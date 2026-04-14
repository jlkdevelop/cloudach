'use strict';

const { db } = require('./db');

/**
 * Asynchronously log a completed API request to usage_logs.
 * Fire-and-forget — never blocks the response path.
 *
 * @param {object} opts
 * @param {string} opts.userId
 * @param {string|null} opts.apiKeyId
 * @param {string} opts.model
 * @param {number} opts.promptTokens
 * @param {number} opts.completionTokens
 * @param {number} opts.latencyMs
 * @param {number} opts.statusCode
 */
function logUsage({ userId, apiKeyId, model, promptTokens, completionTokens, latencyMs, statusCode }) {
  db.query(
    `INSERT INTO usage_logs
       (user_id, api_key_id, model, prompt_tokens, completion_tokens, total_tokens, latency_ms, status_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      userId,
      apiKeyId ?? null,
      model,
      promptTokens ?? 0,
      completionTokens ?? 0,
      (promptTokens ?? 0) + (completionTokens ?? 0),
      latencyMs ?? null,
      statusCode ?? null,
    ]
  ).catch(() => {}); // non-fatal
}

module.exports = { logUsage };
