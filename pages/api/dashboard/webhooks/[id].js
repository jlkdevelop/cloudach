import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

const VALID_EVENTS = [
  'usage.threshold',
  'api_key.created',
  'api_key.revoked',
  'request.failed',
];

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;
  const { id } = req.query;

  // Verify ownership
  const ownerCheck = await db.query(
    'SELECT id FROM webhooks WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!ownerCheck.rows.length) {
    return res.status(404).json({ error: 'Webhook not found.' });
  }

  if (req.method === 'DELETE') {
    await db.query('DELETE FROM webhooks WHERE id = $1', [id]);
    return res.status(200).json({ success: true });
  }

  if (req.method === 'PATCH') {
    const { url, events, is_enabled } = req.body || {};
    const updates = [];
    const values = [];
    let idx = 1;

    if (url !== undefined) {
      if (typeof url !== 'string') return res.status(400).json({ error: 'url must be a string.' });
      try { new URL(url); } catch { return res.status(400).json({ error: 'url must be a valid URL.' }); }
      if (!url.startsWith('https://') && process.env.NODE_ENV === 'production') {
        return res.status(400).json({ error: 'url must use HTTPS in production.' });
      }
      updates.push(`url = $${idx++}`);
      values.push(url.trim());
    }

    if (events !== undefined) {
      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ error: 'events must be a non-empty array.' });
      }
      const invalid = events.filter((e) => !VALID_EVENTS.includes(e));
      if (invalid.length) {
        return res.status(400).json({ error: `Unknown event types: ${invalid.join(', ')}.` });
      }
      updates.push(`events = $${idx++}`);
      values.push(events);
    }

    if (is_enabled !== undefined) {
      updates.push(`is_enabled = $${idx++}`);
      values.push(Boolean(is_enabled));
    }

    if (!updates.length) return res.status(400).json({ error: 'No fields to update.' });

    updates.push(`updated_at = now()`);
    values.push(id);

    const result = await db.query(
      `UPDATE webhooks SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, url, events, is_enabled, updated_at`,
      values
    );
    return res.status(200).json({ webhook: result.rows[0] });
  }

  return res.status(405).end();
});
