-- ==========================================
-- CodeCraft — Database Migration V2: Roles & Achievements Seed Data
-- ==========================================

-- Seed Roles
INSERT INTO roles (name, description) VALUES 
('ROLE_STUDENT', 'Standard enrolled student and code practitioner'),
('ROLE_ADMIN', 'Platform content author and administrator')
ON DUPLICATE KEY UPDATE name=name;

-- Seed Achievements
INSERT INTO achievements (code, title, description, icon_url, points, criteria_type, criteria_threshold) VALUES
('FIRST_JAVA_ACCEPTED', 'First Code Accepted', 'Successfully solve and pass all test cases for your first Java problem.', 'zap', 50, 'SUBMISSION_ACCEPTED', 1),
('SOLVED_5_PROBLEMS', 'Problem Solver', 'Solve 5 coding problems across any difficulty.', 'code-2', 100, 'PROBLEMS_SOLVED', 5),
('SOLVED_10_EASY', 'Easy Mastery', 'Solve 10 Easy difficulty coding problems.', 'check-circle-2', 150, 'EASY_SOLVED', 10),
('STREAK_7_DAYS', '7-Day Code Streak', 'Practice and submit code for 7 consecutive days.', 'flame', 200, 'STREAK_DAYS', 7),
('PERFECT_QUIZ', 'Quiz Master', 'Score 100% on any topic assessment quiz.', 'trophy', 100, 'PERFECT_QUIZ', 1),
('COURSE_COMPLETED', 'Course Graduate', 'Complete all lessons, quizzes, and coding challenges in a course track.', 'award', 300, 'COURSE_COMPLETED', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);
