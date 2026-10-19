package com.disha.engine;

import com.disha.models.EvaluationResult;
import com.disha.models.ShortfallDetail;
import com.disha.models.Student;

import java.util.List;

/**
 * Utility responsible for generating clean, actionable terminal shortfall diagnostic reports
 * and human-readable guidance plans for undergraduate students.
 */
public class ShortfallReporter {

    public static String generateComprehensiveReport(Student student, List<EvaluationResult> results) {
        StringBuilder sb = new StringBuilder();
        String line = "=".repeat(88);
        String subline = "-".repeat(88);

        sb.append(line).append("\n");
        sb.append(String.format(" DISHA ELIGIBILITY & SHORTFALL DIAGNOSTIC REPORT%n"));
        sb.append(String.format(" Candidate: %s (ID: %s) | Branch: %s | Year: %d | CGPA: %.2f | Category: %s | Backlogs: %d%n",
                student.getName(), student.getId(), student.getBranch().name(),
                student.getCurrentYear(), student.getCgpa(), student.getCategory().name(), student.getActiveBacklogs()));
        sb.append(line).append("\n\n");

        // Section 1: Eligible Pathways
        long eligibleCount = results.stream().filter(EvaluationResult::isEligible).count();
        sb.append(String.format("[+] ELIGIBLE CAREER PATHWAYS (%d FOUND)%n", eligibleCount));
        sb.append(subline).append("\n");

        if (eligibleCount == 0) {
            sb.append("  (No direct pathways currently open based on current academic semester/metrics)\n");
        } else {
            for (EvaluationResult r : results) {
                if (r.isEligible()) {
                    sb.append(String.format("  * [%-10s] %-46s | Cutoff: %4.2f | %s%n",
                            r.getExamCode(), r.getExamName(), r.getMinCgpaCutoff(), r.getPrimaryAdvice()));
                }
            }
        }
        sb.append("\n");

        // Section 2: Ineligible Pathways with Shortfalls
        long shortfallCount = results.size() - eligibleCount;
        sb.append(String.format("[-] RESTRICTED PATHWAYS & ACTIONABLE SHORTFALLS (%d EXAMS)%n", shortfallCount));
        sb.append(subline).append("\n");

        int index = 1;
        for (EvaluationResult r : results) {
            if (!r.isEligible()) {
                sb.append(String.format("  %d. [%s] %s (%s)%n", index++, r.getExamCode(), r.getExamName(), r.getExamCategory()));
                sb.append(String.format("     Baseline CGPA Cutoff: %.2f | Student CGPA: %.2f%n", r.getMinCgpaCutoff(), r.getStudentCgpa()));
                sb.append("     Identified Disqualifying Shortfalls:\n");

                for (ShortfallDetail s : r.getShortfalls()) {
                    sb.append(String.format("       x %-25s | Criteria: %-28s | Current: %s%n",
                            s.getParameter(), s.getRequiredCriteria(), s.getActualValue()));
                    sb.append(String.format("         -> Action: %s%n", s.getActionableAdvice()));
                }
                sb.append("\n");
            }
        }

        sb.append(line).append("\n");
        sb.append(" Recommendation: Review priority actions above to bridge academic arrears and CGPA gaps.\n");
        sb.append(line).append("\n");

        return sb.toString();
    }
}
