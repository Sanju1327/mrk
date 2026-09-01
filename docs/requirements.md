# CodeCraft — Product Requirements Document (PRD)

## 1. Executive Summary & Vision
**CodeCraft** is an enterprise-grade, full-stack interactive learning and competitive programming platform. It bridges computer science education with hands-on practice through structured courses, interactive markdown lessons, automated assessment quizzes, progress tracking, and a secure coding problem engine supporting Java first.

The project is structured into three clear phases:
- **V1 (Core MVP)**: Core authentication, Course/Lesson learning system with Enrollments, Coding Problem Engine with Java support, Monaco Editor, Sandbox Code Execution abstraction, Submissions, Quizzes, Public Landing Page, and Problem of the Day.
- **V2 (Enhanced Learning & Gamification)**: Rule-driven `AchievementService`, Streak tracking & Activity Heatmap, Advanced Problem Filtering & Tags, Admin content authoring suite, and Comprehensive REST API Integration Testing.
- **V3 (Production Hardening & Scale)**: Containerized Docker Sandbox Execution Provider with cgroups/seccomp limits, Multi-language execution foundation, and Optional Docker Compose deployment packaging.

---

## 2. User Roles & Capabilities

| Role | Description | Primary Capabilities |
| :--- | :--- | :--- |
| **Public Visitor** | Unauthenticated user | Browse Public Landing Page, view course catalog summaries, inspect Problem of the Day preview, register account, log in. |
| **Student (Authenticated)** | Enrolled learner & developer | Enroll in courses, study lessons, solve coding problems in Java via Monaco Editor, dry-run & submit code against test cases, take topic quizzes, check Problem of the Day, track streaks/progress, unlock achievements. |
| **Admin (Authenticated)** | Platform administrator & educator | Manage users, author Courses, Topics, Lessons, manage Coding Problems & Test Cases (public/hidden), author Quizzes & Questions, inspect platform submission audits & real-time activity metrics. |

---

## 3. Functional Requirements by Version

### 3.1 Version 1 (V1) — Core Platform MVP
- **FR-V1-AUTH**: User registration and login using JWT and BCrypt password hashing; role-based access control (`ROLE_STUDENT`, `ROLE_ADMIN`).
- **FR-V1-LANDING**: Professional Public Landing Page (`/`) featuring platform highlights, featured courses, interactive code preview widget, and the **Problem of the Day** spotlight.
- **FR-V1-ENROLL**: Course enrollment system allowing students to enroll in courses (`Enrollment` entity with status `ACTIVE`, `COMPLETED`, `DROPPED`) and track topic/lesson progress.
- **FR-V1-LMS**: Hierarchical curriculum: Course $\rightarrow$ Topic $\rightarrow$ Lesson with rich Markdown rendering and completion tracking.
- **FR-V1-POTD**: **Problem of the Day (POTD)** endpoint and UI component highlighting a daily coding challenge to drive user engagement.
- **FR-V1-CODE**: Java coding challenges featuring problem description, constraints, input/output format, sample test cases with explanations, Java starter code boilerplate, time limit (ms), and memory limit (MB).
- **FR-V1-EDITOR**: Monaco Code Editor integration with Java syntax highlighting, code reset, and customizable font size.
- **FR-V1-SANDBOX**: `CodeExecutionService` abstraction interface with safe sandboxed execution:
  - Dry-Run (`POST /api/submissions/run`): Evaluates against sample test cases without persisting submission records.
  - Formal Submission (`POST /api/submissions`): Evaluates against all test cases (public and hidden), records runtime & memory metrics, stores immutable submission entry.
- **FR-V1-QUIZ**: Topic assessment quizzes with multiple-choice questions, automated scoring engine, pass/fail grading, and question explanations.
- **FR-V1-STATS**: Student Dashboard displaying real activity metrics derived directly from database records (problems solved by difficulty, course completion %, quiz averages).
- **FR-V1-ADMIN**: Basic admin CRUD for managing courses, topics, lessons, coding problems, test cases, and quizzes.

### 3.2 Version 2 (V2) — Enhanced Experience & Gamification
- **FR-V2-ACHIEVE**: Dedicated `AchievementService` implementing rule-based triggers on user actions (`onSubmissionAccepted`, `onQuizCompleted`, `onStreakUpdated`, `onLessonCompleted`).
- **FR-V2-HEATMAP**: 365-day Activity Heatmap logging daily submission, quiz, and lesson activities derived from real user activity records.
- **FR-V2-SEARCH**: Backend search and multi-factor filtering (difficulty, topic, tags, completion status) with pagination.
- **FR-V2-ADMIN-EXP**: Advanced admin management suite with markdown preview editors, bulk test case uploads, and submission log inspection.
- **FR-V2-TESTS**: Comprehensive REST API integration test suite covering all endpoints, validation errors, and authorization boundaries.

### 3.3 Version 3 (V3) — Production Hardening & Sandbox Scaling
- **FR-V3-DOCKER-SANDBOX**: Containerized `DockerSandboxExecutionService` executing student code in isolated, ephemeral containers with `--network none`, `--memory 256m`, `--pids-limit 64`, read-only rootfs, and 2.0s watchdog timer.
- **FR-V3-MULTILANG**: Extensible runner architecture supporting additional languages (Python, C++) while maintaining Java as primary.
- **FR-V3-DEVOPS**: Optional Docker Compose packaging for frontend and backend (connecting to host XAMPP MySQL).

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Security & Sandboxing
- **NFR-SEC-01**: Untrusted student code is isolated from host infrastructure with strict process watchdogs (2000ms max execution time), memory limits (256MB max), and no outbound network access.
- **NFR-SEC-02**: Passwords hashed with BCrypt (cost factor 12). No cleartext passwords or JWT secrets in logs or responses.
- **NFR-SEC-03**: Stateless Bearer JWT tokens for REST API authentication with RBAC enforced at endpoint and method levels.
- **NFR-SEC-04**: Strict input validation using Jakarta Bean Validation on backend and Zod on frontend.
- **NFR-SEC-05**: SQL Injection protection via Spring Data JPA parameterized queries and XSS protection via sanitized Markdown rendering.

### 4.2 Database & Local Environment
- **NFR-DB-01**: **XAMPP MySQL 8.x** is the primary local database (`localhost:3306`, `codecraft_db`), managed via phpMyAdmin.
- **NFR-DB-02**: Database schema evolution managed strictly through **Flyway migrations** (`V1..V3`) with `spring.jpa.hibernate.ddl-auto=validate`.
- **NFR-DB-03**: Docker is strictly **OPTIONAL** for local development. MySQL is never containerized.

### 4.3 Performance & Reliability
- **NFR-PERF-01**: Sub-150ms response times for standard read APIs.
- **NFR-PERF-02**: Real-time statistics computed via optimized indexed queries (no fake or hardcoded counters).
- **NFR-SIMP-01**: Simplicity principle: Avoid premature optimization and excessive boilerplate; focus on clean, maintainable layered architecture.
