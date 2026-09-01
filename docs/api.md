# CodeCraft — REST API Specification

## 1. Global API Standards

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **Authentication**: `Authorization: Bearer <JWT_TOKEN>`
- **Response Envelopes**: Clean JSON objects or structured `ApiResponse<T>` / `PagedResponse<T>`.
- **Standard Error Payload**:
```json
{
  "timestamp": "2026-09-01T21:00:00.000Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed on 1 field",
  "path": "/api/problems",
  "validationErrors": [
    {
      "field": "starterCode",
      "rejectedValue": "",
      "message": "Starter code cannot be blank"
    }
  ]
}
```

---

## 2. API Endpoints Reference

### 2.1 Public & Landing Page (`/api/public`, `/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/landing` | Public | Landing page metrics, featured courses, and Problem of the Day preview |
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and receive JWT |
| `POST` | `/api/auth/refresh` | Public | Refresh expired JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role details |

---

### 2.2 Courses, Enrollments & Lessons (`/api/courses`, `/api/enrollments`, `/api/lessons`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Public | List published courses with syllabus summary |
| `GET` | `/api/courses/{slugOrId}` | Public | Detailed syllabus with topics and lesson listings |
| `POST` | `/api/enrollments/{courseId}` | Authenticated | Enroll current student into a course |
| `GET` | `/api/enrollments/me` | Authenticated | Get list of courses enrolled by current student |
| `GET` | `/api/lessons/{id}` | Authenticated | Get lesson Markdown content |
| `POST` | `/api/lessons/{id}/complete` | Authenticated | Mark lesson as completed (triggers progress check) |

---

### 2.3 Coding Problems & Sandbox Execution (`/api/problems`, `/api/submissions`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/problems` | Public | Paginated problem catalog (filter: `difficulty`, `topicId`, `search`) |
| `GET` | `/api/problems/daily` | Public | Retrieve current **Problem of the Day** |
| `GET` | `/api/problems/{id}` | Public | Problem statement, constraints, starter code, sample test cases |
| `POST` | `/api/submissions/run` | Authenticated | Dry-run code against sample test cases (no DB write) |
| `POST` | `/api/submissions` | Authenticated | Evaluate code against all test cases (persisted in DB) |
| `GET` | `/api/submissions/me` | Authenticated | Get current user's past submission history |
| `GET` | `/api/submissions/{id}` | Authenticated | Inspect specific submission results and compiler output |

#### `GET /api/problems/{id}`
**Response Payload (200 OK):**
```json
{
  "id": 101,
  "title": "Two Sum",
  "slug": "two-sum",
  "difficulty": "EASY",
  "supportedLanguage": "JAVA",
  "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
  "constraints": "• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Only one valid answer exists.",
  "timeLimitMs": 2000,
  "memoryLimitMb": 256,
  "starterCode": "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your Java code here\n        return new int[]{};\n    }\n}",
  "explanation": "Use a HashMap to store complements in O(n) time.",
  "isDailyChallenge": true,
  "sampleTestCases": [
    {
      "id": 1,
      "inputData": "[2, 7, 11, 15], 9",
      "expectedOutput": "[0, 1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ]
}
```

#### `POST /api/submissions/run` (Dry-Run Request)
```json
{
  "problemId": 101,
  "language": "JAVA",
  "sourceCode": "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{0, 1};\n    }\n}"
}
```

#### `POST /api/submissions` (Formal Evaluation Response)
```json
{
  "id": 5012,
  "problemId": 101,
  "status": "ACCEPTED",
  "passedCount": 10,
  "totalCount": 10,
  "executionTimeMs": 64,
  "memoryUsedKb": 15200,
  "errorMessage": null,
  "unlockedAchievements": [
    {
      "code": "FIRST_JAVA_ACCEPTED",
      "title": "First Code Accepted",
      "points": 50
    }
  ],
  "createdAt": "2026-09-01T21:05:00.000Z"
}
```

---

### 2.4 Quizzes & Assessments (`/api/quizzes`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/quizzes` | Authenticated | List quizzes by topic |
| `GET` | `/api/quizzes/{id}` | Authenticated | Get quiz questions & options (excluding correct answer flags) |
| `POST` | `/api/quizzes/{id}/attempts` | Authenticated | Submit quiz answers for automated grading |
| `GET` | `/api/quizzes/attempts/{attemptId}` | Authenticated | Retrieve graded attempt with score breakdown & explanations |

---

### 2.5 Progress, Gamification & Real-Time Stats (`/api/progress`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/progress/dashboard` | Authenticated | Real-time statistics derived directly from database records (problems solved by difficulty, quiz average, streak) |
| `GET` | `/api/progress/activity-heatmap` | Authenticated | 365-day daily submission, quiz, and lesson intensity counts |
| `GET` | `/api/progress/achievements` | Authenticated | List all achievements with user unlock timestamps |

---

### 2.6 Administration (`/api/admin/**`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Real-time platform metrics (users, submissions, pass rates) |
| `GET` | `/api/admin/users` | Admin | Manage user accounts and roles |
| `POST` | `/api/admin/courses` | Admin | Create new course syllabus |
| `POST` | `/api/admin/problems` | Admin | Create coding challenge (with constraints, starter code, limits) |
| `POST` | `/api/admin/problems/{id}/test-cases` | Admin | Add public or hidden test cases |
| `POST` | `/api/admin/quizzes` | Admin | Create topic quiz and question bank |
| `GET` | `/api/admin/submissions` | Admin | Global audit feed of all platform code submissions |

---

## 3. OpenAPI 3.0 / Swagger Integration

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Bearer JWT Security Scheme configured for interactive testing.
