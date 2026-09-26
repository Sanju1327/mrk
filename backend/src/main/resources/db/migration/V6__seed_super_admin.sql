-- ==========================================
-- CodeCraft — Database Migration V6: Super Admin seed
-- Login: Sanju@gmail.com / 12345678
-- Password hash is BCrypt cost 12, matching BCryptPasswordEncoder(12)
-- ==========================================

INSERT INTO users (username, email, password_hash, full_name, bio, is_active, created_at, updated_at)
SELECT
    'SanjuAdmin',
    'Sanju@gmail.com',
    '$2b$12$b2.Hd2o/1AHiZMySjRRRe.6wnsbiTXNKprnrZa/eVaBwW4b1LCR8W',
    'Sanju Kumar',
    'CodeCraft Platform Super Administrator',
    TRUE,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users
    WHERE lower(email) = lower('Sanju@gmail.com')
       OR lower(username) = lower('SanjuAdmin')
);

UPDATE users
SET password_hash = '$2b$12$b2.Hd2o/1AHiZMySjRRRe.6wnsbiTXNKprnrZa/eVaBwW4b1LCR8W',
    full_name = 'Sanju Kumar',
    is_active = TRUE,
    updated_at = NOW()
WHERE lower(email) = lower('Sanju@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name IN ('ROLE_SUPER_ADMIN', 'ROLE_TEACHER')
WHERE lower(u.email) = lower('Sanju@gmail.com')
ON CONFLICT (user_id, role_id) DO NOTHING;
