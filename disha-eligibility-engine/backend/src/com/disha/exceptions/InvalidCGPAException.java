package com.disha.exceptions;

/**
 * Thrown when CGPA falls outside standard 0.00 to 10.00 scale.
 */
public class InvalidCGPAException extends InvalidStudentDataException {
    private static final long serialVersionUID = 1L;

    public InvalidCGPAException(double cgpa) {
        super("CGPA must be between 0.00 and 10.00 inclusive", "cgpa", cgpa);
    }
}
