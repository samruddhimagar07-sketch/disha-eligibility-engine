package com.disha.interfaces;

import com.disha.exams.ExamType;
import com.disha.models.EvaluationResult;
import com.disha.models.Student;

/**
 * Abstraction defining the fundamental contract for all pathway criteria evaluators.
 * Every exam or recruitment drive must implement this interface.
 */
public interface Eligible {

    /**
     * Evaluates whether a given student meets all prerequisite criteria.
     * Dynamic method dispatch invokes the concrete implementation at runtime.
     *
     * @param student Academic and demographic profile of candidate
     * @return EvaluationResult containing status, cutoff details, and shortfalls
     */
    EvaluationResult checkEligibility(Student student);

    /**
     * Unique identifier code for the exam (e.g. "GATE-CS", "CAT", "CDS-IMA").
     */
    String getExamCode();

    /**
     * Full title of the exam.
     */
    String getExamName();

    /**
     * Category classification of the exam.
     */
    ExamType getExamType();

    /**
     * Official authority conducting the exam (e.g., "IITs / IISc", "IIMs", "UPSC").
     */
    String getConductingBody();
}
