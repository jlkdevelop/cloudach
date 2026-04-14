import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { PLANS } from '../../../../lib/stripe';

/**
 * GET /api/dashboard/billing/subscription
 *
 * Returns the current user's subscription plan and status.
 *
 * Response:
 *   {
 *     plan: 'free' | 'pro' | 'enterprise',
 *     planLabel: string,
 *     status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid',
 *     currentPeriodStart: string | null,
 *     currentPeriodEnd: string | null,
 *     cancelAtPeriodEnd: boolean,
 *     trialEnd: string | null,
 *     stripeCustomerId: string | null,
 *     invoices: [{ id, amountPaid, currency, status, periodStart, periodEnd, hostedInvoiceUrl, invoicePdfUrl, createdAt }],
 *   }
 */
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;

  const [subResult, invoicesResult] = await Promise.all([
    db.query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1',
      [userId]
    ),
    db.query(
      `SELECT id, amount_paid, currency, status, period_start, period_end,
              hosted_invoice_url, invoice_pdf_url, created_at
       FROM stripe_invoices
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 12`,
      [userId]
    ),
  ]);

  const sub = subResult.rows[0];
  const plan = sub?.plan ?? 'free';
  const planMeta = PLANS[plan] ?? PLANS.free;

  return res.status(200).json({
    plan,
    planLabel: planMeta.label,
    status: sub?.status ?? 'active',
    currentPeriodStart: sub?.current_period_start ?? null,
    currentPeriodEnd: sub?.current_period_end ?? null,
    cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
    trialEnd: sub?.trial_end ?? null,
    stripeCustomerId: sub?.stripe_customer_id ?? null,
    invoices: invoicesResult.rows.map(r => ({
      id: r.id,
      amountPaid: r.amount_paid,
      currency: r.currency,
      status: r.status,
      periodStart: r.period_start,
      periodEnd: r.period_end,
      hostedInvoiceUrl: r.hosted_invoice_url,
      invoicePdfUrl: r.invoice_pdf_url,
      createdAt: r.created_at,
    })),
  });
});
