import { requireAdmin } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

/**
 * GET /api/admin/usage
 *
 * Aggregated usage analytics for the admin /admin/usage page.
 *
 * Query params:
 *   days   - 7 | 30 | 90 (default 30) — analysis window
 *
 * Returns:
 *   {
 *     window: { days, start, end },
 *     summary: { requests, tokens, cost, errorCount, errorRate, avgLatencyMs, p95LatencyMs },
 *     dailyByDay: [{ date, requests, tokens, cost }],
 *     topModels: [{ model, requests, tokens, cost, share }],   // top 10 by tokens
 *     statusBreakdown: [{ statusCodeBucket, requests }],        // 2xx, 4xx, 5xx, none
 *   }
 *
 * All queries scoped to created_at > now() - interval '{days} days'. Uses the
 * existing usage_logs_created_at_idx index.
 */
export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const requestedDays = parseInt(req.query.days, 10);
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;

  const db = getDb();
  const out = {
    window: {
      days,
      start: new Date(Date.now() - days * 86400_000).toISOString(),
      end: new Date().toISOString(),
    },
    summary: { requests: 0, tokens: 0, cost: 0, errorCount: 0, errorRate: 0, avgLatencyMs: 0, p95LatencyMs: 0 },
    dailyByDay: [],
    topModels: [],
    statusBreakdown: [],
  };

  const intervalLiteral = `${days} days`;

  // --- Window summary ---
  try {
    const r = await db.query(
      `SELECT
         COUNT(*)::bigint                                            AS requests,
         COALESCE(SUM(total_tokens), 0)::bigint                      AS tokens,
         COALESCE(SUM(estimated_cost), 0)::float8                    AS cost,
         COUNT(*) FILTER (WHERE status_code >= 400)::bigint          AS error_count,
         COALESCE(AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL), 0)::float8 AS avg_latency,
         COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) FILTER (WHERE latency_ms IS NOT NULL), 0)::float8 AS p95_latency
       FROM usage_logs
       WHERE created_at > now() - interval '${intervalLiteral}'`
    );
    const s = r.rows[0];
    out.summary.requests = parseInt(s.requests, 10);
    out.summary.tokens = parseInt(s.tokens, 10);
    out.summary.cost = parseFloat(s.cost);
    out.summary.errorCount = parseInt(s.error_count, 10);
    out.summary.errorRate = out.summary.requests > 0 ? out.summary.errorCount / out.summary.requests : 0;
    out.summary.avgLatencyMs = Math.round(parseFloat(s.avg_latency));
    out.summary.p95LatencyMs = Math.round(parseFloat(s.p95_latency));
  } catch (err) {
    console.error('usage summary error:', err.message);
  }

  // --- Daily series (generate_series + LEFT JOIN to fill zeros) ---
  try {
    const r = await db.query(
      `WITH days AS (
         SELECT generate_series(
           date_trunc('day', now()) - interval '${days - 1} days',
           date_trunc('day', now()),
           interval '1 day'
         ) AS day
       )
       SELECT days.day::date                                AS date,
              COUNT(ul.id)::bigint                          AS requests,
              COALESCE(SUM(ul.total_tokens), 0)::bigint     AS tokens,
              COALESCE(SUM(ul.estimated_cost), 0)::float8   AS cost
       FROM days
       LEFT JOIN usage_logs ul
         ON date_trunc('day', ul.created_at) = days.day
       GROUP BY days.day
       ORDER BY days.day`
    );
    out.dailyByDay = r.rows.map(row => ({
      date: row.date,
      requests: parseInt(row.requests, 10),
      tokens: parseInt(row.tokens, 10),
      cost: parseFloat(row.cost),
    }));
  } catch (err) {
    console.error('usage daily error:', err.message);
  }

  // --- Top 10 models by tokens ---
  try {
    const r = await db.query(
      `SELECT model,
              COUNT(*)::bigint                          AS requests,
              COALESCE(SUM(total_tokens), 0)::bigint    AS tokens,
              COALESCE(SUM(estimated_cost), 0)::float8  AS cost
       FROM usage_logs
       WHERE created_at > now() - interval '${intervalLiteral}'
       GROUP BY model
       ORDER BY tokens DESC
       LIMIT 10`
    );
    const totalTokens = out.summary.tokens || 1;
    out.topModels = r.rows.map(row => ({
      model: row.model,
      requests: parseInt(row.requests, 10),
      tokens: parseInt(row.tokens, 10),
      cost: parseFloat(row.cost),
      share: parseInt(row.tokens, 10) / totalTokens,
    }));
  } catch (err) {
    console.error('usage top models error:', err.message);
  }

  // --- Status code bucket breakdown ---
  try {
    const r = await db.query(
      `SELECT
         CASE
           WHEN status_code IS NULL THEN 'none'
           WHEN status_code >= 200 AND status_code < 300 THEN '2xx'
           WHEN status_code >= 300 AND status_code < 400 THEN '3xx'
           WHEN status_code >= 400 AND status_code < 500 THEN '4xx'
           WHEN status_code >= 500 AND status_code < 600 THEN '5xx'
           ELSE 'other'
         END AS bucket,
         COUNT(*)::bigint AS requests
       FROM usage_logs
       WHERE created_at > now() - interval '${intervalLiteral}'
       GROUP BY bucket
       ORDER BY requests DESC`
    );
    out.statusBreakdown = r.rows.map(row => ({
      statusCodeBucket: row.bucket,
      requests: parseInt(row.requests, 10),
    }));
  } catch (err) {
    console.error('usage status breakdown error:', err.message);
  }

  return res.status(200).json(out);
});
