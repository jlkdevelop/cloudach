import { requireAuth } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';
import { logAuditEvent, getClientIp } from '../../../../../lib/audit';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;
  const { keyId } = req.query;

  const result = await db.query(
    `UPDATE api_keys SET revoked_at = now()
     WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
     RETURNING id, name, revoked_at`,
    [keyId, userId]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: 'API key not found or already revoked.' });
  }

  logAuditEvent({
    userId,
    actorEmail: req.session.email,
    action: 'api_key.revoked',
    resource: 'api_key',
    resourceId: keyId,
    ipAddress: getClientIp(req),
    metadata: { name: result.rows[0].name },
  });

  return res.status(200).json({ key: result.rows[0] });
});
