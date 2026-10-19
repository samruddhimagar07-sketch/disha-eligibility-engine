package com.disha.server;

import com.disha.engine.ConcurrentEvaluationEngine;
import com.disha.engine.EligibilityEngine;
import com.disha.exams.Exam;
import com.disha.exceptions.InvalidStudentDataException;
import com.disha.exceptions.NotificationValidationException;
import com.disha.io.AuditLogWriter;
import com.disha.io.NotificationStore;
import com.disha.io.StudentFileReader;
import com.disha.models.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Built-in Lightweight HTTP Server & REST API Provider for Disha.
 * Powered by standard Java SE {@link HttpServer} without external JAR dependencies.
 * Exposes REST endpoints for the React frontend, multithreaded batch engine,
 * and teacher notification communication system.
 */
public class DishaHttpServer {

    private final int port;
    private final EligibilityEngine engine;
    private final ConcurrentEvaluationEngine concurrentEngine;
    private final AuditLogWriter auditWriter;
    private final NotificationStore notificationStore;
    private HttpServer server;
    private final String webStaticDir;

    public DishaHttpServer(int port, EligibilityEngine engine, ConcurrentEvaluationEngine concurrentEngine,
                           AuditLogWriter auditWriter, NotificationStore notificationStore, String webStaticDir) {
        this.port = port;
        this.engine = engine;
        this.concurrentEngine = concurrentEngine;
        this.auditWriter = auditWriter;
        this.notificationStore = (notificationStore != null) ? notificationStore : new NotificationStore("data/notifications.json");
        this.webStaticDir = webStaticDir != null ? webStaticDir : "web";
    }

    public DishaHttpServer(int port, EligibilityEngine engine, ConcurrentEvaluationEngine concurrentEngine,
                           AuditLogWriter auditWriter, String webStaticDir) {
        this(port, engine, concurrentEngine, auditWriter, new NotificationStore("data/notifications.json"), webStaticDir);
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor()); // Efficient virtual threads

        // REST API routes
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/exams", new ExamsHandler());
        server.createContext("/api/evaluate", new EvaluateHandler());
        server.createContext("/api/batch-sample", new BatchSampleHandler());
        server.createContext("/api/batch-add-student", new BatchAddStudentHandler());
        server.createContext("/api/notifications", new NotificationsHandler());
        server.createContext("/api/pathways", new PathwaysHandler());
        server.createContext("/api/demo-profiles", new DemoProfilesHandler());
        server.createContext("/api/logs", new AuditLogsHandler());

        // Static files handler (Web UI)
        server.createContext("/", new StaticFileHandler(webStaticDir));

