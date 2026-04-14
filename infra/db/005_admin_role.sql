-- Migration 005: Admin role support
-- Run after 004_billing.sql.

-- Add role column to users (default 'user'; admins set to 'admin')
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

-- Add is_disabled flag for manual user enable/disable from admin panel
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
