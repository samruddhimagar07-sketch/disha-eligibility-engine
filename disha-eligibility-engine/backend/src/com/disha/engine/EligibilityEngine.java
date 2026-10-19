package com.disha.engine;

import com.disha.exceptions.ExamNotFoundException;
import com.disha.exams.*;
import com.disha.models.Branch;
import com.disha.models.EvaluationResult;
import com.disha.models.Gender;
import com.disha.models.Student;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * Core Rule-Based Evaluation Engine.
 * Implements Polymorphic Dynamic Method Dispatch across a collection of {@link Exam} objects.
 * Eliminates fragile conditional branching by delegating logic directly to domain models.
 */
public class EligibilityEngine {

    // Thread-safe collection of registered pathway evaluators
    private final List<Exam> examRegistry;

    public EligibilityEngine() {
        this.examRegistry = new CopyOnWriteArrayList<>();
        registerDefaultExams();
    }

    /**
     * Registers a new exam into the evaluation catalog.
     */
    public void registerExam(Exam exam) {
        if (exam != null) {
            examRegistry.add(exam);
        }
    }

    /**
     * Returns an unmodifiable view of all registered exams.
     */
    public List<Exam> getAllExams() {
        return Collections.unmodifiableList(examRegistry);
    }

    /**
     * Core Polymorphic Dispatch Method:
     * Evaluates a single student against all registered examinations.
     *
     * @param student The candidate academic profile
     * @return List of evaluation results (both eligible and shortfalls)
     */
    public List<EvaluationResult> evaluate(Student student) {
        if (student == null) {
            return Collections.emptyList();
        }

        List<EvaluationResult> results = new ArrayList<>();
        // Dynamic Method Dispatch: each exam executes its own checkEligibility logic
        for (Exam exam : examRegistry) {
            EvaluationResult res = exam.checkEligibility(student);
            results.add(res);
        }
        return results;
    }

    /**
     * Overloaded method: Evaluates student filtering strictly by specific ExamType.
     */
    public List<EvaluationResult> evaluate(Student student, ExamType filterType) {
        if (student == null || filterType == null) {
            return Collections.emptyList();
        }

        List<EvaluationResult> filtered = new ArrayList<>();
        for (Exam exam : examRegistry) {
            if (exam.getExamType() == filterType) {
                filtered.add(exam.checkEligibility(student));
            }
        }
        return filtered;
    }

    /**
     * Overloaded method: Evaluates student against a single specific exam code.
     * Throws custom domain exception if exam is not registered.
     */
    public EvaluationResult evaluateSingle(Student student, String examCode) throws ExamNotFoundException {
        if (student == null) {
            throw new IllegalArgumentException("Student profile cannot be null");
        }
        if (examCode == null) {
            throw new ExamNotFoundException("null");
        }

        for (Exam exam : examRegistry) {
            if (exam.getExamCode().equalsIgnoreCase(examCode.trim())) {
                return exam.checkEligibility(student);
            }
        }

        throw new ExamNotFoundException(examCode);
    }

    /**
     * Returns categorized map containing partitioned results: ELIGIBLE and SHORTFALLS.
     */
    public Map<String, List<EvaluationResult>> evaluatePartitioned(Student student) {
        List<EvaluationResult> all = evaluate(student);
        Map<String, List<EvaluationResult>> partitioned = new LinkedHashMap<>();

        partitioned.put("ELIGIBLE", all.stream().filter(EvaluationResult::isEligible).collect(Collectors.toList()));
        partitioned.put("SHORTFALLS", all.stream().filter(r -> !r.isEligible()).collect(Collectors.toList()));

        return partitioned;
    }

