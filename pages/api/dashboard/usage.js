import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);

  // Recent requests (now includes estimated_cost)
  const logsResult = await db.query(
    `SELECT ul.id, ul.model, ul.prompt_tokens, ul.completion_tokens, ul.total_tokens,
            ul.latency_ms, ul.status_code, ul.estimated_cost, ul.created_at,
            ak.name AS api_key_name
     FROM usage_logs ul
     LEFT JOIN api_keys ak ON ak.id = ul.api_key_id
     WHERE ul.user_id = $1
     ORDER BY ul.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  // Daily usage for last 7 days — use aggregates table (fast, includes cost)
  const dailyResult = await db.query(
    `SELECT day,
            SUM(total_tokens)   AS tokens,
            SUM(request_count)  AS requests,
            SUM(estimated_cost) AS cost
     FROM daily_usage_aggregates
     WHERE user_id = $1 AND day > CURRENT_DATE - INTERVAL '7 days'
     GROUP BY day
     ORDER BY day ASC`,
    [userId]
  );

  return res.status(200).json({
    logs: logsResult.rows.map(r => ({
      ...r,
      estimated_cost: parseFloat(r.estimated_cost ?? 0),
    })),
    daily: dailyResult.rows.map(r => ({
      day:      r.day,
      tokens:   parseInt(r.tokens, 10),
      requests: parseInt(r.requests, 10),
      cost:     parseFloat(r.cost ?? 0),
    })),
  });
});
