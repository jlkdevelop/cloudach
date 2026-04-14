-- Cloudach — combined schema for Neon (or any Postgres).
-- Run this once against a fresh database to set up all tables.
-- Apply via: psql $DATABASE_URL -f infra/db/schema.sql
-- Or paste into the Neon console SQL editor.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT      NOT NULL UNIQUE,
    password_hash TEXT,
    role          TEXT      NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_disabled   BOOLEAN   NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- ─── API Keys ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
    id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT      NOT NULL,
    key_hash        TEXT      NOT NULL UNIQUE,
    allowed_models  TEXT[]    DEFAULT NULL,
    rate_limit_rpm  INT       DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at    TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx  ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);

-- ─── Usage Logs ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_logs (
    id                BIGSERIAL   PRIMARY KEY,
    user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key_id        UUID        REFERENCES api_keys(id) ON DELETE SET NULL,
    model             TEXT        NOT NULL,
    prompt_tokens     INT         NOT NULL DEFAULT 0,
    completion_tokens INT         NOT NULL DEFAULT 0,
    total_tokens      INT         NOT NULL DEFAULT 0,
    estimated_cost    NUMERIC(12, 8) NOT NULL DEFAULT 0,
    latency_ms        INT,
    status_code       SMALLINT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx    ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS usage_logs_created_at_idx ON usage_logs(created_at);

-- ─── Model Catalog ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS model_catalog (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id      TEXT      NOT NULL UNIQUE,
    display_name  TEXT      NOT NULL,
    description   TEXT,
    param_count   TEXT,
    context_len   INT       DEFAULT 8192,
    hf_repo       TEXT,
    tags          TEXT[]    DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO model_catalog (model_id, display_name, description, param_count, context_len, hf_repo, tags)
VALUES
  ('llama3-8b',    'Llama 3 8B Instruct',   'Meta''s efficient instruction-tuned model, great for chat and coding.', '8B',  8192,  'meta-llama/Meta-Llama-3-8B-Instruct',  ARRAY['chat','code','fast']),
  ('llama3-70b',   'Llama 3 70B Instruct',  'Meta''s flagship open model. Best accuracy in the Llama 3 family.',   '70B', 8192,  'meta-llama/Meta-Llama-3-70B-Instruct', ARRAY['chat','code','powerful']),
  ('mistral-7b',   'Mistral 7B Instruct',   'Mistral''s compact model. Fast, capable, and Apache 2.0 licensed.',   '7B',  32768, 'mistralai/Mistral-7B-Instruct-v0.3',   ARRAY['chat','fast','open']),
  ('mixtral-8x7b', 'Mixtral 8×7B Instruct', 'Mixture-of-experts model beating GPT-3.5 on most benchmarks.',       '47B', 32768, 'mistralai/Mixtral-8x7B-Instruct-v0.1', ARRAY['chat','code','powerful']),
  ('codellama-13b','CodeLlama 13B Instruct', 'Meta''s code-specialized model, fine-tuned for programming tasks.',  '13B', 16384, 'meta-llama/CodeLlama-13b-Instruct-hf', ARRAY['code','instruct']),
  ('gemma-7b',     'Gemma 7B Instruct',     'Google''s open model from the Gemini family. Compact and capable.',  '7B',  8192,  'google/gemma-7b-it',                   ARRAY['chat','google'])
ON CONFLICT (model_id) DO NOTHING;

-- ─── User Deployments ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_deployments (
    id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id     TEXT      NOT NULL REFERENCES model_catalog(model_id),
    status       TEXT      NOT NULL DEFAULT 'deploying' CHECK (status IN ('deploying', 'active', 'stopped')),
    endpoint_url TEXT,
    deployed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    stopped_at   TIMESTAMPTZ,
    UNIQUE (user_id, model_id)
);

CREATE INDEX IF NOT EXISTS user_deployments_user_id_idx ON user_deployments(user_id);

-- ─── Model Pricing ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS model_pricing (
    id                        UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id                  TEXT      NOT NULL UNIQUE,
    input_price_per_million   NUMERIC(12, 6) NOT NULL DEFAULT 0.08,
    output_price_per_million  NUMERIC(12, 6) NOT NULL DEFAULT 0.10,
    effective_from            TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO model_pricing (model_id, input_price_per_million, output_price_per_million)
VALUES
    ('llama3-8b',    0.08, 0.10),
    ('mistral-7b',   0.08, 0.10),
    ('llama3-70b',   0.65, 0.80),
    ('mixtral-8x7b', 0.95, 1.20),
    ('codellama-13b',0.20, 0.25),
    ('gemma-7b',     0.08, 0.10)
ON CONFLICT (model_id) DO NOTHING;

-- ─── Daily Usage Aggregates ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_usage_aggregates (
    id                BIGSERIAL   PRIMARY KEY,
    user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model             TEXT        NOT NULL,
    day               DATE        NOT NULL,
    prompt_tokens     BIGINT      NOT NULL DEFAULT 0,
    completion_tokens BIGINT      NOT NULL DEFAULT 0,
    total_tokens      BIGINT      NOT NULL DEFAULT 0,
    request_count     INT         NOT NULL DEFAULT 0,
    estimated_cost    NUMERIC(14, 8) NOT NULL DEFAULT 0,
    UNIQUE (user_id, model, day)
);

CREATE INDEX IF NOT EXISTS daily_agg_user_day_idx ON daily_usage_aggregates(user_id, day DESC);

-- ─── Billing Periods ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS billing_periods (
    id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_start     DATE    NOT NULL,
    period_end       DATE    NOT NULL,
    free_tokens_used BIGINT  NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, period_start)
);

CREATE INDEX IF NOT EXISTS billing_periods_user_idx ON billing_periods(user_id, period_start DESC);

-- ─── Webhooks ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS webhooks (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url         TEXT      NOT NULL,
    secret      TEXT      NOT NULL,
    events      TEXT[]    NOT NULL DEFAULT '{}',
    is_enabled  BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);

-- ─── Webhook Deliveries ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id      UUID      NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type      TEXT      NOT NULL,
    payload         JSONB     NOT NULL DEFAULT '{}',
    status          TEXT      NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    attempts        INT       NOT NULL DEFAULT 0,
    response_status INT,
    response_body   TEXT,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivered_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS webhook_deliveries_webhook_id_idx  ON webhook_deliveries(webhook_id, created_at DESC);
CREATE INDEX IF NOT EXISTS webhook_deliveries_created_at_idx  ON webhook_deliveries(created_at DESC);

-- ─── Audit Logs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
    api_key_id  UUID        REFERENCES api_keys(id) ON DELETE SET NULL,
    actor_email TEXT,
    actor_type  TEXT        NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'api_key', 'system')),
    action      TEXT        NOT NULL,
    resource    TEXT,
    resource_id TEXT,
    ip_address  TEXT,
    metadata    JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx    ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx     ON audit_logs(action);

-- ─── Audit Log Retention Settings ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log_settings (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    retention_days INT     NOT NULL DEFAULT 90 CHECK (retention_days IN (30, 60, 90)),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);
