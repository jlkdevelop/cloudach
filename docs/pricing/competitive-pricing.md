# Cloudach Competitive Pricing Sheet (MVP launch)

> **Status:** draft v1 — CEO recommendation for MVP launch tiers
> **Last updated:** 2026-04-17
> **Issue:** [CLO-1](#) — MVP launch goal #1 (pricing) + goal #3 (Stripe tiers)
> **Compute backend:** AWS (EC2 GPU + S3 + RDS) — replaces the GCP/GKE assumptions in `docs/cost-model.md`

This sheet defines the launch prices for Free / Pro / Business, the AWS unit economics that justify them, and how they compare to the competitive set. It is the input to (a) the Stripe tier rate config in `lib/stripe.js`, (b) the public `/pricing` page in `pages/pricing.jsx`, and (c) future Business-tier sales conversations.

---

## 1. TL;DR — Launch tiers

| Tier | Monthly | Included | Overage rate ($/M tokens, Llama 3.1 8B) | Target persona |
|------|---------|----------|------------------------------------------|----------------|
| **Free** | $0 | 1M tokens/mo, 1 deployment, shared GPU | $0.20 | Indie devs, side projects, evaluation |
| **Pro** | $49 | 25M tokens/mo, 10 deployments, dedicated GPU bursting, fine-tuning | $0.15 | Startups in production |
| **Business** | $499 | 250M tokens/mo, unlimited deployments, 99.9% SLA, support SLA, audit log retention | $0.10 | Mid-market / growth-stage businesses |

Reasoning summary (full math in §3–§4):

- **Free** is a loss leader, capped by the 1M/mo included allotment + per-key rate limits so the worst-case loss is ≤ $0.50/user/month at Cloudach's blended cost.
- **Pro** is the volume tier. $49/mo + $0.15/M tokens covers AWS GPU + fixed infra at ≥ 60 % gross margin once a customer crosses ~5M tokens/mo. Below that, the subscription floor makes us whole.
- **Business** is the SLA tier. $499/mo unlocks a 99.9 % SLA (paid via redundant region capacity + on-demand baseline) and a lower per-token rate that meaningfully beats Together/Fireworks at scale.

These tiers replace the existing `pages/pricing.jsx` Enterprise card. **`Enterprise → Business` rename is deferred** per operator (40-file i18n change, cosmetic, not MVP-blocking) — see §6.

---

## 2. Competitive landscape (Llama 3.1 8B real-time inference)

Public list prices, captured **2026-04-17**. Verify before launch announcement — competitor pricing changes monthly.

| Provider | Free / trial credit | $/M input | $/M output | Notes |
|----------|--------------------|-----------|------------|-------|
| **Together AI** | $5 trial | $0.18 | $0.18 | Serverless, OpenAI-compatible. Strong at 70B class. |
| **Fireworks AI** | $1 trial | $0.20 | $0.20 | Speed-focused, FP8 default. |
| **Replicate** | $0.10/run trial | $0.05 | $0.25 | Pay-per-second model; strong for image, weaker for chat economics. |
| **Anyscale Endpoints** | $10 credit | $0.15 | $0.15 | Discontinued endpoints product 2025-Q3 — no longer competing on price. **Skip.** |
| **AWS Bedrock** (Llama 3.1 8B) | None | $0.22 | $0.22 | Region-bound, no fine-tune deploy UX. |
| **OpenRouter** | None | $0.05 | $0.10 | Aggregator — cheapest router, but variable provider quality + no SLA. |
| **Groq** | $30 credit | $0.05 | $0.08 | Speed-focused, LPU. Limited model selection, no fine-tune. |
| **Cloudach Free** (proposed) | $0 + 1M/mo included | $0.20 (blended) | $0.20 (blended) | At parity with Fireworks, 11 % above Together. |
| **Cloudach Pro** (proposed) | $49/mo + 25M included | $0.15 (blended) | $0.15 (blended) | Beats Together (-17 %) and matches Anyscale's old rate. |
| **Cloudach Business** (proposed) | $499/mo + 250M included | $0.10 (blended) | $0.10 (blended) | Beats Together (-44 %), Bedrock (-55 %); above OpenRouter aggregator floor (intentional — we sell SLA + UX). |

Cloudach uses **blended** ($/M for input + output combined) because it simplifies Stripe metering and the public `/pricing` page already advertises blended rates ($0.20, $0.15). Internally we'll meter input + output separately for analytics, but bill on blended.

### What we are NOT competing on

- **Aggregator floor pricing** (OpenRouter, some Groq SKUs at $0.05). Race-to-the-bottom on commodity inference dilutes margin and we have no LPU-scale unit cost advantage. We compete on **fine-tune UX, dedicated GPU option, and SLA**.
- **Hyperscaler enterprise contracts** (Bedrock provisioned throughput, Azure OpenAI PTU). Out of MVP scope. Revisit post-launch with goal #5 follow-up issues.

---

## 3. AWS unit cost (replaces `docs/cost-model.md` GCP numbers)

GPU SKU equivalence: GCP `g2-standard-8` (1× L4) ↔ AWS `g6.xlarge` (1× L4). g6 family launched 2024-07; on-demand pricing in `us-east-1` is the closest analog.

### 3a. Compute (Llama 3.1 8B, vLLM bf16, 8K ctx)

| Resource | AWS spec | On-demand $/hr (us-east-1) | Spot $/hr (typical) |
|----------|----------|----------------------------|---------------------|
| GPU node (1× L4, 4 vCPU, 16 GB) | `g6.xlarge` | $0.805 | ~$0.32 (60 % off) |
| GPU node (1× L4, 8 vCPU, 32 GB) | `g6.2xlarge` | $0.978 | ~$0.39 |
| GPU node (1× A10G, 4 vCPU, 16 GB) | `g5.xlarge` | $1.006 | ~$0.40 |
| GPU node (4× L4, 48 vCPU, 192 GB) | `g6.12xlarge` | $4.602 | ~$1.84 |

**Baseline GPU SKU for MVP:** `g6.xlarge` at **$0.805/hr on-demand**, ~$0.32/hr spot. Slightly cheaper than the GCP `g2-standard-8` baseline ($0.897/hr).

### 3b. Fixed infra floor

| Resource | AWS spec | $/hr | $/month |
|----------|----------|------|---------|
| EKS control plane | 1 cluster | $0.10 | $73 |
| RDS Postgres | `db.t4g.small`, 20 GB gp3 | ~$0.034 | ~$25 |
| ElastiCache Redis | `cache.t4g.micro`, 0.5 GB | ~$0.017 | ~$12 |
| EKS system node pool | `t4g.medium` × 2 | ~$0.067 | ~$49 |
| ALB + Route 53 + NAT | — | ~$0.040 | ~$30 |
| S3 (model cache, ~200 GB) | Standard | — | ~$5 |
| CloudWatch (metrics + logs, baseline) | — | — | ~$15 |

**Fixed monthly floor (no GPU active):** **~$210/month** (vs ~$180 on GCP — ~17 % higher; the gap is mostly RDS + EKS control plane).

### 3c. Cost per 1M tokens

Throughput numbers carry over from the GCP measurements (same vLLM + L4 hardware, ~2 % runtime variance):

| Utilization | tokens/hr | On-demand $/M tokens | Spot $/M tokens |
|-------------|-----------|----------------------|------------------|
| 25 % (1 replica) | ~2.16 M | $0.49 | ~$0.19 |
| 50 % (1 replica) | ~4.32 M | $0.24 | ~$0.10 |
| 75 % (1 replica) | ~6.48 M | $0.16 | ~$0.06 |
| 100 % (1 replica) | ~8.64 M | $0.12 | ~$0.05 |

Numbers include `(0.805 + 0.29 fixed-amortized) / throughput`. The `0.29/hr` fixed amortization assumes the $210/mo floor spread across an average of 1 GPU running ~24 hr/day; revise downward as customer count grows.

> **Margin headline:** at 75 % blended utilization on `g6.xlarge` on-demand, our COGS is **$0.16/M tokens**. Selling Llama 3.1 8B at $0.20/M (Free overage) = ~20 % margin; at $0.15/M (Pro) = -7 % margin per token but recovered via the $49 subscription floor; at $0.10/M (Business) = -60 % margin per token but recovered via the $499 subscription floor. **The subscription is load-bearing — Pro and Business cannot be priced without it.**

---

## 4. Tier economics (does this tier make money?)

Modeled at the **median customer** of each tier. Outliers are discussed per-tier.

### 4a. Free — ceiling-bounded loss leader

- 1M tokens/mo included + hard cap → max compute cost **~$0.16** per active user/mo (75 % util) or **~$0.05** spot.
- Fixed-infra amortization is shared with paid tiers; allocate ~$0.10/user/mo for Free at 5 000 free users.
- **Worst-case loss per Free user/mo: ~$0.50.** Acceptable as acquisition cost given Pro conversion of ≥ 4 % covers it.
- Above 1M tokens, customer must enter card → $0.20/M overage. This makes the Free tier cost-bounded even for abuse cases (after the 1M cap, every additional token pays $0.20 vs ~$0.16 cost, so we're +$0.04/M margin or breakeven).

### 4b. Pro — subscription floor + token margin

| Customer profile | Tokens/mo | Subscription | Token charge | Total revenue | COGS (75 % util, on-demand) | Margin |
|------------------|-----------|--------------|--------------|----------------|----------------------------|--------|
| Light Pro | 5 M | $49 | $0 (under 25M) | $49 | ~$0.80 | **98 %** |
| Median Pro | 25 M | $49 | $0 | $49 | ~$4 | **92 %** |
| Heavy Pro | 100 M | $49 | $11.25 (75M overage × $0.15) | $60 | ~$16 | **73 %** |
| Very heavy Pro | 1 B | $49 | $146 (975M × $0.15) | $195 | ~$160 | **18 %** |

**At 1B tokens/mo a Pro customer is barely profitable — by design.** That's the upsell trigger to Business; the in-app hint should fire around 250M/mo.

### 4c. Business — SLA-priced volume tier

| Customer profile | Tokens/mo | Subscription | Token charge | Total revenue | COGS (75 % util, on-demand + redundancy) | Margin |
|------------------|-----------|--------------|--------------|----------------|--------------------------------------------|--------|
| Median Business | 250 M | $499 | $0 | $499 | ~$80 (incl. multi-AZ redundancy) | **84 %** |
| Heavy Business | 1 B | $499 | $75 (750M × $0.10) | $574 | ~$240 | **58 %** |
| Very heavy Business | 5 B | $499 | $475 (4.75B × $0.10) | $974 | ~$1 050 | **-8 %** |

**Above ~3B tokens/mo Business stops covering its own COGS** — that's the trigger for a custom enterprise contract (post-MVP, future issue).

### 4d. Sensitivity to spot vs on-demand mix

The numbers above assume on-demand baseline + opportunistic spot burst (the `spot-instance-strategy.md` policy). Pure on-demand inflates COGS by ~25 %; pure spot deflates by ~50 % but adds preemption risk that breaks Business's 99.9 % SLA. **Recommendation:** Free + Pro can run majority spot; Business must keep ≥ 1 on-demand replica per active region.

---

## 5. Recommended Stripe configuration (input to goal #3)

When the Stripe audit sub-issue is created, configure:

| Stripe price ID env var | Plan | Type | Amount | Notes |
|------|------|------|--------|-------|
| `STRIPE_PRICE_ID_PRO` | Pro | Recurring monthly | $49.00 USD | Includes 25M tokens/mo via metered cap (no proration) |
| `STRIPE_PRICE_ID_PRO_OVERAGE` | Pro overage | Metered | $0.15 / M tokens | Aggregated monthly, billed on cycle close |
| `STRIPE_PRICE_ID_BUSINESS` | Business | Recurring monthly | $499.00 USD | Includes 250M tokens/mo |
| `STRIPE_PRICE_ID_BUSINESS_OVERAGE` | Business overage | Metered | $0.10 / M tokens | Same metering pipeline as Pro overage |
| `STRIPE_PRICE_ID_FREE_OVERAGE` | Free overage (after 1M cap) | Metered | $0.20 / M tokens | Card-on-file required to enable past 1M |

`lib/stripe.js` currently reads `STRIPE_PRICE_ID_PRO` and `STRIPE_PRICE_ID_ENTERPRISE`. The Engineer sub-issue for Stripe audit (CLO-1 step 3) should:

1. Add the 4 new env vars + Stripe products.
2. Map `enterprise` → `business` in plan keys (deferred i18n cosmetic rename can stay, but DB plan key + Stripe product should use `business` going forward).
3. Add the `_overage` metered prices and update the metering submission code path.

---

## 6. Open questions for operator

These are explicit decision points before the public `/pricing` page changes ship:

1. **Free tier monthly token cap — is 1M the right number?** Lower = safer margin, higher = better acquisition. Together's free trial is $5 credit (~25M tokens). 1M caps the worst-case loss but may feel stingy vs trial-credit competitors. Alternatives: 5M/mo (loss cap rises to ~$0.80/user/mo), or `$5 credit one-time + 0.5M/mo` hybrid.
2. **Business tier — ship at $499 or $999?** $499 is competitive but the SLA cost (multi-AZ redundancy + on-call) might be tight at < 5 customers. $999 is safer for early customers and leaves room for $499 mid-market down-sell later.
3. **Token included caps inside subscription** — Stripe makes this more complex than overage-only metering. Worth the complexity? Alternative: pure metered (no included tokens, $49 sub buys feature access only). Simpler to implement; less competitive at launch headline.
4. **Region pricing** — `us-east-1` only at MVP, or also `eu-west-1`? Multi-region doubles fixed-infra floor but is table stakes for EU customers (GDPR data residency).
5. **Enterprise → Business rename timing** — keep deferred until post-launch, or bundle into the Stripe audit PR? Deferring keeps the Stripe PR small but creates a "Business in copy, Enterprise in code" mismatch.

These are the only items I'd want sign-off on before cutting the Stripe sub-issue.

---

## 7. Sources

- AWS EC2 g6 / g5 on-demand pricing, `us-east-1`, captured 2026-04-17 from public AWS pricing pages.
- Competitor pricing pages, captured 2026-04-17 (Together, Fireworks, Replicate, Bedrock, OpenRouter, Groq).
- Internal: `docs/cost-model.md` (GCP throughput baseline), `docs/batch-inference-pricing.md` (batch math), `docs/spot-instance-strategy.md`, `pages/pricing.jsx` (current public tiers), `lib/stripe.js` (current plan keys).
