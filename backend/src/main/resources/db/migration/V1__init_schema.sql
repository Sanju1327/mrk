-- ==========================================
-- CodeCraft — Database Migration V1: Schema Initialization
-- Compatible with MySQL 8.x
-- ==========================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    github_username VARCHAR(100) NULL,
    bio TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. User Roles Mapping Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_url VARCHAR(255) NULL,
    level VARCHAR(20) NOT NULL DEFAULT 'BEGINNER',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_courses_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    CONSTRAINT uk_user_course UNIQUE (user_id, course_id),
    CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_enrollment_user (user_id),
    INDEX idx_enrollment_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Topics Table
CREATE TABLE IF NOT EXISTS topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_topics_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_topics_course_id (course_id),
    INDEX idx_topics_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content_markdown LONGTEXT NOT NULL,
    estimated_minutes INT NOT NULL DEFAULT 10,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lessons_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    INDEX idx_lessons_topic_id (topic_id),
    INDEX idx_lessons_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Lesson Progress Table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT TRUE,
    completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_lesson UNIQUE (user_id, lesson_id),
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_progress_user (user_id),
    INDEX idx_progress_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Problems Table
CREATE TABLE IF NOT EXISTS problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description LONGTEXT NOT NULL,
    constraints TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    supported_language VARCHAR(50) NOT NULL DEFAULT 'JAVA',
    time_limit_ms INT NOT NULL DEFAULT 2000,
    memory_limit_mb INT NOT NULL DEFAULT 256,
    starter_code LONGTEXT NOT NULL,
    explanation TEXT NULL,
    is_daily_challenge BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_problems_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE RESTRICT,
    INDEX idx_problems_slug (slug),
    INDEX idx_problems_topic_id (topic_id),
    INDEX idx_problems_difficulty (difficulty),
    INDEX idx_problems_daily (is_daily_challenge)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Test Cases Table
CREATE TABLE IF NOT EXISTS test_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN NOT NULL DEFAULT FALSE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    explanation TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_testcases_problem FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    INDEX idx_testcases_problem_id (problem_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL,
    language VARCHAR(30) NOT NULL DEFAULT 'JAVA',
    source_code LONGTEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    execution_time_ms INT NULL,
    memory_used_kb INT NULL,
    compiler_output TEXT NULL,
    error_message TEXT NULL,
    passed_test_cases INT NOT NULL DEFAULT 0,
    total_test_cases INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_problem FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    INDEX idx_sub_user_problem (user_id, problem_id),
    INDEX idx_sub_created_at (created_at),
    INDEX idx_sub_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    topic_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    time_limit_minutes INT NOT NULL DEFAULT 15,
    passing_score_percentage INT NOT NULL DEFAULT 70,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quizzes_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    INDEX idx_quizzes_topic_id (topic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL DEFAULT 'SINGLE_CHOICE',
    points INT NOT NULL DEFAULT 10,
    explanation TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_questions_quiz_id (quiz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Question Options Table
CREATE TABLE IF NOT EXISTS question_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_options_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    score INT NOT NULL,
    max_score INT NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    is_passed BOOLEAN NOT NULL,
    time_spent_seconds INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_attempts_user_quiz (user_id, quiz_id),
    INDEX idx_attempts_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    icon_url VARCHAR(255) NULL,
    points INT NOT NULL DEFAULT 50,
    criteria_type VARCHAR(50) NOT NULL,
    criteria_threshold INT NOT NULL DEFAULT 1,
    INDEX idx_achievements_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    unlocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_achievement UNIQUE (user_id, achievement_id),
    CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_achievements_achieve FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    INDEX idx_user_achievements_user (user_id),
    INDEX idx_user_achievements_achieve (achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Daily Activity Table
CREATE TABLE IF NOT EXISTS daily_activity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_date DATE NOT NULL,
    submission_count INT NOT NULL DEFAULT 0,
    quiz_count INT NOT NULL DEFAULT 0,
    lesson_count INT NOT NULL DEFAULT 0,
    CONSTRAINT uk_user_date UNIQUE (user_id, activity_date),
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_date (activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
