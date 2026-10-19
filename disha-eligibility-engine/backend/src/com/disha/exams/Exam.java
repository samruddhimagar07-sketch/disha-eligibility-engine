package com.disha.exams;

import com.disha.interfaces.Auditable;
import com.disha.interfaces.Eligible;
import com.disha.interfaces.Exportable;
import com.disha.models.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Abstract Base Class modeling competitive exams and career pathways.
 * Provides shared attributes and coordinates evaluation via the Template Method Pattern.
 * Subclasses implement domain-specific checks via {@link #evaluateDomainSpecificRules(Student, List)}.
 */
public abstract class Exam implements Eligible, Auditable, Exportable, Serializable {
    private static final long serialVersionUID = 1L;

    // Encapsulated state
    protected final String examCode;
    protected final String examName;
    protected final ExamType examType;
    protected final String conductingBody;
    protected final String description;
    protected final double baseMinCgpa;
    protected final int minAge;
    protected final int baseMaxAge;
    protected final int minEligibleYear; // e.g., 3 for GATE, 4/graduate for CAT/UPSC
    protected final int maxAllowedActiveBacklogs;
    protected final Set<Branch> allowedBranches;

    // Parameterized constructor
    protected Exam(String examCode, String examName, ExamType examType, String conductingBody,
                   String description, double baseMinCgpa, int minAge, int baseMaxAge,
                   int minEligibleYear, int maxAllowedActiveBacklogs, Set<Branch> allowedBranches) {
        this.examCode = Objects.requireNonNull(examCode, "Exam code must not be null");
        this.examName = Objects.requireNonNull(examName, "Exam name must not be null");
        this.examType = Objects.requireNonNull(examType, "Exam type must not be null");
        this.conductingBody = conductingBody != null ? conductingBody : "National Testing Agency";
        this.description = description != null ? description : "";
        this.baseMinCgpa = Math.max(0.0, baseMinCgpa);
        this.minAge = Math.max(16, minAge);
        this.baseMaxAge = Math.max(minAge, baseMaxAge);
        this.minEligibleYear = Math.max(1, minEligibleYear);
        this.maxAllowedActiveBacklogs = Math.max(0, maxAllowedActiveBacklogs);
        this.allowedBranches = (allowedBranches != null && !allowedBranches.isEmpty())
                ? EnumSet.copyOf(allowedBranches)
                : EnumSet.allOf(Branch.class);
    }

    // Overloaded convenience constructor (allowing all branches)
    protected Exam(String examCode, String examName, ExamType examType, String conductingBody,
                   String description, double baseMinCgpa, int minAge, int baseMaxAge,
                   int minEligibleYear, int maxAllowedActiveBacklogs) {
        this(examCode, examName, examType, conductingBody, description, baseMinCgpa,
                minAge, baseMaxAge, minEligibleYear, maxAllowedActiveBacklogs, EnumSet.allOf(Branch.class));
    }

    @Override
    public String getExamCode() {
        return examCode;
    }

    @Override
    public String getExamName() {
        return examName;
    }

    @Override
    public ExamType getExamType() {
        return examType;
    }

    @Override
    public String getConductingBody() {
        return conductingBody;
    }

    public String getDescription() {
        return description;
    }

    public double getBaseMinCgpa() {
        return baseMinCgpa;
    }

    public int getMinAge() {
        return minAge;
    }

    public int getBaseMaxAge() {
        return baseMaxAge;
    }

    public int getMinEligibleYear() {
        return minEligibleYear;
    }

    public int getMaxAllowedActiveBacklogs() {
        return maxAllowedActiveBacklogs;
    }

    public Set<Branch> getAllowedBranches() {
        return Collections.unmodifiableSet(allowedBranches);
    }

    /**
     * Calculates the effective minimum CGPA for a student considering category relaxation.
     */
    public double getEffectiveMinCgpa(Category category) {
        if (category == null) return baseMinCgpa;
        double relaxed = baseMinCgpa - category.getStandardCgpaRelaxation();
        return Math.max(4.0, Math.round(relaxed * 100.0) / 100.0);
    }

    /**
     * Calculates the effective maximum age for a student considering category relaxation.
     */
    public int getEffectiveMaxAge(Category category) {
        if (category == null) return baseMaxAge;
        return baseMaxAge + category.getAgeRelaxationYears();
    }

    /**
     * Template Method implementing core validation logic.
     * Evaluates universal invariants, then calls {@link #evaluateDomainSpecificRules(Student, List)}.
     */
    @Override
    public final EvaluationResult checkEligibility(Student student) {
        if (student == null) {
            throw new IllegalArgumentException("Cannot evaluate null student profile");
        }

        List<ShortfallDetail> shortfalls = new ArrayList<>();
        double effectiveCutoff = getEffectiveMinCgpa(student.getCategory());
        int effectiveMaxAge = getEffectiveMaxAge(student.getCategory());

        // 1. Academic Year Check
        if (student.getCurrentYear() < minEligibleYear && !student.isDegreeCompleted()) {
            shortfalls.add(new ShortfallDetail(
                    "Academic Year",
                    String.format("Minimum Year %d or Degree Completed", minEligibleYear),
                    String.format("Year %d", student.getCurrentYear()),
                    String.format("You will be eligible once you enter Year %d. Begin preliminary preparation now.", minEligibleYear)
            ));
        }

        // 2. Minimum CGPA Check (Category relaxed)
        if (student.getCgpa() < effectiveCutoff) {
            double deficit = Math.round((effectiveCutoff - student.getCgpa()) * 100.0) / 100.0;
            shortfalls.add(new ShortfallDetail(
                    "CGPA Cutoff",
                    String.format("%.2f (Category: %s)", effectiveCutoff, student.getCategory().name()),
                    String.format("%.2f", student.getCgpa()),
                    String.format("Requires an improvement of +%.2f CGPA in subsequent semesters.", deficit)
            ));
        }

        // 3. Age Limit Check (Category relaxed)
        if (student.getAge() < minAge) {
            shortfalls.add(new ShortfallDetail(
                    "Minimum Age",
                    String.format("%d years", minAge),
                    String.format("%d years", student.getAge()),
                    String.format("Wait %d year(s) until reaching the minimum age boundary.", minAge - student.getAge())
            ));
        } else if (student.getAge() > effectiveMaxAge) {
            shortfalls.add(new ShortfallDetail(
                    "Maximum Age Limit",
                    String.format("Max %d years (with %s relaxation)", effectiveMaxAge, student.getCategory().name()),
                    String.format("%d years", student.getAge()),
                    "Upper age ceiling exceeded for this exam category. Explore lateral or open-age pathways."
            ));
        }

        // 4. Active Backlogs Check
        if (student.getActiveBacklogs() > maxAllowedActiveBacklogs) {
            shortfalls.add(new ShortfallDetail(
                    "Active Backlogs",
                    String.format("Maximum %d allowed", maxAllowedActiveBacklogs),
                    String.format("%d active backlog(s)", student.getActiveBacklogs()),
                    String.format("Clear %d active backlog(s) before examination registration or document verification.",
                            student.getActiveBacklogs() - maxAllowedActiveBacklogs)
            ));
        }

        // 5. Eligible Branches Check
        if (!allowedBranches.contains(student.getBranch())) {
            shortfalls.add(new ShortfallDetail(
                    "Academic Branch",
                    "Permitted: " + formatAllowedBranches(),
                    student.getBranch().getDisplayName(),
                    "This pathway restricts applicants to specified academic streams."
            ));
        }

        // Polymorphic Hook: Subclasses inject domain-specific validation rules
        evaluateDomainSpecificRules(student, shortfalls);

        // Build result
        if (shortfalls.isEmpty()) {
            return EvaluationResult.eligible(
                    examCode,
                    examName,
                    examType.name(),
                    effectiveCutoff,
                    student.getCgpa(),
                    generateEligibleAdvice(student)
            );
        } else {
            return EvaluationResult.shortfall(
                    examCode,
                    examName,
                    examType.name(),
                    effectiveCutoff,
                    student.getCgpa(),
                    shortfalls,
                    generateCorrectiveRoadmap(shortfalls)
            );
        }
    }

    /**
     * Abstract hook method to be implemented by domain subclasses
     * (e.g., TechnicalExam, DefenceExam, ManagementExam).
     */
    protected abstract void evaluateDomainSpecificRules(Student student, List<ShortfallDetail> shortfalls);

    /**
     * Customizable positive guidance for eligible candidates.
     */
    protected String generateEligibleAdvice(Student student) {
        return String.format("Profile satisfies all prerequisite criteria. Maintain CGPA >= %.2f and prepare syllabus.",
                getEffectiveMinCgpa(student.getCategory()));
    }

    /**
     * Generates a synthesized roadmap from collected shortfalls.
     */
    protected String generateCorrectiveRoadmap(List<ShortfallDetail> shortfalls) {
        if (shortfalls.isEmpty()) return "Ready for application.";
        StringBuilder roadmap = new StringBuilder("Actionable Step(s): ");
        for (int i = 0; i < shortfalls.size(); i++) {
            roadmap.append(String.format("(%d) %s ", i + 1, shortfalls.get(i).getActionableAdvice()));
        }
        return roadmap.toString().trim();
    }

    private String formatAllowedBranches() {
        if (allowedBranches.size() >= Branch.values().length) {
            return "All Branches";
        }
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (Branch b : allowedBranches) {
            if (count++ > 0) sb.append(", ");
            sb.append(b.name());
        }
        return sb.toString();
    }

    @Override
    public String generateAuditTrail(Student student, EvaluationResult result) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        return String.format("[%s] [AUDIT] Exam: %s | Student: %s (ID: %s, Year: %d, CGPA: %.2f) | Result: %s | Shortfalls: %d",
                timestamp, examCode, student.getName(), student.getId(), student.getCurrentYear(),
                student.getCgpa(), result.getStatus(), result.getShortfalls().size());
    }

    @Override
    public String toCsvRecord() {
        return String.format("%s,%s,%s,%s,%.2f,%d,%d,%d,%d",
                examCode, examName.replace(",", ";"), examType.name(), conductingBody.replace(",", ";"),
                baseMinCgpa, minAge, baseMaxAge, minEligibleYear, maxAllowedActiveBacklogs);
    }

    @Override
    public String toJson() {
        return String.format("{\"examCode\":\"%s\",\"examName\":\"%s\",\"examType\":\"%s\",\"conductingBody\":\"%s\"," +
                        "\"baseMinCgpa\":%.2f,\"minAge\":%d,\"baseMaxAge\":%d,\"minEligibleYear\":%d,\"maxAllowedActiveBacklogs\":%d}",
                examCode, examName, examType.name(), conductingBody, baseMinCgpa, minAge, baseMaxAge, minEligibleYear, maxAllowedActiveBacklogs);
    }

    @Override
    public String toString() {
        return String.format("%s (%s) - %s [Min Year: %d, Min CGPA: %.2f, Max Age: %d]",
                examCode, examType.name(), examName, minEligibleYear, baseMinCgpa, baseMaxAge);
    }
}
