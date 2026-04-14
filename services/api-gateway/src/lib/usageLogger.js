'use strict';

const { db } = require('./db');
const { calculateCost } = require('./costCalculator');

/**
 * Asynchronously log a completed API request to usage_logs and upsert the
 * daily_usage_aggregates row for this (user, model, day) combination.
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
  const pt = promptTokens ?? 0;
  const ct = completionTokens ?? 0;
  const cost = calculateCost(model, pt, ct);

  Promise.all([
    // Per-request log with cost
    db.query(
      `INSERT INTO usage_logs
         (user_id, api_key_id, model, prompt_tokens, completion_tokens, total_tokens,
          latency_ms, status_code, estimated_cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, apiKeyId ?? null, model, pt, ct, pt + ct, latencyMs ?? null, statusCode ?? null, cost]
    ),

    // Upsert daily aggregate for (user, model, today UTC)
    db.query(
      `INSERT INTO daily_usage_aggregates
         (user_id, model, day, prompt_tokens, completion_tokens, total_tokens, request_count, estimated_cost)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, 1, $6)
       ON CONFLICT (user_id, model, day) DO UPDATE SET
         prompt_tokens     = daily_usage_aggregates.prompt_tokens     + EXCLUDED.prompt_tokens,
         completion_tokens = daily_usage_aggregates.completion_tokens + EXCLUDED.completion_tokens,
         total_tokens      = daily_usage_aggregates.total_tokens      + EXCLUDED.total_tokens,
         request_count     = daily_usage_aggregates.request_count     + 1,
         estimated_cost    = daily_usage_aggregates.estimated_cost    + EXCLUDED.estimated_cost`,
      [userId, model, pt, ct, pt + ct, cost]
    ),
  ]).catch(() => {}); // non-fatal — logging must never fail requests
}

module.exports = { logUsage };
