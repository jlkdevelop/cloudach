-- Migration 009: Stripe billing integration
-- Adds subscription management tables for Stripe integration.
-- Apply via: psql $DATABASE_URL -f infra/db/009_stripe_billing.sql

-- ─── Subscription Plans ──────────────────────────────────────────────────────
-- Tracks which Stripe subscription a user is on.

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id      TEXT        UNIQUE,
    stripe_subscription_id  TEXT        UNIQUE,
    plan                    TEXT        NOT NULL DEFAULT 'free'
                                        CHECK (plan IN ('free', 'pro', 'enterprise')),
    status                  TEXT        NOT NULL DEFAULT 'active'
                                        CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
    current_period_start    TIMESTAMPTZ,
    current_period_end      TIMESTAMPTZ,
    cancel_at_period_end    BOOLEAN     NOT NULL DEFAULT FALSE,
    trial_end               TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx       ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_customer_id_idx   ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_subscription_idx  ON user_subscriptions(stripe_subscription_id);

-- ─── Stripe Events (idempotency log) ─────────────────────────────────────────
-- Prevents duplicate processing of the same Stripe webhook event.

CREATE TABLE IF NOT EXISTS stripe_events (
    id           TEXT        PRIMARY KEY,   -- Stripe event ID (evt_xxx)
    type         TEXT        NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Stripe Invoices Cache ────────────────────────────────────────────────────
-- Local cache of Stripe invoice data for fast dashboard rendering.

CREATE TABLE IF NOT EXISTS stripe_invoices (
    id                  TEXT        PRIMARY KEY,   -- Stripe invoice ID (in_xxx)
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id  TEXT        NOT NULL,
    amount_paid         INT         NOT NULL DEFAULT 0,   -- cents
    currency            TEXT        NOT NULL DEFAULT 'usd',
    status              TEXT        NOT NULL DEFAULT 'paid',
    period_start        TIMESTAMPTZ,
    period_end          TIMESTAMPTZ,
    hosted_invoice_url  TEXT,
    invoice_pdf_url     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stripe_invoices_user_id_idx ON stripe_invoices(user_id, created_at DESC);
