import Stripe from 'stripe';

let _stripe;

export function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. Add it to your environment variables. ' +
        'See docs/setup/stripe.md for setup instructions.'
      );
    }
    _stripe = new Stripe(key, { apiVersion: '2024-04-10' });
  }
  return _stripe;
}

/**
 * True when STRIPE_SECRET_KEY is set. Use this to gate Stripe-dependent
 * code paths so they degrade gracefully (return mock/empty data) instead
 * of 500-ing on environments that haven't been wired with Stripe creds.
 */
export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * True when STRIPE_WEBHOOK_SECRET is set. The /api/webhooks/stripe
 * endpoint should respond 200 with `{ignored: true}` when missing so
 * Stripe stops retrying instead of treating it as a transient failure.
 */
export function isStripeWebhookConfigured() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}

// Plan definitions — keep in sync with Stripe dashboard and pricing page.
export const PLANS = {
  free: {
    label: 'Free',
    price: 0,
    stripePriceId: null,
    maxDeployments: 1,
    maxStorageGb: 1,
    tokenRate: 0.20,
  },
  pro: {
    label: 'Pro',
    price: 49,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || null,
    maxDeployments: 10,
    maxStorageGb: 50,
    tokenRate: 0.15,
  },
  enterprise: {
    label: 'Enterprise',
    price: null,
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || null,
    maxDeployments: null,
    maxStorageGb: null,
    tokenRate: null,
  },
};
