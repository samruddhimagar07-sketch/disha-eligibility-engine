package com.disha.io;

import com.disha.exceptions.FileProcessingException;
import com.disha.models.EvaluationResult;
import com.disha.models.Student;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * File handling utility for persisting transactional evaluation audit trails.
 * Uses BufferedWriter and FileWriter in append mode.
 */
public class AuditLogWriter {

    private final String logFilePath;
    private final Object writeLock = new Object();

    public AuditLogWriter(String logFilePath) {
        this.logFilePath = logFilePath != null ? logFilePath : "data/audit_logs.txt";
        ensureParentDirectoryExists();
    }

    private void ensureParentDirectoryExists() {
        File f = new File(logFilePath);
        File parent = f.getParentFile();
        if (parent != null && !parent.exists()) {
            parent.mkdirs();
        }
    }

    /**
     * Appends an audit entry for a student's evaluation results.
     */
    public void recordEvaluation(Student student, List<EvaluationResult> results) throws FileProcessingException {
        if (student == null || results == null) return;

        synchronized (writeLock) {
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(logFilePath, true))) {
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                String threadName = Thread.currentThread().getName();

                long eligibleCount = results.stream().filter(EvaluationResult::isEligible).count();
                long shortfallCount = results.size() - eligibleCount;

                String summaryLine = String.format("[%s] [THREAD: %s] STUDENT: %s (ID: %s, %s Yr %d, CGPA: %.2f) | Evaluated: %d | Eligible: %d | Shortfalls: %d%n",
                        timestamp, threadName, student.getName(), student.getId(),
                        student.getBranch().name(), student.getCurrentYear(), student.getCgpa(),
                        results.size(), eligibleCount, shortfallCount);

                writer.write(summaryLine);

                for (EvaluationResult r : results) {
                    writer.write(String.format("    -> [%s] %s: %s (Cutoff: %.2f | Shortfalls: %d)%n",
                            r.getExamCode(), r.getExamName(), r.getStatus(), r.getMinCgpaCutoff(), r.getShortfalls().size()));
                }
                writer.flush();
            } catch (IOException ioe) {
                throw new FileProcessingException("Failed writing evaluation to audit log", logFilePath, ioe);
            }
        }
    }

    public String getLogFilePath() {
        return logFilePath;
    }
}
