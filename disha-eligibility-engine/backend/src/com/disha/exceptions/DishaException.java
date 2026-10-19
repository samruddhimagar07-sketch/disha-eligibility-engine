package com.disha.exceptions;

/**
 * Base checked exception for the Disha Eligibility Engine domain.
 */
public class DishaException extends Exception {
    private static final long serialVersionUID = 1L;

    public DishaException(String message) {
        super(message);
    }

    public DishaException(String message, Throwable cause) {
        super(message, cause);
    }
}
