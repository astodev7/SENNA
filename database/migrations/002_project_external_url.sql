-- Optional live URL for portfolio projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS external_url VARCHAR(500);
