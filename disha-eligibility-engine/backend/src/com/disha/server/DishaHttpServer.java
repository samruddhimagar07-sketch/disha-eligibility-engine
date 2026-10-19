package com.disha.server;

import com.disha.engine.ConcurrentEvaluationEngine;
import com.disha.engine.EligibilityEngine;
import com.disha.exams.Exam;
import com.disha.exceptions.InvalidStudentDataException;
import com.disha.io.AuditLogWriter;
import com.disha.io.StudentFileReader;
import com.disha.models.*;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;
import java.util.concurrent.Executors;

/**
 * Built-in Lightweight HTTP Server & REST API Provider for Disha.
 * Powered by standard Java SE {@link HttpServer} without external JAR dependencies.
 * Exposes REST endpoints for the React frontend and serves the static light-theme web UI.
 */
public class DishaHttpServer {

    private final int port;
    private final EligibilityEngine engine;
    private final ConcurrentEvaluationEngine concurrentEngine;
    private final AuditLogWriter auditWriter;
    private HttpServer server;
    private final String webStaticDir;

    public DishaHttpServer(int port, EligibilityEngine engine, ConcurrentEvaluationEngine concurrentEngine,
                           AuditLogWriter auditWriter, String webStaticDir) {
        this.port = port;
        this.engine = engine;
        this.concurrentEngine = concurrentEngine;
        this.auditWriter = auditWriter;
        this.webStaticDir = webStaticDir != null ? webStaticDir : "web";
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor()); // Efficient virtual threads or worker pool

        // REST API routes
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/exams", new ExamsHandler());
        server.createContext("/api/evaluate", new EvaluateHandler());
        server.createContext("/api/batch-sample", new BatchSampleHandler());
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
                    sb.append("{")
                            .append("\"id\":\"").append(s.getId()).append("\",")
                            .append("\"name\":\"").append(escapeJson(s.getName())).append("\",")
                            .append("\"branch\":\"").append(s.getBranch().name()).append("\",")
                            .append("\"year\":").append(s.getCurrentYear()).append(",")
                            .append("\"cgpa\":").append(s.getCgpa()).append(",")
                            .append("\"activeBacklogs\":").append(s.getActiveBacklogs()).append(",")
                            .append("\"eligibleCount\":").append(resList.stream().filter(EvaluationResult::isEligible).count()).append(",")
                            .append("\"shortfallCount\":").append(resList.stream().filter(r -> !r.isEligible()).count())
                            .append("}");
                }
                sb.append("]}");

                sendJsonResponse(exchange, 200, sb.toString());
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"error\":\"Batch evaluation error: " + escapeJson(e.getMessage()) + "\"}");
            }
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
