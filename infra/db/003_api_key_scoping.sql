-- Migration 003: API key scoping — per-key model allowlist and rate limits
-- Run after 002_add_auth.sql.

-- allowed_models: NULL means all models are permitted; otherwise a whitelist array e.g. ARRAY['llama3-8b','mistral-7b']
ALTER TABLE api_keys
  ADD COLUMN IF NOT EXISTS allowed_models TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rate_limit_rpm  INT     DEFAULT NULL;

COMMENT ON COLUMN api_keys.allowed_models IS
  'NULL = unrestricted. Otherwise, only models in this array may be called with this key.';

COMMENT ON COLUMN api_keys.rate_limit_rpm IS
  'NULL = no limit. Max requests per minute permitted for this key (enforced in gateway).';
