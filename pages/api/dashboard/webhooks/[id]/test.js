import { requireAuth } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';
import { dispatchWebhookEvent } from '../../../../../lib/webhooks';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;
  const { id } = req.query;

  const ownerCheck = await db.query(
    'SELECT id, events FROM webhooks WHERE id = $1 AND user_id = $2 AND is_enabled = TRUE',
    [id, userId]
  );
  if (!ownerCheck.rows.length) {
    return res.status(404).json({ error: 'Webhook not found or disabled.' });
  }

  const hook = ownerCheck.rows[0];
  const eventType = hook.events[0] || 'api_key.created';

  // Fire a synthetic test event for this specific webhook only
  const crypto = (await import('crypto')).default;
  const hookRow = await db.query(
    'SELECT id, url, secret FROM webhooks WHERE id = $1',
    [id]
  );
  const { url, secret } = hookRow.rows[0];

  const payload = {
    id: crypto.randomUUID(),
    event: eventType,
    created: Math.floor(Date.now() / 1000),
    data: { test: true, message: 'This is a test event from Cloudach.' },
  };

  const body = JSON.stringify(payload);
  const { signPayload } = await import('../../../../../lib/webhooks');
  const signature = signPayload(secret, body);
  const timestamp = Math.floor(Date.now() / 1000);

  // Insert delivery log
  const ins = await db.query(
    `INSERT INTO webhook_deliveries (webhook_id, event_type, payload, status, attempts)
     VALUES ($1, $2, $3, 'pending', 0)
     RETURNING id`,
    [id, eventType, JSON.stringify(payload)]
  );
  const deliveryId = ins.rows[0].id;

  let responseStatus = null;
  let responseBody = null;
  let success = false;
  let errorMessage = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
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
    success = resp.ok;
  } catch (err) {
    errorMessage = err.name === 'AbortError' ? 'Request timed out after 10s' : err.message;
  }

  await db.query(
    `UPDATE webhook_deliveries
     SET status = $1, attempts = 1, response_status = $2, response_body = $3,
         error_message = $4, delivered_at = CASE WHEN $1 = 'success' THEN now() ELSE NULL END
     WHERE id = $5`,
    [success ? 'success' : 'failed', responseStatus, responseBody, errorMessage, deliveryId]
  );

  return res.status(200).json({
    success,
    responseStatus,
    responseBody,
    error: errorMessage,
  });
});
