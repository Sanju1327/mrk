-- ==========================================
-- CodeCraft — Database Migration V4: Admin & Teacher CMS Architecture
-- Compatible with MySQL 8.x
-- ==========================================

-- 1. Insert New Roles (SUPER_ADMIN and TEACHER)
INSERT INTO roles (name, description) VALUES 
('ROLE_SUPER_ADMIN', 'Platform owner with full system administration and teacher management authority'),
('ROLE_TEACHER', 'Course creator and curriculum instructor with content management permissions')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 2. Enhance Courses Table with Teacher Ownership and Publishing Lifecycle
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS teacher_id BIGINT NULL,
ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Programming',
ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(50) NOT NULL DEFAULT '4 weeks',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS published_at DATETIME NULL;

-- Add foreign key constraint for teacher ownership if not already present
SET @dbname = DATABASE();
SET @tablename = "courses";
SET @fkname = "fk_courses_teacher";
SET @cmd = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
     WHERE CONSTRAINT_SCHEMA = @dbname AND TABLE_NAME = @tablename AND CONSTRAINT_NAME = @fkname) > 0,
    "SELECT 1;",
    "ALTER TABLE courses ADD CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL;"
));
PREPARE stmt FROM @cmd;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Sync existing is_published courses with status
UPDATE courses SET status = 'PUBLISHED', published_at = created_at WHERE is_published = TRUE AND status = 'DRAFT';

-- 3. Create Content Blocks Table (Ordered multi-block lesson structure)
CREATE TABLE IF NOT EXISTS content_blocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NULL,
    content LONGTEXT NULL,
    data_json LONGTEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_blocks_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_blocks_lesson_order (lesson_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Course Resources Table
CREATE TABLE IF NOT EXISTS course_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    lesson_id BIGINT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    resource_type VARCHAR(30) NOT NULL,
    url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NULL,
    mime_type VARCHAR(100) NULL,
    file_size BIGINT NULL,
    provider VARCHAR(100) NULL,
    attribution VARCHAR(255) NULL,
    uploaded_by BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resources_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_resources_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    CONSTRAINT fk_resources_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_resources_course (course_id),
    INDEX idx_resources_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Extend Quizzes and Problems Tables
ALTER TABLE quizzes
ADD COLUMN IF NOT EXISTS lesson_id BIGINT NULL;

ALTER TABLE problems
ADD COLUMN IF NOT EXISTS course_id BIGINT NULL,
ADD COLUMN IF NOT EXISTS lesson_id BIGINT NULL,
ADD COLUMN IF NOT EXISTS created_by BIGINT NULL,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

-- 6. Create Quiz Attempt Answers Table
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_id BIGINT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_awarded INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_qaa_attempt FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_qaa_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_qaa_option FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL,
    INDEX idx_qaa_attempt (attempt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
