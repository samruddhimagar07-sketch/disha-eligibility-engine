package com.disha.exceptions;

/**
 * Thrown when active backlog count is negative.
 */
public class InvalidBacklogException extends InvalidStudentDataException {
    private static final long serialVersionUID = 1L;

    public InvalidBacklogException(int backlogs) {
        super("Backlog count cannot be negative", "activeBacklogs", backlogs);
    }
}
