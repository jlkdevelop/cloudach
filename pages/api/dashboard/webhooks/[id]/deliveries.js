import { requireAuth } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;
  const { id } = req.query;

  const ownerCheck = await db.query(
    'SELECT id FROM webhooks WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  if (!ownerCheck.rows.length) {
    return res.status(404).json({ error: 'Webhook not found.' });
  }

  const result = await db.query(
    `SELECT id, event_type, status, attempts, response_status, response_body,
            error_message, created_at, delivered_at
     FROM webhook_deliveries
     WHERE webhook_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [id]
  );

  return res.status(200).json({ deliveries: result.rows });
});
