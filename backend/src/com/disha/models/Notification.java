package com.disha.models;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Encapsulated Domain Model representing a communication notification / broadcast
 * sent by teachers/faculty to specific eligible student cohorts.
 * Demonstrates OOP Encapsulation with defensive copying and validated state.
 */
public class Notification implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String id;
    private final String title;
    private final String message;
    private final String sender;
    private final String targetExamCode;
    private final String targetAudience;
    private final List<String> recipientIds;
    private final String priority; // "INFO", "ACTION_REQUIRED", "URGENT"
    private final String timestamp;
    private boolean read;

    public Notification(String id, String title, String message, String sender,
                        String targetExamCode, String targetAudience, List<String> recipientIds,
                        String priority, String timestamp, boolean read) {
        this.id = Objects.requireNonNull(id, "Notification ID cannot be null");
        this.title = Objects.requireNonNull(title, "Notification title cannot be null");
        this.message = Objects.requireNonNull(message, "Notification message cannot be null");
        this.sender = (sender != null && !sender.isBlank()) ? sender : "Higher Studies Advisory Cell";
        this.targetExamCode = (targetExamCode != null && !targetExamCode.isBlank()) ? targetExamCode : "GENERAL";
        this.targetAudience = (targetAudience != null && !targetAudience.isBlank()) ? targetAudience : "All Students";
        this.recipientIds = (recipientIds != null) ? new ArrayList<>(recipientIds) : new ArrayList<>();
        this.priority = (priority != null && !priority.isBlank()) ? priority.toUpperCase() : "INFO";
        this.timestamp = (timestamp != null && !timestamp.isBlank())
                ? timestamp
                : LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        this.read = read;
    }

    public static Notification createNew(String title, String message, String sender,
                                         String targetExamCode, String targetAudience,
                                         List<String> recipientIds, String priority) {
        String newId = "NOTIF-" + System.currentTimeMillis() % 1000000;
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        return new Notification(newId, title, message, sender, targetExamCode, targetAudience,
                recipientIds, priority, now, false);
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getSender() {
        return sender;
    }

    public String getTargetExamCode() {
        return targetExamCode;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public List<String> getRecipientIds() {
        return Collections.unmodifiableList(recipientIds);
    }

    public String getPriority() {
        return priority;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public boolean isDeliveredTo(String studentId) {
        if (studentId == null || recipientIds.isEmpty()) return true; // Broadcast to all
        return recipientIds.contains(studentId) || recipientIds.contains("ALL");
    }

    @Override
    public String toString() {
        return String.format("[%s] %s (From: %s to %d recipients) - %s",
                priority, title, sender, recipientIds.size(), timestamp);
    }
}
