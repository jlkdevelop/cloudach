import { requireAdmin } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

const PLAN_MRR_CENTS = { free: 0, pro: 4900, enterprise: 49900 };

/**
 * GET /api/admin/customers/{id}
 *
 * Single-customer drill-down. Fetches the user record + subscription + last-30-day
 * invoices + active API keys + last 50 inference requests + last 20 audit entries.
 *
 * Each query is wrapped in its own try/catch so a missing optional table
 * (e.g. Stripe) degrades gracefully rather than 500-ing the whole endpoint.
 */
export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Customer id is required' });
  }

  const db = getDb();
  const out = {
    user: null,
    subscription: null,
    billing: { mrrCents: 0, lifetimeCents: 0, last30dCents: 0, currency: 'usd', stripeCustomerId: null },
    invoices: [],
    apiKeys: [],
    recentRequests: [],
    usageTotals: { requests: 0, tokens: 0, cost: 0, lastRequestAt: null },
    auditLog: [],
    warnings: [],
  };

  // --- User core ---
  try {
    const r = await db.query(
      `SELECT id, email, role, is_disabled, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    const u = r.rows[0];
    out.user = {
      id: u.id,
      email: u.email,
      role: u.role,
      isDisabled: u.is_disabled,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    };
  } catch (err) {
    return res.status(500).json({ error: 'Database error', detail: err.message });
  }

  // --- Subscription (Stripe migration may not be applied) ---
  try {
    const r = await db.query(
      `SELECT plan, status, stripe_customer_id, stripe_subscription_id,
              current_period_start, current_period_end, cancel_at_period_end, trial_end
       FROM user_subscriptions
       WHERE user_id = $1`,
      [id]
    );
    if (r.rows.length > 0) {
      const s = r.rows[0];
      out.subscription = {
        plan: s.plan,
        status: s.status,
        stripeCustomerId: s.stripe_customer_id,
        stripeSubscriptionId: s.stripe_subscription_id,
        currentPeriodStart: s.current_period_start,
        currentPeriodEnd: s.current_period_end,
        cancelAtPeriodEnd: s.cancel_at_period_end,
        trialEnd: s.trial_end,
      };
      out.billing.stripeCustomerId = s.stripe_customer_id;
      const isActive = s.status === 'active' || s.status === 'trialing';
      out.billing.mrrCents = isActive ? (PLAN_MRR_CENTS[s.plan] ?? 0) : 0;
    }
  } catch (err) {
    if (!/does not exist/i.test(err.message)) {
      out.warnings.push(`subscription lookup: ${err.message}`);
    } else {
      out.warnings.push('user_subscriptions table not present');
    }
  }

  // --- Stripe invoice totals (lifetime + last 30d) ---
  try {
    const r = await db.query(
      `SELECT
         COALESCE(SUM(amount_paid) FILTER (WHERE status = 'paid'), 0) AS lifetime_cents,
         COALESCE(SUM(amount_paid) FILTER (WHERE status = 'paid' AND created_at > now() - interval '30 days'), 0) AS last30_cents,
         COALESCE(MIN(currency) FILTER (WHERE status = 'paid'), 'usd') AS currency
       FROM stripe_invoices
       WHERE user_id = $1`,
      [id]
    );
    out.billing.lifetimeCents = parseInt(r.rows[0].lifetime_cents, 10);
    out.billing.last30dCents = parseInt(r.rows[0].last30_cents, 10);
    out.billing.currency = r.rows[0].currency || 'usd';
  } catch (err) {
    if (!/does not exist/i.test(err.message)) {
      out.warnings.push(`invoice totals: ${err.message}`);
    }
  }

  // --- Recent invoices (last 12) ---
  try {
    const r = await db.query(
      `SELECT id, amount_paid, currency, status, period_start, period_end,
              hosted_invoice_url, invoice_pdf_url, created_at
       FROM stripe_invoices
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 12`,
      [id]
    );
    out.invoices = r.rows.map(i => ({
      id: i.id,
      amountPaid: parseInt(i.amount_paid, 10),
      currency: i.currency,
      status: i.status,
      periodStart: i.period_start,
      periodEnd: i.period_end,
      hostedInvoiceUrl: i.hosted_invoice_url,
      invoicePdfUrl: i.invoice_pdf_url,
      createdAt: i.created_at,
    }));
  } catch (err) {
    if (!/does not exist/i.test(err.message)) {
      out.warnings.push(`invoice list: ${err.message}`);
    }
  }

  // --- API keys (schema has no `prefix` column; key_hash is opaque-only) ---
  try {
    const r = await db.query(
      `SELECT id, name, rate_limit_rpm, allowed_models, revoked_at, last_used_at, created_at
       FROM api_keys
       WHERE user_id = $1
       ORDER BY revoked_at IS NULL DESC, created_at DESC`,
      [id]
    );
    out.apiKeys = r.rows.map(k => ({
      id: k.id,
      name: k.name,
      rateLimitRpm: k.rate_limit_rpm,
      allowedModels: k.allowed_models,
      revokedAt: k.revoked_at,
      lastUsedAt: k.last_used_at,
      createdAt: k.created_at,
      isActive: k.revoked_at == null,
    }));
  } catch (err) {
    out.warnings.push(`api keys: ${err.message}`);
  }

  // --- Recent requests + lifetime usage totals ---
  try {
    const [reqsResult, totalsResult] = await Promise.all([
      db.query(
        `SELECT id, model, prompt_tokens, completion_tokens, total_tokens,
                latency_ms, status_code, estimated_cost, created_at
         FROM usage_logs
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [id]
      ),
      db.query(
        `SELECT COUNT(*)::int AS requests,
                COALESCE(SUM(total_tokens), 0)::bigint AS tokens,
                COALESCE(SUM(estimated_cost), 0)::float8 AS cost,
                MAX(created_at) AS last_request_at
         FROM usage_logs
         WHERE user_id = $1`,
        [id]
      ),
    ]);
    out.recentRequests = reqsResult.rows.map(r => ({
      id: r.id,
      model: r.model,
      promptTokens: r.prompt_tokens,
      completionTokens: r.completion_tokens,
      totalTokens: r.total_tokens,
      latencyMs: r.latency_ms,
      statusCode: r.status_code,
      estimatedCost: parseFloat(r.estimated_cost ?? 0),
      createdAt: r.created_at,
    }));
    const t = totalsResult.rows[0];
    out.usageTotals = {
      requests: t.requests,
      tokens: parseInt(t.tokens, 10),
      cost: parseFloat(t.cost ?? 0),
      lastRequestAt: t.last_request_at,
    };
  } catch (err) {
    out.warnings.push(`usage logs: ${err.message}`);
  }

  // --- Audit log entries for this user (last 20) ---
  try {
    const r = await db.query(
      `SELECT id, actor_email, actor_type, action, resource, resource_id, ip_address, metadata, created_at
       FROM audit_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [id]
    );
    out.auditLog = r.rows.map(a => ({
      id: String(a.id),
      actorEmail: a.actor_email,
      actorType: a.actor_type,
      action: a.action,
      resource: a.resource,
      resourceId: a.resource_id,
      ipAddress: a.ip_address,
      metadata: a.metadata,
      createdAt: a.created_at,
    }));
  } catch (err) {
    if (!/does not exist/i.test(err.message)) {
      out.warnings.push(`audit log: ${err.message}`);
    }
  }

  return res.status(200).json(out);
});
