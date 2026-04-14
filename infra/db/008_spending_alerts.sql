-- Migration 008 — Spending alerts and alert history
-- Apply via: psql $DATABASE_URL -f infra/db/008_spending_alerts.sql

-- ─── Spending Alert Config (one row per user) ────────────────────────────────

CREATE TABLE IF NOT EXISTS spending_alerts (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monthly_budget  NUMERIC(12, 4),                        -- NULL = no budget set
    thresholds      INT[]   NOT NULL DEFAULT '{50,80,100}', -- % of budget to alert at
    notify_email    BOOLEAN NOT NULL DEFAULT TRUE,
    hard_cap        BOOLEAN NOT NULL DEFAULT FALSE,          -- disable API keys at 100%
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

-- ─── Alert History ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS alert_history (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    threshold_pct   INT     NOT NULL,
    spend_at_alert  NUMERIC(12, 4) NOT NULL,
    budget          NUMERIC(12, 4) NOT NULL,
    triggered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    notified_email  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS alert_history_user_id_idx
    ON alert_history(user_id, triggered_at DESC);
