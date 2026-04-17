# Stripe Setup — Cloudach

> Last updated: 2026-04-17
> Related code: `lib/stripe.js`, `pages/api/webhooks/stripe.js`, `pages/api/dashboard/billing/*`, migration `infra/db/009_stripe_billing.sql`.

This doc gets a fresh Cloudach environment from "Stripe shows NOT_CONFIGURED in /admin" to "billing fully wired and self-serve". Operator-only — agents do not request live keys per CLO-1 ground rules.

---

## 0. Prerequisites

- A Stripe account with at least one Product configured (or willing to create them in §2).
- Vercel project access to set environment variables on the production environment.
- Repo write access (for the local `.env` if you also want to test locally; not needed for production-only setup).
- Migration `009_stripe_billing.sql` applied to the live Neon database (already done as of 2026-04-17 per CLO-1 directive).

---

## 1. Required environment variables

All four env vars must be set on the Vercel project for the billing flow to be fully functional. The system degrades gracefully if any are missing — the admin Stripe panel will show `NOT_CONFIGURED` instead of throwing 500s.

| Env var | What it is | Where it's used |
|---------|-----------|-----------------|
| `STRIPE_SECRET_KEY` | Server-side API key. Starts with `sk_test_` (test mode) or `sk_live_` (live mode). | `lib/stripe.js → getStripe()` instantiates the SDK. Powers checkout / portal / webhook signature verification. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the webhook endpoint. Starts with `whsec_`. **Different per environment.** | `pages/api/webhooks/stripe.js` uses it to verify event signatures. Set this AFTER you create the webhook endpoint in §3. |
| `STRIPE_PRICE_ID_PRO` | Stripe Price object ID for the Pro subscription ($49/mo). Starts with `price_`. | `lib/stripe.js → PLANS.pro.stripePriceId`. Used in `/api/dashboard/billing/checkout` to create the checkout session. |
| `STRIPE_PRICE_ID_ENTERPRISE` | Stripe Price object ID for the Business tier ($499/mo). **Note:** the env var name says `_ENTERPRISE` because the DB plan key still uses `'enterprise'` per the deferred rename (Phase 2 §6). The public-facing label is "Business". | `lib/stripe.js → PLANS.enterprise.stripePriceId`. |

**Important:** the env var name `STRIPE_PRICE_ID_BUSINESS` does NOT work — only `STRIPE_PRICE_ID_ENTERPRISE` is read by the code today. When the deferred i18n/code rename ships, both names will be supported during the transition.

### Optional vars

| Env var | Default | Purpose |
|---------|---------|---------|
| `NEXT_PUBLIC_APP_URL` | derived from request `origin` header | Used as the absolute base URL when building `success_url` / `cancel_url` for Checkout. Set to `https://cloudach.vercel.app` on production for stability. |

---

## 2. Create the Stripe products and prices (Stripe Dashboard)

Do this once per environment (test mode first, then repeat for live).

### 2a. Sign in and pick the right mode

1. Go to https://dashboard.stripe.com.
2. **Top-right toggle: switch to Test mode** for the first run-through. Live mode comes later once the flow is verified.

### 2b. Create the Pro product

1. Left nav → **Product catalog** → **+ Add product**.
2. Fill out:
   - **Name:** `Cloudach Pro`
   - **Description:** `Production-ready inference. 25M tokens included per month, then $0.15 per million.`
   - **Image:** optional; can add the Cloudach wordmark later.
3. Under **Pricing**:
   - **Pricing model:** Standard pricing
   - **Price:** `$49.00 USD`
   - **Billing period:** `Monthly`
   - **Type:** `Recurring`
4. Click **Save product**.
5. After save, the page shows the **Price ID** (starts with `price_`). **Copy it** — this is your `STRIPE_PRICE_ID_PRO`.

### 2c. Create the Business product

1. Left nav → **Product catalog** → **+ Add product**.
2. Fill out:
   - **Name:** `Cloudach Business`
   - **Description:** `For production workloads with SLA. 250M tokens included per month, then $0.10 per million. 99.9% uptime SLA.`
3. Under **Pricing**:
   - **Pricing model:** Standard pricing
   - **Price:** `$499.00 USD`
   - **Billing period:** `Monthly`
   - **Type:** `Recurring`
4. Click **Save product**.
5. **Copy the Price ID** — this is your `STRIPE_PRICE_ID_ENTERPRISE` (despite the public name being "Business").

### 2d. (Optional) Configure the Customer Portal

