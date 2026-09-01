# CodeCraft — Security Architecture & Sandbox Isolation

## 1. Security Architecture Overview

CodeCraft implements **Defense-in-Depth**, enforcing security controls across transport, API authentication, business logic, persistence, and the isolated code execution sandbox.

```mermaid
graph TD
    subgraph Layer1 ["1. Network & API Transport Layer"]
        CORS["Strict CORS Policy (http://localhost:5173)"]
        Headers["Security Headers (CSP, HSTS, X-Content-Type-Options)"]
    end

    subgraph Layer2 ["2. Authentication Gateway"]
        JWT["Stateless Bearer JWT Validation (HMAC-SHA256)"]
        EntryPoint["Custom AuthenticationEntryPoint (401 Handler)"]
    end

    subgraph Layer3 ["3. Authorization & Domain Layer"]
        RBAC["Spring Security 6 RBAC (@PreAuthorize('hasRole(...)'))"]
        Validation["Jakarta Bean Validation (@Valid on DTOs)"]
    end

    subgraph Layer4 ["4. Data Layer"]
        JPA["Parameterized JPA/Hibernate Queries (Zero SQL Injection)"]
        BCrypt["BCrypt Password Hashing (Strength: 12)"]
    end

    subgraph Layer5 ["5. Sandboxed Code Execution"]
        Timeout["Watchdog Timer (2000ms Hard Process Termination)"]
        MemLimit["Memory Ceilings (256MB Cap)"]
        OutputLimit["Stream Truncation (16KB Max Output Buffer)"]
        Sandbox["Restricted Scratch Workspace / Optional Container Sandbox"]
    end

    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4
    Layer3 --> Layer5
```

---

## 2. Authentication & Authorization Lifecycle

1. **Password Security**: Passwords hashed with **BCrypt** with cost factor `12`.
2. **Stateless JWT**:
   - Signature: HMAC with SHA-256 (`HS256`).
   - Claims: User ID (`sub`), username, roles (`ROLE_STUDENT`, `ROLE_ADMIN`), issued at (`iat`), expiration (`exp`).
   - Expiration: Configurable via `JWT_EXPIRATION_MS` (default 24 hours in development).
3. **Role-Based Access Control**:
   - Public: `/api/auth/**`, `/api/public/**`, `/swagger-ui/**`.
   - Student: `/api/enrollments/**`, `/api/lessons/**`, `/api/submissions/**`, `/api/quizzes/**`, `/api/progress/**`.
   - Admin: `/api/admin/**` (strictly enforced via `@PreAuthorize("hasRole('ADMIN')")`).

---

## 3. Code Execution Sandbox Security Specification

Executing arbitrary user Java code introduces attack vectors including Remote Code Execution (RCE), Infinite Loops, Fork Bombs, and Memory Bloat. CodeCraft enforces strict containment rules.

```mermaid
flowchart TD
    Code["Student Java Code"] --> Harness["Test Runner Harness"]
    Harness --> Sandbox["CodeExecutionService (Sandbox Interface)"]
    
    subgraph Isolation ["Sandbox Security Constraints"]
        direction TB
        C1["Watchdog Timer (2.0s Hard Kill)"]
        C2["Memory Bounding (-Xmx256m)"]
        C3["Output Stream Bounded to 16KB"]
        C4["Restricted Ephemeral Workspace (Auto-purged)"]
        C5["Optional Docker Sandbox (--network none, --pids-limit 64)"]
    end

    Sandbox --> Isolation
    Isolation --> Result["ExecutionResult (ACCEPTED / WA / TLE / MLE / CE / RE)"]
```

### 3.1 Security Constraints Enforced:
1. **Compilation Isolation**: Code compiled in a clean, temporary scratch directory with `javac`. Compilation errors are captured and returned cleanly without exposing host system paths.
2. **Execution Watchdog**: An asynchronous watchdog thread kills the runtime process if execution exceeds the problem's `time_limit_ms` (default 2000ms), returning `TIME_LIMIT_EXCEEDED`.
3. **Memory Ceilings**: Java VM memory ceiling clamped via `-Xmx256m` (or problem `memory_limit_mb`).
4. **Buffer Truncation**: Standard output and error streams are capped at 16KB to prevent denial of service via `System.out.print` flood.
5. **Clean Abstraction**: The execution engine implements `CodeExecutionService`, allowing seamless switching between local process sandbox and containerized Docker sandbox without altering domain code.
