package com.disha.exceptions;

/**
 * Exception thrown when student personal or academic input fails domain validation.
 */
public class InvalidStudentDataException extends DishaException {
    private static final long serialVersionUID = 1L;
    private final String fieldName;
    private final Object invalidValue;

    public InvalidStudentDataException(String message, String fieldName, Object invalidValue) {
        super(String.format("%s [Field: '%s', Value: %s]", message, fieldName, invalidValue));
        this.fieldName = fieldName;
        this.invalidValue = invalidValue;
    }

    public String getFieldName() {
        return fieldName;
    }

    public Object getInvalidValue() {
        return invalidValue;
    }
}
