package com.disha.models;

/**
 * Enumeration representing academic branches in engineering.
 */
public enum Branch {
    CSE("Computer Science & Engineering", true, true),
    IT("Information Technology", true, true),
    ECE("Electronics & Communication Engineering", true, true),
    EE("Electrical Engineering", true, true),
    ME("Mechanical Engineering", true, false),
    CE("Civil Engineering", true, false),
    CHEM("Chemical Engineering", true, false),
    OTHER_ENG("Other Engineering Discipline", true, false),
    NON_ENG("Non-Engineering Graduate", false, false);

    private final String displayName;
    private final boolean isEngineering;
    private final boolean isCircuital;

    Branch(String displayName, boolean isEngineering, boolean isCircuital) {
        this.displayName = displayName;
        this.isEngineering = isEngineering;
        this.isCircuital = isCircuital;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isEngineering() {
        return isEngineering;
    }

    public boolean isCircuital() {
        return isCircuital;
    }

    public static Branch fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return CSE;
        }
        String clean = text.trim().toUpperCase().replaceAll("[\\s-_&]+", "");
        for (Branch b : values()) {
            if (b.name().equals(clean) || b.displayName.toUpperCase().replaceAll("[\\s-_&]+", "").equals(clean)) {
                return b;
            }
        }
        if (clean.contains("COMP") || clean.contains("CS")) return CSE;
        if (clean.contains("INFO") || clean.contains("IT")) return IT;
        if (clean.contains("ELEC") && clean.contains("COMM")) return ECE;
        if (clean.contains("ELEC")) return EE;
        if (clean.contains("MECH")) return ME;
        if (clean.contains("CIVIL")) return CE;
        return OTHER_ENG;
    }
}
