package com.disha.models;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Result of evaluating a student against an exam.
 * Encapsulates eligibility status, score cutoffs, and detailed shortfall lists.
 */
public class EvaluationResult implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum Status {
        ELIGIBLE,
        SHORTFALL
    }

    private final String examCode;
    private final String examName;
    private final String examCategory;
    private final Status status;
    private final double minCgpaCutoff;
    private final double studentCgpa;
    private final List<ShortfallDetail> shortfalls;
    private final String primaryAdvice;

    // Parameterized constructor
    public EvaluationResult(String examCode, String examName, String examCategory,
                            Status status, double minCgpaCutoff, double studentCgpa,
                            List<ShortfallDetail> shortfalls, String primaryAdvice) {
        this.examCode = examCode;
        this.examName = examName;
        this.examCategory = examCategory;
        this.status = status;
        this.minCgpaCutoff = minCgpaCutoff;
        this.studentCgpa = studentCgpa;
        this.shortfalls = shortfalls != null ? new ArrayList<>(shortfalls) : new ArrayList<>();
        this.primaryAdvice = primaryAdvice != null ? primaryAdvice : "";
    }

    // Overloaded factory method for successful eligibility
    public static EvaluationResult eligible(String examCode, String examName, String examCategory,
                                            double minCgpaCutoff, double studentCgpa, String positiveAdvice) {
        return new EvaluationResult(examCode, examName, examCategory, Status.ELIGIBLE,
                minCgpaCutoff, studentCgpa, Collections.emptyList(), positiveAdvice);
    }

    // Overloaded factory method for shortfalls
    public static EvaluationResult shortfall(String examCode, String examName, String examCategory,
                                             double minCgpaCutoff, double studentCgpa,
                                             List<ShortfallDetail> shortfalls, String correctiveAdvice) {
        return new EvaluationResult(examCode, examName, examCategory, Status.SHORTFALL,
                minCgpaCutoff, studentCgpa, shortfalls, correctiveAdvice);
    }

    public boolean isEligible() {
        return status == Status.ELIGIBLE;
    }

    public String getExamCode() {
        return examCode;
    }

    public String getExamName() {
        return examName;
    }

    public String getExamCategory() {
        return examCategory;
    }

    public Status getStatus() {
        return status;
    }

    public double getMinCgpaCutoff() {
        return minCgpaCutoff;
    }

    public double getStudentCgpa() {
        return studentCgpa;
    }

    public List<ShortfallDetail> getShortfalls() {
        return Collections.unmodifiableList(shortfalls);
    }

    public String getPrimaryAdvice() {
        return primaryAdvice;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("[%s] %s (%s) - STATUS: %s%n",
                examCode, examName, examCategory, status));
        sb.append(String.format("   CGPA Cutoff: %.2f | Student: %.2f%n", minCgpaCutoff, studentCgpa));
        if (isEligible()) {
            sb.append("   Summary: Fully meets criteria. ").append(primaryAdvice).append("\n");
        } else {
            sb.append("   Shortfalls (").append(shortfalls.size()).append("):\n");
            for (ShortfallDetail s : shortfalls) {
                sb.append("     - ").append(s.toString()).append("\n");
            }
            sb.append("   Actionable Path: ").append(primaryAdvice).append("\n");
        }
        return sb.toString();
    }
}
