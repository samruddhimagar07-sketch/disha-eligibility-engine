package com.disha.exams;

/**
 * High-level categorization of competitive examinations and recruitment drives.
 */
public enum ExamType {
    TECHNICAL("Technical & PSU Recruitment", "GATE, PSU drives, Engineering Services"),
    MANAGEMENT("Management & Business Schools", "CAT, XAT, SNAP for IIMs/XLRI"),
    DEFENCE("Armed Forces & Defence Services", "CDS, AFCAT, INET, Indian Navy Tech"),
    CIVIL_SERVICES("Civil & Administrative Services", "UPSC CSE, State Public Service Commissions"),
    CORPORATE_SDE("Corporate & SDE Hiring Drives", "Tier-1 Tech Companies & National Hiring Drives");

    private final String title;
    private final String description;

    ExamType(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }
}
