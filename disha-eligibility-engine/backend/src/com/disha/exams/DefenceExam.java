package com.disha.exams;

import com.disha.models.Branch;
import com.disha.models.Gender;
import com.disha.models.ShortfallDetail;
import com.disha.models.Student;

import java.util.List;
import java.util.Set;

/**
 * Domain-specific subclass representing Armed Forces and Defence Services Examinations
 * such as CDS (Combined Defence Services), AFCAT (Air Force), and Indian Navy Technical Entry.
 */
public class DefenceExam extends Exam {
    private static final long serialVersionUID = 1L;

    private final String serviceWing; // e.g. "Air Force Flying/Ground Duty", "Army IMA/OTA", "Naval Academy"
    private final double minTwelfthSciencePercentage;
    private final boolean requiresZeroBacklogsStrict;
    private final Gender allowedGender; // null means all genders eligible

    public DefenceExam(String examCode, String examName, String conductingBody,
                       String description, double baseMinCgpa, int minAge, int baseMaxAge,
                       int minEligibleYear, Set<Branch> allowedBranches, String serviceWing,
                       double minTwelfthSciencePercentage, boolean requiresZeroBacklogsStrict,
                       Gender allowedGender) {
        super(examCode, examName, ExamType.DEFENCE, conductingBody, description,
                baseMinCgpa, minAge, baseMaxAge, minEligibleYear, 0, allowedBranches);
        this.serviceWing = serviceWing;
        this.minTwelfthSciencePercentage = minTwelfthSciencePercentage;
        this.requiresZeroBacklogsStrict = requiresZeroBacklogsStrict;
        this.allowedGender = allowedGender;
    }

    public String getServiceWing() {
        return serviceWing;
    }

    public double getMinTwelfthSciencePercentage() {
        return minTwelfthSciencePercentage;
    }

    public boolean isRequiresZeroBacklogsStrict() {
        return requiresZeroBacklogsStrict;
    }

    public Gender getAllowedGender() {
        return allowedGender;
    }

    @Override
    protected void evaluateDomainSpecificRules(Student student, List<ShortfallDetail> shortfalls) {
        // Gender suitability rule
        if (allowedGender != null && student.getGender() != allowedGender) {
            shortfalls.add(new ShortfallDetail(
                    "Gender Criterion",
                    "Restricted to " + allowedGender.name() + " candidates",
                    student.getGender().name(),
                    "Consider alternative entry schemes (e.g. OTA Women entry for Army or Non-Tech entries)."
            ));
        }

        // Strict 10+2 science cutoff rule for technical branches (AFCAT/Naval Tech)
        if (minTwelfthSciencePercentage > 0 && student.getTwelfthPercentage() < minTwelfthSciencePercentage) {
            shortfalls.add(new ShortfallDetail(
                    "10+2 Science Percentage",
                    String.format("Minimum %.1f%% in Class 12 (Maths & Physics mandatory)", minTwelfthSciencePercentage),
                    String.format("%.1f%%", student.getTwelfthPercentage()),
                    "Higher secondary science aggregate falls below the armed forces technical academy cutoff."
            ));
        }

        // Strict active backlog prohibition
        if (requiresZeroBacklogsStrict && student.getActiveBacklogs() > 0) {
            shortfalls.add(new ShortfallDetail(
                    "SSB Backlog Policy",
                    "0 Active Backlogs (Clean academic slate required at SSB interview)",
                    student.getActiveBacklogs() + " active backlog(s)",
                    "Defence Service Selection Boards (SSB) immediately disqualify candidates with ongoing arrears."
            ));
        }
    }

    @Override
    protected String generateEligibleAdvice(Student student) {
        return String.format("Eligible for %s (%s). Maintain peak physical fitness and begin SSB psychological prep.",
                examName, serviceWing);
    }
}
