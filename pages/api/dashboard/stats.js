import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;

  const [totalReqs, todayReqs, totalTokens, activeDeployments, apiKeyCount] = await Promise.all([
    db.query('SELECT COUNT(*) FROM usage_logs WHERE user_id = $1', [userId]),
    db.query(
      "SELECT COUNT(*) FROM usage_logs WHERE user_id = $1 AND created_at > now() - interval '24 hours'",
      [userId]
    ),
    db.query(
      'SELECT COALESCE(SUM(total_tokens), 0) AS tokens FROM usage_logs WHERE user_id = $1',
      [userId]
    ),
    db.query(
      "SELECT COUNT(*) FROM user_deployments WHERE user_id = $1 AND status = 'active'",
      [userId]
    ),
    db.query('SELECT COUNT(*) FROM api_keys WHERE user_id = $1 AND revoked_at IS NULL', [userId]),
  ]);

  return res.status(200).json({
    totalRequests: parseInt(totalReqs.rows[0].count, 10),
    requestsToday: parseInt(todayReqs.rows[0].count, 10),
    totalTokens: parseInt(totalTokens.rows[0].tokens, 10),
    activeDeployments: parseInt(activeDeployments.rows[0].count, 10),
    apiKeyCount: parseInt(apiKeyCount.rows[0].count, 10),
  });
});
