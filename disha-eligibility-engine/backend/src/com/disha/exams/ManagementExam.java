package com.disha.exams;

import com.disha.models.Category;
import com.disha.models.ShortfallDetail;
import com.disha.models.Student;

import java.util.List;

/**
 * Domain-specific subclass representing Management Entrance Examinations
 * such as CAT (IIMs), XAT (XLRI), and SNAP (Symbiosis).
 */
public class ManagementExam extends Exam {
    private static final long serialVersionUID = 1L;

    private final double generalMinPercentage;
    private final double reservedMinPercentage;
    private final boolean allowsBacklogsDuringExam;

    public ManagementExam(String examCode, String examName, String conductingBody,
                          String description, double generalMinCgpa, int minAge, int baseMaxAge,
                          int minEligibleYear, double generalMinPercentage, double reservedMinPercentage,
                          boolean allowsBacklogsDuringExam) {
        // CAT allows backlogs during exam sitting if cleared by admission date
        super(examCode, examName, ExamType.MANAGEMENT, conductingBody, description,
                generalMinCgpa, minAge, baseMaxAge, minEligibleYear,
                allowsBacklogsDuringExam ? 4 : 0);
        this.generalMinPercentage = generalMinPercentage;
        this.reservedMinPercentage = reservedMinPercentage;
        this.allowsBacklogsDuringExam = allowsBacklogsDuringExam;
    }

    public double getGeneralMinPercentage() {
        return generalMinPercentage;
    }

    public double getReservedMinPercentage() {
        return reservedMinPercentage;
    }

    public boolean isAllowsBacklogsDuringExam() {
        return allowsBacklogsDuringExam;
    }

    @Override
    protected void evaluateDomainSpecificRules(Student student, List<ShortfallDetail> shortfalls) {
        // Evaluate percentage equivalent (CGPA * 9.5)
        double requiredPercent = (student.getCategory() == Category.SC || student.getCategory() == Category.ST)
                ? reservedMinPercentage
                : generalMinPercentage;

        double studentPercent = student.getApproxPercentage();

        if (studentPercent < requiredPercent) {
            shortfalls.add(new ShortfallDetail(
                    "Graduation Percentage Equivalent",
                    String.format("%.1f%% required for %s", requiredPercent, student.getCategory().name()),
                    String.format("%.1f%% (CGPA %.2f * 9.5)", studentPercent, student.getCgpa()),
                    String.format("Requires graduation aggregate of at least %.1f%% to fulfill IIM/B-School minimum.", requiredPercent)
            ));
        }

        // Informative guidance on active backlogs during CAT
        if (allowsBacklogsDuringExam && student.getActiveBacklogs() > 0) {
            // Note: student can sit for CAT, but will receive a conditional shortfall notice if they exceed 3
            if (student.getActiveBacklogs() > 3) {
                shortfalls.add(new ShortfallDetail(
                        "Risk of Admission Ineligibility",
                        "Must clear all backlogs prior to June IIM registration",
                        student.getActiveBacklogs() + " active backlogs",
                        "High academic load. You may register for CAT, but all backlog exams must be cleared before admission."
                ));
            }
        }
    }

    @Override
    protected String generateEligibleAdvice(Student student) {
        return String.format("Eligible for %s. B-School profile emphasizes percentile, diversity, and CGPA consistency.",
                examName);
    }
}
