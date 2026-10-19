package com.disha.exams;

import com.disha.models.Branch;
import com.disha.models.ShortfallDetail;
import com.disha.models.Student;

import java.util.List;
import java.util.Set;

/**
 * Domain-specific subclass representing International Graduate Examinations
 * for MS/Ph.D. and Global MBA admissions (e.g., GRE General, TOEFL, GMAT).
 * Demonstrates OOP Inheritance, Encapsulation, and Polymorphism.
 */
public class AbroadHigherStudiesExam extends Exam {
    private static final long serialVersionUID = 1L;

    private final String targetDegree;        // e.g. "MS in Computer Science / Data Science", "Global MBA"
    private final boolean requiresPassport;   // Mandatory for GRE/GMAT
    private final double recommendedMinCgpa;  // Higher benchmark for top 50 global universities

    public AbroadHigherStudiesExam(String examCode, String examName, String conductingBody,
                                  String description, double baseMinCgpa, int minAge, int baseMaxAge,
                                  int minEligibleYear, int maxAllowedActiveBacklogs, Set<Branch> allowedBranches,
                                  String targetDegree, boolean requiresPassport, double recommendedMinCgpa) {
        super(examCode, examName, ExamType.HIGHER_STUDIES_ABROAD, conductingBody, description,
                baseMinCgpa, minAge, baseMaxAge, minEligibleYear, maxAllowedActiveBacklogs, allowedBranches);
        this.targetDegree = targetDegree != null ? targetDegree : "Master of Science (MS)";
        this.requiresPassport = requiresPassport;
        this.recommendedMinCgpa = recommendedMinCgpa;
    }

    public String getTargetDegree() {
        return targetDegree;
    }

    public boolean isRequiresPassport() {
        return requiresPassport;
    }

    public double getRecommendedMinCgpa() {
        return recommendedMinCgpa;
    }

    @Override
    protected void evaluateDomainSpecificRules(Student student, List<ShortfallDetail> shortfalls) {
        // Active backlogs strictly deter US/European university admissions
        if (student.getActiveBacklogs() > 0) {
            shortfalls.add(new ShortfallDetail(
                    "Backlog Clearance for Global Admissions",
                    "0 Active Backlogs (Clean academic transcript mandatory for I-20/CAS)",
                    student.getActiveBacklogs() + " active backlog(s)",
                    "International admissions committees require all backlogs cleared prior to transcript submission."
            ));
        }

        // 10th and 12th percentage baseline for Visa and university profile evaluation
        if (student.getTwelfthPercentage() < 60.0) {
            shortfalls.add(new ShortfallDetail(
                    "12th Grade Foundation",
                    "Minimum 60.0% in Senior Secondary (12th)",
                    student.getTwelfthPercentage() + "%",
                    "Ensure strong academic justification or research publications to offset 12th grade marks."
            ));
        }
    }

    @Override
    protected String generateEligibleAdvice(Student student) {
        if (student.getCgpa() >= recommendedMinCgpa) {
            return String.format("Outstanding profile for Top 50 Global Universities (%s)! CGPA %.2f exceeds recommended benchmark %.2f. Target GRE Quantitative 165+.",
                    targetDegree, student.getCgpa(), recommendedMinCgpa);
        } else {
            return String.format("Eligible for %s. Current CGPA %.2f qualifies for Top 100-200 institutions. Boost profile with GRE/TOEFL scores, SOP, and academic research.",
                    targetDegree, student.getCgpa());
        }
    }
}
