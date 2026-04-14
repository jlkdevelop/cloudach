import { requireAdmin } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

/**
 * GET /api/admin/api-keys — list all API keys across all users
 */
export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);

  const result = await db.query(
    `SELECT ak.id, ak.name, ak.created_at, ak.last_used_at, ak.revoked_at,
            ak.allowed_models, ak.rate_limit_rpm,
            u.email AS user_email, u.id AS user_id
     FROM api_keys ak
     JOIN users u ON u.id = ak.user_id
     ORDER BY ak.created_at DESC
     LIMIT $1`,
    [limit]
  );

  return res.status(200).json({
    apiKeys: result.rows.map(r => ({
      id:           r.id,
      name:         r.name,
      userId:       r.user_id,
      userEmail:    r.user_email,
      createdAt:    r.created_at,
      lastUsedAt:   r.last_used_at,
      revokedAt:    r.revoked_at,
      isActive:     !r.revoked_at,
      allowedModels: r.allowed_models,
      rateLimitRpm:  r.rate_limit_rpm,
    })),
  });
});
