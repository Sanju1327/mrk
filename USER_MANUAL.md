# CodeCraft — Comprehensive Platform User Manual

---

## 1. Introduction & Platform Overview

Welcome to **CodeCraft**, an enterprise-grade learning platform and interactive coding ecosystem designed for software engineering mastery. CodeCraft unifies structured curricula, rich educational multimedia, interactive concept assessments, and sub-second isolated Java 21 code execution.

### Key Capabilities
* **Full-Stack Learning Tracks**: In-depth curricula covering Core Java 21 LTS, Web Fundamentals (HTML5/CSS3/ES6+), Python 3, React, React Native Mobile, and Relational Databases (MySQL).
* **Browser-Native Monaco Code Studio**: Solve algorithmic challenges directly in the browser with syntax highlighting, IntelliSense, keyboard shortcuts, standard input/output terminals, and test case evaluation.
* **Faculty & Course Studio (CMS)**: Authorized instructors can build dynamic courses, structure modules and lessons, embed YouTube lectures, curate official documentation, attach coding problems, and build multi-question assessments.
* **Super Admin Control Center**: Platform governance, real-time KPI telemetry, and faculty provisioning with zero-trust role-based authorization.

---

## 2. Platform Architecture & Three-Role Model

CodeCraft enforces a strict **Three-Role Access Control Model**. There is no ambiguous "Admin" tier; responsibilities are cleanly bifurcated:

```
                  ┌─────────────────────────────────────┐
                  │          CodeCraft Platform         │
                  └──────────────────┬──────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
  ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
  │   STUDENT    │            │   TEACHER    │            │ SUPER_ADMIN  │
  │ (Learner UI) │            │ (Faculty UI) │            │ (Owner UI)   │
  └──────────────┘            └──────────────┘            └──────────────┘
   • Public Courses            • Course Studio             • Platform KPIs
   • Lesson Reader             • Modules & Lessons         • Faculty Provisioning
   • Monaco Editor             • Multimedia & Docs         • Teacher Governance
   • Quizzes & Results         • Coding Problem Author     • Full Teacher Rights
   • Progress Tracking         • Quiz Assessments          • System Oversight
```

| Role Key | Target Audience | Primary Access Point | Authorized Capabilities |
| :--- | :--- | :--- | :--- |
| **`ROLE_STUDENT`** | Software learners, students, engineers | `/login` and `/register` | Browse catalog, enroll in courses, view lessons, run code in sandbox, take quizzes, track personal progress. |
| **`ROLE_TEACHER`** | Faculty members, instructors, authors | `/admin` | Access Teacher Dashboard, create/edit courses, organize modules and lessons, add content blocks, attach problems and quizzes, view student engagement. |
| **`ROLE_SUPER_ADMIN`** | Platform owner, system administrator | `/admin` | System-wide statistics, provision teacher accounts, toggle teacher account status, reset faculty passwords, full teacher content authoring. |

---

## 3. Account Access & Authentication

CodeCraft provides two dedicated, isolated authentication entry points:

### 3.1 Student Authentication
* **Registration URL**: `http://localhost:5173/register`
* **Login URL**: `http://localhost:5173/login`
* **Account Creation**: Anyone can register as a student. Required fields:
  * Full Name (2–100 characters)
  * Username (alphanumeric and underscores, 3–50 characters)
  * Email Address (valid unique email format)
  * Password (minimum 8 characters)
* **Default Assignment**: All self-registered users are automatically assigned `ROLE_STUDENT`.

### 3.2 Teacher & Super Admin Authentication
* **Management URL**: `http://localhost:5173/admin`
* **Single Direct Route**: Visiting `/admin` while unauthenticated renders the **Teacher / Super Admin Login** gateway directly. It does **not** redirect to `/login`.
* **Dispatched Dashboards**:
  * If authenticated as **`SUPER_ADMIN`**, the portal displays the **Super Admin Control Center**.
  * If authenticated as **`TEACHER`**, the portal displays the **Teacher Studio & Curriculum Dashboard**.
  * If a user with **`STUDENT`** credentials attempts access, the system displays a secure **403 Forbidden: Access Denied** screen with options to return to the learner dashboard or switch accounts.
