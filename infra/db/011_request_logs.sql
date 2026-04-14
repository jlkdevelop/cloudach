-- Migration 011: Request/response logging for debug dashboard
-- Adds request_id, request_body, response_body to usage_logs
-- and a latency histogram helper view.

ALTER TABLE usage_logs
  ADD COLUMN IF NOT EXISTS request_id   TEXT,
  ADD COLUMN IF NOT EXISTS request_body  JSONB,
  ADD COLUMN IF NOT EXISTS response_body JSONB;

CREATE INDEX IF NOT EXISTS usage_logs_request_id_idx ON usage_logs(request_id);
CREATE INDEX IF NOT EXISTS usage_logs_user_model_idx ON usage_logs(user_id, model);
CREATE INDEX IF NOT EXISTS usage_logs_user_status_idx ON usage_logs(user_id, status_code);
