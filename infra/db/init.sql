-- Cloudach database schema
-- Applied once on first container start (postgres docker-entrypoint-initdb.d).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (linked to auth provider, not storing passwords here)
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API keys — actual key material is never stored; only a SHA-256 hex hash.
-- The raw key is shown to the user once at creation time.
CREATE TABLE IF NOT EXISTS api_keys (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    -- SHA-256 hex of the raw key (encode(sha256(key::bytea), 'hex'))
    key_hash    TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    revoked_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);

-- Usage tracking — one row per request, aggregated by billing jobs
CREATE TABLE IF NOT EXISTS usage_logs (
    id               BIGSERIAL PRIMARY KEY,
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key_id       UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    model            TEXT NOT NULL,
    prompt_tokens    INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_tokens     INT NOT NULL DEFAULT 0,
    latency_ms       INT,
    status_code      SMALLINT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS usage_logs_created_at_idx ON usage_logs(created_at);

-- Model deployments registry (future: drive models list dynamically)
CREATE TABLE IF NOT EXISTS model_deployments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id       TEXT NOT NULL UNIQUE,   -- e.g. 'llama3-8b'
    display_name   TEXT NOT NULL,
    vllm_model_name TEXT NOT NULL,         -- passed to vLLM --served-model-name
    status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'deploying')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO model_deployments (model_id, display_name, vllm_model_name)
VALUES ('llama3-8b', 'Llama 3 8B Instruct', 'llama3-8b')
ON CONFLICT (model_id) DO NOTHING;
