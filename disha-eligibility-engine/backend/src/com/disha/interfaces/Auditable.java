package com.disha.interfaces;

import com.disha.models.EvaluationResult;
import com.disha.models.Student;

/**
 * Interface contract for entities capable of generating compliance audit trails.
 */
public interface Auditable {

    /**
     * Produces a structured audit log entry for evaluation accountability.
     */
    String generateAuditTrail(Student student, EvaluationResult result);
}
