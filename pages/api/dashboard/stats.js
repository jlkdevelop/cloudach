import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;

  // Current billing period (UTC month)
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString().slice(0, 10);
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
    .toISOString().slice(0, 10);

  const [totalReqs, todayReqs, totalTokens, activeDeployments, apiKeyCount, monthlyCost] = await Promise.all([
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
    // Monthly cost from pre-aggregated table (fast path)
    db.query(
      `SELECT COALESCE(SUM(estimated_cost), 0) AS cost,
              COALESCE(SUM(total_tokens), 0)   AS tokens
       FROM daily_usage_aggregates
       WHERE user_id = $1 AND day >= $2::date AND day <= $3::date`,
      [userId, periodStart, periodEnd]
    ),
  ]);

  return res.status(200).json({
    totalRequests:        parseInt(totalReqs.rows[0].count, 10),
    requestsToday:        parseInt(todayReqs.rows[0].count, 10),
    totalTokens:          parseInt(totalTokens.rows[0].tokens, 10),
    activeDeployments:    parseInt(activeDeployments.rows[0].count, 10),
    apiKeyCount:          parseInt(apiKeyCount.rows[0].count, 10),
    estimatedCostThisMonth: parseFloat(monthlyCost.rows[0].cost),
    tokensThisMonth:      parseInt(monthlyCost.rows[0].tokens, 10),
    billingPeriod:        { start: periodStart, end: periodEnd },
  });
});
