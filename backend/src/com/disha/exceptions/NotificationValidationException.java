package com.disha.exceptions;

/**
 * Exception thrown when a teacher creates a notification with invalid parameters
 * such as missing subject, empty message, or invalid recipient specification.
 */
public class NotificationValidationException extends Exception {
    private static final long serialVersionUID = 1L;

    public NotificationValidationException(String message) {
        super(message);
    }

    public NotificationValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
