-- Make sure we start clean (optional, but safe for dev)
DELETE FROM user_progress WHERE user_id = 1;
DELETE FROM users WHERE id = 1;

-- Insert user with fixed ID
INSERT INTO users (id, name, password_hash)
VALUES (1, 'Yegor', '123');

-- Insert default progress for this user
INSERT INTO user_progress (user_id, sheet2_unlocked, sheet2_completed)
VALUES (1, 0, 0);