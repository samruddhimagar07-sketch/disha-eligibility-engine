package com.disha.exceptions;

/**
 * Thrown when current academic year is outside standard engineering undergraduate range (1 to 4).
 */
public class InvalidAcademicYearException extends InvalidStudentDataException {
    private static final long serialVersionUID = 1L;

    public InvalidAcademicYearException(int year) {
        super("Academic year must be between 1 and 4 for undergraduate engineering programs", "currentYear", year);
    }
}