* **Bootstrap Credentials (Local Development)**:
  * Email: `Sanju@gmail.com`
  * Password: Configured via environment variable `SUPER_ADMIN_PASSWORD` (default: `San!@#ju123`)

---

## 4. Student User Guide

### 4.1 Navigating the Catalog & Enrolling
1. Navigate to **Courses** (`/courses`) from the top navigation bar.
2. Filter tracks by keyword or difficulty level (Beginner, Intermediate, Advanced).
3. Click on any course card to inspect its syllabus, estimated duration, prerequisites, and assigned faculty instructor.
4. Click **Start Course** or **Enroll Now** to begin learning.

### 4.2 Lesson Reading & Multimedia Experience
Lessons feature a rich, structured modular learning layout:
* **Interactive Syllabus Sidebar**: Easily navigate across topics, modules, and sub-lessons.
* **Rich Markdown Notes**: Read structured explanations, architectural diagrams, and syntax breakdowns.
* **Embedded Video Lectures**: Watch embedded high-definition YouTube video lessons with creator attribution without leaving your workspace.
* **External Reference Cards**: Direct outbound links to authoritative documentation (e.g., MDN Web Docs, Oracle Java SE docs, React.dev).
* **Syntax-Highlighted Code Snippets**: Copyable code snippets with one-click clipboard copying.
* **Completion Tracking**: Click **Mark Lesson Complete** at the bottom of each lesson to update your course progress bar and streak counter.

### 4.3 Coding Problem Workspace (Monaco IDE)
1. Navigate to **Problems** (`/problems`) to select an algorithmic challenge.
2. The workspace features a split-pane development environment:
   * **Left Pane**: Problem description, constraints, input/output formats, and sample test cases.
   * **Right Pane**: Embedded VS Code-powered Monaco Editor pre-populated with starter Java code.
   * **Bottom Pane**: Interactive execution terminal with input/output tabs.
3. Click **Run Code** to compile and test against sample public test cases.
4. Click **Submit Solution** to evaluate against full private test suites. Feedback shows execution time (ms), memory consumed (MB), test cases passed, and detailed diffs on failure.

### 4.4 Taking Topic Quizzes
1. When a topic includes an assessment, click **Take Quiz** or access quizzes from the navigation bar (`/quizzes`).
2. Answer multiple-choice questions one by one.
3. Upon clicking **Submit Quiz**, your attempt is scored instantly, highlighting correct answers, selected options, and explanatory rationales.

---

## 5. Teacher User Guide (Course Management System)

### 5.1 Logging In to Teacher Studio
1. Open your browser and navigate to `/admin`.
2. Enter your Teacher username or email and password provided by the Super Admin.
3. Upon successful login, you are automatically directed to the **Teacher Studio Dashboard**.

### 5.2 Creating a New Course
1. Click **+ Create New Course** in the top-right corner of the studio.
2. Fill in the course modal:
   * **Title**: e.g., *Modern Reactive Java with Spring WebFlux*
   * **Slug**: Auto-generated URL-safe identifier (e.g., `modern-reactive-java`)
   * **Category**: e.g., `Backend Development`, `Algorithms`, `Cloud`
   * **Difficulty**: `BEGINNER`, `INTERMEDIATE`, or `ADVANCED`
   * **Estimated Duration**: e.g., `6 weeks`
   * **Description**: Detailed overview of what students will achieve.
3. Click **Create Course Draft**. The course is saved in `DRAFT` state and will remain hidden from the public catalog until explicitly published.

### 5.3 Building Course Content & Modules
1. Click **Edit Content** on any course card to open the **Visual Course Builder**.
2. **Add Modules**: Click **+ Add Module** to group lessons logically (e.g., *Module 1: Concurrency Basics*).
3. **Add Lessons**: Within any module, click **+ Add Lesson**. Provide:
   * Lesson Title
   * Estimated reading/study time
   * Display order
