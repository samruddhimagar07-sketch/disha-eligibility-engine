package com.disha.exceptions;

/**
 * Thrown when I/O operations on student data or audit logs fail.
 */
public class FileProcessingException extends DishaException {
    private static final long serialVersionUID = 1L;
    private final String filePath;

    public FileProcessingException(String message, String filePath) {
        super(String.format("%s [File: %s]", message, filePath));
        this.filePath = filePath;
    }

    public FileProcessingException(String message, String filePath, Throwable cause) {
        super(String.format("%s [File: %s]", message, filePath), cause);
        this.filePath = filePath;
    }

    public String getFilePath() {
        return filePath;
    }
}
