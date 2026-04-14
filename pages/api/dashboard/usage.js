import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);

  // Recent requests
  const logsResult = await db.query(
    `SELECT ul.id, ul.model, ul.prompt_tokens, ul.completion_tokens, ul.total_tokens,
            ul.latency_ms, ul.status_code, ul.created_at,
            ak.name AS api_key_name
     FROM usage_logs ul
     LEFT JOIN api_keys ak ON ak.id = ul.api_key_id
     WHERE ul.user_id = $1
     ORDER BY ul.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  // Daily usage for last 7 days (for sparkline)
  const dailyResult = await db.query(
    `SELECT date_trunc('day', created_at) AS day,
            SUM(total_tokens) AS tokens,
            COUNT(*) AS requests
     FROM usage_logs
     WHERE user_id = $1 AND created_at > now() - interval '7 days'
     GROUP BY 1
     ORDER BY 1`,
    [userId]
  );

  return res.status(200).json({
    logs: logsResult.rows,
    daily: dailyResult.rows,
  });
});
