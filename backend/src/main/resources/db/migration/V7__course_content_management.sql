-- ==========================================
-- CodeCraft — Database Migration V7: Course Content Management
-- Compatible with PostgreSQL (Supabase)
--
-- Extends the existing Course -> Topic (Chapter) -> Lesson model with:
--   * course language + thumbnail
--   * chapter completion rules (lesson gating + chapter quiz rules)
--   * lesson-level primary video (YouTube or uploaded file)
--   * lesson video resume position in lesson_progress
--   * quiz enable/disable switch
--   * ordering for lesson learning materials (course_resources)
-- ==========================================

-- 1. Courses: language + thumbnail
ALTER TABLE courses
    ADD COLUMN IF NOT EXISTS language VARCHAR(50) NOT NULL DEFAULT 'English',
    ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500) NULL;

-- 2. Topics (chapters): completion settings
ALTER TABLE topics
    ADD COLUMN IF NOT EXISTS require_all_lessons BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS require_quiz_pass BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS allow_quiz_retakes BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS max_quiz_attempts INT NULL;

-- 3. Lessons: description, primary video, publish flag
ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS description TEXT NULL,
    ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) NOT NULL DEFAULT 'NONE',
    ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS video_id VARCHAR(50) NULL,
    ADD COLUMN IF NOT EXISTS video_file_name VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS video_mime_type VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS video_file_size BIGINT NULL,
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE lessons ALTER COLUMN content_markdown SET DEFAULT '';

-- 4. Lesson progress: in-progress rows + video resume
ALTER TABLE lesson_progress
    ADD COLUMN IF NOT EXISTS video_position_seconds INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP(6) NULL;

ALTER TABLE lesson_progress ALTER COLUMN completed_at DROP NOT NULL;
ALTER TABLE lesson_progress ALTER COLUMN is_completed SET DEFAULT FALSE;

-- 5. Quizzes: enable switch
ALTER TABLE quizzes
    ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- 6. Course resources (learning materials): explicit ordering
ALTER TABLE course_resources
    ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;
