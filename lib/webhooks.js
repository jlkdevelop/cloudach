/**
 * Webhook delivery library — HMAC-SHA256 signing, dispatch, and retry logic.
 *
 * Event types:
 *   usage.threshold   — fired when a user crosses a usage cost threshold
 *   api_key.created   — fired when an API key is created
 *   api_key.revoked   — fired when an API key is revoked
 *   request.failed    — fired when an API request returns a 4xx/5xx
 */

import crypto from 'crypto';
import { getDb } from './db.js';

const MAX_ATTEMPTS = 3;
const BACKOFF_BASE_MS = 500; // 500ms, 1000ms, 2000ms

/**
 * Sign a webhook payload with HMAC-SHA256.
 * Returns the hex digest in the format: sha256=<hex>
 */
export function signPayload(secret, body) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Attempt to deliver a single webhook with retry/backoff.
 * Updates the webhook_deliveries row in the DB.
 *
 * @param {object} db  - pg pool
 * @param {string} deliveryId - UUID of the webhook_deliveries row
 * @param {string} url
 * @param {string} secret
 * @param {string} eventType
 * @param {object} payload  - JS object to JSON-serialize and POST
 */
async function attemptDelivery(db, deliveryId, url, secret, eventType, payload) {
  const body = JSON.stringify(payload);
  const signature = signPayload(secret, body);
  const timestamp = Math.floor(Date.now() / 1000);

  let lastError = null;
  let responseStatus = null;
  let responseBody = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await new Promise((r) => setTimeout(r, BACKOFF_BASE_MS * Math.pow(2, attempt - 2)));
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Cloudach-Signature': signature,
          'X-Cloudach-Timestamp': String(timestamp),
          'X-Cloudach-Event': eventType,
          'User-Agent': 'Cloudach-Webhooks/1.0',
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      responseStatus = resp.status;
      responseBody = (await resp.text()).slice(0, 2000);

      if (resp.ok) {
        await db.query(
          `UPDATE webhook_deliveries
           SET status = 'success', attempts = $1, response_status = $2,
               response_body = $3, error_message = NULL, delivered_at = now()
           WHERE id = $4`,
          [attempt, responseStatus, responseBody, deliveryId]
        );
        return { success: true, attempts: attempt, responseStatus };
      }

      lastError = `HTTP ${responseStatus}`;
    } catch (err) {
      lastError = err.name === 'AbortError' ? 'Request timed out after 10s' : err.message;
      responseStatus = null;
      responseBody = null;
    }
  }

  // All attempts failed
  await db.query(
    `UPDATE webhook_deliveries
     SET status = 'failed', attempts = $1, response_status = $2,
         response_body = $3, error_message = $4
     WHERE id = $5`,
    [MAX_ATTEMPTS, responseStatus, responseBody, lastError, deliveryId]
  );
  return { success: false, attempts: MAX_ATTEMPTS, error: lastError };
}

/**
 * Dispatch an event to all enabled webhooks for a user that are subscribed to it.
 * Creates delivery log rows and attempts delivery with retries.
 *
 * This function does not throw — failures are recorded in webhook_deliveries.
 *
 * @param {string} userId
 * @param {string} eventType  - one of the supported event type strings
 * @param {object} data       - event-specific data to include in payload
 */
export async function dispatchWebhookEvent(userId, eventType, data = {}) {
  let db;
  try {
    db = getDb();
  } catch {
    // DB not available — silently skip (e.g. during build)
    return;
  }

  let hooks;
  try {
    const result = await db.query(
      `SELECT id, url, secret FROM webhooks
       WHERE user_id = $1
         AND is_enabled = TRUE
         AND $2 = ANY(events)`,
      [userId, eventType]
    );
    hooks = result.rows;
  } catch {
    return;
  }

  if (!hooks.length) return;

  const payload = {
    id: crypto.randomUUID(),
    event: eventType,
    created: Math.floor(Date.now() / 1000),
    data,
  };

  await Promise.allSettled(
    hooks.map(async (hook) => {
      let deliveryId;
      try {
        const ins = await db.query(
          `INSERT INTO webhook_deliveries (webhook_id, event_type, payload, status, attempts)
           VALUES ($1, $2, $3, 'pending', 0)
           RETURNING id`,
          [hook.id, eventType, JSON.stringify(payload)]
        );
        deliveryId = ins.rows[0].id;
      } catch {
        return;
      }
      await attemptDelivery(db, deliveryId, hook.url, hook.secret, eventType, payload);
    })
  );
}