1. Left nav → **Settings** → **Billing** → **Customer portal**.
2. Enable **"Allow customers to update their subscription"** so they can switch between Pro / Business in the portal.
3. Toggle **"Cancel subscription"** to allow self-service cancellation.
4. Set the **return URL** to `https://cloudach.vercel.app/dashboard/billing` (or your env's URL).
5. Save.

---

## 3. Create the webhook endpoint

The webhook is what keeps the local `user_subscriptions` and `stripe_invoices` tables in sync with what's happening in Stripe.

### 3a. Add the endpoint

1. Stripe Dashboard → **Developers** → **Webhooks** → **+ Add endpoint**.
2. **Endpoint URL:** `https://cloudach.vercel.app/api/webhooks/stripe` (use `http://localhost:3000/api/webhooks/stripe` plus `stripe listen --forward-to ...` for local testing).
3. **Events to send:** click **+ Select events** and check exactly these:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint**.

### 3b. Copy the signing secret

1. After the endpoint is created, the page shows **Signing secret** (under "Signing secret" section, may say "Reveal").
2. **Copy** the value (starts with `whsec_`). This is your `STRIPE_WEBHOOK_SECRET`.

### 3c. Test the webhook

1. On the same endpoint page → **Send test webhook** → pick `checkout.session.completed` → **Send**.
2. Verify in Vercel function logs that the request returned 200. If it returns 200 with `{ignored: true, reason: 'stripe_not_configured'}`, you haven't set `STRIPE_SECRET_KEY` yet — finish §4 first.

---

## 4. Set the env vars on Vercel

1. Vercel dashboard → your **cloudach** project → **Settings** → **Environment Variables**.
2. For each variable from §1, click **Add New** and set:
   - **Name:** the env var name (e.g. `STRIPE_SECRET_KEY`)
   - **Value:** the value you copied
   - **Environments:** check **Production**, **Preview**, and **Development**
3. After all four are set, **redeploy the project** (Vercel won't pick up new env vars on the previous deployment).

The fastest redeploy: Settings → **Deployments** → on the latest production deploy, click `…` → **Redeploy**.

---

## 5. Verify

After redeploy:

1. Visit `https://cloudach.vercel.app/admin` (sign in as admin if needed).
2. Find the **Stripe** card — top-right of the row below the KPI strip.
3. Confirm:
   - Status pill shows **`KEY_PRESENT`** (green) instead of `NOT_CONFIGURED` (red).
   - **Webhook** row shows "no events yet" (or the last event time once one fires).
   - **Paid invoices · 24h / MTD** show 0 (until a real subscription is purchased).
4. End-to-end test:
   - From a test user account, visit `/dashboard/billing` and click "Upgrade to Pro".
   - Use Stripe test card `4242 4242 4242 4242`, any future date, any CVC, any zip.
   - After redirect, the **Stripe** admin card should show **Webhook** updated and **Paid invoices · 24h** = 1.

---

## 6. Promoting from test to live mode

When you're ready to take real money:

1. **Repeat §2 + §3** in Stripe Dashboard with the **Live mode** toggle switched on. You'll get new `price_…` IDs and a new `whsec_…` value — they are **different from the test ones**.
2. On Vercel, **replace** the test values with the live values for `STRIPE_SECRET_KEY` (now starts with `sk_live_`), `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`, `STRIPE_PRICE_ID_ENTERPRISE`.
3. **Redeploy.**
4. Verify the Stripe admin card again — same `KEY_PRESENT` flow, but now under your live Stripe account.

---

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Admin Stripe card shows `NOT_CONFIGURED` after setting env vars | Vercel deployment hasn't been redeployed since env vars were added | Redeploy: Vercel Settings → Deployments → `…` → Redeploy on the latest production deploy |
| Webhook events arrive but admin shows "no events yet" | Webhook secret doesn't match — Stripe is sending, but signature verification fails | Re-copy `STRIPE_WEBHOOK_SECRET` from Stripe → Webhooks → your endpoint → "Signing secret". Vercel function logs will say `Stripe webhook signature verification failed`. |
| Checkout returns `503 stripe_not_configured` | `STRIPE_SECRET_KEY` is unset on the active Vercel environment | Verify the env var is set on **Production** (not just Preview/Development), then redeploy |
| Checkout returns `400 Invalid plan` | `plan` body field is not exactly `"pro"` or `"enterprise"` | Check the calling code in `pages/dashboard/billing/*` and pass the right key |
| User upgraded but `user_subscriptions.plan` didn't change | `checkout.session.completed` webhook didn't carry `cloudach_user_id` metadata | Check `pages/api/dashboard/billing/checkout.js` line 71 — `subscription_data.metadata.cloudach_user_id` must include the user's UUID |
| Admin shows revenue but Top spenders are empty | Different cause: `topSpenders` LEFT JOINs both `user_subscriptions` and `stripe_invoices` per migration 009. Confirm both tables have rows. | Run `SELECT count(*) FROM stripe_invoices;` against the Neon DB |
| Stripe webhook retries forever even after deploy | Webhook is returning a non-2xx response. Check function logs. The endpoint returns 200 with `{ignored: true}` when keys are missing — if it's still 4xx/5xx, signature verification or body parsing is failing | Inspect Vercel function logs for the webhook route; use Stripe CLI (`stripe events resend evt_…`) to retrigger after fix |

---

## 8. What this doc deliberately doesn't do

- **Doesn't include screenshots.** Kept text-only per directive ("screenshots-as-text"). All UI references are precise enough to navigate the Stripe Dashboard from text alone.
- **Doesn't request keys.** Operator runs steps 2–4 manually; agents do not have access to Stripe live or test secret keys.
- **Doesn't cover Tax** (`automatic_tax`), **Coupons**, or **Trials in Customer Portal**. Those are post-MVP polish; the current code path uses a 14-day trial via `subscription_data.trial_period_days` only on Pro checkouts.
- **Doesn't cover EU SCA (3DS)** test flows. The default Stripe config handles SCA correctly; no extra wiring needed.

---

## 9. Where each env var is read

For audit / migration purposes:

| Env var | File | Line |
|---------|------|------|
| `STRIPE_SECRET_KEY` | `lib/stripe.js` | 7 (and `isStripeConfigured()`) |
| `STRIPE_WEBHOOK_SECRET` | `pages/api/webhooks/stripe.js` | 35 (and `isStripeWebhookConfigured()`) |
| `STRIPE_PRICE_ID_PRO` | `lib/stripe.js` | 32 (`PLANS.pro.stripePriceId`) |
| `STRIPE_PRICE_ID_ENTERPRISE` | `lib/stripe.js` | 40 (`PLANS.enterprise.stripePriceId`) |
| `NEXT_PUBLIC_APP_URL` (optional) | `pages/api/dashboard/billing/checkout.js` | 67 |
| `NEXT_PUBLIC_APP_URL` (optional) | `pages/api/dashboard/billing/portal.js` | 36 |
