package com.disha.models;

/**
 * Gender categorization relevant for specific defence and public service branches.
 */
public enum Gender {
    MALE,
    FEMALE,
    OTHER;

    public static Gender fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return MALE;
        }
        String clean = text.trim().toUpperCase();
        if (clean.startsWith("F")) return FEMALE;
        if (clean.startsWith("M")) return MALE;
        return OTHER;
    }
}
