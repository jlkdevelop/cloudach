-- Migration 012 — Per-model spending limits
-- Apply via: psql $DATABASE_URL -f infra/db/012_model_spending_limits.sql

-- ─── Per-model Monthly Spending Limits ───────────────────────────────────────
-- Each row caps the monthly spend for a specific model for a given user.
-- When spend for that model >= limit_usd, the model is blocked for that user.

CREATE TABLE IF NOT EXISTS model_spending_limits (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id    TEXT    NOT NULL,                     -- e.g. 'llama-3-70b-instruct'
    limit_usd   NUMERIC(12, 4) NOT NULL,              -- monthly cap in USD
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, model_id)
);

CREATE INDEX IF NOT EXISTS model_spending_limits_user_idx
    ON model_spending_limits(user_id);
