import { getStripe } from '../../../lib/stripe';
import { getDb } from '../../../lib/db';

// Stripe sends the raw body for signature verification — disable body parsing.
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const db = getDb();

  // Idempotency — skip already-processed events
  const existing = await db.query('SELECT id FROM stripe_events WHERE id = $1', [event.id]);
  if (existing.rows.length > 0) {
    return res.status(200).json({ received: true, skipped: true });
  }

  try {
    await handleEvent(db, event);
    await db.query(
      'INSERT INTO stripe_events (id, type) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [event.id, event.type]
    );
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err.message);
    return res.status(500).json({ error: 'Event handling failed' });
  }

  return res.status(200).json({ received: true });
}

async function handleEvent(db, event) {
  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.mode !== 'subscription') break;

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const customerId = session.customer;
      const userId = subscription.metadata?.cloudach_user_id
        || session.metadata?.cloudach_user_id;

      if (!userId) {
        console.warn('checkout.session.completed: no cloudach_user_id in metadata');
        break;
      }

      const plan = subscription.metadata?.plan || 'pro';

      await db.query(
        `INSERT INTO user_subscriptions
           (user_id, stripe_customer_id, stripe_subscription_id, plan, status,
            current_period_start, current_period_end, trial_end, cancel_at_period_end)
         VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7), to_timestamp($8), $9)
         ON CONFLICT (user_id) DO UPDATE SET
           stripe_customer_id     = EXCLUDED.stripe_customer_id,
           stripe_subscription_id = EXCLUDED.stripe_subscription_id,
           plan                   = EXCLUDED.plan,
           status                 = EXCLUDED.status,
           current_period_start   = EXCLUDED.current_period_start,
           current_period_end     = EXCLUDED.current_period_end,
           trial_end              = EXCLUDED.trial_end,
           cancel_at_period_end   = EXCLUDED.cancel_at_period_end,
           updated_at             = now()`,
        [
          userId,
          customerId,
          subscription.id,
          plan,
          subscription.status,
          subscription.current_period_start,
          subscription.current_period_end,
          subscription.trial_end,
          subscription.cancel_at_period_end,
        ]
      );
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const plan = sub.metadata?.plan || 'pro';

      await db.query(
        `UPDATE user_subscriptions SET
           plan                 = $2,
           status               = $3,
           current_period_start = to_timestamp($4),
           current_period_end   = to_timestamp($5),
           trial_end            = to_timestamp($6),
           cancel_at_period_end = $7,
           updated_at           = now()
         WHERE stripe_subscription_id = $1`,
        [
          sub.id,
          plan,
          sub.status,
          sub.current_period_start,
          sub.current_period_end,
          sub.trial_end,
          sub.cancel_at_period_end,
        ]
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;

      await db.query(
        `UPDATE user_subscriptions SET
           plan                   = 'free',
           status                 = 'canceled',
           stripe_subscription_id = NULL,
           cancel_at_period_end   = FALSE,
           updated_at             = now()
         WHERE stripe_subscription_id = $1`,
        [sub.id]
      );
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      if (!invoice.customer) break;

      // Resolve user_id from customer ID
      const subRow = await db.query(
        'SELECT user_id FROM user_subscriptions WHERE stripe_customer_id = $1',
        [invoice.customer]
      );
      const userId = subRow.rows[0]?.user_id;
      if (!userId) break;

      // Cache invoice locally
      await db.query(
        `INSERT INTO stripe_invoices
           (id, user_id, stripe_customer_id, amount_paid, currency, status,
            period_start, period_end, hosted_invoice_url, invoice_pdf_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7), to_timestamp($8), $9, $10, to_timestamp($11))
         ON CONFLICT (id) DO UPDATE SET
           status             = EXCLUDED.status,
           hosted_invoice_url = EXCLUDED.hosted_invoice_url,
           invoice_pdf_url    = EXCLUDED.invoice_pdf_url`,
        [
          invoice.id,
          userId,
          invoice.customer,
          invoice.amount_paid,
          invoice.currency,
          invoice.status,
          invoice.period_start,
          invoice.period_end,
          invoice.hosted_invoice_url,
          invoice.invoice_pdf,
          invoice.created,
        ]
      );

      // Sync subscription status to 'active' in case it was past_due
      if (invoice.subscription) {
        await db.query(
          `UPDATE user_subscriptions SET status = 'active', updated_at = now()
           WHERE stripe_subscription_id = $1 AND status = 'past_due'`,
          [invoice.subscription]
        );
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await db.query(
          `UPDATE user_subscriptions SET status = 'past_due', updated_at = now()
           WHERE stripe_subscription_id = $1`,
          [invoice.subscription]
        );
      }
      break;
    }

    default:
      // Unhandled event types are silently ignored
      break;
  }
}
