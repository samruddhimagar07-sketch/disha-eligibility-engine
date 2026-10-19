# Disha: Clear Direction for Your Next Big Step
### Undergraduate Post-Graduation Pathway & Exam Eligibility Evaluation Engine

---

## 1. Executive Summary & Problem Overview
Undergraduate engineering students frequently struggle to track fragmented, evolving, and overlapping eligibility criteria for various post-graduation pathways, including:
- **GATE CS/IT & Core Engineering** (IITs / IISc)
- **PSU Direct Recruitment Drives** (IOCL, ISRO, ONGC, BARC)
- **Management Entrance Tests** (CAT, XAT for IIMs & XLRI)
- **Civil & Administrative Services** (UPSC CSE - IAS/IPS/IFS)
- **Defence Commissioning Entries** (CDS IMA/OTA, AFCAT Ground Duty Technical)
- **Corporate SDE & Placement Drives** (Tier-1 Product Companies & National Qualifiers)

Eligibility criteria such as strict maximum age limits, category-based age and CGPA relaxations, passing-out year restrictions, branch allowances, and zero-backlog policies are difficult to evaluate manually. **Disha** solves this by providing a high-performance, rule-based evaluation engine built with standard Java and a light-themed, glassmorphic UI.

---

## 2. Object-Oriented Architecture & Rubric Alignment

