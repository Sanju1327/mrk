# CodeCraft — System Architecture & Technical Design

## 1. High-Level Architecture Overview

CodeCraft is built on a clean layered architecture with a decoupled React SPA frontend, a Spring Boot 3.x backend, a local **XAMPP MySQL** database, and a pluggable sandbox execution engine.

```mermaid
graph TB
    subgraph Client ["Frontend (React 18 + TypeScript - Port 5173)"]
        Landing["Public Landing Page (Hero, Courses, POTD Preview)"]
        Dashboard["Student Dashboard (Real Stats, Streak, Enrolled Courses)"]
        CourseView["Course Syllabus & Lesson Markdown Reader"]
        Monaco["Monaco Editor (Java IDE, Starter Code, Tests)"]
        QuizUI["Interactive Quiz Player (Timer, Instant Grading)"]
        AdminUI["Admin Authoring Portal (CRUD, Test Cases, Audits)"]
    end

    subgraph Backend ["Spring Boot 3.x (Java 21 LTS - Port 8080)"]
        subgraph REST ["REST Controllers"]
            AuthController["AuthController (/api/auth)"]
            CourseController["CourseController (/api/courses)"]
            EnrollController["EnrollmentController (/api/enrollments)"]
            ProblemController["ProblemController (/api/problems + /potd)"]
            SubController["SubmissionController (/api/submissions)"]
            QuizController["QuizController (/api/quizzes)"]
            ProgressController["ProgressController (/api/progress)"]
            AdminController["AdminController (/api/admin)"]
        end

        subgraph Services ["Service & Business Logic Layer"]
            AuthService["AuthService & UserDetailsService"]
            CourseService["Course & Lesson Service"]
            EnrollService["EnrollmentService"]
            ProblemService["Problem & TestCase Service"]
            SubService["SubmissionService"]
            QuizService["QuizService"]
            AchieveService["AchievementService (Rule Engine)"]
            ProgressService["ProgressService (Real DB Aggregations)"]
        end

        subgraph Execution ["Code Execution Sandbox Abstraction"]
            ExecInterface["CodeExecutionService (Interface)"]
            LocalSandbox["LocalProcessSandboxExecutionService (Default Local Sandbox)"]
            DockerSandbox["DockerSandboxExecutionService (Optional Container Sandbox)"]
        end

        subgraph Persistence ["Persistence Layer"]
            JPARepos["Spring Data JPA Repositories"]
            Hibernate["Hibernate ORM (ddl-auto=validate)"]
            Flyway["Flyway Migration Engine"]
        end
    end

    subgraph Database ["XAMPP Server (Port 3306)"]
        XAMPPMySQL[("XAMPP MySQL 8.x Engine\nDatabase: codecraft_db")]
        phpMyAdmin["phpMyAdmin (Port 80/Apache)"]
    end

    %% Interactions
    Client -->|HTTP / REST + Bearer JWT| REST
    REST --> Services
    Services --> JPARepos
    JPARepos --> Hibernate
    Hibernate -->|JDBC localhost:3306| XAMPPMySQL
    Flyway -.->|Applies Migrations V1..V3| XAMPPMySQL
    phpMyAdmin -.->|Inspect & Manage| XAMPPMySQL
    
    SubService --> ExecInterface
    ExecInterface --> LocalSandbox
    ExecInterface --> DockerSandbox
    SubService -.->|Trigger Achievement Rules| AchieveService
    QuizService -.->|Trigger Achievement Rules| AchieveService
```

---

## 2. Versioned Architecture Strategy (V1, V2, V3)

