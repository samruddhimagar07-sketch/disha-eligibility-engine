package com.disha.io;

import com.disha.exceptions.NotificationValidationException;
import com.disha.models.Notification;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Thread-safe File Handling mechanism for persisting faculty broadcasts and student notifications.
 * Uses Core Java NIO, {@link ReentrantReadWriteLock}, and structured file I/O without third-party libraries.
 */
public class NotificationStore {

    private final String filePath;
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    public NotificationStore(String filePath) {
        this.filePath = (filePath != null && !filePath.isBlank()) ? filePath : "data/notifications.json";
        ensureStorageFileExists();
    }

    private void ensureStorageFileExists() {
        lock.writeLock().lock();
        try {
            Path path = Paths.get(filePath);
            if (path.getParent() != null && !Files.exists(path.getParent())) {
                Files.createDirectories(path.getParent());
            }

            if (!Files.exists(path)) {
                List<Notification> seedList = createDefaultSeedNotifications();
                writeNotificationsToFile(seedList);
            }
        } catch (IOException e) {
            System.err.println("[NotificationStore] Warning: Could not initialize file storage: " + e.getMessage());
        } finally {
            lock.writeLock().unlock();
        }
    }

    private List<Notification> createDefaultSeedNotifications() {
        List<Notification> seeds = new ArrayList<>();

        seeds.add(new Notification(
                "NOTIF-801",
                "UPSC Civil Services Mentorship & Mock Prelims Cohort",
                "Orientation session for 3rd and 4th year aspirants eligible for UPSC CSE. Prof. K. Sundaram will review general studies syllabus division and optional subject selection strategies in Seminar Hall 2 this Saturday at 10:00 AM.",
                "Prof. K. Sundaram (Dean of Career Services)",
                "UPSC-CSE",
                "Eligible for UPSC CSE (6 Students)",
                List.of("STU-101", "STU-103", "STU-104", "STU-105", "STU-106", "STU-109"),
                "ACTION_REQUIRED",
                "2026-10-18 09:30",
                false
        ));

        seeds.add(new Notification(
                "NOTIF-802",
                "CAT / MBA Summer Bootcamp & Quantitative Aptitude Series",
                "Exclusive invitation for high CGPA students eligible for IIM CAT 2026. Weekly speed arithmetic workshops and mock interviews will be conducted by alumni from IIM Ahmedabad.",
                "Dr. Neha Kapoor (Management Guidance Cell)",
                "CAT",
                "Eligible for CAT (IIMs)",
                List.of("STU-101", "STU-104", "STU-105", "STU-106", "STU-108", "STU-109"),
                "INFO",
                "2026-10-17 14:15",
                false
        ));

        seeds.add(new Notification(
                "NOTIF-803",
                "Urgent: Remedial Fast-Track Classes for Active Backlog Clearance",
                "All students with active backlogs in semesters 1-4 must register for remedial tutoring. Clearing arrears before semester 7 is mandatory for PSU recruitment and Defence NDA/CDS eligibility.",
                "Prof. R. Deshpande (Academic Review Board)",
                "REMEDIAL",
                "Students with Active Backlogs",
                List.of("STU-102", "STU-103", "STU-107", "STU-110"),
                "URGENT",
                "2026-10-16 11:00",
                false
        ));

        seeds.add(new Notification(
                "NOTIF-804",
                "Indian Armed Forces (CDS & AFCAT) SSB Screening Preparation",
                "Physical fitness and psychological screening practice session for CDS IMA/OTA and AFCAT eligible graduates. Colonel (Retd.) Verma will conduct SSB interview drills.",
                "Col. (Retd.) S. Verma (Defence Academy Liason)",
                "CDS-IMA",
                "Defence & AFCAT Aspirants",
                List.of("STU-101", "STU-104", "STU-105", "STU-106", "STU-109"),
                "INFO",
                "2026-10-15 16:45",
                false
        ));

        return seeds;
    }

