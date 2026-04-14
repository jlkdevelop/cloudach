import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

const DEFAULT_THRESHOLDS = [50, 80, 100];

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  // ── GET — return current alert config + recent history ──────────────────────
  if (req.method === 'GET') {
    const [cfgRes, histRes, spendRes] = await Promise.all([
      db.query(
        `SELECT id, monthly_budget, thresholds, notify_email, hard_cap, updated_at
         FROM spending_alerts WHERE user_id = $1`,
        [userId]
      ),
      db.query(
        `SELECT id, threshold_pct, spend_at_alert, budget, triggered_at, notified_email
         FROM alert_history
         WHERE user_id = $1
         ORDER BY triggered_at DESC
         LIMIT 50`,
        [userId]
      ),
      // Current month spend
      db.query(
        `SELECT COALESCE(SUM(estimated_cost), 0) AS cost
         FROM daily_usage_aggregates
         WHERE user_id = $1
           AND day >= date_trunc('month', CURRENT_DATE)::date`,
        [userId]
      ),
    ]);

    const config = cfgRes.rows[0] || null;
    return res.status(200).json({
      config: config
        ? {
            monthlyBudget: config.monthly_budget != null ? parseFloat(config.monthly_budget) : null,
            thresholds: config.thresholds || DEFAULT_THRESHOLDS,
            notifyEmail: config.notify_email,
            hardCap: config.hard_cap,
            updatedAt: config.updated_at,
          }
        : null,
      history: histRes.rows.map((r) => ({
        id: r.id,
        thresholdPct: r.threshold_pct,
        spendAtAlert: parseFloat(r.spend_at_alert),
        budget: parseFloat(r.budget),
        triggeredAt: r.triggered_at,
        notifiedEmail: r.notified_email,
      })),
      currentMonthSpend: parseFloat(spendRes.rows[0].cost),
    });
  }

  // ── PUT — upsert alert configuration ────────────────────────────────────────
  if (req.method === 'PUT') {
    const { monthlyBudget, thresholds, notifyEmail, hardCap } = req.body || {};

    // Validate monthlyBudget
    let budget = null;
    if (monthlyBudget !== null && monthlyBudget !== undefined && monthlyBudget !== '') {
      budget = parseFloat(monthlyBudget);
      if (isNaN(budget) || budget < 0) {
        return res.status(400).json({ error: 'monthlyBudget must be a non-negative number.' });
      }
    }

    // Validate thresholds
    let thr = DEFAULT_THRESHOLDS;
    if (thresholds !== undefined) {
      if (!Array.isArray(thresholds) || thresholds.length === 0) {
        return res.status(400).json({ error: 'thresholds must be a non-empty array of integers (1–100).' });
      }
      thr = thresholds.map(Number);
      if (thr.some((t) => !Number.isInteger(t) || t < 1 || t > 100)) {
        return res.status(400).json({ error: 'Each threshold must be an integer between 1 and 100.' });
      }
      thr = [...new Set(thr)].sort((a, b) => a - b);
    }

    await db.query(
      `INSERT INTO spending_alerts (user_id, monthly_budget, thresholds, notify_email, hard_cap)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
         SET monthly_budget = EXCLUDED.monthly_budget,
             thresholds     = EXCLUDED.thresholds,
             notify_email   = EXCLUDED.notify_email,
             hard_cap       = EXCLUDED.hard_cap,
             updated_at     = now()`,
      [userId, budget, thr, notifyEmail !== false, hardCap === true]
    );

    return res.status(200).json({ ok: true });
  }

  // ── DELETE — remove alert configuration ─────────────────────────────────────
  if (req.method === 'DELETE') {
    await db.query('DELETE FROM spending_alerts WHERE user_id = $1', [userId]);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
});
