import crypto from 'crypto';
import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

const VALID_EVENTS = [
  'usage.threshold',
  'api_key.created',
  'api_key.revoked',
  'request.failed',
];

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    const result = await db.query(
      `SELECT id, url, events, is_enabled, created_at, updated_at
       FROM webhooks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.status(200).json({ webhooks: result.rows });
  }

  if (req.method === 'POST') {
    const { url, events } = req.body || {};

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required.' });
    }
    try { new URL(url); } catch {
      return res.status(400).json({ error: 'url must be a valid URL.' });
    }
    if (!url.startsWith('https://') && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ error: 'url must use HTTPS in production.' });
    }

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: 'events must be a non-empty array.' });
    }
    const invalid = events.filter((e) => !VALID_EVENTS.includes(e));
    if (invalid.length) {
      return res.status(400).json({ error: `Unknown event types: ${invalid.join(', ')}. Valid types: ${VALID_EVENTS.join(', ')}.` });
    }

    // Enforce max 10 webhooks per user
    const countRes = await db.query('SELECT COUNT(*) FROM webhooks WHERE user_id = $1', [userId]);
    if (parseInt(countRes.rows[0].count, 10) >= 10) {
      return res.status(400).json({ error: 'Maximum of 10 webhooks allowed per account.' });
    }

    const secret = `whsec_${crypto.randomBytes(24).toString('base64url')}`;

    const result = await db.query(
      `INSERT INTO webhooks (user_id, url, secret, events)
       VALUES ($1, $2, $3, $4)
       RETURNING id, url, events, is_enabled, created_at`,
      [userId, url.trim(), secret, events]
    );

    return res.status(201).json({ webhook: result.rows[0], secret });
  }

  return res.status(405).end();
});
