package com.disha.exams;

import com.disha.models.Category;
import com.disha.models.ShortfallDetail;
import com.disha.models.Student;

import java.util.List;

/**
 * Domain-specific subclass representing Central Government & Nationalized Banking Examinations
 * such as SSC-CGL (Inspector/Auditor) and IBPS/SBI PO.
 * Demonstrates OOP Inheritance, Encapsulation, and Polymorphic Category Age/Attempts calculation.
 */
public class GovernmentBankingExam extends Exam {
    private static final long serialVersionUID = 1L;

    private final String conductingAgency; // e.g. "Staff Selection Commission", "Institute of Banking Personnel Selection"
    private final boolean requiresFinalDegree;

    public GovernmentBankingExam(String examCode, String examName, String conductingBody,
                                String description, double baseMinCgpa, int minAge, int baseMaxAge,
                                int minEligibleYear, int maxAllowedActiveBacklogs,
                                String conductingAgency, boolean requiresFinalDegree) {
        super(examCode, examName, ExamType.GOVERNMENT_BANKING, conductingBody, description,
                baseMinCgpa, minAge, baseMaxAge, minEligibleYear, maxAllowedActiveBacklogs);
        this.conductingAgency = conductingAgency != null ? conductingAgency : "Central Recruitment Board";
        this.requiresFinalDegree = requiresFinalDegree;
    }

    public String getConductingAgency() {
        return conductingAgency;
    }

    public boolean isRequiresFinalDegree() {
        return requiresFinalDegree;
    }

    @Override
    protected void evaluateDomainSpecificRules(Student student, List<ShortfallDetail> shortfalls) {
        // Degree completion requirement at the time of final document verification
        if (requiresFinalDegree && student.getCurrentYear() < 4 && !student.isDegreeCompleted()) {
            shortfalls.add(new ShortfallDetail(
                    "Degree Eligibility",
                    "Final Year Appearing or Graduate Degree Awarded",
                    "Currently in Year " + student.getCurrentYear(),
                    "Candidates may apply in their final year (Year 4) provided final results are declared before document verification."
            ));
        }

        // Category-specific age limit verification
        int relaxedMaxAge = switch (student.getCategory()) {
            case GENERAL, EWS -> baseMaxAge;
            case OBC_NCL -> baseMaxAge + 3;
            case SC, ST -> baseMaxAge + 5;
        };

        if (student.getAge() > relaxedMaxAge) {
            shortfalls.add(new ShortfallDetail(
                    "Government Service Upper Age Limit",
                    String.format("Max %d years (Category %s)", relaxedMaxAge, student.getCategory().name()),
                    student.getAge() + " years",
                    "Age exceeds permissible limit for " + examName + ". Consider lateral or state-level age relaxations."
            ));
        }
    }

    @Override
    protected String generateEligibleAdvice(Student student) {
        return String.format("Eligible for %s. High vacancy recruitment with nationwide postings. Recommended preparation focus: Speed Mathematics, Reasoning, and General Financial Awareness.",
                examName);
    }
}
