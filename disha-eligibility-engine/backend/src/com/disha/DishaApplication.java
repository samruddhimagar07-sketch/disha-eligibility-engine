package com.disha;

import com.disha.demo.PredefinedProfilesDemo;
import com.disha.engine.ConcurrentEvaluationEngine;
import com.disha.engine.EligibilityEngine;
import com.disha.engine.ShortfallReporter;
import com.disha.exams.Exam;
import com.disha.exceptions.InvalidStudentDataException;
import com.disha.io.AuditLogWriter;
import com.disha.io.ReportExporter;
import com.disha.io.StudentFileReader;
import com.disha.models.*;
import com.disha.server.DishaHttpServer;

import java.io.File;
import java.util.List;
import java.util.Scanner;

/**
 * Main Application Runner for Disha: Pathway & Exam Eligibility Engine.
 * Features an interactive terminal CLI, predefined rubric demonstration runner,
 * multithreaded batch processing, and embedded REST API Web Server.
 */
public class DishaApplication {

    private static final String VERSION = "1.0.0-PROD";
    private static final int DEFAULT_SERVER_PORT = 8080;

    public static void main(String[] args) {
        printBanner();

        // 1. Initialize core OOP dependencies
        EligibilityEngine engine = new EligibilityEngine();
        ConcurrentEvaluationEngine concurrentEngine = new ConcurrentEvaluationEngine(engine);
        AuditLogWriter auditWriter = new AuditLogWriter("data/audit_logs.txt");
        PredefinedProfilesDemo demoRunner = new PredefinedProfilesDemo(engine, auditWriter);

        // Check command-line arguments for quick direct execution
        if (args.length > 0) {
            String command = args[0].trim().toLowerCase();
            switch (command) {
                case "--demo" -> {
                    demoRunner.runFullDemonstration();
                    concurrentEngine.shutdown();
                    return;
                }
                case "--server" -> {
                    startWebServer(engine, concurrentEngine, auditWriter, DEFAULT_SERVER_PORT, true);
                    return;
                }
                case "--batch" -> {
                    runBatchProcess(concurrentEngine, auditWriter, "data/students_sample.csv");
                    concurrentEngine.shutdown();
                    return;
                }
            }
        }

        // Start embedded server automatically in background so Web UI is immediately available
        startWebServer(engine, concurrentEngine, auditWriter, DEFAULT_SERVER_PORT, false);

        // 2. Interactive Console Menu Loop
        Scanner scanner = new Scanner(System.in);
        boolean running = true;

        while (running) {
            printMenu();
            System.out.print(" Select an option [1-7]: ");
            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1" -> demoRunner.runFullDemonstration();
                case "2" -> handleInteractiveStudentEvaluation(scanner, engine, auditWriter);
                case "3" -> runBatchProcess(concurrentEngine, auditWriter, "data/students_sample.csv");
                case "4" -> displayExamCatalog(engine);
                case "5" -> handleExportStudentReport(scanner, engine);
                case "6" -> {
                    System.out.printf("%n[Info] Web GUI and REST API are active at: http://localhost:%d%n", DEFAULT_SERVER_PORT);
                    System.out.println("Open this URL in any browser to experience the light glassmorphic interface.");
                }
                case "7", "exit", "q" -> {
                    System.out.println("\nExiting Disha Eligibility Engine. Goodbye!");
                    running = false;
                }
                default -> System.out.println("\n[!] Invalid selection. Please enter a number between 1 and 7.");
            }

            if (running) {
                System.out.println("\nPress [Enter] to return to the main menu...");
                scanner.nextLine();
            }
        }

