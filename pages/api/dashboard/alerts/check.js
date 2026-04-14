/**
 * POST /api/dashboard/alerts/check
 *
 * Evaluates the authenticated user's current month spend against their configured
 * spending thresholds and records new alert_history rows when a threshold is crossed
 * for the first time this month.  Optionally sends email + webhook notifications.
 *
 * Called client-side after the alerts page loads (fire-and-forget) so thresholds are
 * always evaluated when a user visits their dashboard.
 */

import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { dispatchWebhookEvent } from '../../../../lib/webhooks';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;

  // Load alert config
  const cfgRes = await db.query(
    `SELECT monthly_budget, thresholds, notify_email, hard_cap
     FROM spending_alerts WHERE user_id = $1`,
    [userId]
  );
  if (!cfgRes.rows.length || cfgRes.rows[0].monthly_budget == null) {
    return res.status(200).json({ checked: false, reason: 'no_budget_configured' });
  }

  const cfg = cfgRes.rows[0];
  const budget = parseFloat(cfg.monthly_budget);
  const thresholds = cfg.thresholds || [50, 80, 100];

  // Current month spend
  const spendRes = await db.query(
    `SELECT COALESCE(SUM(estimated_cost), 0) AS cost
     FROM daily_usage_aggregates
     WHERE user_id = $1
       AND day >= date_trunc('month', CURRENT_DATE)::date`,
    [userId]
  );
  const spend = parseFloat(spendRes.rows[0].cost);

  if (budget <= 0) {
    return res.status(200).json({ checked: false, reason: 'invalid_budget' });
  }

  const pct = (spend / budget) * 100;

  // Find which thresholds have been crossed already this month
  const existingRes = await db.query(
    `SELECT threshold_pct FROM alert_history
     WHERE user_id = $1
       AND triggered_at >= date_trunc('month', CURRENT_DATE)`,
    [userId]
  );
  const alreadyFired = new Set(existingRes.rows.map((r) => r.threshold_pct));

  // Find newly crossed thresholds
  const newlyTriggered = thresholds.filter((t) => pct >= t && !alreadyFired.has(t));

  if (!newlyTriggered.length) {
    return res.status(200).json({ checked: true, triggered: [], spend, budget, pct });
  }

  // Get user email for notifications
  const userRes = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
  const userEmail = userRes.rows[0]?.email;

  // Record each triggered threshold
  await Promise.all(
    newlyTriggered.map((t) =>
      db.query(
        `INSERT INTO alert_history
           (user_id, threshold_pct, spend_at_alert, budget, notified_email)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, t, spend.toFixed(4), budget.toFixed(4), cfg.notify_email && !!userEmail]
      )
    )
  );

  // If hard cap enabled and 100% was just crossed, revoke all active API keys
  const capTriggered = cfg.hard_cap && newlyTriggered.includes(100);
  if (capTriggered) {
    await db.query(
      `UPDATE api_keys SET revoked_at = now()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  }

  // Fire webhook events for each threshold (fire-and-forget)
  newlyTriggered.forEach((t) => {
    dispatchWebhookEvent(userId, 'usage.threshold', {
      threshold_pct: t,
      spend,
      budget,
      pct: Math.round(pct * 10) / 10,
      hard_cap_applied: capTriggered && t === 100,
    }).catch(() => {});
  });

  return res.status(200).json({
    checked: true,
    triggered: newlyTriggered,
    spend,
    budget,
    pct: Math.round(pct * 10) / 10,
    capApplied: capTriggered,
  });
});
