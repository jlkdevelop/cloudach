import { requireAdmin } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

/**
 * GET   /api/admin/users — list all users with usage + subscription + revenue stats
 * PATCH /api/admin/users — toggle is_disabled
 *
 * The subscription / invoice columns degrade to nulls if the underlying
 * tables (user_subscriptions, stripe_invoices from migration 009) are
 * absent, so the endpoint never 500s on a partially-migrated environment.
 */

// Plan key -> monthly recurring revenue cents.
// DB still uses 'enterprise' as the third-tier key per the deferred rename
// (Phase 2 §6). The public-facing label is 'Business' but the data column
// stays 'enterprise' until that rename ships.
const PLAN_MRR_CENTS = {
  free: 0,
  pro: 4900,
  enterprise: 49900,
};

export default requireAdmin(async function handler(req, res) {
  const db = getDb();

  if (req.method === 'GET') {
    let rows;
    let stripeColumnsAvailable = true;

    try {
      const result = await db.query(
        `SELECT u.id, u.email, u.role, u.is_disabled, u.created_at,
                us.plan, us.status AS sub_status, us.stripe_customer_id,
                us.current_period_end, us.cancel_at_period_end,
                COALESCE(SUM(ul.total_tokens), 0) AS total_tokens,
                COUNT(DISTINCT ul.id)             AS total_requests,
                COUNT(DISTINCT ak.id) FILTER (WHERE ak.revoked_at IS NULL) AS active_api_keys,
                MAX(ul.created_at)                AS last_request_at,
                COALESCE(SUM(si.amount_paid)
                  FILTER (WHERE si.created_at > now() - interval '30 days'
                            AND si.status = 'paid'), 0) AS stripe_30d_cents,
                COALESCE(SUM(si.amount_paid)
                  FILTER (WHERE si.status = 'paid'), 0) AS stripe_total_cents
         FROM users u
         LEFT JOIN user_subscriptions us ON us.user_id = u.id
         LEFT JOIN usage_logs ul         ON ul.user_id = u.id
         LEFT JOIN api_keys   ak         ON ak.user_id = u.id
         LEFT JOIN stripe_invoices si    ON si.user_id = u.id
         GROUP BY u.id, us.plan, us.status, us.stripe_customer_id,
                  us.current_period_end, us.cancel_at_period_end
         ORDER BY u.created_at DESC`
      );
      rows = result.rows;
    } catch (err) {
      // Stripe tables missing — fall back to the basic query that worked pre-migration.
      if (/does not exist/i.test(err.message || '')) {
        stripeColumnsAvailable = false;
        const fallback = await db.query(
          `SELECT u.id, u.email, u.role, u.is_disabled, u.created_at,
                  COALESCE(SUM(ul.total_tokens), 0) AS total_tokens,
                  COUNT(DISTINCT ul.id)             AS total_requests,
                  COUNT(DISTINCT ak.id) FILTER (WHERE ak.revoked_at IS NULL) AS active_api_keys,
                  MAX(ul.created_at)                AS last_request_at
           FROM users u
           LEFT JOIN usage_logs ul ON ul.user_id = u.id
           LEFT JOIN api_keys   ak ON ak.user_id = u.id
           GROUP BY u.id
           ORDER BY u.created_at DESC`
        );
        rows = fallback.rows;
      } else {
        throw err;
      }
    }

    const users = rows.map(r => {
      const plan = r.plan || 'free';
      const subStatus = r.sub_status || null;
      const subActive = subStatus === 'active' || subStatus === 'trialing';
      const mrrCents = subActive ? (PLAN_MRR_CENTS[plan] ?? 0) : 0;

      return {
        id:                  r.id,
        email:               r.email,
        role:                r.role,
        isDisabled:          r.is_disabled,
        createdAt:           r.created_at,
        plan,
        subscriptionStatus:  subStatus,
        stripeCustomerId:    r.stripe_customer_id || null,
        currentPeriodEnd:    r.current_period_end || null,
        cancelAtPeriodEnd:   r.cancel_at_period_end || false,
        mrrCents,
        stripe30dCents:      parseInt(r.stripe_30d_cents ?? 0, 10),
        stripeTotalCents:    parseInt(r.stripe_total_cents ?? 0, 10),
        totalTokens:         parseInt(r.total_tokens, 10),
        totalRequests:       parseInt(r.total_requests, 10),
        activeApiKeys:       parseInt(r.active_api_keys, 10),
        lastRequestAt:       r.last_request_at,
      };
    });

    const summary = {
      totalUsers:        users.length,
      activeUsers:       users.filter(u => !u.isDisabled).length,
      disabledUsers:     users.filter(u => u.isDisabled).length,
      paidCustomers:     users.filter(u => u.mrrCents > 0).length,
      totalMrrCents:     users.reduce((s, u) => s + u.mrrCents, 0),
      total30dRevenueCents: users.reduce((s, u) => s + u.stripe30dCents, 0),
      byPlan: users.reduce((acc, u) => {
        acc[u.plan] = (acc[u.plan] || 0) + 1;
        return acc;
      }, {}),
      stripeColumnsAvailable,
    };

    return res.status(200).json({ users, summary });
  }

  if (req.method === 'PATCH') {
    const { id, isDisabled } = req.body || {};
    if (!id || typeof isDisabled !== 'boolean') {
      return res.status(400).json({ error: 'id (string) and isDisabled (boolean) are required.' });
    }

    const result = await db.query(
      'UPDATE users SET is_disabled = $1, updated_at = now() WHERE id = $2 RETURNING id, email, is_disabled',
      [isDisabled, id]
    );

    if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
    return res.status(200).json({ user: result.rows[0] });
  }

  return res.status(405).end();
});