        concurrentEngine.shutdown();
    }

    private static void startWebServer(EligibilityEngine engine, ConcurrentEvaluationEngine concurrentEngine,
                                       AuditLogWriter auditWriter, int port, boolean blockMainThread) {
        try {
            DishaHttpServer server = new DishaHttpServer(port, engine, concurrentEngine, auditWriter, "web");
            server.start();

            if (blockMainThread) {
                System.out.printf("Web Server active on http://localhost:%d. Press Ctrl+C to terminate.%n", port);
                Thread.currentThread().join();
            }
        } catch (Exception e) {
            System.err.println("[Warning] Could not start embedded HTTP server: " + e.getMessage());
        }
    }

    private static void handleInteractiveStudentEvaluation(Scanner scanner, EligibilityEngine engine, AuditLogWriter auditWriter) {
        System.out.println("\n--- Interactive Student Profile Input ---");
        try {
            System.out.print("Enter Student Full Name: ");
            String name = scanner.nextLine().trim();

            System.out.print("Enter Age [16-65]: ");
            int age = Integer.parseInt(scanner.nextLine().trim());

            System.out.println("Available Branches: CSE, IT, ECE, EE, ME, CE, CHEM, OTHER_ENG, NON_ENG");
            System.out.print("Enter Branch: ");
            Branch branch = Branch.fromString(scanner.nextLine().trim());

            System.out.print("Enter Current Academic Year [1-4]: ");
            int year = Integer.parseInt(scanner.nextLine().trim());

            System.out.print("Enter CGPA [0.00 - 10.00]: ");
            double cgpa = Double.parseDouble(scanner.nextLine().trim());

            System.out.println("Available Categories: GENERAL, OBC_NCL, SC, ST, EWS");
            System.out.print("Enter Category: ");
            Category category = Category.fromString(scanner.nextLine().trim());

            System.out.print("Enter Number of Active Backlogs [>=0]: ");
            int backlogs = Integer.parseInt(scanner.nextLine().trim());

            // Build student (encapsulation ensures domain validation invariants)
            Student student = new Student("CLI-USR", name, age, branch, year, cgpa, category, backlogs);

            System.out.println("\nEvaluating profile against all registered exam pathways...\n");
            List<EvaluationResult> results = engine.evaluate(student);

            // Display formatted shortfall report
            System.out.println(ShortfallReporter.generateComprehensiveReport(student, results));

            // Record to persistent audit log
            auditWriter.recordEvaluation(student, results);
            System.out.println("[Audit Log] Successfully appended evaluation record to data/audit_logs.txt");

        } catch (NumberFormatException nfe) {
            System.err.println("\n[Input Error] Expected a valid numeric value: " + nfe.getMessage());
        } catch (InvalidStudentDataException isde) {
            System.err.println("\n[Domain Validation Error] " + isde.getMessage());
        } catch (Exception e) {
            System.err.println("\n[Unexpected Error] " + e.getMessage());
        }
    }

    private static void runBatchProcess(ConcurrentEvaluationEngine concurrentEngine, AuditLogWriter auditWriter, String csvPath) {
        System.out.printf("%n--- Multithreaded Batch Processing from File: %s ---%n", csvPath);
        try {
            List<Student> students = StudentFileReader.readStudentsFromCsv(csvPath);
            System.out.printf("Loaded %d student profiles from CSV.%n", students.size());
            System.out.printf("Dispatching parallel evaluation across %d worker threads...%n", concurrentEngine.getThreadCount());

            var report = concurrentEngine.evaluateBatch(students);

            System.out.println("\n=== Batch Processing Complete ===");
            System.out.printf("  Total Students Evaluated : %d%n", report.getTotalStudents());
            System.out.printf("  Total Rule Checks Done   : %d%n", report.getTotalExamsEvaluated());
            System.out.printf("  Execution Duration       : %d ms%n", report.getDurationMillis());
            System.out.printf("  Worker Threads Utilized  : %d%n", report.getThreadCountUsed());
            System.out.println("--------------------------------------------------------------------------------");
            System.out.printf("  %-10s | %-18s | %-4s | %-4s | %-5s | %-8s | %-8s%n",
                    "ID", "Name", "Dept", "Year", "CGPA", "Eligible", "Shortfall");
            System.out.println("--------------------------------------------------------------------------------");

            for (var entry : report.getResults().entrySet()) {
                Student s = entry.getKey();
                List<EvaluationResult> res = entry.getValue();
                long el = res.stream().filter(EvaluationResult::isEligible).count();
                long sf = res.size() - el;
                System.out.printf("  %-10s | %-18s | %-4s | Yr %-1d | %5.2f | %-8d | %-8d%n",
                        s.getId(), s.getName(), s.getBranch().name(), s.getCurrentYear(), s.getCgpa(), el, sf);

                auditWriter.recordEvaluation(s, res);
            }
            System.out.println("--------------------------------------------------------------------------------");
            System.out.println("Batch evaluation audit logs persisted to data/audit_logs.txt");

        } catch (Exception e) {
            System.err.println("[Batch Error] " + e.getMessage());
        }
    }

    private static void displayExamCatalog(EligibilityEngine engine) {
        System.out.println("\n=== Registered Examination & Recruitment Catalog ===");
        List<Exam> exams = engine.getAllExams();
        System.out.printf("Total pathways registered: %d%n%n", exams.size());

        for (Exam e : exams) {
            System.out.printf(" * [%-10s] %s%n", e.getExamCode(), e.getExamName());
            System.out.printf("   Category: %-25s | Conducting Body: %s%n", e.getExamType().getTitle(), e.getConductingBody());
            System.out.printf("   Min Year: %-5d | Min CGPA: %-6.2f | Max Age: %-5d | Max Backlogs: %d%n",
                    e.getMinEligibleYear(), e.getBaseMinCgpa(), e.getBaseMaxAge(), e.getMaxAllowedActiveBacklogs());
            System.out.printf("   Description: %s%n%n", e.getDescription());
        }
    }

    private static void handleExportStudentReport(Scanner scanner, EligibilityEngine engine) {
        System.out.println("\n--- Export Shortfall Report to Disk ---");
        try {
            System.out.print("Enter Student Name: ");
            String name = scanner.nextLine().trim();
            System.out.print("Enter Branch (e.g. IT, CSE, ME): ");
            Branch branch = Branch.fromString(scanner.nextLine().trim());
            System.out.print("Enter Current Year (1-4): ");
            int year = Integer.parseInt(scanner.nextLine().trim());
            System.out.print("Enter CGPA: ");
            double cgpa = Double.parseDouble(scanner.nextLine().trim());
            System.out.print("Enter Active Backlogs: ");
            int backlogs = Integer.parseInt(scanner.nextLine().trim());

            Student student = new Student("EXP-" + System.currentTimeMillis() % 10000, name, 21, branch, year, cgpa, Category.GENERAL, backlogs);
            List<EvaluationResult> results = engine.evaluate(student);

            File exported = ReportExporter.exportStudentReport(student, results, "data");
            System.out.printf("[Export Success] Comprehensive shortfall report written to:%n  %s%n", exported.getAbsolutePath());

        } catch (Exception e) {
            System.err.println("[Export Error] " + e.getMessage());
        }
    }

    private static void printBanner() {
        System.out.println("""
        ========================================================================================
         DISHA : Clear Direction for Your Next Big Step
         Rule-Based Undergraduate Eligibility Engine & Shortfall Diagnostic System
         Version %s | Running on Java %s
        ========================================================================================
        """.formatted(VERSION, System.getProperty("java.version")));
    }

    private static void printMenu() {
        System.out.println("""
        +--------------------------------------------------------------------------------------+
        |                                  MAIN CONTROL MENU                                   |
        +--------------------------------------------------------------------------------------+
        | 1. Run Live OOP Rubric Demonstration (Predefined Personas & Exception Handling)     |
        | 2. Evaluate Single Student Profile Interactively                                    |
        | 3. Process Batch Dataset via Multithreading (data/students_sample.csv)              |
        | 4. View Registered Exam Catalog & Eligibility Rules                                  |
        | 5. Export Actionable Shortfall Diagnostic Report to File                             |
        | 6. Check Web GUI & REST API Status (http://localhost:8080)                           |
        | 7. Exit System                                                                       |
        +--------------------------------------------------------------------------------------+
        """);
    }
}
