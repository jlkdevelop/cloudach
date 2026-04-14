import { requireAdmin } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

/**
 * GET  /api/admin/users — list all users with usage stats
 * PATCH /api/admin/users?id=<userId> — toggle is_disabled
 */
export default requireAdmin(async function handler(req, res) {
  const db = getDb();

  if (req.method === 'GET') {
    const result = await db.query(
      `SELECT u.id, u.email, u.role, u.is_disabled, u.created_at,
              COALESCE(SUM(ul.total_tokens), 0) AS total_tokens,
              COUNT(ul.id)                       AS total_requests,
              COUNT(ak.id) FILTER (WHERE ak.revoked_at IS NULL) AS active_api_keys,
              MAX(ul.created_at)                 AS last_request_at
       FROM users u
       LEFT JOIN usage_logs ul ON ul.user_id = u.id
       LEFT JOIN api_keys   ak ON ak.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      []
    );

    return res.status(200).json({
      users: result.rows.map(r => ({
        id:            r.id,
        email:         r.email,
        role:          r.role,
        isDisabled:    r.is_disabled,
        createdAt:     r.created_at,
        totalTokens:   parseInt(r.total_tokens, 10),
        totalRequests: parseInt(r.total_requests, 10),
        activeApiKeys: parseInt(r.active_api_keys, 10),
        lastRequestAt: r.last_request_at,
      })),
    });
  }

  if (req.method === 'PATCH') {
    const { id, isDisabled } = req.body || {};
    if (!id || typeof isDisabled !== 'boolean') {
      return res.status(400).json({ error: 'id (string) and isDisabled (boolean) are required.' });
    }

    const result = await db.query(
      'UPDATE users SET is_disabled = $1, updated_at = now() WHERE id = $2 RETURNING id, email, is_disabled',
      [isDisabled, id]
    );

    if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
    return res.status(200).json({ user: result.rows[0] });
  }

  return res.status(405).end();
});
