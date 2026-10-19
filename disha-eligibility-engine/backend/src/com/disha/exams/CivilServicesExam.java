package com.disha.exams;

import com.disha.models.Category;
import com.disha.models.ShortfallDetail;
import com.disha.models.Student;

import java.util.List;

/**
 * Domain-specific subclass representing Civil and Administrative Services Examinations
 * such as UPSC CSE (IAS/IPS/IFS) and State PSCs.
 */
public class CivilServicesExam extends Exam {
    private static final long serialVersionUID = 1L;

    private final int maxAttemptsGeneral;
    private final int maxAttemptsObc;
    private final boolean degreeMandatoryForMains;

    public CivilServicesExam(String examCode, String examName, String conductingBody,
                             String description, double baseMinCgpa, int minAge, int baseMaxAge,
                             int minEligibleYear, int maxAttemptsGeneral, int maxAttemptsObc,
                             boolean degreeMandatoryForMains) {
        // UPSC accepts all branches, min year 4 (or degree complete), backlogs don't bar prelims entry if cleared
        super(examCode, examName, ExamType.CIVIL_SERVICES, conductingBody, description,
                baseMinCgpa, minAge, baseMaxAge, minEligibleYear, 5);
        this.maxAttemptsGeneral = maxAttemptsGeneral;
        this.maxAttemptsObc = maxAttemptsObc;
        this.degreeMandatoryForMains = degreeMandatoryForMains;
    }

    public int getMaxAttemptsForCategory(Category category) {
        if (category == null) return maxAttemptsGeneral;
        return switch (category) {
            case GENERAL, EWS -> maxAttemptsGeneral;
            case OBC_NCL -> maxAttemptsObc;
            case SC, ST -> Integer.MAX_VALUE; // Unlimited up to age limit
        };
    }

    @Override
    protected void evaluateDomainSpecificRules(Student student, List<ShortfallDetail> shortfalls) {
        // Must be in final year or completed degree
        if (student.getCurrentYear() < 4 && !student.isDegreeCompleted()) {
            shortfalls.add(new ShortfallDetail(
                    "Degree Status for Civil Services",
                    "Final Year Appearing (Year 4) or Graduate",
                    "Year " + student.getCurrentYear(),
                    "Undergraduate students can sit for UPSC Prelims during their final year of study."
            ));
        }

        // Age cutoff check with standard civil service relaxation
        int maxAllowedAge = switch (student.getCategory()) {
            case GENERAL, EWS -> baseMaxAge;
            case OBC_NCL -> baseMaxAge + 3;
            case SC, ST -> baseMaxAge + 5;
        };

        if (student.getAge() > maxAllowedAge) {
            shortfalls.add(new ShortfallDetail(
                    "UPSC Age Ceiling",
                    String.format("Max %d years for %s", maxAllowedAge, student.getCategory().name()),
                    student.getAge() + " years",
                    "Age exceeds permissible limit for UPSC CSE under your current category."
            ));
        }
    }

    @Override
    protected String generateEligibleAdvice(Student student) {
        int attempts = getMaxAttemptsForCategory(student.getCategory());
        String attemptsText = (attempts == Integer.MAX_VALUE) ? "Unlimited (until age ceiling)" : String.valueOf(attempts);
        return String.format("Eligible for %s. Permissible Attempts: %s. Select optional subject aligned with engineering domain.",
                examName, attemptsText);
    }
}
