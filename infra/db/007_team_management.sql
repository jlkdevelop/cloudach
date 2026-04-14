-- Migration 007: Team management and invite system
-- Run: psql $DATABASE_URL -f infra/db/007_team_management.sql

-- ─── Teams ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teams (
    id                    UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    name                  TEXT      NOT NULL,
    owner_user_id         UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    billing_contact_email TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS teams_owner_idx ON teams(owner_user_id);

-- ─── Team Members ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS team_members (
    id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id    UUID  NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id    UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT  NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS team_members_team_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_idx ON team_members(user_id);

-- ─── Team Invites ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS team_invites (
    id                UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id           UUID  NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email             TEXT  NOT NULL,
    role              TEXT  NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    token             TEXT  NOT NULL UNIQUE,
    invited_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at        TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    accepted_at       TIMESTAMPTZ,
    revoked_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS team_invites_team_idx  ON team_invites(team_id);
CREATE INDEX IF NOT EXISTS team_invites_token_idx ON team_invites(token);
CREATE INDEX IF NOT EXISTS team_invites_email_idx ON team_invites(email);

-- ─── API Key Team Scope ───────────────────────────────────────────────────────
-- Adds optional team_id to api_keys so keys can be team-scoped vs individual

ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS api_keys_team_idx ON api_keys(team_id) WHERE team_id IS NOT NULL;
