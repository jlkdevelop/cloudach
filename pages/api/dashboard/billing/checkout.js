import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { getStripe, PLANS } from '../../../../lib/stripe';

/**
 * POST /api/dashboard/billing/checkout
 *
 * Creates a Stripe Checkout session for plan upgrade.
 * Body: { plan: 'pro' | 'enterprise' }
 *
 * Response: { url: string }  — redirect user to this URL
 */
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { plan } = req.body || {};
  if (!plan || !PLANS[plan] || plan === 'free') {
    return res.status(400).json({ error: 'Invalid plan. Must be "pro" or "enterprise".' });
  }

  const planMeta = PLANS[plan];
  if (!planMeta.stripePriceId) {
    // Enterprise or unconfigured — redirect to contact page
    if (plan === 'enterprise') {
      return res.status(200).json({ url: '/contact?plan=enterprise' });
    }
    return res.status(503).json({ error: 'Billing is not configured. Contact support.' });
  }

  const db = getDb();
  const stripe = getStripe();
  const userId = req.session.sub;

  // Fetch or create Stripe customer
  const userResult = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
  const userEmail = userResult.rows[0]?.email;

  const subResult = await db.query(
    'SELECT stripe_customer_id, stripe_subscription_id, plan FROM user_subscriptions WHERE user_id = $1',
    [userId]
  );
  let customerId = subResult.rows[0]?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { cloudach_user_id: userId },
    });
    customerId = customer.id;

    // Upsert subscription row with customer ID
    await db.query(
      `INSERT INTO user_subscriptions (user_id, stripe_customer_id, plan, status)
       VALUES ($1, $2, 'free', 'active')
       ON CONFLICT (user_id)
       DO UPDATE SET stripe_customer_id = $2, updated_at = now()`,
      [userId, customerId]
    );
  }

  const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: planMeta.stripePriceId, quantity: 1 }],
    success_url: `${origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&upgrade=success`,
    cancel_url: `${origin}/dashboard/billing?upgrade=cancelled`,
    subscription_data: {
      trial_period_days: plan === 'pro' ? 14 : undefined,
      metadata: { cloudach_user_id: userId, plan },
    },
    allow_promotion_codes: true,
  });

  return res.status(200).json({ url: session.url });
});
