import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { getStripe } from '../../../../lib/stripe';

/**
 * POST /api/dashboard/billing/portal
 *
 * Creates a Stripe Customer Portal session so the user can manage their
 * payment method, view invoices, and cancel/update their subscription.
 *
 * Response: { url: string }
 */
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const db = getDb();
  const stripe = getStripe();
  const userId = req.session.sub;

  const subResult = await db.query(
    'SELECT stripe_customer_id FROM user_subscriptions WHERE user_id = $1',
    [userId]
  );
  const customerId = subResult.rows[0]?.stripe_customer_id;

  if (!customerId) {
    return res.status(400).json({ error: 'No billing account found. Please upgrade to a paid plan first.' });
  }

  const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard/billing`,
  });

  return res.status(200).json({ url: session.url });
});