    public List<Notification> getAllNotifications() {
        lock.readLock().lock();
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                return Collections.emptyList();
            }
            String jsonContent = Files.readString(path, StandardCharsets.UTF_8);
            return parseNotificationsList(jsonContent);
        } catch (IOException e) {
            System.err.println("[NotificationStore] Error reading notifications: " + e.getMessage());
            return Collections.emptyList();
        } finally {
            lock.readLock().unlock();
        }
    }

    public List<Notification> getNotificationsForStudent(String studentId) {
        List<Notification> all = getAllNotifications();
        if (studentId == null || studentId.isBlank()) {
            return all;
        }

        List<Notification> filtered = new ArrayList<>();
        for (Notification n : all) {
            if (n.isDeliveredTo(studentId)) {
                filtered.add(n);
            }
        }
        return filtered;
    }

    public Notification addNotification(String title, String message, String sender,
                                       String targetExamCode, String targetAudience,
                                       List<String> recipientIds, String priority)
            throws NotificationValidationException {
        if (title == null || title.trim().isEmpty()) {
            throw new NotificationValidationException("Notification title / subject is required.");
        }
        if (message == null || message.trim().isEmpty()) {
            throw new NotificationValidationException("Notification message body is required.");
        }

        Notification notif = Notification.createNew(title.trim(), message.trim(), sender,
                targetExamCode, targetAudience, recipientIds, priority);

        lock.writeLock().lock();
        try {
            List<Notification> list = new ArrayList<>(getAllNotifications());
            // Prepend new notification to the top
            list.add(0, notif);
            writeNotificationsToFile(list);
            return notif;
        } catch (IOException e) {
            throw new NotificationValidationException("Failed to persist notification to storage file: " + e.getMessage(), e);
        } finally {
            lock.writeLock().unlock();
        }
    }

    private void writeNotificationsToFile(List<Notification> notifications) throws IOException {
        Path path = Paths.get(filePath);
        StringBuilder sb = new StringBuilder("[\n");
        for (int i = 0; i < notifications.size(); i++) {
            if (i > 0) sb.append(",\n");
            Notification n = notifications.get(i);
            sb.append("  {\n")
                    .append("    \"id\": \"").append(escape(n.getId())).append("\",\n")
                    .append("    \"title\": \"").append(escape(n.getTitle())).append("\",\n")
                    .append("    \"message\": \"").append(escape(n.getMessage())).append("\",\n")
                    .append("    \"sender\": \"").append(escape(n.getSender())).append("\",\n")
                    .append("    \"targetExamCode\": \"").append(escape(n.getTargetExamCode())).append("\",\n")
                    .append("    \"targetAudience\": \"").append(escape(n.getTargetAudience())).append("\",\n")
                    .append("    \"priority\": \"").append(escape(n.getPriority())).append("\",\n")
                    .append("    \"timestamp\": \"").append(escape(n.getTimestamp())).append("\",\n")
                    .append("    \"read\": ").append(n.isRead()).append(",\n")
                    .append("    \"recipientIds\": [");

            List<String> rIds = n.getRecipientIds();
            for (int j = 0; j < rIds.size(); j++) {
                if (j > 0) sb.append(", ");
                sb.append("\"").append(escape(rIds.get(j))).append("\"");
            }
            sb.append("]\n  }");
        }
        sb.append("\n]\n");

        Files.writeString(path, sb.toString(), StandardCharsets.UTF_8,
                StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    private List<Notification> parseNotificationsList(String json) {
        List<Notification> list = new ArrayList<>();
        if (json == null || json.trim().isEmpty() || json.trim().equals("[]")) {
            return list;
        }

        Pattern objPattern = Pattern.compile("\\{[^{}]*\\}", Pattern.DOTALL);
        Matcher objMatcher = objPattern.matcher(json);

        while (objMatcher.find()) {
            String block = objMatcher.group();
            String id = extract(block, "id", "NOTIF-0");
            String title = extract(block, "title", "Announcement");
            String message = extract(block, "message", "");
            String sender = extract(block, "sender", "Faculty");
            String targetExamCode = extract(block, "targetExamCode", "ALL");
            String targetAudience = extract(block, "targetAudience", "Students");
            String priority = extract(block, "priority", "INFO");
            String timestamp = extract(block, "timestamp", "");
            boolean read = block.contains("\"read\": true") || block.contains("\"read\":true");

            List<String> recipients = new ArrayList<>();
            Pattern arrPattern = Pattern.compile("\"recipientIds\"\\s*:\\s*\\[([^\\]]*)\\]");
            Matcher arrMatcher = arrPattern.matcher(block);
            if (arrMatcher.find()) {
                String inner = arrMatcher.group(1);
                Pattern idPattern = Pattern.compile("\"([^\"]+)\"");
                Matcher idMatcher = idPattern.matcher(inner);
                while (idMatcher.find()) {
                    recipients.add(idMatcher.group(1));
                }
            }

            list.add(new Notification(id, title, message, sender, targetExamCode, targetAudience,
                    recipients, priority, timestamp, read));
        }

        return list;
    }

    private String extract(String block, String key, String defaultVal) {
        Pattern p = Pattern.compile("\"" + key + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher m = p.matcher(block);
        if (m.find()) return unescape(m.group(1));
        return defaultVal;
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private String unescape(String s) {
        if (s == null) return "";
        return s.replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");
    }
}
