'use strict';

const { Router } = require('express');
const { db } = require('../lib/db');
const { calculateCost } = require('../lib/costCalculator');

const batchRouter = Router();

const ALLOWED_MODELS = new Set(['llama3-8b', 'llama3-70b', 'mistral-7b', 'mixtral-8x7b', 'codellama-13b', 'gemma-7b']);
const ALLOWED_WINDOWS = new Set(['1h', '4h', '24h']);
const MAX_REQUESTS_PER_BATCH = 50_000;

// Estimate tokens per request for cost preview (rough heuristic until real inference runs)
const AVG_TOKENS_PER_MESSAGE = 250;

/**
 * Estimate completion window expiry from now.
 */
function windowToMs(window) {
  if (window === '1h')  return 1 * 60 * 60 * 1000;
  if (window === '4h')  return 4 * 60 * 60 * 1000;
  return 24 * 60 * 60 * 1000;
}

/**
 * Batch discount: 50% off real-time rates (spot GPU savings).
 */
const BATCH_DISCOUNT = 0.5;

function estimateBatchCost(model, requestCount) {
  const promptTokens = requestCount * AVG_TOKENS_PER_MESSAGE;
  const completionTokens = requestCount * AVG_TOKENS_PER_MESSAGE;
  const fullCost = calculateCost(model, promptTokens, completionTokens);
  return fullCost * BATCH_DISCOUNT;
}

/**
 * POST /v1/batches
 * Submit a new batch inference job.
 *
 * Body: { model, requests: [{custom_id, messages},...], completion_window?, output_format? }
 */
batchRouter.post('/', async (req, res) => {
  const {
    model,
    requests,
    completion_window = '24h',
    output_format = 'jsonl',
  } = req.body || {};

  if (!model || !ALLOWED_MODELS.has(model)) {
    return res.status(400).json({
      error: {
        message: `Model '${model}' not found. Available: ${[...ALLOWED_MODELS].join(', ')}`,
        type: 'invalid_request_error',
        param: 'model',
      },
    });
  }

  if (req.keyAllowedModels && !req.keyAllowedModels.includes(model)) {
    return res.status(403).json({
      error: {
        message: `Model '${model}' is not permitted for this API key.`,
        type: 'permission_error',
      },
    });
  }

  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({
      error: { message: "'requests' must be a non-empty array.", type: 'invalid_request_error', param: 'requests' },
    });
  }

  if (requests.length > MAX_REQUESTS_PER_BATCH) {
    return res.status(400).json({
      error: {
        message: `Batch exceeds maximum of ${MAX_REQUESTS_PER_BATCH} requests. Use the file-based API for larger batches.`,
        type: 'invalid_request_error',
        param: 'requests',
      },
    });
  }

  if (!ALLOWED_WINDOWS.has(completion_window)) {
    return res.status(400).json({
      error: {
        message: `'completion_window' must be one of: ${[...ALLOWED_WINDOWS].join(', ')}.`,
        type: 'invalid_request_error',
        param: 'completion_window',
      },
    });
  }

  if (output_format !== 'jsonl' && output_format !== 'csv') {
    return res.status(400).json({
      error: {
        message: "'output_format' must be 'jsonl' or 'csv'.",
        type: 'invalid_request_error',
        param: 'output_format',
      },
    });
  }

  // Validate each request has custom_id and messages
  for (let i = 0; i < requests.length; i++) {
    const r = requests[i];
    if (!r || typeof r.custom_id !== 'string' || !r.custom_id) {
      return res.status(400).json({
        error: {
          message: `requests[${i}] must have a non-empty 'custom_id'.`,
          type: 'invalid_request_error',
          param: 'requests',
        },
      });
    }
    if (!Array.isArray(r.messages) || r.messages.length === 0) {
      return res.status(400).json({
        error: {
          message: `requests[${i}] must have a non-empty 'messages' array.`,
          type: 'invalid_request_error',
          param: 'requests',
        },
      });
    }
  }

  // Check for duplicate custom_ids
  const ids = requests.map((r) => r.custom_id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    return res.status(400).json({
      error: { message: "'custom_id' values must be unique within a batch.", type: 'invalid_request_error', param: 'requests' },
    });
  }

  const expiresAt = new Date(Date.now() + windowToMs(completion_window) + 7 * 24 * 60 * 60 * 1000);
  const estimatedCost = estimateBatchCost(model, requests.length);

  try {
    const result = await db.query(
      `INSERT INTO batch_jobs
         (user_id, api_key_id, model, status, completion_window, output_format,
          requests, request_count, estimated_cost, expires_at)
       VALUES ($1, $2, $3, 'queued', $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at`,
      [
        req.userId,
        req.apiKeyId ?? null,
        model,
        completion_window,
        output_format,
        JSON.stringify(requests),
        requests.length,
        estimatedCost,
        expiresAt,
      ]
    );

    const { id, created_at } = result.rows[0];
    const estimatedCompletion = new Date(Date.now() + windowToMs(completion_window));

    res.status(202).json({
      id,
      object: 'batch',
      status: 'queued',
      model,
      completion_window,
      output_format,
      request_count: requests.length,
      completed_count: 0,
      failed_count: 0,
      estimated_completion: estimatedCompletion.toISOString(),
      cost_estimate_usd: parseFloat(estimatedCost.toFixed(6)),
      created_at: created_at.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, 'batch: create failed');
    res.status(500).json({ error: { message: 'Internal server error', type: 'api_error' } });
  }
});

