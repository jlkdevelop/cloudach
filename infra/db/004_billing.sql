-- Migration 004: Billing engine — model pricing and daily usage aggregates
-- Run after 003_api_key_scoping.sql.

-- Model pricing table: per-model token cost config
-- Based on CLO-14 pricing strategy (Startup tier list prices).
CREATE TABLE IF NOT EXISTS model_pricing (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id                        TEXT NOT NULL UNIQUE,
    -- Price per 1M tokens in USD
    input_price_per_million         NUMERIC(12, 6) NOT NULL DEFAULT 0.08,
    output_price_per_million        NUMERIC(12, 6) NOT NULL DEFAULT 0.10,
    effective_from                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed pricing from CLO-14 Startup tier (Startup: pay-per-token)
INSERT INTO model_pricing (model_id, input_price_per_million, output_price_per_million)
VALUES
    ('llama3-8b',    0.08, 0.10),
    ('mistral-7b',   0.08, 0.10),
    ('llama3-70b',   0.65, 0.80),
    ('mixtral-8x7b', 0.95, 1.20),
    ('codellama-13b',0.20, 0.25),
    ('gemma-7b',     0.08, 0.10)
ON CONFLICT (model_id) DO NOTHING;

-- Add estimated_cost to usage_logs for per-request cost tracking
ALTER TABLE usage_logs
    ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(12, 8) NOT NULL DEFAULT 0;

-- Daily usage aggregates: pre-computed per (user, model, day)
-- Updated in near-real-time by the usage logger (upsert after each request).
CREATE TABLE IF NOT EXISTS daily_usage_aggregates (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model                TEXT        NOT NULL,
    day                  DATE        NOT NULL,
    prompt_tokens        BIGINT      NOT NULL DEFAULT 0,
    completion_tokens    BIGINT      NOT NULL DEFAULT 0,
    total_tokens         BIGINT      NOT NULL DEFAULT 0,
    request_count        INT         NOT NULL DEFAULT 0,
    estimated_cost       NUMERIC(14, 8) NOT NULL DEFAULT 0,
    UNIQUE (user_id, model, day)
);

CREATE INDEX IF NOT EXISTS daily_agg_user_day_idx ON daily_usage_aggregates(user_id, day DESC);

-- Billing periods: tracks the start/end of each monthly billing cycle per user.
-- Allows clean monthly reset for Developer tier free allowance tracking.
CREATE TABLE IF NOT EXISTS billing_periods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    free_tokens_used BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, period_start)
);

CREATE INDEX IF NOT EXISTS billing_periods_user_idx ON billing_periods(user_id, period_start DESC);
