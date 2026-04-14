-- Migration 009 — Audit log for enterprise compliance
-- Apply via: psql $DATABASE_URL -f infra/db/009_audit_log.sql

-- ─── Audit Logs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
    api_key_id  UUID        REFERENCES api_keys(id) ON DELETE SET NULL,
    actor_email TEXT,                     -- snapshot of email at event time
    actor_type  TEXT        NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'api_key', 'system')),
    action      TEXT        NOT NULL,     -- e.g. 'api_key.created', 'login.success'
    resource    TEXT,                     -- e.g. 'api_key', 'user', 'webhook'
    resource_id TEXT,                     -- id of the affected resource
    ip_address  TEXT,
    metadata    JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx    ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx     ON audit_logs(action);

-- ─── Audit Log Retention Settings (one row per user) ─────────────────────────

CREATE TABLE IF NOT EXISTS audit_log_settings (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    retention_days      INT     NOT NULL DEFAULT 90 CHECK (retention_days IN (30, 60, 90)),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);
