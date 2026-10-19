package com.disha.models;

import java.io.Serializable;

/**
 * Encapsulates an individual shortfall detected during eligibility evaluation,
 * specifying the exact rule violated and actionable advice for the student.
 */
public class ShortfallDetail implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String parameter;
    private final String requiredCriteria;
    private final String actualValue;
    private final String actionableAdvice;

    public ShortfallDetail(String parameter, String requiredCriteria, String actualValue, String actionableAdvice) {
        this.parameter = parameter;
        this.requiredCriteria = requiredCriteria;
        this.actualValue = actualValue;
        this.actionableAdvice = actionableAdvice;
    }

    public String getParameter() {
        return parameter;
    }

    public String getRequiredCriteria() {
        return requiredCriteria;
    }

    public String getActualValue() {
        return actualValue;
    }

    public String getActionableAdvice() {
        return actionableAdvice;
    }

    @Override
    public String toString() {
        return String.format("[%s] Required: %s | Actual: %s -> Action: %s",
                parameter, requiredCriteria, actualValue, actionableAdvice);
    }
}
