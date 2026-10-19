package com.disha.engine;

import com.disha.models.EvaluationResult;
import com.disha.models.Student;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * High-performance Multithreaded Evaluation Engine.
 * Utilizes Java's Concurrency Framework (ExecutorService, Callables, Futures,
 * thread-safe queues, and atomic variables) to concurrently process large batches
 * of student profiles across CPU cores.
 */
public class ConcurrentEvaluationEngine {

    private final EligibilityEngine coreEngine;
    private final ExecutorService threadPool;
    private final int threadCount;

    // Concurrency metrics and telemetry
    private final AtomicInteger totalEvaluations = new AtomicInteger(0);
    private final AtomicInteger eligibleMatches = new AtomicInteger(0);
    private final AtomicInteger shortfallMatches = new AtomicInteger(0);
    private final AtomicLong totalExecutionTimeNanos = new AtomicLong(0);

    public ConcurrentEvaluationEngine(EligibilityEngine coreEngine) {
        this(coreEngine, Math.max(2, Runtime.getRuntime().availableProcessors()));
    }

    public ConcurrentEvaluationEngine(EligibilityEngine coreEngine, int threadCount) {
        this.coreEngine = Objects.requireNonNull(coreEngine, "EligibilityEngine must not be null");
        this.threadCount = Math.max(1, threadCount);
        this.threadPool = Executors.newFixedThreadPool(this.threadCount, new ThreadFactory() {
            private final AtomicInteger id = new AtomicInteger(1);
            @Override
            public Thread newThread(Runnable r) {
                Thread t = new Thread(r, "Disha-Worker-" + id.getAndIncrement());
                t.setDaemon(true);
                return t;
            }
        });
    }

    /**
     * Encapsulates batch evaluation output.
     */
    public static class BatchReport {
        private final Map<Student, List<EvaluationResult>> results;
        private final int totalStudents;
        private final int totalExamsEvaluated;
        private final long durationMillis;
        private final int threadCountUsed;

        public BatchReport(Map<Student, List<EvaluationResult>> results, int totalStudents,
                           int totalExamsEvaluated, long durationMillis, int threadCountUsed) {
            this.results = results;
            this.totalStudents = totalStudents;
            this.totalExamsEvaluated = totalExamsEvaluated;
            this.durationMillis = durationMillis;
            this.threadCountUsed = threadCountUsed;
        }

        public Map<Student, List<EvaluationResult>> getResults() {
            return results;
        }

        public int getTotalStudents() {
            return totalStudents;
        }

        public int getTotalExamsEvaluated() {
            return totalExamsEvaluated;
        }

        public long getDurationMillis() {
            return durationMillis;
        }

        public int getThreadCountUsed() {
            return threadCountUsed;
        }

        @Override
        public String toString() {
            return String.format("BatchReport[Students: %d | Total Evaluations: %d | Time: %d ms | Threads: %d]",
                    totalStudents, totalExamsEvaluated, durationMillis, threadCountUsed);
        }
    }

    /**
     * Concurrently evaluates an entire collection of students using thread pool workers.
     * Each student is evaluated in parallel.
     */
    public BatchReport evaluateBatch(List<Student> students) throws InterruptedException, ExecutionException {
        if (students == null || students.isEmpty()) {
            return new BatchReport(Collections.emptyMap(), 0, 0, 0, threadCount);
        }

        long start = System.nanoTime();
        Map<Student, List<EvaluationResult>> resultMap = new ConcurrentHashMap<>();
        List<Future<StudentEvaluationTaskResult>> futures = new ArrayList<>();

        for (Student student : students) {
            Callable<StudentEvaluationTaskResult> task = () -> {
                String workerName = Thread.currentThread().getName();
                List<EvaluationResult> res = coreEngine.evaluate(student);

                // Update thread-safe atomic telemetry
                int eligibleCount = 0;
                int shortfallCount = 0;
                for (EvaluationResult r : res) {
                    if (r.isEligible()) eligibleCount++;
                    else shortfallCount++;
                }
                totalEvaluations.addAndGet(res.size());
                eligibleMatches.addAndGet(eligibleCount);
                shortfallMatches.addAndGet(shortfallCount);

                return new StudentEvaluationTaskResult(student, res, workerName);
            };

            futures.add(threadPool.submit(task));
        }

        // Gather all futures safely
        int totalEvaluated = 0;
        for (Future<StudentEvaluationTaskResult> future : futures) {
            StudentEvaluationTaskResult taskResult = future.get();
            resultMap.put(taskResult.student, taskResult.results);
            totalEvaluated += taskResult.results.size();
        }

        long durationNanos = System.nanoTime() - start;
        totalExecutionTimeNanos.addAndGet(durationNanos);
        long durationMillis = TimeUnit.NANOSECONDS.toMillis(durationNanos);

        return new BatchReport(resultMap, students.size(), totalEvaluated, durationMillis, threadCount);
    }

    /**
     * Executes asynchronous evaluation and completes a CompletableFuture,
     * ensuring non-blocking operations for UI or HTTP servers.
     */
    public CompletableFuture<List<EvaluationResult>> evaluateAsync(Student student) {
        return CompletableFuture.supplyAsync(() -> coreEngine.evaluate(student), threadPool);
    }

    /**
     * Gracefully shuts down the worker thread pool.
     */
    public void shutdown() {
        threadPool.shutdown();
        try {
            if (!threadPool.awaitTermination(3, TimeUnit.SECONDS)) {
                threadPool.shutdownNow();
            }
        } catch (InterruptedException e) {
            threadPool.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    public int getTotalEvaluations() {
        return totalEvaluations.get();
    }

    public int getEligibleMatches() {
        return eligibleMatches.get();
    }

    public int getShortfallMatches() {
        return shortfallMatches.get();
    }

    public int getThreadCount() {
        return threadCount;
    }

    private static class StudentEvaluationTaskResult {
        final Student student;
        final List<EvaluationResult> results;
        final String workerName;

        StudentEvaluationTaskResult(Student student, List<EvaluationResult> results, String workerName) {
            this.student = student;
            this.results = results;
            this.workerName = workerName;
        }
    }
}