    /**
     * Initializes the standard national benchmark exams.
     */
    private void registerDefaultExams() {
        // 1. Technical: GATE CS/IT
        examRegistry.add(new TechnicalExam(
                "GATE-CS",
                "GATE (Computer Science & Information Technology)",
                "IITs / IISc",
                "National examination for M.Tech admissions and PSU recruitment.",
                6.0, 18, 50, 3, 2,
                EnumSet.of(Branch.CSE, Branch.IT, Branch.ECE, Branch.EE),
                "CS", true, false
        ));

        // 2. Technical: GATE ME
        examRegistry.add(new TechnicalExam(
                "GATE-ME",
                "GATE (Mechanical Engineering)",
                "IITs / IISc",
                "National examination for Mechanical core PSU roles and post-graduation.",
                6.0, 18, 50, 3, 2,
                EnumSet.of(Branch.ME),
                "ME", true, false
        ));

        // 3. Technical: PSU Direct Recruitment (IOCL / ONGC)
        examRegistry.add(new TechnicalExam(
                "PSU-IOCL",
                "IOCL Executive Graduate Trainee via GATE",
                "Indian Oil Corporation Ltd",
                "Direct PSU Maharatna engineering officer recruitment.",
                6.5, 21, 26, 4, 0,
                EnumSet.of(Branch.CSE, Branch.IT, Branch.ECE, Branch.EE, Branch.ME, Branch.CE, Branch.CHEM),
                "GATE-SCORE", true, true
        ));

        // 4. Technical: ISRO Scientist/Engineer 'SC'
        examRegistry.add(new TechnicalExam(
                "ISRO-SC",
                "ISRO Scientist / Engineer 'SC' Recruitment",
                "Indian Space Research Organisation",
                "Premier research space agency scientific officer induction.",
                6.84, 21, 28, 4, 0,
                EnumSet.of(Branch.CSE, Branch.ECE, Branch.EE, Branch.ME),
                "ICRB-SC", true, true
        ));

        // 5. Management: CAT (IIMs)
        examRegistry.add(new ManagementExam(
                "CAT",
                "Common Admission Test (IIMs)",
                "Indian Institutes of Management",
                "Premier entrance for MBA/PGDM programs across all 21 IIMs and top B-schools.",
                5.3, 19, 65, 4, 50.0, 45.0, true
        ));

        // 6. Management: XAT
        examRegistry.add(new ManagementExam(
                "XAT",
                "Xavier Aptitude Test (XLRI)",
                "XLRI Jamshedpur",
                "All India test for XLRI Jamshedpur and associate Xavier institutions.",
                5.0, 19, 65, 4, 50.0, 45.0, true
        ));

        // 7. Civil Services: UPSC CSE
        examRegistry.add(new CivilServicesExam(
                "UPSC-CSE",
                "Civil Services Examination (IAS / IPS / IFS)",
                "Union Public Service Commission",
                "Apex examination for all-India civil services and administrative posts.",
                5.0, 21, 32, 4, 6, 9, true
        ));

        // 8. Defence: CDS (IMA)
        examRegistry.add(new DefenceExam(
                "CDS-IMA",
                "Combined Defence Services (Indian Military Academy)",
                "UPSC & Indian Army",
                "Permanent commission entry into Indian Army officers cadre.",
                5.5, 19, 24, 4, EnumSet.allOf(Branch.class),
                "Indian Army (IMA)", 0.0, true, Gender.MALE
        ));

        // 9. Defence: CDS (OTA Men & Women)
        examRegistry.add(new DefenceExam(
                "CDS-OTA",
                "Combined Defence Services (Officers Training Academy)",
                "UPSC & Indian Army",
                "Short service commission entry for both male and female graduates.",
                5.0, 19, 25, 4, EnumSet.allOf(Branch.class),
                "Indian Army (OTA)", 0.0, true, null
        ));

        // 10. Defence: AFCAT Flying & Ground Duty Tech
        examRegistry.add(new DefenceExam(
                "AFCAT-TECH",
                "Air Force Common Admission Test (Ground Duty Technical)",
                "Indian Air Force",
                "Commissioned officer entry for Aeronautical Engineering branches.",
                6.0, 20, 26, 4, EnumSet.of(Branch.CSE, Branch.IT, Branch.ECE, Branch.EE, Branch.ME),
                "Indian Air Force", 50.0, true, null
        ));

        // 11. Corporate SDE: Tier-1 Product Companies
        examRegistry.add(new CorporateDriveExam(
                "SDE-TIER1",
                "Tier-1 Product SDE Drives (Google / Amazon / Microsoft)",
                "Corporate Talent Acquisition",
                "Premier software engineering and distributed systems development roles.",
                7.0, 18, 30, 3, EnumSet.of(Branch.CSE, Branch.IT, Branch.ECE, Branch.EE),
                70.0, 70.0, true
        ));

        // 12. Corporate SDE: National Qualifier Drive
        examRegistry.add(new CorporateDriveExam(
                "SDE-NQT",
                "National SDE Qualifier (TCS Digital / Infosys SP)",
                "National Recruitment Consortium",
                "High-volume accelerated digital specialist software developer hiring.",
                6.0, 18, 30, 4, EnumSet.allOf(Branch.class),
                60.0, 60.0, false
        ));
    }
}
