import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

/**
 * GET /api/dashboard/billing
 *
 * Returns the current billing period's usage and cost summary for the
 * authenticated user, plus a per-model breakdown and 30-day daily trend.
 *
 * Response:
 *   {
 *     period: { start: string, end: string },          // ISO date strings
 *     totalTokens: number,
 *     promptTokens: number,
 *     completionTokens: number,
 *     estimatedCost: number,                           // USD
 *     requestCount: number,
 *     byModel: [{ model, totalTokens, estimatedCost, requestCount }],
 *     daily: [{ day, totalTokens, estimatedCost, requestCount }],   // last 30 days
 *   }
 */
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;

  // Current billing period = current UTC month
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const startStr = periodStart.toISOString().slice(0, 10);
  const endStr   = periodEnd.toISOString().slice(0, 10);

  const [summaryResult, byModelResult, dailyResult] = await Promise.all([
    // Monthly totals from daily aggregates (fast)
    db.query(
      `SELECT
         COALESCE(SUM(prompt_tokens), 0)     AS prompt_tokens,
         COALESCE(SUM(completion_tokens), 0) AS completion_tokens,
         COALESCE(SUM(total_tokens), 0)      AS total_tokens,
         COALESCE(SUM(request_count), 0)     AS request_count,
         COALESCE(SUM(estimated_cost), 0)    AS estimated_cost
       FROM daily_usage_aggregates
       WHERE user_id = $1
         AND day >= $2::date
         AND day <= $3::date`,
      [userId, startStr, endStr]
    ),

    // Per-model breakdown this month
    db.query(
      `SELECT
         model,
         COALESCE(SUM(total_tokens), 0)   AS total_tokens,
         COALESCE(SUM(request_count), 0)  AS request_count,
         COALESCE(SUM(estimated_cost), 0) AS estimated_cost
       FROM daily_usage_aggregates
       WHERE user_id = $1
         AND day >= $2::date
         AND day <= $3::date
       GROUP BY model
       ORDER BY estimated_cost DESC`,
      [userId, startStr, endStr]
    ),

    // Daily trend for last 30 days (cross-model aggregated per day)
    db.query(
      `SELECT
         day,
         COALESCE(SUM(total_tokens), 0)   AS total_tokens,
         COALESCE(SUM(request_count), 0)  AS request_count,
         COALESCE(SUM(estimated_cost), 0) AS estimated_cost
       FROM daily_usage_aggregates
       WHERE user_id = $1
         AND day > CURRENT_DATE - INTERVAL '30 days'
       GROUP BY day
       ORDER BY day ASC`,
      [userId]
    ),
  ]);

  const s = summaryResult.rows[0];

  return res.status(200).json({
    period: { start: startStr, end: endStr },
    totalTokens:       parseInt(s.total_tokens, 10),
    promptTokens:      parseInt(s.prompt_tokens, 10),
    completionTokens:  parseInt(s.completion_tokens, 10),
    requestCount:      parseInt(s.request_count, 10),
    estimatedCost:     parseFloat(s.estimated_cost),
    byModel: byModelResult.rows.map(r => ({
      model:          r.model,
      totalTokens:    parseInt(r.total_tokens, 10),
      requestCount:   parseInt(r.request_count, 10),
      estimatedCost:  parseFloat(r.estimated_cost),
    })),
    daily: dailyResult.rows.map(r => ({
      day:           r.day,
      totalTokens:   parseInt(r.total_tokens, 10),
      requestCount:  parseInt(r.request_count, 10),
      estimatedCost: parseFloat(r.estimated_cost),
    })),
  });
});
