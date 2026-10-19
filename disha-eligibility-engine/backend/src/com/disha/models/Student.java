package com.disha.models;

import com.disha.exceptions.InvalidAcademicYearException;
import com.disha.exceptions.InvalidAgeException;
import com.disha.exceptions.InvalidBacklogException;
import com.disha.exceptions.InvalidCGPAException;

import java.io.Serializable;
import java.util.Objects;

/**
 * Encapsulated Student entity securely representing personal and academic state.
 * Implements strict domain validation within setter methods and constructors
 * to enforce business invariants and protect data integrity.
 */
public class Student implements Serializable {
    private static final long serialVersionUID = 1L;

    // Private fields to ensure strict encapsulation
    private String id;
    private String name;
    private String email;
    private int age;
    private Branch branch;
    private int currentYear; // 1 to 4 for undergraduate engineering
    private double cgpa;     // 0.00 to 10.00
    private Category category;
    private int activeBacklogs;
    private int historyOfBacklogs;
    private double tenthPercentage;
    private double twelfthPercentage;
    private Gender gender;
    private boolean isDegreeCompleted;

    // 1. Default Constructor
    public Student() {
        this.id = "STU-" + System.currentTimeMillis() % 100000;
        this.name = "Unknown Student";
        this.email = "student@university.edu";
        this.age = 20;
        this.branch = Branch.CSE;
        this.currentYear = 1;
        this.cgpa = 7.00;
        this.category = Category.GENERAL;
        this.activeBacklogs = 0;
        this.historyOfBacklogs = 0;
        this.tenthPercentage = 75.0;
        this.twelfthPercentage = 75.0;
        this.gender = Gender.MALE;
        this.isDegreeCompleted = false;
    }

    // 2. Overloaded Constructor (Convenience for typical undergraduate profiling)
    public Student(String id, String name, int age, Branch branch, int currentYear, double cgpa,
                   Category category, int activeBacklogs)
            throws InvalidAgeException, InvalidAcademicYearException, InvalidCGPAException, InvalidBacklogException {
        this(id, name, name.toLowerCase().replaceAll("\\s+", ".") + "@univ.edu",
                age, branch, currentYear, cgpa, category, activeBacklogs, activeBacklogs,
                80.0, 80.0, Gender.MALE, currentYear >= 4);
    }

    // 3. Full Parameterized Constructor with Validation
    public Student(String id, String name, String email, int age, Branch branch, int currentYear,
                   double cgpa, Category category, int activeBacklogs, int historyOfBacklogs,
                   double tenthPercentage, double twelfthPercentage, Gender gender, boolean isDegreeCompleted)
            throws InvalidAgeException, InvalidAcademicYearException, InvalidCGPAException, InvalidBacklogException {
        this.id = (id != null && !id.trim().isEmpty()) ? id.trim() : "STU-" + System.currentTimeMillis() % 100000;
        this.name = (name != null && !name.trim().isEmpty()) ? name.trim() : "Unnamed";
        this.email = (email != null && !email.trim().isEmpty()) ? email.trim() : "student@univ.edu";

        // Enforce invariants through validated setters
        setAge(age);
        setBranch(branch);
        setCurrentYear(currentYear);
        setCgpa(cgpa);
        setCategory(category);
        setActiveBacklogs(activeBacklogs);

        this.historyOfBacklogs = Math.max(historyOfBacklogs, this.activeBacklogs);
        this.tenthPercentage = Math.min(100.0, Math.max(0.0, tenthPercentage));
        this.twelfthPercentage = Math.min(100.0, Math.max(0.0, twelfthPercentage));
        this.gender = gender != null ? gender : Gender.MALE;
        this.isDegreeCompleted = isDegreeCompleted || currentYear > 4;
    }