| OOP Concept | Project Implementation | Location in Codebase |
| :--- | :--- | :--- |
| **Constructors** | Default constructors, overloaded convenience constructors, full parameterized constructors with validation, copy constructors for defensive immutability. | [Student.java](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/models/Student.java), [Exam.java](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/exams/Exam.java) |
| **Encapsulation** | All fields `private`. State mutators enforce business invariants, throwing domain exceptions if CGPA `< 0` or `> 10`, age `< 16` or `> 65`, or backlogs `< 0`. | [Student.java](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/models/Student.java) |
| **Abstraction** | Contract defined via `Eligible`, `Auditable`, and `Exportable` interfaces. Universal logic centralized in `abstract class Exam` utilizing the **Template Method Pattern**. | [Eligible.java](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/interfaces/Eligible.java), [Exam.java](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/exams/Exam.java) |
| **Inheritance** | Domain subclasses inherit from `Exam`: `TechnicalExam`, `DefenceExam`, `ManagementExam`, `CivilServicesExam`, `CorporateDriveExam`. | [com/disha/exams/](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/exams/) |
| **Polymorphism** | **Dynamic Method Dispatch**: `EligibilityEngine` iterates over `List<Exam>`, invoking overridden `checkEligibility(Student)` at runtime with zero rigid if-else/switch checks. Method overloading in engine and constructors. | [EligibilityEngine.java](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/engine/EligibilityEngine.java) |
| **Exception Handling** | Custom checked and unchecked exception hierarchy (`DishaException`, `InvalidCGPAException`, `InvalidAgeException`, `InvalidBacklogException`, `ExamNotFoundException`, `FileProcessingException`). Try-catch-finally and multi-catch. | [com/disha/exceptions/](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/exceptions/) |
| **Multithreading** | `ConcurrentEvaluationEngine` leverages Java `ExecutorService` thread pool, `Callable<T>`, and `Future<T>` for concurrent batch student evaluations; atomic counters (`AtomicInteger`, `AtomicLong`) for thread-safe telemetry. | [ConcurrentEvaluationEngine.java](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/engine/ConcurrentEvaluationEngine.java) |
| **File Handling** | `StudentFileReader` parses student datasets via `BufferedReader`/`FileReader`. `AuditLogWriter` and `ReportExporter` persist audit trails and markdown reports using `BufferedWriter` and `FileWriter`. | [com/disha/io/](file:///C:/Users/samru/.gemini/antigravity-ide/scratch/disha-eligibility-engine/backend/src/com/disha/io/) |

---

## 3. Directory Structure

```
disha-eligibility-engine/
│
├── backend/
│   ├── src/
│   │   └── com/
│   │       └── disha/
│   │           ├── DishaApplication.java           # CLI Menu, Server Launcher & Live Demo Runner
│   │           │
│   │           ├── models/                         # Encapsulated Domain Models
│   │           │   ├── Student.java                # Encapsulated candidate profile with invariant guards
│   │           │   ├── Branch.java                 # Academic branch enumeration
│   │           │   ├── Category.java               # Quota categories (GENERAL, OBC_NCL, SC, ST, EWS)
│   │           │   ├── Gender.java                 # Gender enum for defence wing requirements
│   │           │   ├── EvaluationResult.java       # Result model holding status and shortfall lists
│   │           │   └── ShortfallDetail.java        # Specific shortfall: field, required, actual, advice
│   │           │
│   │           ├── exceptions/                     # Custom Domain Exception Hierarchy
│   │           │   ├── DishaException.java         # Base checked exception
│   │           │   ├── InvalidStudentDataException.java
│   │           │   ├── InvalidCGPAException.java
│   │           │   ├── InvalidAgeException.java
│   │           │   ├── InvalidBacklogException.java
│   │           │   ├── InvalidAcademicYearException.java
│   │           │   ├── ExamNotFoundException.java
│   │           │   └── FileProcessingException.java
│   │           │
│   │           ├── interfaces/                     # Core Behavioral Abstractions
│   │           │   ├── Eligible.java               # Evaluator contract (checkEligibility)
│   │           │   ├── Auditable.java              # Audit trail contract
│   │           │   └── Exportable.java             # Serialization contract
│   │           │
│   │           ├── exams/                          # Inheritance Subclasses & Exam Implementations
│   │           │   ├── Exam.java                   # Abstract base class implementing Template Method
│   │           │   ├── ExamType.java               # Pathway classifications
│   │           │   ├── TechnicalExam.java          # GATE CS/IT, GATE ME, PSU Recruitment
│   │           │   ├── DefenceExam.java            # CDS IMA, CDS OTA, AFCAT Ground Duty Tech
│   │           │   ├── ManagementExam.java         # CAT, XAT
│   │           │   ├── CivilServicesExam.java      # UPSC CSE
│   │           │   └── CorporateDriveExam.java     # SDE Tier-1 & National Qualifier Drives
│   │           │
│   │           ├── engine/                         # Evaluation & Dispatch Engines
│   │           │   ├── EligibilityEngine.java      # Polymorphic dynamic dispatch registry
│   │           │   ├── ConcurrentEvaluationEngine.java # Multithreaded ExecutorService processor
│   │           │   └── ShortfallReporter.java      # Diagnostic report formatter
│   │           │
│   │           ├── io/                             # Standard Java I/O File Handling
│   │           │   ├── StudentFileReader.java      # BufferedReader CSV parser
│   │           │   ├── AuditLogWriter.java         # BufferedWriter append log recorder
│   │           │   └── ReportExporter.java         # Diagnostic file exporter
│   │           │
│   │           ├── server/                         # Built-in Lightweight HTTP & REST Server
│   │           │   └── DishaHttpServer.java        # Zero-dependency Java SE HttpServer
│   │           │
│   │           └── demo/                           # Live Evaluation Rubric Demonstration
│   │               └── PredefinedProfilesDemo.java # Scenarios 1-5 testing edge cases & personas
│   │
│   └── bin/                                        # Compiled Java Bytecode
│
├── data/
│   ├── students_sample.csv                         # 10 sample student profiles for batch testing
│   └── audit_logs.txt                              # Auto-generated transactional audit logs
│
├── web/                                            # Built-in Light Glassmorphic Web Application
│   ├── index.html                                  # Semantic HTML5 Single Page App
│   ├── style.css                                   # Minimalistic, glassmorphism light theme CSS
│   ├── app.js                                      # Client-side controller communicating with REST API
│   └── assets/
│       └── disha-logo.jpg                          # Disha logo (Clear Direction for Your Next Big Step)
│
└── frontend/                                       # Modular React 18 Application (Vite-ready)
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── disha-logo.jpg
        ├── components/
        │   ├── Header.jsx
        │   ├── StudentForm.jsx
        │   ├── ResultsPanel.jsx
        │   ├── BatchProcessor.jsx
        │   ├── ExamCatalog.jsx
        │   └── AuditLogViewer.jsx
        └── services/
            └── api.js
```

---

## 4. How to Run

### Option 1: Live OOP Rubric Demonstration (Console)
Executes all 5 predefined demonstration scenarios, validating branch filtering, backlog prohibitions, passing year checks, and custom exception handling:
```powershell
cd C:\Users\samru\.gemini\antigravity-ide\scratch\disha-eligibility-engine
java -cp "backend/bin" com.disha.DishaApplication --demo
```

### Option 2: Multithreaded Batch Evaluation (CSV Dataset)
Executes concurrent evaluations across worker threads for profiles in `data/students_sample.csv`:
```powershell
java -cp "backend/bin" com.disha.DishaApplication --batch
```

### Option 3: Interactive CLI Menu & Web Server
Launches the interactive console menu while starting the embedded web server on port `8080`:
```powershell
java -cp "backend/bin" com.disha.DishaApplication
```

### Option 4: Web Application (Browser)
Open your browser and navigate to:
```
http://localhost:8080/
```
The interface features:
- **Predefined Persona Quick-Chips**: Single-click testing of *Aarav Sharma* (2nd-Yr IT), *Diya Patel* (2nd-Yr IT with arrears), *Rohan Verma* (4th-Yr CS), and *Ananya Iyer* (3rd-Yr ME).
- **Interactive Profile Evaluator**: Real-time evaluation against all 12 pathways.
- **Actionable Shortfall Remediation Cards**: Displays exact missing parameters, cutoff comparisons, and specific guidance steps.
- **Multithreaded Batch Tab**: Live performance telemetry (duration in milliseconds, thread count, student stats).
- **Exam Catalog**: Comprehensive criteria directory with category-based adjustments.
- **Audit Log Trail**: Live stream of persisted transactions from `data/audit_logs.txt`.

---

## 5. Predefined Personas & Demonstration Scenarios

1. **Aarav Sharma (2nd-Year IT, CGPA 8.50, 0 Backlogs)**
   - *Outcome*: Highlights pre-eligibility for early GATE prep, but identifies shortfalls for Year 4/Graduate exams (CAT, UPSC CSE, CDS, PSU drives), guiding him on the exact semester he can apply.
2. **Diya Patel (2nd-Year IT, CGPA 6.80, 2 Active Backlogs)**
   - *Outcome*: Demonstrates how active arrears trigger immediate shortfalls across campus recruitment and PSU pathways, providing remediation guidance.
3. **Rohan Verma (4th-Year CS, CGPA 6.20, 2 Active Backlogs)**
   - *Outcome*: Proves domain rule variance: while strict PSUs and Defence entries reject active arrears, CAT permits examination registration conditionally if cleared before IIM admission.
4. **Ananya Iyer (3rd-Year Mechanical, CGPA 9.10, 0 Backlogs)**
   - *Outcome*: Demonstrates dynamic branch filtering. Ineligible for GATE CS/IT, but eligible for GATE Mechanical, AFCAT Ground Tech, and CAT/UPSC pathways.
5. **Defensive Validation & Exception Handling**
   - *Outcome*: Attempts to create invalid student profiles (CGPA = 11.2, Backlogs = -3, Age = 14, Year = 5), proving robust encapsulation and graceful recovery via custom exceptions.