        server.start();
        System.out.printf("[Disha Server] Online and listening on http://localhost:%d%n", port);
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
            System.out.println("[Disha Server] Stopped.");
        }
    }

    // --- Handlers ---

    private static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            sendJsonResponse(exchange, 200, "{\"status\":\"UP\",\"service\":\"Disha Pathway Eligibility Engine\"}");
        }
    }

    private class ExamsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }

            List<Exam> exams = engine.getAllExams();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < exams.size(); i++) {
                if (i > 0) sb.append(",");
                Exam e = exams.get(i);
                sb.append("{")
                        .append("\"code\":\"").append(escapeJson(e.getExamCode())).append("\",")
                        .append("\"name\":\"").append(escapeJson(e.getExamName())).append("\",")
                        .append("\"category\":\"").append(e.getExamType().name()).append("\",")
                        .append("\"categoryTitle\":\"").append(escapeJson(e.getExamType().getTitle())).append("\",")
                        .append("\"conductingBody\":\"").append(escapeJson(e.getConductingBody())).append("\",")
                        .append("\"description\":\"").append(escapeJson(e.getDescription())).append("\",")
                        .append("\"baseMinCgpa\":").append(e.getBaseMinCgpa()).append(",")
                        .append("\"minAge\":").append(e.getMinAge()).append(",")
                        .append("\"baseMaxAge\":").append(e.getBaseMaxAge()).append(",")
                        .append("\"minEligibleYear\":").append(e.getMinEligibleYear()).append(",")
                        .append("\"maxAllowedBacklogs\":").append(e.getMaxAllowedActiveBacklogs())
                        .append("}");
            }
            sb.append("]");
            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    private class EvaluateHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed. Use POST.\"}");
                return;
            }

            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            try {
                Student student = parseStudentFromJson(body);
                List<EvaluationResult> results = engine.evaluate(student);

                // Asynchronously record to audit log
                auditWriter.recordEvaluation(student, results);

                String json = formatEvaluationResultsJson(student, results);
                sendJsonResponse(exchange, 200, json);
            } catch (InvalidStudentDataException isde) {
                sendJsonResponse(exchange, 400, "{\"error\":\"Validation Error: " + escapeJson(isde.getMessage()) + "\"}");
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"error\":\"Server evaluation error: " + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    private class BatchSampleHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }

            try {
                List<Student> students = StudentFileReader.readStudentsFromCsv("data/students_sample.csv");
                var batchReport = concurrentEngine.evaluateBatch(students);

                StringBuilder sb = new StringBuilder("{");
                sb.append("\"totalStudents\":").append(batchReport.getTotalStudents()).append(",")
                        .append("\"totalEvaluated\":").append(batchReport.getTotalExamsEvaluated()).append(",")
                        .append("\"durationMillis\":").append(batchReport.getDurationMillis()).append(",")
                        .append("\"threadsUsed\":").append(batchReport.getThreadCountUsed()).append(",")
                        .append("\"students\":[");

                int sIdx = 0;
                for (Map.Entry<Student, List<EvaluationResult>> entry : batchReport.getResults().entrySet()) {
                    if (sIdx++ > 0) sb.append(",");
                    Student s = entry.getKey();
                    List<EvaluationResult> resList = entry.getValue();

                    List<String> eligibleCodes = new ArrayList<>();
                    for (EvaluationResult r : resList) {
                        if (r.isEligible()) eligibleCodes.add(r.getExamCode());
                    }

                    sb.append("{")
                            .append("\"id\":\"").append(s.getId()).append("\",")
                            .append("\"name\":\"").append(escapeJson(s.getName())).append("\",")
                            .append("\"email\":\"").append(escapeJson(s.getEmail())).append("\",")
                            .append("\"age\":").append(s.getAge()).append(",")
                            .append("\"branch\":\"").append(s.getBranch().name()).append("\",")
                            .append("\"year\":").append(s.getCurrentYear()).append(",")
                            .append("\"cgpa\":").append(s.getCgpa()).append(",")
                            .append("\"category\":\"").append(s.getCategory().name()).append("\",")
                            .append("\"activeBacklogs\":").append(s.getActiveBacklogs()).append(",")
                            .append("\"eligibleCount\":").append(resList.stream().filter(EvaluationResult::isEligible).count()).append(",")
                            .append("\"shortfallCount\":").append(resList.stream().filter(r -> !r.isEligible()).count()).append(",")
                            .append("\"eligibleExams\":[");

                    for (int c = 0; c < eligibleCodes.size(); c++) {
                        if (c > 0) sb.append(",");
                        sb.append("\"").append(escapeJson(eligibleCodes.get(c))).append("\"");
                    }
                    sb.append("]}");
                }
                sb.append("]}");

                sendJsonResponse(exchange, 200, sb.toString());
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"error\":\"Batch evaluation error: " + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    private class BatchAddStudentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }

            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed. Use POST.\"}");
                return;
            }

            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            try {
                Student s = parseStudentFromJson(body);
                // Append to CSV
                String csvLine = String.format("%s,%s,%s,%d,%s,%d,%.2f,%s,%d,%d,%.1f,%.1f,%s,%s%n",
                        s.getId(), s.getName(), s.getEmail(), s.getAge(), s.getBranch().name(),
                        s.getCurrentYear(), s.getCgpa(), s.getCategory().name(), s.getActiveBacklogs(),
                        s.getHistoryOfBacklogs(), s.getTenthPercentage(), s.getTwelfthPercentage(),
                        s.getGender().name(), s.isDegreeCompleted());

                Files.writeString(Paths.get("data/students_sample.csv"), csvLine, StandardCharsets.UTF_8,
                        StandardOpenOption.CREATE, StandardOpenOption.APPEND);

                sendJsonResponse(exchange, 201, "{\"success\":true,\"message\":\"Student profile added to batch.\"}");
            } catch (Exception e) {
                sendJsonResponse(exchange, 400, "{\"error\":\"Failed to add student: " + escapeJson(e.getMessage()) + "\"}");
            }
        }
    }

    private class NotificationsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }

            String method = exchange.getRequestMethod().toUpperCase();
            if ("GET".equals(method)) {
                // Parse optional query param: ?studentId=STU-101
                String query = exchange.getRequestURI().getQuery();
                String studentId = null;
                if (query != null && query.contains("studentId=")) {
                    for (String part : query.split("&")) {
                        if (part.startsWith("studentId=")) {
                            studentId = part.substring("studentId=".length());
                        }
                    }
                }

                List<Notification> list = notificationStore.getNotificationsForStudent(studentId);
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < list.size(); i++) {
                    if (i > 0) sb.append(",");
                    Notification n = list.get(i);
                    sb.append("{")
                            .append("\"id\":\"").append(escapeJson(n.getId())).append("\",")
                            .append("\"title\":\"").append(escapeJson(n.getTitle())).append("\",")
                            .append("\"message\":\"").append(escapeJson(n.getMessage())).append("\",")
                            .append("\"sender\":\"").append(escapeJson(n.getSender())).append("\",")
                            .append("\"targetExamCode\":\"").append(escapeJson(n.getTargetExamCode())).append("\",")
                            .append("\"targetAudience\":\"").append(escapeJson(n.getTargetAudience())).append("\",")
                            .append("\"priority\":\"").append(escapeJson(n.getPriority())).append("\",")
                            .append("\"timestamp\":\"").append(escapeJson(n.getTimestamp())).append("\",")
                            .append("\"read\":").append(n.isRead()).append(",")
                            .append("\"recipientIds\":[");
                    List<String> rIds = n.getRecipientIds();
                    for (int j = 0; j < rIds.size(); j++) {
                        if (j > 0) sb.append(",");
                        sb.append("\"").append(escapeJson(rIds.get(j))).append("\"");
                    }
                    sb.append("]}");
                }
                sb.append("]");
                sendJsonResponse(exchange, 200, sb.toString());

            } else if ("POST".equals(method)) {
                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                try {
                    String title = extractString(body, "title", "");
                    String message = extractString(body, "message", "");
                    String sender = extractString(body, "sender", "Higher Studies Advisor");
                    String targetExamCode = extractString(body, "targetExamCode", "ALL");
                    String targetAudience = extractString(body, "targetAudience", "Eligible Students");
                    String priority = extractString(body, "priority", "INFO");

                    List<String> recipients = new ArrayList<>();
                    Pattern arrPattern = Pattern.compile("\"recipientIds\"\\s*:\\s*\\[([^\\]]*)\\]");
                    Matcher arrMatcher = arrPattern.matcher(body);
                    if (arrMatcher.find()) {
                        String inner = arrMatcher.group(1);
                        Pattern idPattern = Pattern.compile("\"([^\"]+)\"");
                        Matcher idMatcher = idPattern.matcher(inner);
                        while (idMatcher.find()) {
                            recipients.add(idMatcher.group(1));
                        }
                    }

                    Notification saved = notificationStore.addNotification(title, message, sender,
                            targetExamCode, targetAudience, recipients, priority);

                    // Multithreaded / background audit logging
                    String auditLine = String.format("[NOTIFICATION BROADCAST] ID: %s | Title: %s | Target: %s | Recipients: %d",
                            saved.getId(), saved.getTitle(), saved.getTargetAudience(), recipients.size());
                    System.out.println(auditLine);

                    String resJson = String.format("{\"success\":true,\"id\":\"%s\",\"recipientsCount\":%d,\"message\":\"Notification successfully broadcasted to %d students.\"}",
                            escapeJson(saved.getId()), recipients.size(), recipients.size());
                    sendJsonResponse(exchange, 201, resJson);

                } catch (NotificationValidationException nve) {
                    sendJsonResponse(exchange, 400, "{\"error\":\"" + escapeJson(nve.getMessage()) + "\"}");
                } catch (Exception e) {
                    sendJsonResponse(exchange, 500, "{\"error\":\"Server notification error: " + escapeJson(e.getMessage()) + "\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method Not Allowed.\"}");
            }
        }
    }

    private static class PathwaysHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }

            // Rich preparation pathway guides
            String json = """
            {
              "UPSC-CSE": {
                "examCode": "UPSC-CSE",
                "examName": "UPSC Civil Services Examination (IAS/IPS/IFS)",
                "overview": "India's premier competitive examination comprising Prelims (CSAT + GS), Mains (9 written papers), and Personality Interview.",
                "timeline": "12 to 18 months structured preparation recommended during Year 3 & 4.",
                "phases": [
                  {
                    "phase": 1,
                    "title": "Foundation & NCERT Mastery",
                    "duration": "Months 1 - 4",
                    "milestones": [
                      "Complete NCERTs (Class 6 to 12) for History, Geography, Polity, and Economics",
                      "Daily reading of 'The Hindu' or 'Indian Express' with editorial notes",
                      "Understand previous 10 years Prelims and Mains question pattern"
                    ]
                  },
                  {
                    "phase": 2,
                    "title": "Standard Reference Textbooks & Optional Subject",
                    "duration": "Months 5 - 9",
                    "milestones": [
                      "Master Indian Polity (M. Laxmikanth) and Modern India (Spectrum / Bipin Chandra)",
                      "Select optional subject (e.g. Electrical/Mechanical Engg, Geography, Public Admin)",
                      "Complete 1st reading and comprehensive note-making for optional papers 1 & 2"
                    ]
                  },
                  {
                    "phase": 3,
                    "title": "Intensive Mains Answer Writing & CSAT Practice",
                    "duration": "Months 10 - 12",
                    "milestones": [
                      "Write 2 GS Mains answers daily with focus on structure (Intro, Body, Conclusion)",
                      "Practice CSAT speed math and reading comprehension weekly to ensure 33% qualifying cutoff",
                      "Solve monthly current affairs compilations (VisionIAS/PT 365)"
                    ]
                  },
                  {
                    "phase": 4,
                    "title": "Full-Length Prelims Mocks & Revision Sprints",
                    "duration": "Months 13 - 15",
                    "milestones": [
                      "Complete 35+ full-length Prelims mock tests with negative marking review",
                      "3 rounds of revision of core facts, constitutional articles, and government schemes",
                      "Prepare for Personality Test (DAF analysis and current affairs defense)"
                    ]
                  }
                ],
                "recommendedBooks": [
                  "Indian Polity by M. Laxmikanth",
                  "A Brief History of Modern India by Spectrum",
                  "Certificate Physical and Human Geography by G.C. Leong",
                  "Indian Economy by Ramesh Singh or Nitin Singhania",
                  "Ethics, Integrity & Aptitude by Subba Rao & P.N. Roy Chowdhury"
                ],
                "studySchedule": "College students: 3.5 hrs on weekdays (1 hr news, 2 hrs GS, 0.5 hr revision); 7 hrs on weekends."
              },
              "CAT": {
                "examCode": "CAT",
                "examName": "Common Admission Test (IIMs & Top Business Schools)",
                "overview": "Computer-based national aptitude test consisting of 3 sections: VARC, DILR, and QA (66 questions in 120 minutes).",
                "timeline": "6 to 9 months focused quantitative and analytical preparation.",
                "phases": [
                  {
                    "phase": 1,
                    "title": "Core Arithmetic & Reading Comprehension Habit",
                    "duration": "Months 1 - 2",
                    "milestones": [
                      "Daily reading of 3 diverse Aeon essays and editorial articles",
                      "Complete arithmetic foundations (Percentages, Profit/Loss, Ratios, Time-Speed-Distance)",
                      "Learn mental math techniques, squares, cubes, and fraction-to-percentage conversions"
                    ]
                  },
                  {
                    "phase": 2,
                    "title": "Algebra, Geometry & DILR Caselets",
                    "duration": "Months 3 - 5",
                    "milestones": [
                      "Master Quadratics, Logarithms, Functions, Sequences, and Coordinate Geometry",
                      "Solve 3 unseen DILR sets daily (Arrangements, Matrix, Graphs, Venn diagrams)",
                      "Sectional tests: Attempt 2 sectionals per week with strict 40-minute timer"
                    ]
                  },
                  {
                    "phase": 3,
                    "title": "Full-Length Mock Drills & Error Log Analysis",
                    "duration": "Months 6 - 8",
                    "milestones": [
                      "Take 25+ All-India Mocks (AIMCAT / SIMCAT / CL Prime)",
                      "Spend 3 hours analyzing every mock: question selection strategy is key",
                      "Refine round-1 scanning to pick low-hanging fruit questions first"
                    ]
                  },
                  {
                    "phase": 4,
                    "title": "WAT-GD-PI & College Profile Refinement",
                    "duration": "Post-CAT",
                    "milestones": [
                      "Draft Statement of Purpose (SOP) focusing on undergraduate projects and internships",
                      "Mock Personal Interviews covering academic engineering concepts and current business news"
                    ]
                  }
                ],
                "recommendedBooks": [
                  "How to Prepare for Quantitative Aptitude for CAT by Arun Sharma",
                  "How to Prepare for Verbal Ability & Reading Comprehension by Arun Sharma & Meenakshi Upadhyay",
                  "Logical Reasoning and Data Interpretation by Nishit K. Sinha",
                  "Word Power Made Easy by Norman Lewis"
                ],
                "studySchedule": "College students: 2.5 hrs daily (1 hr QA, 1 hr VARC, 0.5 hr DILR); 5 hrs mock analysis on Sundays."
              },
              "GATE-CS": {
                "examCode": "GATE-CS",
                "examName": "GATE (Computer Science & Information Technology)",
                "overview": "Premier gateway for M.Tech admissions at IITs/IISc and PSU Executive recruitment (IOCL, ONGC, NTPC, ISRO, DRDO).",
                "timeline": "8 to 12 months technical syllabus mastery starting from 3rd year.",
                "phases": [
                  {
                    "phase": 1,
                    "title": "Discrete Math & Programming / Data Structures",
                    "duration": "Months 1 - 3",
                    "milestones": [
                      "Master Set Theory, Combinatorics, Graph Theory, and Propositional Logic",
                      "Implement Arrays, Stacks, Queues, Trees, Heaps, and Hashing in C/C++",
                      "Solve previous 15 years GATE questions for Data Structures & Algorithms"
                    ]
                  },
                  {
                    "phase": 2,
                    "title": "Core Systems: OS, DBMS & Computer Networks",
                    "duration": "Months 4 - 6",
                    "milestones": [
                      "Deep dive into OS: CPU Scheduling, Virtual Memory Paging, Deadlocks, and Semaphores",
                      "Master DBMS Normalization (BCNF, 3NF), Transactions, Serializability, and SQL",
                      "Networking: Subnetting, TCP Congestion Control, Sliding Window Protocols"
                    ]
                  },
                  {
                    "phase": 3,
                    "title": "Theory of Computation & Compiler Design",
                    "duration": "Months 7 - 9",
                    "milestones": [
                      "Regular Expressions, DFA/NFA Minimization, Context-Free Grammars, Turing Machines",
                      "Top-Down (LL1) and Bottom-Up (LR, LALR) Parsers, Syntax-Directed Translation",
                      "Solve all subject-wise test series questions"
                    ]
                  },
                  {
                    "phase": 4,
                    "title": "Full-Length Mocks & Revision Formula Sheets",
                    "duration": "Months 10 - 11",
                    "milestones": [
                      "15+ Complete 3-hour GATE Mocks with virtual calculator discipline",
                      "Focus on accuracy: eliminate silly arithmetic errors in numerical answer type (NAT) questions",
                      "Formulas and theorem flashcard review daily"
                    ]
                  }
                ],
                "recommendedBooks": [
                  "Introduction to Algorithms by Cormen, Leiserson, Rivest, Stein (CLRS)",
                  "Operating System Concepts by Silberschatz, Galvin, Gagne",
                  "Database System Concepts by Korth & Sudarshan",
                  "Computer Networking: A Top-Down Approach by Kurose & Ross",
                  "Theory of Computation by Michael Sipser"
                ],
                "studySchedule": "College students: 3 hrs weekdays aligned with semester courses; 6 hrs on weekends."
              },
              "CDS-IMA": {
                "examCode": "CDS-IMA",
                "examName": "Combined Defence Services (IMA / OTA Officers Cadre)",
                "overview": "UPSC-conducted defense examination followed by the rigorous 5-day Service Selection Board (SSB) Interview and Medical Board.",
                "timeline": "6 months written prep + ongoing physical conditioning.",
                "phases": [
                  {
                    "phase": 1,
                    "title": "Written Exam Core: English & Elementary Mathematics",
                    "duration": "Months 1 - 3",
                    "milestones": [
                      "Grammar rules, sentence rearrangement, idioms, and reading comprehension",
                      "Elementary mathematics: Geometry, Trigonometry, Mensuration, and Number Systems",
                      "Solve 10 years CDS written papers to understand difficulty tier"
                    ]
                  },
                  {
                    "phase": 2,
                    "title": "General Knowledge & Defense Current Affairs",
                    "duration": "Months 4 - 5",
                    "milestones": [
                      "Physical & Indian Geography, Modern History, Indian Constitution",
                      "Daily defense news: Military exercises, weapons systems, geopolitical developments",
                      "Complete 2 full mock papers weekly"
                    ]
                  },
                  {
                    "phase": 3,
                    "title": "Service Selection Board (SSB) Screening Drills",
                    "duration": "Months 5 - 6",
                    "milestones": [
                      "Stage-1 Screening: Officer Intelligence Rating (OIR) test and Picture Perception & Description Test (PPDT)",
                      "Psychological tests: TAT (Thematic Apperception), WAT (Word Association), SRT (Situation Reaction), Self Description",
                      "Group Testing Officer (GTO) tasks: PGT, HGT, Group Planning Exercise, Command Task"
                    ]
                  },
                  {
                    "phase": 4,
                    "title": "Physical Fitness & Personal Interview Conditioning",
                    "duration": "Ongoing",
                    "milestones": [
                      "Daily 5 km run under 25 minutes, 30 pushups, 10 pullups",
                      "Preparation of Personal Information Questionnaire (PIQ)",
                      "Confidence building, clear voice projection, and officer-like qualities (OLQs)"
                    ]
                  }
                ],
                "recommendedBooks": [
                  "Pathfinder for CDS Examination by Arihant Experts",
                  "High School English Grammar & Composition by Wren & Martin",
                  "Let's Crack SSB Interview by SSBCrack",
                  "Quantitative Aptitude for Competitive Examinations by R.S. Aggarwal"
                ],
                "studySchedule": "1 hr physical workout daily + 2.5 hrs written exam study + 30 mins reading defense journals."
              },
              "GRE-MS": {
                "examCode": "GRE-MS",
                "examName": "GRE & Higher Studies Abroad (MS in US/Europe)",
                "overview": "Standardized graduate admissions test accepted by US, Canadian, and European universities for Master's and Ph.D. degrees.",
                "timeline": "4 to 6 months testing prep + admissions application cycle.",
                "phases": [
                  {
                    "phase": 1,
                    "title": "Quantitative Reasoning 170/170 Target & Core Vocab",
                    "duration": "Months 1 - 2",
                    "milestones": [
                      "Build strong GRE vocabulary using Magoosh Flashcards & Manhattan 500 Essential Words",
                      "Revise arithmetic, algebra, coordinate geometry, data analysis, and standard deviation",
                      "Solve Manhattan 5 lb. Book of GRE Practice Problems"
                    ]
                  },
                  {
                    "phase": 2,
                    "title": "Verbal Reasoning & Analytical Writing (AWA)",
                    "duration": "Months 3 - 4",
                    "milestones": [
                      "Master Text Completion (TC) and Sentence Equivalence (SE) logic strategies",
                      "Practice Reading Comprehension with focus on argument structure and author tone",
                      "Write 10 Issue Essays following ETS rubric criteria"
                    ]
                  },
                  {
                    "phase": 3,
                    "title": "Official ETS PowerPrep Mocks & Test Taking Stamina",
                    "duration": "Month 5",
                    "milestones": [
                      "Take all 5 Official ETS PowerPrep full-length computer-adaptive mocks",
                      "Target Score: 320+ (Quant 165+, Verbal 155+, AWA 4.0+)",
                      "Take TOEFL iBT or IELTS Academic test (Target TOEFL 100+ / IELTS 7.5+)"
                    ]
                  },
                  {
                    "phase": 4,
                    "title": "University Shortlisting, SOP & Letters of Recommendation",
                    "duration": "Months 5 - 6",
                    "milestones": [
                      "Shortlist 10 universities in Ambitious, Moderate, and Safe categories",
                      "Draft tailored Statement of Purpose highlighting undergraduate academic projects and research",
                      "Secure 3 strong Letters of Recommendation (LORs) from college professors"
                    ]
                  }
                ],
                "recommendedBooks": [
                  "The Official Guide to the GRE General Test by ETS",
                  "5 lb. Book of GRE Practice Problems by Manhattan Prep",
                  "GRE Prep Plus by Kaplan",
                  "The Official Guide to the TOEFL Test by ETS"
                ],
                "studySchedule": "2 hrs daily (1 hr Quant, 1 hr Verbal); 4 hrs full-length mock on Saturdays."
              },
              "SSC-CGL": {
                "examCode": "SSC-CGL",
                "examName": "SSC Combined Graduate Level (Inspector / ASO)",
                "overview": "Central Government recruitment for Group B and C gazetted/non-gazetted administrative appointments.",
                "timeline": "6 to 8 months focused speed mathematics and general awareness.",
                "phases": [
                  {
                    "phase": 1,
                    "title": "Tier-1 Foundation: Quantitative Aptitude & Reasoning",
                    "duration": "Months 1 - 3",
                    "milestones": [
                      "Master short tricks for Arithmetic (Profit-Loss, Percentage, SI/CI, Time & Work)",
                      "Advanced math: Algebra, Trigonometry, Geometry, and Mensuration",
                      "Logical reasoning: Syllogisms, Analogies, Coding-Decoding, Non-verbal series"
                    ]
                  },
                  {
                    "phase": 2,
                    "title": "General Studies & English Comprehension",
                    "duration": "Months 4 - 5",
                    "milestones": [
                      "Static GK: Indian Polity, Geography, Modern History, Science & Technology",
                      "English: Spotting errors, Cloze test, Active/Passive voice, Direct/Indirect speech",
                      "Daily current affairs quiz"
                    ]
                  },
                  {
                    "phase": 3,
                    "title": "Tier-2 Speed Drills & Computer / Typing Module",
                    "duration": "Months 6 - 7",
                    "milestones": [
                      "Intensive practice for Tier-2 Mathematical and English sections",
                      "Qualify Computer Knowledge module (Basics of CPU, Memory, MS Office, Cyber security)",
                      "Daily 15-minute typing practice to achieve 27 words per minute qualifying speed"
                    ]
                  }
                ],
                "recommendedBooks": [
                  "Quantitative Aptitude for Competitive Examinations by R.S. Aggarwal",
                  "Play with Advanced Maths by Abhinay Sharma",
                  "Lucent's General Knowledge",
                  "Objective General English by S.P. Bakshi"
                ],
                "studySchedule": "3 hrs daily with focus on sectional speed and typing skills."
              }
            }
            """;
            sendJsonResponse(exchange, 200, json);
        }
    }

    private static class DemoProfilesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }

            String json = """
            [
              {
                "id": "DEMO-01",
                "name": "Aarav Sharma",
                "email": "aarav.sharma@eng.edu",
                "age": 20,
                "branch": "IT",
                "currentYear": 2,
                "cgpa": 8.50,
                "category": "GENERAL",
                "activeBacklogs": 0,
                "tenthPercentage": 91.5,
                "twelfthPercentage": 89.0,
                "gender": "MALE",
                "degreeCompleted": false,
                "notes": "2nd-year IT student with stellar CGPA, evaluating early prep pathways."
              },
              {
                "id": "DEMO-02",
                "name": "Diya Patel",
                "email": "diya.patel@eng.edu",
                "age": 20,
                "branch": "IT",
                "currentYear": 2,
                "cgpa": 6.80,
                "category": "OBC_NCL",
                "activeBacklogs": 2,
                "tenthPercentage": 84.0,
                "twelfthPercentage": 82.5,
                "gender": "FEMALE",
                "degreeCompleted": false,
                "notes": "2nd-year IT student with active arrears, demonstrating shortfall remediation."
              },
              {
                "id": "DEMO-03",
                "name": "Rohan Verma",
                "email": "rohan.verma@eng.edu",
                "age": 22,
                "branch": "CSE",
                "currentYear": 4,
                "cgpa": 6.20,
                "category": "GENERAL",
                "activeBacklogs": 2,
                "tenthPercentage": 78.0,
                "twelfthPercentage": 75.0,
                "gender": "MALE",
                "degreeCompleted": false,
                "notes": "4th-year CS student with backlogs, testing CAT vs strict PSU eligibility."
              },
              {
                "id": "DEMO-04",
                "name": "Ananya Iyer",
                "email": "ananya.iyer@eng.edu",
                "age": 21,
                "branch": "ME",
                "currentYear": 3,
                "cgpa": 9.10,
                "category": "GENERAL",
                "activeBacklogs": 0,
                "tenthPercentage": 94.0,
                "twelfthPercentage": 92.0,
                "gender": "FEMALE",
                "degreeCompleted": false,
                "notes": "3rd-year Mechanical student with high CGPA, testing branch restrictions."
              },
              {
                "id": "DEMO-05",
                "name": "Vikram Singh",
                "email": "vikram.singh@eng.edu",
                "age": 23,
                "branch": "ECE",
                "currentYear": 4,
                "cgpa": 7.85,
                "category": "SC",
                "activeBacklogs": 0,
                "tenthPercentage": 82.0,
                "twelfthPercentage": 80.0,
                "gender": "MALE",
                "degreeCompleted": false,
                "notes": "4th-year ECE student with SC category age/cutoff relaxations for UPSC & Defence."
              }
            ]
            """;
            sendJsonResponse(exchange, 200, json);
        }
    }

    private static class AuditLogsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendCors(exchange);
                return;
            }

            File logFile = new File("data/audit_logs.txt");
            if (!logFile.exists()) {
                sendJsonResponse(exchange, 200, "{\"logs\":[]}");
                return;
            }

            List<String> lines = Files.readAllLines(logFile.toPath());
            int max = Math.min(100, lines.size());
            List<String> sub = lines.subList(lines.size() - max, lines.size());

            StringBuilder sb = new StringBuilder("{\"logs\":[");
            for (int i = 0; i < sub.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append("\"").append(escapeJson(sub.get(i))).append("\"");
            }
            sb.append("]}");
            sendJsonResponse(exchange, 200, sb.toString());
        }
    }

    private static class StaticFileHandler implements HttpHandler {
        private final String baseDir;

        public StaticFileHandler(String baseDir) {
            this.baseDir = baseDir;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            File file = new File(baseDir + path);
            if (!file.exists() || file.isDirectory()) {
                file = new File(baseDir + "/index.html");
            }

            if (!file.exists()) {
                String notFound = "<h1>404 Not Found</h1>";
                exchange.getResponseHeaders().set("Content-Type", "text/html");
                exchange.sendResponseHeaders(404, notFound.length());
                exchange.getResponseBody().write(notFound.getBytes());
                exchange.getResponseBody().close();
                return;
            }

            String contentType = "text/plain";
            String lower = file.getName().toLowerCase();
            if (lower.endsWith(".html")) contentType = "text/html; charset=UTF-8";
            else if (lower.endsWith(".css")) contentType = "text/css; charset=UTF-8";
            else if (lower.endsWith(".js")) contentType = "application/javascript; charset=UTF-8";
            else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (lower.endsWith(".png")) contentType = "image/png";
            else if (lower.endsWith(".svg")) contentType = "image/svg+xml";
            else if (lower.endsWith(".json")) contentType = "application/json";

            byte[] bytes = Files.readAllBytes(file.toPath());
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("Cache-Control", "no-cache");
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.getResponseBody().close();
        }
    }

    // --- Helpers ---

    private static void sendCors(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.sendResponseHeaders(204, -1);
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static Student parseStudentFromJson(String json) throws InvalidStudentDataException {
        // Robust lightweight key-value extraction
        String id = extractString(json, "id", "STU-" + System.currentTimeMillis() % 10000);
        String name = extractString(json, "name", "Student Profile");
        String email = extractString(json, "email", "student@univ.edu");
        int age = extractInt(json, "age", 20);
        Branch branch = Branch.fromString(extractString(json, "branch", "CSE"));
        int currentYear = extractInt(json, "currentYear", 2);
        double cgpa = extractDouble(json, "cgpa", 7.5);
        Category category = Category.fromString(extractString(json, "category", "GENERAL"));
        int activeBacklogs = extractInt(json, "activeBacklogs", 0);
        int historyOfBacklogs = extractInt(json, "historyOfBacklogs", activeBacklogs);
        double tenthPercentage = extractDouble(json, "tenthPercentage", 80.0);
        double twelfthPercentage = extractDouble(json, "twelfthPercentage", 80.0);
        Gender gender = Gender.fromString(extractString(json, "gender", "MALE"));
        boolean degreeCompleted = extractBoolean(json, "degreeCompleted", false);

        return new Student(id, name, email, age, branch, currentYear, cgpa, category,
                activeBacklogs, historyOfBacklogs, tenthPercentage, twelfthPercentage, gender, degreeCompleted);
    }

    private static String formatEvaluationResultsJson(Student student, List<EvaluationResult> results) {
        StringBuilder sb = new StringBuilder("{");

        // Student metadata
        sb.append("\"student\":{")
                .append("\"id\":\"").append(student.getId()).append("\",")
                .append("\"name\":\"").append(escapeJson(student.getName())).append("\",")
                .append("\"age\":").append(student.getAge()).append(",")
                .append("\"branch\":\"").append(student.getBranch().name()).append("\",")
                .append("\"branchDisplay\":\"").append(escapeJson(student.getBranch().getDisplayName())).append("\",")
                .append("\"currentYear\":").append(student.getCurrentYear()).append(",")
                .append("\"cgpa\":").append(student.getCgpa()).append(",")
                .append("\"approxPercentage\":").append(student.getApproxPercentage()).append(",")
                .append("\"category\":\"").append(student.getCategory().name()).append("\",")
                .append("\"categoryLabel\":\"").append(escapeJson(student.getCategory().getLabel())).append("\",")
                .append("\"activeBacklogs\":").append(student.getActiveBacklogs()).append(",")
                .append("\"tenthPercentage\":").append(student.getTenthPercentage()).append(",")
                .append("\"twelfthPercentage\":").append(student.getTwelfthPercentage()).append(",")
                .append("\"gender\":\"").append(student.getGender().name()).append("\",")
                .append("\"degreeCompleted\":").append(student.isDegreeCompleted())
                .append("},");

        // Results array
        sb.append("\"results\":[");
        for (int i = 0; i < results.size(); i++) {
            if (i > 0) sb.append(",");
            EvaluationResult r = results.get(i);
            sb.append("{")
                    .append("\"examCode\":\"").append(escapeJson(r.getExamCode())).append("\",")
                    .append("\"examName\":\"").append(escapeJson(r.getExamName())).append("\",")
                    .append("\"examCategory\":\"").append(escapeJson(r.getExamCategory())).append("\",")
                    .append("\"status\":\"").append(r.getStatus().name()).append("\",")
                    .append("\"isEligible\":").append(r.isEligible()).append(",")
                    .append("\"minCgpaCutoff\":").append(r.getMinCgpaCutoff()).append(",")
                    .append("\"studentCgpa\":").append(r.getStudentCgpa()).append(",")
                    .append("\"primaryAdvice\":\"").append(escapeJson(r.getPrimaryAdvice())).append("\",")
                    .append("\"shortfalls\":[");

            List<ShortfallDetail> shortfalls = r.getShortfalls();
            for (int j = 0; j < shortfalls.size(); j++) {
                if (j > 0) sb.append(",");
                ShortfallDetail s = shortfalls.get(j);
                sb.append("{")
                        .append("\"parameter\":\"").append(escapeJson(s.getParameter())).append("\",")
                        .append("\"requiredCriteria\":\"").append(escapeJson(s.getRequiredCriteria())).append("\",")
                        .append("\"actualValue\":\"").append(escapeJson(s.getActualValue())).append("\",")
                        .append("\"actionableAdvice\":\"").append(escapeJson(s.getActionableAdvice())).append("\"")
                        .append("}");
            }
            sb.append("]}");
        }
        sb.append("],");

        long eligibleCount = results.stream().filter(EvaluationResult::isEligible).count();
        sb.append("\"summary\":{")
                .append("\"totalExams\":").append(results.size()).append(",")
                .append("\"eligibleCount\":").append(eligibleCount).append(",")
                .append("\"shortfallCount\":").append(results.size() - eligibleCount)
                .append("}");

        sb.append("}");
        return sb.toString();
    }

    private static String extractString(String json, String key, String defaultVal) {
        String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]*)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) return m.group(1);
        return defaultVal;
    }

    private static int extractInt(String json, String key, int defaultVal) {
        String pattern = "\"" + key + "\"\\s*:\\s*([0-9-]+)";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) {
            try { return Integer.parseInt(m.group(1)); } catch (Exception ignored) {}
        }
        return defaultVal;
    }

    private static double extractDouble(String json, String key, double defaultVal) {
        String pattern = "\"" + key + "\"\\s*:\\s*([0-9.-]+)";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) {
            try { return Double.parseDouble(m.group(1)); } catch (Exception ignored) {}
        }
        return defaultVal;
    }

    private static boolean extractBoolean(String json, String key, boolean defaultVal) {
        String pattern = "\"" + key + "\"\\s*:\\s*(true|false)";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) return Boolean.parseBoolean(m.group(1));
        return defaultVal;
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
