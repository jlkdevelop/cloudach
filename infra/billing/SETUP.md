# Stripe Billing Setup

This guide covers the one-time configuration required to enable Stripe billing
in Cloudach (subscription management, customer portal, and webhook processing).

---

## 1. Create a Stripe Account

1. Sign up at https://dashboard.stripe.com/register
2. Complete business verification (required for live payments).
3. Switch to **Test mode** during development (toggle in the top-left of the dashboard).

---

## 2. Create Products and Prices

In the Stripe dashboard → **Products** → **Add product**:

### Pro Plan
- **Name:** Cloudach Pro
- **Pricing model:** Standard pricing
- **Price:** $49.00 / month (recurring)
- **Currency:** USD
- Copy the **Price ID** (starts with `price_...`) → set as `STRIPE_PRICE_ID_PRO`

### Enterprise Plan (optional)
- Create similarly if you want automated Enterprise checkout.
- Copy the Price ID → set as `STRIPE_PRICE_ID_ENTERPRISE`
- If left unset, the "Upgrade to Enterprise" CTA redirects to `/contact`.

---

## 3. Configure the Customer Portal

In the Stripe dashboard → **Settings** → **Billing** → **Customer portal**:

1. Enable the portal.
2. Under **Functionality**, enable:
   - Update payment methods
   - Cancel subscriptions
   - View invoices
3. Set the **Return URL** to: `https://your-domain.com/dashboard/billing`
4. Save settings.

---

## 4. Set Up Webhooks

### Local development (Stripe CLI)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This prints a **webhook signing secret** (`whsec_...`). Copy it.

### Production (Stripe Dashboard)

In the Stripe dashboard → **Developers** → **Webhooks** → **Add endpoint**:

- **Endpoint URL:** `https://your-domain.com/api/webhooks/stripe`
- **Events to listen to:**
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- After saving, click **Reveal signing secret** and copy it.

---

## 5. Set Environment Variables

Add these to your `.env` (local) or Vercel environment variables (production):

```bash
# Stripe secret key (from Stripe Dashboard → Developers → API keys)
STRIPE_SECRET_KEY=sk_test_...

# Stripe publishable key (used client-side if needed)
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook signing secret (from Stripe webhook endpoint config or CLI output)
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from Stripe Dashboard → Products)
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...   # optional

# Your app's public URL (used for checkout success/cancel redirects)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

For Vercel deployments, add these in: **Project → Settings → Environment Variables**.

---

## 6. Apply the Database Migration

Run the Stripe billing migration against your database:

```bash
psql $DATABASE_URL -f infra/db/009_stripe_billing.sql
```

This creates three tables:
- `user_subscriptions` — stores Stripe customer/subscription IDs and plan state
- `stripe_events` — idempotency log for webhook events
- `stripe_invoices` — local invoice cache for fast dashboard rendering

---

## 7. Test the Integration

### Upgrade flow
1. Log in and navigate to `/dashboard/billing`
2. Click **Upgrade to Pro**
3. Use Stripe's test card: `4242 4242 4242 4242` / any future date / any CVC
4. Complete checkout → you should be redirected back with a success banner
5. Verify the plan badge updates to **Pro**

### Webhook events
With the Stripe CLI running, test events manually:

```bash
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

Check your app logs for confirmation messages.

---

## Plan Definitions

| Plan       | Price        | Deployments | Storage | Token rate       |
|------------|-------------|-------------|---------|------------------|
| Free       | $0/month     | 1           | 1 GB    | $0.20/M tokens   |
| Pro        | $49/month    | 10          | 50 GB   | $0.15/M tokens   |
| Enterprise | Custom       | Unlimited   | Custom  | Volume discounts |

Plans are defined in `lib/stripe.js` (`PLANS` constant) — keep in sync with
the Stripe dashboard and the pricing page (`pages/pricing.jsx`).

---

## Webhook Event Handling

The webhook handler at `pages/api/webhooks/stripe.js` processes:

| Event                              | Action                                           |
|------------------------------------|--------------------------------------------------|
| `checkout.session.completed`       | Activates subscription, upserts DB row           |
| `customer.subscription.updated`    | Syncs plan, status, period dates                 |
| `customer.subscription.deleted`    | Downgrades user to Free plan                     |
| `invoice.payment_succeeded`        | Caches invoice, clears `past_due` status         |
| `invoice.payment_failed`           | Sets subscription status to `past_due`           |

All events are deduplicated via the `stripe_events` table using the Stripe event ID.
