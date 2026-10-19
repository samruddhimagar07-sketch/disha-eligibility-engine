package com.disha.exceptions;

/**
 * Thrown when student age is out of eligible bounds (e.g. 16 to 65).
 */
public class InvalidAgeException extends InvalidStudentDataException {
    private static final long serialVersionUID = 1L;

    public InvalidAgeException(int age) {
        super("Age must be between 16 and 65 years", "age", age);
    }
}