/**
 * GET /v1/batches
 * List batch jobs for the authenticated user.
 *
 * Query: limit (default 20, max 100), after (cursor: last batch id for pagination)
 */
batchRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? '20', 10) || 20, 100);
  const after = req.query.after;

  try {
    let query;
    let params;

    if (after) {
      // Cursor pagination: fetch jobs created before the cursor batch
      query = `
        SELECT id, model, status, completion_window, output_format,
               request_count, completed_count, failed_count,
               estimated_cost, error_message,
               created_at, started_at, completed_at, expires_at
        FROM batch_jobs
        WHERE user_id = $1
          AND created_at < (SELECT created_at FROM batch_jobs WHERE id = $2 AND user_id = $1)
        ORDER BY created_at DESC
        LIMIT $3
      `;
      params = [req.userId, after, limit];
    } else {
      query = `
        SELECT id, model, status, completion_window, output_format,
               request_count, completed_count, failed_count,
               estimated_cost, error_message,
               created_at, started_at, completed_at, expires_at
        FROM batch_jobs
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;
      params = [req.userId, limit];
    }

    const result = await db.query(query, params);
    const batches = result.rows.map(formatBatch);

    res.json({
      object: 'list',
      data: batches,
      has_more: batches.length === limit,
      first_id: batches[0]?.id ?? null,
      last_id: batches[batches.length - 1]?.id ?? null,
    });
  } catch (err) {
    req.log.error({ err }, 'batch: list failed');
    res.status(500).json({ error: { message: 'Internal server error', type: 'api_error' } });
  }
});

/**
 * GET /v1/batches/:id
 * Get batch status and progress.
 */
batchRouter.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, model, status, completion_window, output_format,
              request_count, completed_count, failed_count,
              estimated_cost, error_message,
              created_at, started_at, completed_at, expires_at
       FROM batch_jobs
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: { message: `Batch '${req.params.id}' not found.`, type: 'invalid_request_error' },
      });
    }

    res.json(formatBatch(result.rows[0]));
  } catch (err) {
    req.log.error({ err }, 'batch: get failed');
    res.status(500).json({ error: { message: 'Internal server error', type: 'api_error' } });
  }
});

/**
 * GET /v1/batches/:id/results
 * Retrieve completed batch results.
 *
 * Returns JSONL (or JSON array) of {custom_id, response, error} objects.
 */
batchRouter.get('/:id/results', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, status, output_format, results, request_count, completed_count
       FROM batch_jobs
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: { message: `Batch '${req.params.id}' not found.`, type: 'invalid_request_error' },
      });
    }

    const batch = result.rows[0];

    if (batch.status !== 'completed') {
      return res.status(409).json({
        error: {
          message: `Batch is not completed (current status: '${batch.status}'). Results are only available once the batch has completed.`,
          type: 'invalid_request_error',
        },
      });
    }

    const rows = batch.results ?? [];

    if (batch.output_format === 'csv') {
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', `attachment; filename="batch_${batch.id}_results.csv"`);
      const header = 'custom_id,status,content,prompt_tokens,completion_tokens,error\n';
      const lines = rows.map((r) => {
        const content = (r.response?.choices?.[0]?.message?.content ?? '').replace(/"/g, '""');
        const err = r.error?.message ?? '';
        return `"${r.custom_id}","${r.error ? 'error' : 'success'}","${content}",${r.response?.usage?.prompt_tokens ?? ''},${r.response?.usage?.completion_tokens ?? ''},"${err}"`;
      });
      return res.send(header + lines.join('\n'));
    }

    // Default: JSONL
    res.set('Content-Type', 'application/x-ndjson');
    res.set('Content-Disposition', `attachment; filename="batch_${batch.id}_results.jsonl"`);
    const jsonl = rows.map((r) => JSON.stringify(r)).join('\n');
    res.send(jsonl);
  } catch (err) {
    req.log.error({ err }, 'batch: results failed');
    res.status(500).json({ error: { message: 'Internal server error', type: 'api_error' } });
  }
});

/**
 * DELETE /v1/batches/:id
 * Cancel a queued or processing batch.
 */
batchRouter.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE batch_jobs
       SET status = 'cancelled', completed_at = now()
       WHERE id = $1 AND user_id = $2 AND status IN ('queued', 'validating', 'processing')
       RETURNING id`,
      [req.params.id, req.userId]
    );

    if (!result.rows.length) {
      // Check if it exists at all
      const check = await db.query(
        'SELECT status FROM batch_jobs WHERE id = $1 AND user_id = $2',
        [req.params.id, req.userId]
      );
      if (!check.rows.length) {
        return res.status(404).json({
          error: { message: `Batch '${req.params.id}' not found.`, type: 'invalid_request_error' },
        });
      }
      return res.status(409).json({
        error: {
          message: `Batch cannot be cancelled (current status: '${check.rows[0].status}').`,
          type: 'invalid_request_error',
        },
      });
    }

    // Return updated batch
    const updated = await db.query(
      `SELECT id, model, status, completion_window, output_format,
              request_count, completed_count, failed_count,
              estimated_cost, error_message,
              created_at, started_at, completed_at, expires_at
       FROM batch_jobs WHERE id = $1`,
      [result.rows[0].id]
    );

    res.json(formatBatch(updated.rows[0]));
  } catch (err) {
    req.log.error({ err }, 'batch: cancel failed');
    res.status(500).json({ error: { message: 'Internal server error', type: 'api_error' } });
  }
});

function formatBatch(row) {
  const progress = row.request_count > 0
    ? Math.round((row.completed_count / row.request_count) * 100)
    : 0;

  return {
    id: row.id,
    object: 'batch',
    status: row.status,
    model: row.model,
    completion_window: row.completion_window,
    output_format: row.output_format,
    request_count: row.request_count,
    completed_count: row.completed_count,
    failed_count: row.failed_count,
    progress_pct: progress,
    cost_estimate_usd: parseFloat((row.estimated_cost ?? 0).toString()),
    error: row.error_message ? { message: row.error_message } : null,
    created_at: row.created_at?.toISOString() ?? null,
    started_at: row.started_at?.toISOString() ?? null,
    completed_at: row.completed_at?.toISOString() ?? null,
    expires_at: row.expires_at?.toISOString() ?? null,
  };
}

module.exports = { batchRouter };
