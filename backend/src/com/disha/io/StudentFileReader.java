package com.disha.io;

import com.disha.exceptions.FileProcessingException;
import com.disha.exceptions.InvalidStudentDataException;
import com.disha.models.Branch;
import com.disha.models.Category;
import com.disha.models.Gender;
import com.disha.models.Student;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * File handling utility for reading student academic profiles from CSV datasets.
 * Implements standard Java I/O (BufferedReader, FileReader) and robust exception handling.
 */
public class StudentFileReader {

    /**
     * Reads a list of students from a CSV file.
     * CSV Format:
     * id,name,email,age,branch,currentYear,cgpa,category,activeBacklogs,historyOfBacklogs,tenthPct,twelfthPct,gender,degreeCompleted
     */
    public static List<Student> readStudentsFromCsv(String filePath) throws FileProcessingException {
        File file = new File(filePath);
        if (!file.exists() || !file.isFile()) {
            throw new FileProcessingException("CSV source file does not exist", filePath);
        }

        List<Student> students = new ArrayList<>();
        int lineNumber = 0;

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                line = line.trim();
                // Skip empty lines or header row
                if (line.isEmpty() || line.startsWith("#") || (lineNumber == 1 && line.toLowerCase().contains("cgpa"))) {
                    continue;
                }

                String[] tokens = line.split(",");
                if (tokens.length < 8) {
                    System.err.printf("[Warning] Line %d has insufficient columns (%d). Skipping.%n", lineNumber, tokens.length);
                    continue;
                }

                try {
                    String id = tokens[0].trim();
                    String name = tokens[1].trim();
                    String email = tokens.length > 2 && tokens[2].contains("@") ? tokens[2].trim() : name.toLowerCase().replace(" ", ".") + "@univ.edu";
                    int age = Integer.parseInt(tokens[3].trim());
                    Branch branch = Branch.fromString(tokens[4].trim());
                    int currentYear = Integer.parseInt(tokens[5].trim());
                    double cgpa = Double.parseDouble(tokens[6].trim());
                    Category category = Category.fromString(tokens[7].trim());
                    int activeBacklogs = (tokens.length > 8) ? Integer.parseInt(tokens[8].trim()) : 0;
                    int historyBacklogs = (tokens.length > 9) ? Integer.parseInt(tokens[9].trim()) : activeBacklogs;
                    double tenthPct = (tokens.length > 10) ? Double.parseDouble(tokens[10].trim()) : 80.0;
                    double twelfthPct = (tokens.length > 11) ? Double.parseDouble(tokens[11].trim()) : 80.0;
                    Gender gender = (tokens.length > 12) ? Gender.fromString(tokens[12].trim()) : Gender.MALE;
                    boolean degreeDone = (tokens.length > 13) && Boolean.parseBoolean(tokens[13].trim());

                    Student student = new Student(id, name, email, age, branch, currentYear, cgpa,
                            category, activeBacklogs, historyBacklogs, tenthPct, twelfthPct, gender, degreeDone);
                    students.add(student);

                } catch (InvalidStudentDataException isde) {
                    System.err.printf("[Data Error] Line %d skipped due to domain violation: %s%n", lineNumber, isde.getMessage());
                } catch (NumberFormatException nfe) {
                    System.err.printf("[Parse Error] Line %d contains unparseable numeric field: %s%n", lineNumber, nfe.getMessage());
                }
            }
        } catch (IOException ioe) {
            throw new FileProcessingException("Failed reading student CSV data", filePath, ioe);
        }

        return students;
    }
}
