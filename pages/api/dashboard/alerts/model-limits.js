/**
 * GET  /api/dashboard/alerts/model-limits  — list per-model limits for the user
 * PUT  /api/dashboard/alerts/model-limits  — upsert a per-model limit
 * DELETE /api/dashboard/alerts/model-limits?modelId=xxx — remove a model limit
 */

import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  // ── GET ─────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const [limitsRes, spendRes] = await Promise.all([
      db.query(
        `SELECT id, model_id, limit_usd, updated_at
         FROM model_spending_limits
         WHERE user_id = $1
         ORDER BY model_id ASC`,
        [userId]
      ),
      // Current month spend per model
      db.query(
        `SELECT model_id, COALESCE(SUM(estimated_cost), 0) AS cost
         FROM daily_usage_aggregates
         WHERE user_id = $1
           AND day >= date_trunc('month', CURRENT_DATE)::date
         GROUP BY model_id`,
        [userId]
      ),
    ]);

    const spendByModel = {};
    spendRes.rows.forEach((r) => {
      spendByModel[r.model_id] = parseFloat(r.cost);
    });

    return res.status(200).json({
      limits: limitsRes.rows.map((r) => ({
        id: r.id,
        modelId: r.model_id,
        limitUsd: parseFloat(r.limit_usd),
        spendThisMonth: spendByModel[r.model_id] ?? 0,
        updatedAt: r.updated_at,
      })),
    });
  }

  // ── PUT — upsert a limit ────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    const { modelId, limitUsd } = req.body || {};

    if (!modelId || typeof modelId !== 'string' || !modelId.trim()) {
      return res.status(400).json({ error: 'modelId is required.' });
    }

    const limit = parseFloat(limitUsd);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: 'limitUsd must be a positive number.' });
    }

    await db.query(
      `INSERT INTO model_spending_limits (user_id, model_id, limit_usd)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, model_id) DO UPDATE
         SET limit_usd  = EXCLUDED.limit_usd,
             updated_at = now()`,
      [userId, modelId.trim(), limit.toFixed(4)]
    );

    return res.status(200).json({ ok: true });
  }

  // ── DELETE — remove a model limit ──────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { modelId } = req.query;
    if (!modelId) return res.status(400).json({ error: 'modelId query param required.' });

    await db.query(
      'DELETE FROM model_spending_limits WHERE user_id = $1 AND model_id = $2',
      [userId, modelId]
    );

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
});
