package com.disha.exams;

import com.disha.models.Branch;
import com.disha.models.ShortfallDetail;
import com.disha.models.Student;

import java.util.List;
import java.util.Set;

/**
 * Domain-specific subclass representing Corporate Placement and SDE Hiring Drives
 * (e.g. Google/Amazon Tier-1 SDE, TCS Digital / Infosys SP, Microsoft College Drives).
 */
public class CorporateDriveExam extends Exam {
    private static final long serialVersionUID = 1L;

    private final double minTenthPercentage;
    private final double minTwelfthPercentage;
    private final boolean isTierOneProduct;

    public CorporateDriveExam(String examCode, String examName, String conductingBody,
                              String description, double baseMinCgpa, int minAge, int baseMaxAge,
                              int minEligibleYear, Set<Branch> allowedBranches,
                              double minTenthPercentage, double minTwelfthPercentage, boolean isTierOneProduct) {
        super(examCode, examName, ExamType.CORPORATE_SDE, conductingBody, description,
                baseMinCgpa, minAge, baseMaxAge, minEligibleYear, 0, allowedBranches);
        this.minTenthPercentage = minTenthPercentage;
        this.minTwelfthPercentage = minTwelfthPercentage;
        this.isTierOneProduct = isTierOneProduct;
    }

    public double getMinTenthPercentage() {
        return minTenthPercentage;
    }

    public double getMinTwelfthPercentage() {
        return minTwelfthPercentage;
    }

    public boolean isTierOneProduct() {
        return isTierOneProduct;
    }

    @Override
    protected void evaluateDomainSpecificRules(Student student, List<ShortfallDetail> shortfalls) {
        // 10th Standard Cutoff Check
        if (student.getTenthPercentage() < minTenthPercentage) {
            shortfalls.add(new ShortfallDetail(
                    "Class 10th Academic Cutoff",
                    String.format("Minimum %.1f%% aggregate", minTenthPercentage),
                    String.format("%.1f%%", student.getTenthPercentage()),
                    "Campus placement eligibility criteria strictly evaluates secondary school performance consistency."
            ));
        }

        // 12th Standard Cutoff Check
        if (student.getTwelfthPercentage() < minTwelfthPercentage) {
            shortfalls.add(new ShortfallDetail(
                    "Class 12th Academic Cutoff",
                    String.format("Minimum %.1f%% aggregate", minTwelfthPercentage),
                    String.format("%.1f%%", student.getTwelfthPercentage()),
                    "Higher secondary academic record does not satisfy minimum recruitment criteria."
            ));
        }

        // Active Backlogs Rule (strictly 0 for campus placement test drives)
        if (student.getActiveBacklogs() > 0) {
            shortfalls.add(new ShortfallDetail(
                    "Campus Placement Arrears Policy",
                    "0 Active Backlogs at time of test shortlisting",
                    student.getActiveBacklogs() + " active backlog(s)",
                    "Clear ongoing arrears before placement cell registration to qualify for coding round access."
            ));
        }
    }

    @Override
    protected String generateEligibleAdvice(Student student) {
        if (isTierOneProduct) {
            return String.format("Eligible for %s. Focus on DSA (Data Structures & Algorithms), System Design fundamentals, and core CS subjects.",
                    examName);
        }
        return String.format("Eligible for %s. Prepare for online assessment covering aptitude, programming, and verbal skills.",
                examName);
    }
}
