import { requireAdmin } from '../../../lib/auth';
import { getDb } from '../../../lib/db';
import { isStripeConfigured, isStripeWebhookConfigured } from '../../../lib/stripe';

/**
 * GET /api/admin/overview — consolidated KPI snapshot for the admin dashboard.
 *
 * Every metric is produced by an isolated query wrapped in its own try/catch,
 * so a missing table (e.g. Stripe tables not yet migrated on this environment)
 * degrades to `null` for that metric without failing the whole endpoint.
 */
export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const out = {
    generatedAt: new Date().toISOString(),
    users: { total: null, active: null, disabled: null, signups7d: null, signups30d: null, signupsByDay: null },
    usage: { requests24h: null, tokens24h: null, errors24h: null, avgLatencyMs24h: null, p95LatencyMs24h: null },
    revenue: { todayCents: null, mtdCents: null, last30dCents: null, currency: 'usd' },
    topSpenders: null,
    stripe: {
      configured: isStripeConfigured(),
      webhookConfigured: isStripeWebhookConfigured(),
      webhookLastAt: null,
      paidInvoices24h: null,
      paidInvoicesMtd: null,
      paidInvoicesTotal: null,
    },
    systemStatus: { dbReachable: true, stripeWebhookLastAt: null },
  };

  // --- Users (total / active / disabled / signups) ---
  try {
    const r = await db.query(
      `SELECT
         COUNT(*)                                                   AS total,
         COUNT(*) FILTER (WHERE NOT is_disabled)                    AS active,
         COUNT(*) FILTER (WHERE is_disabled)                        AS disabled,
         COUNT(*) FILTER (WHERE created_at > now() - interval '7 days')   AS signups7,
         COUNT(*) FILTER (WHERE created_at > now() - interval '30 days')  AS signups30
       FROM users`
    );
    const row = r.rows[0];
    out.users.total = parseInt(row.total, 10);
    out.users.active = parseInt(row.active, 10);
    out.users.disabled = parseInt(row.disabled, 10);
    out.users.signups7d = parseInt(row.signups7, 10);
    out.users.signups30d = parseInt(row.signups30, 10);
  } catch (err) {
    console.error('overview users error:', err.message);
  }

  // --- Signups by day (last 30 days, for sparkline) ---
  try {
    const r = await db.query(
      `WITH days AS (
         SELECT generate_series(
           date_trunc('day', now()) - interval '29 days',
           date_trunc('day', now()),
           interval '1 day'
         ) AS day
       )
       SELECT days.day::date AS day,
              COUNT(u.id)     AS count
       FROM days
       LEFT JOIN users u
         ON date_trunc('day', u.created_at) = days.day
       GROUP BY days.day
       ORDER BY days.day`
    );
    out.users.signupsByDay = r.rows.map(x => ({ date: x.day, count: parseInt(x.count, 10) }));
  } catch (err) {
    console.error('overview signupsByDay error:', err.message);
  }

  // --- 24h usage summary + p95 latency ---
  try {
    const r = await db.query(
      `SELECT
         COUNT(*)                                            AS total_requests,
         COALESCE(SUM(total_tokens), 0)                      AS total_tokens,
         COUNT(*) FILTER (WHERE status_code >= 400)          AS error_count,
         COALESCE(AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL), 0) AS avg_latency,
         COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) FILTER (WHERE latency_ms IS NOT NULL), 0) AS p95_latency
       FROM usage_logs
       WHERE created_at > now() - interval '24 hours'`
    );
    const row = r.rows[0];
    out.usage.requests24h = parseInt(row.total_requests, 10);
    out.usage.tokens24h = parseInt(row.total_tokens, 10);
    out.usage.errors24h = parseInt(row.error_count, 10);
    out.usage.avgLatencyMs24h = Math.round(parseFloat(row.avg_latency));
    out.usage.p95LatencyMs24h = Math.round(parseFloat(row.p95_latency));
  } catch (err) {
    console.error('overview usage error:', err.message);
  }

  // --- Stripe revenue (today / MTD / last-30d) ---
  // Stripe tables may not exist on this environment; degrade silently.
  try {
    const r = await db.query(
      `SELECT
         COALESCE(SUM(amount_paid) FILTER (WHERE created_at >= date_trunc('day', now())), 0)              AS today_cents,
         COALESCE(SUM(amount_paid) FILTER (WHERE created_at >= date_trunc('month', now())), 0)            AS mtd_cents,
         COALESCE(SUM(amount_paid) FILTER (WHERE created_at > now() - interval '30 days'), 0)             AS last30_cents,
         COALESCE(MIN(currency) FILTER (WHERE created_at > now() - interval '30 days'), 'usd')            AS currency
       FROM stripe_invoices
       WHERE status = 'paid'`
    );
    const row = r.rows[0];
    out.revenue.todayCents = parseInt(row.today_cents, 10);
    out.revenue.mtdCents = parseInt(row.mtd_cents, 10);
    out.revenue.last30dCents = parseInt(row.last30_cents, 10);
    out.revenue.currency = row.currency || 'usd';
  } catch (err) {
    if (!/does not exist/i.test(err.message || '')) {
      console.error('overview revenue error:', err.message);
    }
  }

  // --- Top 5 spenders (last 30 days by Stripe amount; falls back to tokens if Stripe missing) ---
  try {
    const r = await db.query(
      `SELECT u.id, u.email, u.is_disabled,
              COALESCE(SUM(si.amount_paid) FILTER (WHERE si.created_at > now() - interval '30 days' AND si.status = 'paid'), 0) AS revenue_cents,
              COALESCE(SUM(ul.total_tokens) FILTER (WHERE ul.created_at > now() - interval '30 days'), 0) AS tokens_30d
       FROM users u
       LEFT JOIN stripe_invoices si ON si.user_id = u.id
       LEFT JOIN usage_logs ul      ON ul.user_id = u.id
       GROUP BY u.id, u.email, u.is_disabled
       ORDER BY revenue_cents DESC, tokens_30d DESC
       LIMIT 5`
    );
    out.topSpenders = r.rows.map(row => ({
      id: row.id,
      email: row.email,
      isDisabled: row.is_disabled,
      revenueCents: parseInt(row.revenue_cents, 10),
      tokens30d: parseInt(row.tokens_30d, 10),
    }));
  } catch (err) {
    // Fall back to tokens-only ranking when stripe_invoices is absent.
    try {
      const r = await db.query(
        `SELECT u.id, u.email, u.is_disabled,
                COALESCE(SUM(ul.total_tokens) FILTER (WHERE ul.created_at > now() - interval '30 days'), 0) AS tokens_30d
         FROM users u
         LEFT JOIN usage_logs ul ON ul.user_id = u.id
         GROUP BY u.id, u.email, u.is_disabled
         ORDER BY tokens_30d DESC
         LIMIT 5`
      );
      out.topSpenders = r.rows.map(row => ({
        id: row.id,
        email: row.email,
        isDisabled: row.is_disabled,
        revenueCents: null,
        tokens30d: parseInt(row.tokens_30d, 10),
      }));
    } catch (err2) {
      console.error('overview topSpenders fallback error:', err2.message);
    }
  }

  // --- Stripe webhook last received + paid-invoice counts ---
  try {
    const r = await db.query(`SELECT MAX(processed_at) AS last_at FROM stripe_events`);
    const lastAt = r.rows[0].last_at;
    out.systemStatus.stripeWebhookLastAt = lastAt;
    out.stripe.webhookLastAt = lastAt;
  } catch (err) {
    if (!/does not exist/i.test(err.message || '')) {
      console.error('overview stripe webhook status error:', err.message);
    }
  }

  try {
    const r = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours' AND status = 'paid') AS invoices_24h,
         COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())   AND status = 'paid') AS invoices_mtd,
         COUNT(*) FILTER (WHERE status = 'paid')                                              AS invoices_total
       FROM stripe_invoices`
    );
    const row = r.rows[0];
    out.stripe.paidInvoices24h = parseInt(row.invoices_24h, 10);
    out.stripe.paidInvoicesMtd = parseInt(row.invoices_mtd, 10);
    out.stripe.paidInvoicesTotal = parseInt(row.invoices_total, 10);
  } catch (err) {
    if (!/does not exist/i.test(err.message || '')) {
      console.error('overview stripe invoice count error:', err.message);
    }
  }

  return res.status(200).json(out);
});
