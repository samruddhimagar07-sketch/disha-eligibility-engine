package com.disha.exceptions;

/**
 * Thrown when an exam code is queried that does not exist in the registry.
 */
public class ExamNotFoundException extends DishaException {
    private static final long serialVersionUID = 1L;
    private final String examCode;

    public ExamNotFoundException(String examCode) {
        super(String.format("Exam with code '%s' was not found in the registry.", examCode));
        this.examCode = examCode;
    }

    public String getExamCode() {
        return examCode;
    }
}
