import { requireAdmin } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

/**
 * GET /api/admin/requests — recent inference requests across all users
 * Query params: limit (default 100, max 500)
 */
export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);

  const [requestsResult, statsResult] = await Promise.all([
    db.query(
      `SELECT ul.id, ul.model, ul.prompt_tokens, ul.completion_tokens, ul.total_tokens,
              ul.latency_ms, ul.status_code, ul.estimated_cost, ul.created_at,
              u.email  AS user_email,
              ak.name  AS api_key_name
       FROM usage_logs ul
       JOIN users    u  ON u.id  = ul.user_id
       LEFT JOIN api_keys ak ON ak.id = ul.api_key_id
       ORDER BY ul.created_at DESC
       LIMIT $1`,
      [limit]
    ),
    // Platform-wide summary stats (last 24h)
    db.query(
      `SELECT COUNT(*)                            AS total_requests,
              COALESCE(SUM(total_tokens), 0)      AS total_tokens,
              COALESCE(AVG(latency_ms), 0)        AS avg_latency_ms,
              COUNT(*) FILTER (WHERE status_code >= 400) AS error_count
       FROM usage_logs
       WHERE created_at > now() - interval '24 hours'`
    ),
  ]);

  const s = statsResult.rows[0];

  return res.status(200).json({
    summary: {
      totalRequests24h: parseInt(s.total_requests, 10),
      totalTokens24h:   parseInt(s.total_tokens, 10),
      avgLatencyMs24h:  Math.round(parseFloat(s.avg_latency_ms)),
      errorCount24h:    parseInt(s.error_count, 10),
    },
    requests: requestsResult.rows.map(r => ({
      id:               r.id,
      model:            r.model,
      promptTokens:     r.prompt_tokens,
      completionTokens: r.completion_tokens,
      totalTokens:      r.total_tokens,
      latencyMs:        r.latency_ms,
      statusCode:       r.status_code,
      estimatedCost:    parseFloat(r.estimated_cost ?? 0),
      createdAt:        r.created_at,
      userEmail:        r.user_email,
      apiKeyName:       r.api_key_name,
    })),
  });
});