```mermaid
graph LR
    subgraph V1 ["Version 1: Core Platform MVP"]
        V1_Auth["JWT Auth & RBAC"]
        V1_LMS["Courses, Topics, Lessons & Enrollments"]
        V1_POTD["Problem of the Day"]
        V1_Java["Java Coding Engine (Monaco + Sandbox Abstraction)"]
        V1_Quiz["Quizzes with Auto-Grading"]
        V1_Landing["Public Landing Page"]
        V1_XAMPP["XAMPP MySQL + Flyway"]
    end

    subgraph V2 ["Version 2: Gamification & Polish"]
        V2_Achieve["AchievementService (Event-Driven Rules)"]
        V2_Heatmap["365-Day Activity Heatmap"]
        V2_Search["Multi-Factor Problem Search & Tags"]
        V2_Admin["Rich Admin Content Builder"]
        V2_Tests["REST API Integration Test Suite"]
    end

    subgraph V3 ["Version 3: Hardening & Sandbox Scale"]
        V3_Docker["Docker Ephemeral Container Sandbox"]
        V3_MultiLang["Multi-Language Runner Foundation"]
        V3_DevOps["Optional Docker Compose Packaging"]
    end

    V1 --> V2 --> V3
```

---

## 3. Code Execution Architecture & Abstraction

CodeCraft abstracts code execution behind a clean, secure interface to guarantee separation between business submission logic and isolated execution runtime.

### 3.1 `CodeExecutionService` Interface Contract
```java
public interface CodeExecutionService {
    /**
     * Executes student code against specified test cases in an isolated sandbox.
     *
     * @param request Contains source code, language, test cases, time limit, memory limit
     * @return ExecutionResult containing status, per-testcase results, runtime (ms), and memory (kb)
     */
    ExecutionResult execute(ExecutionRequest request);
}
```

### 3.2 Execution Workflow Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Monaco Editor)
    participant API as SubmissionController
    participant SubService as SubmissionService
    participant ExecService as CodeExecutionService
    participant Sandbox as Sandbox Worker (Process/Container)
    participant DB as XAMPP MySQL Database
    participant Achieve as AchievementService

    Student->>API: POST /api/submissions (problemId, sourceCode, language="JAVA")
    API->>SubService: evaluateSubmission(userId, problemId, sourceCode, language)
    SubService->>DB: Fetch Problem (constraints, limits) & TestCases
    SubService->>ExecService: execute(ExecutionRequest)
    
    rect rgb(240, 248, 255)
        Note over ExecService, Sandbox: Isolated Sandbox Boundary
        ExecService->>Sandbox: Create isolated scratch directory / container
        Sandbox->>Sandbox: Compile Java code (javac)
        Sandbox->>Sandbox: Execute with watchdog timer (<=2000ms), memory limits (<=256MB)
        Sandbox-->>ExecService: Collect stdout, stderr, exit code, runtime ms, memory kb
        ExecService->>Sandbox: Purge scratch files / terminate container
    end

    ExecService-->>SubService: Return ExecutionResult (ACCEPTED / WA / TLE / MLE / CE / RE)
    SubService->>DB: Save immutable Submission record & update User stats
    SubService->>Achieve: onSubmissionEvaluated(userId, submission)
    Achieve->>DB: Unlock new achievements if rule criteria met
    SubService-->>API: Return SubmissionResultDto
    API-->>Student: 200 OK with detailed run results
```

### 3.3 Security & Sandbox Isolation Controls
1. **Java First Support**: Complete compilation and execution harness for Java 21 LTS with I/O redirection.
2. **Watchdog Timer**: Hard execution timeout (default: 2000ms) that forcibly terminates hung processes or infinite loops.
3. **Memory Ceilings**: Maximum heap/process memory (default: 256MB) to prevent host memory exhaustion.
4. **Output Bounding**: Captured stdout/stderr streams capped at 16KB to prevent buffer flooding.
5. **No Network Access**: In containerized mode (`DockerSandboxExecutionService`), launched with `--network none`.

---

## 4. Achievement & Gamification Service Architecture

Achievements are evaluated through an event-driven `AchievementService` rule engine that processes real user actions:

```mermaid
graph TD
    subgraph TriggerEvents ["Domain User Events"]
        E1["Submission Accepted (e.g. First Java Problem, 10 Easy, 5 Hard)"]
        E2["Quiz Completed (e.g. Perfect Score, 5 Quizzes Passed)"]
        E3["Lesson Completed (e.g. Java Course Finished)"]
        E4["Daily Login / Action (e.g. 7-Day Streak)"]
    end

    subgraph Engine ["AchievementService (Rule Engine)"]
        Evaluate["Evaluate Rules against Real DB Activity Records"]
        CheckUnlocked["Check Already Unlocked Badges in UserAchievement table"]
        Award["Award New Achievement & Persist Timestamp"]
    end

    subgraph Outcomes ["Output / Gamification"]
        DBRecord[("Save in user_achievements")]
        Toast["Return Unlocked Badges in API Response / Toast Notification"]
    end

    TriggerEvents --> Evaluate
    Evaluate --> CheckUnlocked
    CheckUnlocked --> Award
    Award --> DBRecord
    Award --> Toast