4. **Attach Learning Blocks**: Inside each lesson, click **+ Add Content Block**:
   * **Rich Text**: Write formatting notes, lists, tables, and guides in Markdown.
   * **YouTube Video Embed**: Paste any educational YouTube URL (e.g., `https://www.youtube.com/watch?v=...`) and specify attribution.
   * **Reference Link**: Add links to official technical documentation with custom link labels.
   * **Code Snippet**: Insert syntax-highlighted code blocks.
   * **Concept Check**: Insert interactive single-question review checks.

### 5.4 Authoring Coding Practice Problems
1. From the studio sidebar or course builder, select **Attach Problem**.
2. Define the challenge parameters:
   * Problem Title and Slug
   * Difficulty (Easy, Medium, Hard)
   * Problem Statement, Constraints, Input/Output specification
   * Starter Code template
3. **Define Test Cases**:
   * **Public Test Cases**: Visible to students for debugging.
   * **Hidden Test Cases**: Secret evaluation test cases used strictly by the backend evaluator.

### 5.5 Authoring Quizzes
1. Select **Create Quiz** from the studio.
2. Provide the quiz title, description, and passing score percentage.
3. Add questions, populate answer options, and select the radio button denoting the **Correct Answer**.
4. Save the quiz and associate it with the corresponding lesson or topic.

### 5.6 Publishing a Course
1. Ensure your course has at least one module with published lessons.
2. In the course builder header, click **Publish Course**.
3. The platform validates content completeness. Once published, the status transitions to `PUBLISHED` and becomes immediately accessible to all students in the public course catalog.

---

## 6. Super Admin User Guide

### 6.1 Accessing the Control Center
1. Navigate to `/admin`.
2. Enter the Super Admin credentials (`Sanju@gmail.com`).
3. You are granted access to the **Super Admin Governance Center**.

### 6.2 Monitoring Platform Telemetry
The top KPI strip displays real-time metrics across the entire platform:
* **Total Registered Students**: Active learner count.
* **Faculty Members**: Total approved Teacher accounts.
* **Total Courses**: Total published courses vs. drafts.
* **Practice Problems & Quizzes**: System-wide educational asset count.

### 6.3 Faculty Provisioning (Creating Teachers)
Teachers cannot self-register; they must be created by the Super Admin:
1. Navigate to the **Teacher Governance** tab.
2. Click **+ Provision Teacher**.
3. Fill in the required faculty profile:
   * **Full Name**: e.g., *Dr. Barbara Liskov*
   * **Username**: e.g., *barbara_liskov*
   * **Email Address**: e.g., *liskov@mit.edu*
   * **Temporary Password**: Minimum 8 characters.
   * **Bio / Department**: Instructor qualifications and background.
4. Click **Create Teacher Account**. The system creates the user record, assigns `ROLE_TEACHER`, and enables the account immediately.

### 6.4 Faculty Management & Security Operations
* **Toggle Account Status**: Click the power icon on any teacher row to instantly suspend or re-activate instructor privileges. Suspended teachers cannot log in or edit courses.
* **Reset Password**: Click the key icon on any teacher row to set a new password if the instructor forgets their credentials.
* **Global Course Catalog**: Inspect courses created by all instructors, review draft materials, and unpublish content if required.

---

## 7. Troubleshooting & FAQ

#### Q1: When I go to `/admin`, why am I not redirected to `/login`?
> **A:** This is by design. `/login` is the dedicated authentication route for **Students**, while `/admin` is the dedicated portal for **Teachers and the Super Admin**. If you are not authenticated, `/admin` directly renders the Management Login form.

#### Q2: What happens if a Student tries to log in through `/admin`?
> **A:** The system authenticates the credentials via JWT, detects that the user lacks `ROLE_TEACHER` or `ROLE_SUPER_ADMIN`, and displays a clear **403 Forbidden: Access Denied** screen. Students are never allowed into administrative or instructor interfaces.

#### Q3: Why is my course not appearing in the public catalog?
> **A:** Newly created courses start in `DRAFT` status. Make sure you open the Course Builder in the Teacher Studio and click **Publish Course**.

#### Q4: Can a Teacher see or edit another Teacher's course?
> **A:** No. CodeCraft enforces strict ownership authorization (`checkCourseAccess`). Only the assigned teacher or the Super Admin can modify a course. Unauthorized attempts are rejected with HTTP 403.
