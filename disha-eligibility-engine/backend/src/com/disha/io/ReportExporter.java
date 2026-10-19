package com.disha.io;

import com.disha.engine.ShortfallReporter;
import com.disha.exceptions.FileProcessingException;
import com.disha.models.EvaluationResult;
import com.disha.models.Student;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

/**
 * File handling utility for exporting formatted shortfall reports and CSV summaries to disk.
 */
public class ReportExporter {

    /**
     * Exports a student diagnostic report to a plain text file.
     */
    public static File exportStudentReport(Student student, List<EvaluationResult> results, String targetDirectory)
            throws FileProcessingException {
        File dir = new File(targetDirectory != null ? targetDirectory : "data");
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String safeName = student.getName().replaceAll("[^a-zA-Z0-9_-]", "_");
        File targetFile = new File(dir, "Shortfall_Report_" + student.getId() + "_" + safeName + ".txt");

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(targetFile))) {
            String reportContent = ShortfallReporter.generateComprehensiveReport(student, results);
            writer.write(reportContent);
            writer.flush();
        } catch (IOException e) {
            throw new FileProcessingException("Failed exporting student shortfall report", targetFile.getAbsolutePath(), e);
        }

        return targetFile;
    }
}