```

---

## 5. Backend Package Structure (`com.codecraft`)

```
com.codecraft
├── CodeCraftApplication.java
├── config/                          # Security, CORS, OpenAPI, MVC configs
├── security/                        # JWT token provider, filter, UserPrincipal
├── common/                          # Global exception handler, API responses, utils
├── domain/
│   ├── auth/                        # Registration, Login, Token Refresh
│   ├── user/                        # Profile, Roles, User entities
│   ├── course/                      # Courses, Topics, Lessons
│   ├── enrollment/                  # Course Enrollments & student progress
│   ├── problem/                     # Problems, Constraints, TestCases, POTD
│   ├── submission/                  # Submission evaluation & history
│   ├── execution/                   # CodeExecutionService & Sandbox implementations
│   │   ├── service/CodeExecutionService.java
│   │   ├── service/LocalProcessSandboxExecutionService.java
│   │   ├── service/DockerSandboxExecutionService.java
│   │   ├── model/ (ExecutionRequest, ExecutionResult, TestCaseResult)
│   │   └── runner/ (JavaCodeRunner)
│   ├── quiz/                        # Quizzes, Questions, Options, Attempts
│   ├── achievement/                 # AchievementService, Rule engine, Badges
│   ├── progress/                    # Dashboard stats, Streak calculation, Heatmap
│   └── admin/                       # Admin management & content authoring
```

---

## 6. Frontend Architecture & Routing

```mermaid
graph TD
    Root["/ (AppShell)"]
    
    subgraph PublicRoutes ["Public Pages"]
        Home["/ (Public Landing Page with Hero, POTD, Featured Courses)"]
        Login["/login (Sign In)"]
        Register["/register (Sign Up)"]
    end
    
    subgraph StudentRoutes ["Student Protected (/app)"]
        Dashboard["/app/dashboard (Real Stats, Streak, Enrolled Courses)"]
        Courses["/app/courses (Course Catalog)"]
        CourseDetail["/app/courses/:courseId (Syllabus & Enrollment)"]
        LessonView["/app/lessons/:lessonId (Markdown Lesson Reader)"]
        Problems["/app/problems (Filterable Catalog & Daily Challenge)"]
        ProblemSolve["/app/problems/:problemId/solve (Monaco Java IDE)"]
        Quizzes["/app/quizzes (Topic Quizzes)"]
        QuizTake["/app/quizzes/:quizId (Timed Quiz Player)"]
        QuizResult["/app/quizzes/:quizId/results/:attemptId"]
        Progress["/app/progress (Activity Heatmap & Badges)"]
        Profile["/app/profile (Account Settings)"]
    end
    
    subgraph AdminRoutes ["Admin Protected (/admin)"]
        AdminDashboard["/admin/dashboard (Platform Overview)"]
        AdminCourses["/admin/courses (Course & Lesson Authoring)"]
        AdminProblems["/admin/problems (Problem & TestCase Authoring)"]
        AdminQuizzes["/admin/quizzes (Quiz & Question Builder)"]
        AdminUsers["/admin/users (User Role Management)"]
        AdminSubmissions["/admin/submissions (Audit Logs)"]
    end

    Root --> PublicRoutes
    Root --> StudentRoutes
    Root --> AdminRoutes
```