    // 4. Copy Constructor (Defensive Copying)
    public Student(Student other) {
        if (other == null) {
            throw new IllegalArgumentException("Cannot copy null student");
        }
        this.id = other.id;
        this.name = other.name;
        this.email = other.email;
        this.age = other.age;
        this.branch = other.branch;
        this.currentYear = other.currentYear;
        this.cgpa = other.cgpa;
        this.category = other.category;
        this.activeBacklogs = other.activeBacklogs;
        this.historyOfBacklogs = other.historyOfBacklogs;
        this.tenthPercentage = other.tenthPercentage;
        this.twelfthPercentage = other.twelfthPercentage;
        this.gender = other.gender;
        this.isDegreeCompleted = other.isDegreeCompleted;
    }

    // --- Strict Encapsulation: Validated Getters and Setters ---

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id != null ? id.trim() : this.id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = (name != null && !name.trim().isEmpty()) ? name.trim() : this.name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = (email != null && email.contains("@")) ? email.trim() : this.email;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) throws InvalidAgeException {
        if (age < 16 || age > 65) {
            throw new InvalidAgeException(age);
        }
        this.age = age;
    }

    public Branch getBranch() {
        return branch;
    }

    public void setBranch(Branch branch) {
        this.branch = branch != null ? branch : Branch.CSE;
    }

    public int getCurrentYear() {
        return currentYear;
    }

    public void setCurrentYear(int currentYear) throws InvalidAcademicYearException {
        if (currentYear < 1 || currentYear > 4) {
            throw new InvalidAcademicYearException(currentYear);
        }
        this.currentYear = currentYear;
    }

    public double getCgpa() {
        return cgpa;
    }

    public void setCgpa(double cgpa) throws InvalidCGPAException {
        if (cgpa < 0.0 || cgpa > 10.0) {
            throw new InvalidCGPAException(cgpa);
        }
        // Round to 2 decimal places
        this.cgpa = Math.round(cgpa * 100.0) / 100.0;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category != null ? category : Category.GENERAL;
    }

    public int getActiveBacklogs() {
        return activeBacklogs;
    }

    public void setActiveBacklogs(int activeBacklogs) throws InvalidBacklogException {
        if (activeBacklogs < 0) {
            throw new InvalidBacklogException(activeBacklogs);
        }
        this.activeBacklogs = activeBacklogs;
        if (activeBacklogs > this.historyOfBacklogs) {
            this.historyOfBacklogs = activeBacklogs;
        }
    }

    public int getHistoryOfBacklogs() {
        return historyOfBacklogs;
    }

    public void setHistoryOfBacklogs(int historyOfBacklogs) {
        this.historyOfBacklogs = Math.max(historyOfBacklogs, this.activeBacklogs);
    }

    public double getTenthPercentage() {
        return tenthPercentage;
    }

    public void setTenthPercentage(double tenthPercentage) {
        this.tenthPercentage = Math.min(100.0, Math.max(0.0, tenthPercentage));
    }

    public double getTwelfthPercentage() {
        return twelfthPercentage;
    }

    public void setTwelfthPercentage(double twelfthPercentage) {
        this.twelfthPercentage = Math.min(100.0, Math.max(0.0, twelfthPercentage));
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender != null ? gender : Gender.MALE;
    }

    public boolean isDegreeCompleted() {
        return isDegreeCompleted;
    }

    public void setDegreeCompleted(boolean degreeCompleted) {
        isDegreeCompleted = degreeCompleted;
    }

    /**
     * Approximates standard Indian engineering percentage equivalent: CGPA * 9.5
     */
    public double getApproxPercentage() {
        return Math.round(this.cgpa * 9.5 * 10.0) / 10.0;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Student student = (Student) o;
        return Objects.equals(id, student.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("Student[%s | %s | Age: %d | %s Yr %d | CGPA: %.2f (%.1f%%) | %s | Backlogs: %d]",
                id, name, age, branch.name(), currentYear, cgpa, getApproxPercentage(), category.name(), activeBacklogs);
    }
}
