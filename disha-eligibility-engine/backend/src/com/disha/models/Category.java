package com.disha.models;

/**
 * Reservation categories with standard government quota relaxation policies.
 */
public enum Category {
    GENERAL("General / Unreserved", 0, 0.0),
    EWS("Economically Weaker Section", 0, 0.0),
    OBC_NCL("Other Backward Classes (Non-Creamy Layer)", 3, 0.5),
    SC("Scheduled Caste", 5, 0.5),
    ST("Scheduled Tribe", 5, 0.5);

    private final String label;
    private final int ageRelaxationYears;
    private final double standardCgpaRelaxation;

    Category(String label, int ageRelaxationYears, double standardCgpaRelaxation) {
        this.label = label;
        this.ageRelaxationYears = ageRelaxationYears;
        this.standardCgpaRelaxation = standardCgpaRelaxation;
    }

    public String getLabel() {
        return label;
    }

    public int getAgeRelaxationYears() {
        return ageRelaxationYears;
    }

    public double getStandardCgpaRelaxation() {
        return standardCgpaRelaxation;
    }

    public static Category fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return GENERAL;
        }
        String clean = text.trim().toUpperCase().replaceAll("[\\s-_]+", "");
        for (Category c : values()) {
            if (c.name().replaceAll("_", "").equals(clean)) {
                return c;
            }
        }
        if (clean.contains("OBC")) return OBC_NCL;
        if (clean.contains("EWS")) return EWS;
        if (clean.contains("SC")) return SC;
        if (clean.contains("ST")) return ST;
        return GENERAL;
    }
}
