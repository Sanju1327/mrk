-- ==========================================
-- CodeCraft — Database Migration V5: Exact Three-Role Architecture
-- Canonical Roles: ROLE_STUDENT, ROLE_TEACHER, ROLE_SUPER_ADMIN
-- ==========================================

-- 1. Ensure ROLE_TEACHER and ROLE_SUPER_ADMIN exist
INSERT INTO roles (name, description) VALUES
('ROLE_STUDENT', 'Standard enrolled student and code practitioner'),
('ROLE_SUPER_ADMIN', 'Platform owner with full system administration and teacher management authority'),
('ROLE_TEACHER', 'Course creator and curriculum instructor with content management permissions')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 2. Re-assign any users associated with legacy ROLE_ADMIN to ROLE_TEACHER
INSERT INTO user_roles (user_id, role_id)
SELECT ur.user_id, r_teacher.id
FROM user_roles ur
JOIN roles r_old ON ur.role_id = r_old.id AND r_old.name = 'ROLE_ADMIN'
JOIN roles r_teacher ON r_teacher.name = 'ROLE_TEACHER'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 3. Safely remove user bindings to legacy ROLE_ADMIN
DELETE FROM user_roles AS ur
USING roles AS r
WHERE ur.role_id = r.id
  AND r.name = 'ROLE_ADMIN';

-- 4. Delete legacy ROLE_ADMIN from roles table
DELETE FROM roles WHERE name = 'ROLE_ADMIN';
