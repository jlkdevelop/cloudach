# Cloudach Onboarding Drip Campaign

A 5-email sequence designed to take a new signup from zero to retained user. Research basis: Resend, Vercel, and Linear onboarding flows — all use sparse, value-dense emails with clear single CTAs and no filler.

---

## Campaign Overview

| # | Template | Trigger | Condition | Goal |
|---|----------|---------|-----------|------|
| 1 | [Welcome](#email-1-welcome) | Immediately after signup | Always send | First API call |
| 2 | [First API Call Reminder](#email-2-first-api-call-reminder) | 24h after signup | Only if no API call made | Activation |
| 3 | [Explore Models](#email-3-explore-models) | 3 days after signup | Always send | Model exploration / second deployment |
| 4 | [Team Features](#email-4-team-features) | 7 days after signup | Always send | Virality / teammate invite |
| 5 | [Upgrade](#email-5-upgrade) | 14 days after signup | Always send | Starter → Pro conversion |

---

## Email 1: Welcome

**File:** `marketing/emails/01-welcome.html`

**Subject:** `Your Cloudach account is ready`

**Send time:** Immediately on `user.created` event (transactional, not batched)

**Trigger condition:** Always — every new signup

**Goal:** Drive first API call within 24 hours

**Content:**
- Headline: *Your model is one command away.*
- 3-step quickstart (pick model → deploy → swap base URL)
- Inline code snippet showing the one-line migration from OpenAI
- Single CTA: **Open your dashboard →**

**Suppression:** None. This is always sent.

**Success metric:** User makes first API call within 24h of receiving this email.

**Implementation notes:**
```
trigger: user.created
delay: 0
from: "Cloudach <hello@cloudach.com>"
reply-to: "support@cloudach.com"
```

---

## Email 2: First API Call Reminder

**File:** `marketing/emails/02-first-api-call-reminder.html`

**Subject:** `You signed up for Cloudach yesterday`

**Send time:** 24 hours after signup

**Trigger condition:** ONLY if `user.first_api_call` event has NOT fired since signup

**Goal:** Re-engage users who signed up but haven't activated

**Content:**
- Headline: *You signed up yesterday. Your model is still waiting.*
- Inline curl command — one copy-paste and they're done
- "Common questions" blocker card (credit card? which model? will it break my code?)
- Social proof stats (60s average activation, 60% savings, 40+ models)
- Single CTA: **Deploy your model now →**

**Suppression:** Skip if `user.first_api_call` has been received. Do not send to activated users.

**Implementation notes:**
```
trigger: user.created
delay: 24h
condition: event "user.first_api_call" NOT received since trigger
from: "Cloudach <hello@cloudach.com>"
reply-to: "support@cloudach.com"
```

**A/B test opportunities:**
- Subject line: `You signed up yesterday` vs. `Your model is still waiting`
- CTA copy: `Deploy your model now` vs. `Make your first API call`

---

## Email 3: Explore Models

**File:** `marketing/emails/03-explore-models.html`

**Subject:** `Which model fits your workload?`

**Send time:** 3 days after signup

**Trigger condition:** Always — sent to all users regardless of activation status

**Goal:** Expand usage — encourage users to try a second model or match a model to their actual workload

**Content:**
- Tag: Day 3
- Model grid: Llama 3 70B, Mistral 7B, DeepSeek Coder, Qwen 2.5 72B
- Use case guide: chatbots, code gen, document RAG, structured output
- Single CTA: **Explore models →** (links to `/models` page)

**Suppression:** None. Educational content is always relevant.

**Implementation notes:**
```
trigger: user.created
delay: 72h (3 days)
from: "Cloudach <hello@cloudach.com>"
reply-to: "support@cloudach.com"
```

---

## Email 4: Team Features

**File:** `marketing/emails/04-team-features.html`

**Subject:** `Cloudach for your whole team`

**Send time:** 7 days after signup

**Trigger condition:** Always — with optional personalization for Pro users (see notes)

**Goal:** Drive teammate invites (virality loop) and Pro trial starts

**Content:**
- Tag: Day 7
- 5 team features: per-team API keys, usage dashboard, autoscaling, request logs, private VPC
- Customer quote (Priya N., Head of Engineering)
- Two CTAs: **Invite teammates →** (primary) + **Team docs** (secondary)

**Suppression:** None. Even solo users benefit from knowing team features exist when they're ready to scale.

**Personalization opportunity:** If user is already on Pro, swap primary CTA to "Invite teammates" with a note about their current team seat count.

**Implementation notes:**
```
trigger: user.created
delay: 168h (7 days)
from: "Cloudach <hello@cloudach.com>"
reply-to: "support@cloudach.com"
```

---

## Email 5: Upgrade

**File:** `marketing/emails/05-upgrade.html`

**Subject:** `Two weeks in — here's what Pro unlocks`

**Send time:** 14 days after signup

**Trigger condition:** Always for Starter users. Suppress if user has already upgraded to Pro or Enterprise.

**Goal:** Convert Starter users to Pro

**Content:**
- Tag: Day 14
- Headline: *You've been on Cloudach for 2 weeks. Here's what unlocks next.*
- Starter vs. Pro comparison table
- Pricing card: $49/month + $0.15/M tokens, 14-day free trial
- Customer quote (Sarah K., Staff ML Engineer)
- FAQ: break-even math, cancellation, enterprise options
- Single CTA: **Upgrade to Pro →**

**Suppression:** Skip if `subscription.upgraded` event received before send time.

**Break-even copy:** The email explicitly explains that at ~330M tokens/month the $0.05/M savings covers the $49 base — this makes the upgrade feel data-driven, not sales-y.

**Implementation notes:**
```
trigger: user.created
delay: 336h (14 days)
condition: user.plan == "starter"
from: "Cloudach <hello@cloudach.com>"
reply-to: "sales@cloudach.com"
```

---

## Implementation Guide

### Recommended Email Service

The sequence is designed for [Resend](https://resend.com) or any transactional email provider that supports:
- Event-triggered sends
- Conditional logic (send if X has not occurred)
- Unsubscribe link injection (`{{unsubscribe_url}}` token in templates)

### Required Events

Your application must emit these events to the email service:

| Event | When to fire |
|-------|-------------|
| `user.created` | After successful email verification / first login |
| `user.first_api_call` | After the first authenticated request hits `/v1/chat/completions` or any model endpoint |
| `subscription.upgraded` | After successful Pro or Enterprise subscription activation |

### Template Variables

All templates use the following replacement tokens:

| Token | Value |
|-------|-------|
| `{{unsubscribe_url}}` | One-click unsubscribe URL from your email provider |
| `{{user_name}}` | Optional — first name for personalized subject lines |
| `{{user_email}}` | User's email address |

### Unsubscribe Handling

- All emails include an `{{unsubscribe_url}}` token in the footer
- Email 1 (Welcome) is transactional — CAN-SPAM and GDPR allow transactional emails even to unsubscribed users, but confirm your legal interpretation
- Emails 2–5 are marketing — honor unsubscribe requests immediately

### Subject Line Strategy

Subject lines are written to avoid spam triggers and drive opens through specificity:

| # | Subject |
|---|---------|
| 1 | `Your Cloudach account is ready` |
| 2 | `You signed up for Cloudach yesterday` |
| 3 | `Which model fits your workload?` |
| 4 | `Cloudach for your whole team` |
| 5 | `Two weeks in — here's what Pro unlocks` |

No emoji, no ALL CAPS, no "Free", no "!!!". Clean developer-focused copy throughout.

### Sending Infrastructure

```
From name:  Cloudach
From email: hello@cloudach.com   (emails 1-4)
            hello@cloudach.com   (email 5, can use sales@cloudach.com for reply-to)
Reply-to:   support@cloudach.com (emails 1-4)
            sales@cloudach.com   (email 5)
```

---

## Success Metrics

| Email | Primary metric | Target |
|-------|---------------|--------|
| 1 — Welcome | First API call within 24h | 40%+ of recipients |
| 2 — API Reminder | Activation rate on non-activated users | 20%+ click-to-activate |
| 3 — Explore Models | Second model deployment within 7 days | 25%+ of recipients |
| 4 — Team Features | Teammate invite sent | 10%+ of recipients |
| 5 — Upgrade | Starter → Pro conversion | 5-8% of recipients |

Overall sequence open rate target: 35%+ (developer audience, transactional sender reputation).

---

## Future Additions

These emails are not in scope for the initial sequence but are recommended next:

- **Day 30 — Power user tip**: Show advanced features (fine-tuning, custom base models, API key scoping) to users who have made 1000+ API calls
- **Day 60 — Check-in**: Re-engage dormant users (no API call in 14 days) with a "what's new" roundup
- **Enterprise nurture**: Dedicated sequence for users who click "Contact sales" on the upgrade email
