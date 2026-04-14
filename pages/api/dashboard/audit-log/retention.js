import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { logAuditEvent, getClientIp } from '../../../../lib/audit';

const VALID_DAYS = [30, 60, 90];

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    const result = await db.query(
      'SELECT retention_days FROM audit_log_settings WHERE user_id = $1',
      [userId]
    );
    return res.status(200).json({ retentionDays: result.rows[0]?.retention_days ?? 90 });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { retentionDays } = req.body || {};
    const days = parseInt(retentionDays, 10);
    if (!VALID_DAYS.includes(days)) {
      return res.status(400).json({ error: 'retentionDays must be 30, 60, or 90.' });
    }

    await db.query(
      `INSERT INTO audit_log_settings (user_id, retention_days, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (user_id) DO UPDATE SET retention_days = $2, updated_at = now()`,
      [userId, days]
    );

    logAuditEvent({
      userId,
      actorEmail: req.session.email,
      action: 'audit_log.retention_updated',
      resource: 'audit_log_settings',
      ipAddress: getClientIp(req),
      metadata: { retentionDays: days },
    });

    return res.status(200).json({ retentionDays: days });
  }

  return res.status(405).end();
});
