package com.disha.exams;

import com.disha.models.Branch;
import com.disha.models.ShortfallDetail;
import com.disha.models.Student;

import java.util.List;
import java.util.Set;

/**
 * Domain-specific subclass representing Technical & PSU Recruitment Examinations
 * such as GATE (CS/IT, ECE, ME) and direct recruitment drives (ISRO, IOCL, BARC).
 */
public class TechnicalExam extends Exam {
    private static final long serialVersionUID = 1L;

    private final String paperCode;
    private final boolean requiresEngineeringDegree;
    private final boolean psuDirectRecruitment;

    public TechnicalExam(String examCode, String examName, String conductingBody,
                         String description, double baseMinCgpa, int minAge, int baseMaxAge,
                         int minEligibleYear, int maxAllowedActiveBacklogs, Set<Branch> allowedBranches,
                         String paperCode, boolean requiresEngineeringDegree, boolean psuDirectRecruitment) {
        super(examCode, examName, ExamType.TECHNICAL, conductingBody, description,
                baseMinCgpa, minAge, baseMaxAge, minEligibleYear, maxAllowedActiveBacklogs, allowedBranches);
        this.paperCode = paperCode;
        this.requiresEngineeringDegree = requiresEngineeringDegree;
        this.psuDirectRecruitment = psuDirectRecruitment;
    }

    public String getPaperCode() {
        return paperCode;
    }

    public boolean isRequiresEngineeringDegree() {
        return requiresEngineeringDegree;
    }

    public boolean isPsuDirectRecruitment() {
        return psuDirectRecruitment;
    }

    @Override
    protected void evaluateDomainSpecificRules(Student student, List<ShortfallDetail> shortfalls) {
        // Rule: Must be an engineering student/graduate if mandated
        if (requiresEngineeringDegree && !student.getBranch().isEngineering()) {
            shortfalls.add(new ShortfallDetail(
                    "Degree Type",
                    "B.E. / B.Tech / Equivalent Engineering Degree",
                    student.getBranch().getDisplayName(),
                    "Technical recruitment requires an AICTE/UGC recognized engineering degree."
            ));
        }

        // Rule: PSU direct recruitment drives strictly enforce 0 active backlogs at time of selection
        if (psuDirectRecruitment && student.getActiveBacklogs() > 0) {
            shortfalls.add(new ShortfallDetail(
                    "PSU Backlog Prohibition",
                    "0 Active Backlogs (Strict Zero Tolerance)",
                    student.getActiveBacklogs() + " active backlog(s)",
                    "PSU recruitment requires an immaculate academic record with zero active arrears at document verification."
            ));
        }

        // Rule: PSU drives usually require passing out year (4th year or graduated)
        if (psuDirectRecruitment && student.getCurrentYear() < 4 && !student.isDegreeCompleted()) {
            shortfalls.add(new ShortfallDetail(
                    "PSU Recruitment Stage",
                    "Final Year (Year 4) or Graduated",
                    "Year " + student.getCurrentYear(),
                    "PSU placement shortlist eligibility begins in the final academic year."
            ));
        }
    }

    @Override
    protected String generateEligibleAdvice(Student student) {
        if (psuDirectRecruitment) {
            return String.format("Eligible for %s direct recruitment. Target top 100 GATE %s ranking for shortlisting.",
                    examName, paperCode);
        }
        return String.format("Eligible to write GATE %s paper. Pre-final (Year 3) & Final (Year 4) scores are valid for 3 years.",
                paperCode);
    }
}
