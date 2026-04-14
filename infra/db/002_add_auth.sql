-- Migration 002: Add password auth and model catalog
-- Run this after 001 (init.sql) on existing deployments.

-- Add password_hash to users for email/password auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Model catalog — what models are available to deploy (separate from deployments)
CREATE TABLE IF NOT EXISTS model_catalog (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id      TEXT NOT NULL UNIQUE,        -- e.g. 'llama3-8b'
    display_name  TEXT NOT NULL,
    description   TEXT,
    param_count   TEXT,                        -- e.g. '8B', '70B'
    context_len   INT DEFAULT 8192,
    hf_repo       TEXT,                        -- HuggingFace repo
    tags          TEXT[] DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO model_catalog (model_id, display_name, description, param_count, context_len, hf_repo, tags)
VALUES
  ('llama3-8b',    'Llama 3 8B Instruct',    'Meta''s efficient instruction-tuned model, great for chat and coding.', '8B',  8192,  'meta-llama/Meta-Llama-3-8B-Instruct',  ARRAY['chat','code','fast']),
  ('llama3-70b',   'Llama 3 70B Instruct',   'Meta''s flagship open model. Best accuracy in the Llama 3 family.',   '70B', 8192,  'meta-llama/Meta-Llama-3-70B-Instruct', ARRAY['chat','code','powerful']),
  ('mistral-7b',   'Mistral 7B Instruct',    'Mistral''s compact model. Fast, capable, and Apache 2.0 licensed.',   '7B',  32768, 'mistralai/Mistral-7B-Instruct-v0.3',   ARRAY['chat','fast','open']),
  ('mixtral-8x7b', 'Mixtral 8×7B Instruct',  'Mixture-of-experts model beating GPT-3.5 on most benchmarks.',       '47B', 32768, 'mistralai/Mixtral-8x7B-Instruct-v0.1', ARRAY['chat','code','powerful']),
  ('codellama-13b','CodeLlama 13B Instruct',  'Meta''s code-specialized model, fine-tuned for programming tasks.',   '13B', 16384, 'meta-llama/CodeLlama-13b-Instruct-hf', ARRAY['code','instruct']),
  ('gemma-7b',     'Gemma 7B Instruct',      'Google''s open model from the Gemini family. Compact and capable.',   '7B',  8192,  'google/gemma-7b-it',                   ARRAY['chat','google'])
ON CONFLICT (model_id) DO NOTHING;

-- Per-user model deployments (which models a user has deployed)
CREATE TABLE IF NOT EXISTS user_deployments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model_id       TEXT NOT NULL REFERENCES model_catalog(model_id),
    status         TEXT NOT NULL DEFAULT 'deploying' CHECK (status IN ('deploying', 'active', 'stopped')),
    endpoint_url   TEXT,
    deployed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    stopped_at     TIMESTAMPTZ,
    UNIQUE (user_id, model_id)
);

CREATE INDEX IF NOT EXISTS user_deployments_user_id_idx ON user_deployments(user_id);
