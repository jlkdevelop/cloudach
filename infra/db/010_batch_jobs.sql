-- Migration 010: Batch inference jobs
-- Creates batch_jobs table for async bulk inference requests.

CREATE TYPE batch_status AS ENUM (
    'queued',
    'validating',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'expired'
);

CREATE TABLE IF NOT EXISTS batch_jobs (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key_id            UUID        REFERENCES api_keys(id) ON DELETE SET NULL,
    model                 TEXT        NOT NULL,
    status                batch_status NOT NULL DEFAULT 'queued',
    completion_window     TEXT        NOT NULL DEFAULT '24h' CHECK (completion_window IN ('1h', '4h', '24h')),
    output_format         TEXT        NOT NULL DEFAULT 'jsonl' CHECK (output_format IN ('jsonl', 'csv')),
    -- Request payload stored as JSONB; for large batches the file-based path would store only a file ref
    requests              JSONB       NOT NULL DEFAULT '[]',
    results               JSONB,
    request_count         INT         NOT NULL DEFAULT 0,
    completed_count       INT         NOT NULL DEFAULT 0,
    failed_count          INT         NOT NULL DEFAULT 0,
    total_prompt_tokens   INT         NOT NULL DEFAULT 0,
    total_completion_tokens INT       NOT NULL DEFAULT 0,
    estimated_cost        NUMERIC(14, 8) NOT NULL DEFAULT 0,
    error_message         TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at            TIMESTAMPTZ,
    completed_at          TIMESTAMPTZ,
    expires_at            TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS batch_jobs_user_id_idx    ON batch_jobs(user_id);
CREATE INDEX IF NOT EXISTS batch_jobs_status_idx     ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS batch_jobs_created_at_idx ON batch_jobs(created_at DESC);
