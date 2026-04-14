import crypto from 'crypto';
import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';
import { logAuditEvent, getClientIp } from '../../../lib/audit';

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    const result = await db.query(
      `SELECT id, name, created_at, last_used_at, revoked_at, allowed_models, rate_limit_rpm
       FROM api_keys
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.status(200).json({ keys: result.rows });
  }

  if (req.method === 'POST') {
    const { name, allowed_models, rate_limit_rpm } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    // Validate allowed_models: must be array of strings or null/omitted
    let modelsArr = null;
    if (allowed_models != null) {
      if (!Array.isArray(allowed_models) || allowed_models.some(m => typeof m !== 'string')) {
        return res.status(400).json({ error: 'allowed_models must be an array of model ID strings.' });
      }
      modelsArr = allowed_models.length > 0 ? allowed_models : null;
    }

    // Validate rate_limit_rpm: positive integer or null/omitted
    let rpmLimit = null;
    if (rate_limit_rpm != null) {
      const parsed = parseInt(rate_limit_rpm, 10);
      if (isNaN(parsed) || parsed < 1) {
        return res.status(400).json({ error: 'rate_limit_rpm must be a positive integer.' });
      }
      rpmLimit = parsed;
    }

    // Generate a raw key: sk-cloudach-<32 random hex bytes>
    const rawKey = `sk-cloudach-${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const result = await db.query(
      `INSERT INTO api_keys (user_id, name, key_hash, allowed_models, rate_limit_rpm)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, created_at, allowed_models, rate_limit_rpm`,
      [userId, name, keyHash, modelsArr, rpmLimit]
    );

    // Return the raw key once — never stored again
    logAuditEvent({
      userId,
      actorEmail: req.session.email,
      action: 'api_key.created',
      resource: 'api_key',
      resourceId: result.rows[0].id,
      ipAddress: getClientIp(req),
      metadata: { name, allowed_models: modelsArr, rate_limit_rpm: rpmLimit },
    });

    return res.status(201).json({ key: result.rows[0], rawKey });
  }

  return res.status(405).end();
});
