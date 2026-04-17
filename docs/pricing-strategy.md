# Pricing Strategy — MVP Launch

> **Status:** Phase 3 deliverable for CLO-1 MVP launch. **Not live** — operator approval of this PR gates public rollout.
> **Last updated:** 2026-04-17
> **Inputs:** Phase 1 (`docs/research/competitive-landscape.md`, PR #4), Phase 2 (`docs/research/market-fit.md`, PR #5).
> **Purpose:** Set launch prices for Free / Pro / Business, demonstrate unit economics on AWS, specify per-model rates, and document the operator-approval gate for going live.

---

## 0. What this doc commits to

This doc turns Phase 2's pricing posture ("mid-band per-token, subscription-shaped uniquely") into concrete numbers. The commitments below are the basis for the `pages/pricing.jsx` changes in this same PR.

**Tier shape (final):** Free / Pro / Business. 3 tiers, no fourth.

**Tier prices (final at launch):**
- Free: $0/mo, 1M tokens/mo included, $0.20/M overage (Llama 3.1 8B class).
- Pro: $49/mo, 25M tokens/mo included, $0.15/M overage.
- Business: $499/mo, 250M tokens/mo included, $0.10/M overage. **Self-serve, not sales-led.**

**Billing shape (final):** Monthly subscription + included tokens + per-token overage above the included allotment. Reasoning models use input/output split rates; all other models use blended rates.

**Rename in public copy:** "Enterprise" → "Business" on `pages/pricing.jsx` and related surfaces. **DB `enterprise` plan key and `lib/stripe.js` PLANS constant are unchanged** (operator deferred that i18n/code rename in PR #3 thread). This PR touches public copy only.

**What this PR does NOT do** (deliberate scope cuts, per operator ground rules):

- No changes to `lib/stripe.js` PLANS constant (waits for the Stripe-audit sub-issue to wire the `business` plan key alongside `enterprise`).
- No Stripe product creation, no env-var changes, no price-ID configuration (ground rule #5).
- No DB migration (no `plan` column to migrate — plan is derived from Stripe subscription state; confirmed against `infra/db/schema.sql`).
- No change to the public pricing page's live rollout status. Operator approval + merge of this PR is what takes it live.

---

## 1. Tier structure — the math, the copy, the guardrails

### 1.1 Free tier

| Field | Value | Rationale |
|-------|-------|-----------|
| Monthly cost | $0 | — |
| Included tokens | **1M / mo** | Conservative default. See §7 risk 4. |
| Overage rate (after 1M) | $0.20 / M (Llama 3.1 8B class) | Matches Fireworks, slightly above Together's $0.18 Turbo — deliberately not the cheapest on this tier since Free is a loss-leader, not a volume product. |
| Credit card required? | **No** | Phase 2 §4.6 committed to permanent no-CC free tier. Reinforced against trial-credit-only competitors (Together $5, Fireworks $1). |
| Rate limit | 30 RPM / 100k TPM per key, max 3 keys per account | Bounds abuse. See §3.2. |
| Deployment cap | 1 active deployment | Same as current. |
| Model access | All non-reasoning models at "Free" rate (§2) | — |

**Economics at the cap.** 1M tokens/mo of Llama 3.1 8B at 75 % utilization on AWS `g6.xlarge` on-demand:
- COGS: 1M tokens ÷ 8.64M tokens/hr × $1.095/hr (GPU + amortized fixed) = **~$0.13 per maxed-out Free user/mo**.
- Worst-case fixed-infra share (~$0.10/user/mo at 5 000 active Free users).
- **Worst-case loss per Free user/mo: ~$0.23.**

**Past-cap economics** (user hits 1M, must add card to continue): the $0.20/M overage on our ~$0.16/M COGS gives a **25 % margin per overage token**. Not profitable in absolute terms at low volume (fixed-infra share still in play), but directionally self-funding.

**Abuse bounds.** Phone-number verify on sign-up (behavioral-gating, cheap) + IP rate limiting at 10 signups per IP per day. Worst-plausible abuse: 100 farmed accounts × 1M tokens = 100M tokens × $0.16 COGS = **~$16/mo** — operator acceptable.

### 1.2 Pro tier

| Field | Value | Rationale |
|-------|-------|-----------|
| Monthly cost | $49 | Matches existing `pages/pricing.jsx` sticker. Phase 1 found this unique in the segment (per-token competitors have no subscription floor). |
| Included tokens | **25M / mo** | Sized so a "real product" on P1 (startup product engineer) can freely iterate in development but hits overage in production — the upgrade-to-Business pressure point. |
| Overage rate (after 25M) | $0.15 / M | Phase 2 §6 committed to $0.15–0.18 band; picking the low end to make Pro genuinely attractive. |
| Deployment cap | 10 active deployments | Unchanged from current. |
| Fine-tune deploy | Included | Paid Pro entitles fine-tune UX (see §5). |
| Request log viewer | 30-day retention | `BL-04` deliverable; marketed as a pricing feature, not admin-only. |
| Per-key spend caps | Included | `BL-01` deliverable; marketed as bill-shock protection. |
| CTA | "Start 14-day free trial — no card required" | Matches current copy; operator can change to "Start Pro" after Stripe is wired and trial decision is made. |

**Economics at the median Pro customer (25M tokens/mo, no overage):**
- Revenue: $49 subscription.
- COGS: 25M ÷ 8.64M tokens/hr × $1.095/hr = **~$3.17**.
- **Margin: ~94 %.**

**Economics at a heavy Pro customer (100M tokens/mo = 75M overage):**
- Revenue: $49 + (75M × $0.15/M) = $49 + $11.25 = **$60.25**.
- COGS: 100M ÷ 8.64M × $1.095 = **~$12.67**.
- **Margin: ~79 %.**

**Economics at a very-heavy Pro customer (1B tokens/mo = 975M overage):**
- Revenue: $49 + (975M × $0.15/M) = $49 + $146.25 = **$195.25**.
- COGS: 1B ÷ 8.64M × $1.095 = **~$126.74**.
- **Margin: ~35 %.**

**Upsell trigger.** Pro margin drops below 50 % somewhere around 400M tokens/mo. In-app nudge to upgrade to Business should fire at **200M tokens/mo** (80 % of Business's included allotment, so the customer knows they'd save money on the higher tier).

### 1.3 Business tier

| Field | Value | Rationale |
|-------|-------|-----------|
| Monthly cost | $499 | Phase 2 §6 committed; defensible given the 99.9 % SLA and longer log retention. |
| Included tokens | **250M / mo** | 10× Pro included, matching the 10× price gap. Target customer is a customer-facing production workload, not a dev environment. |
| Overage rate (after 250M) | $0.10 / M | Phase 2 §6 committed. 33 % discount vs. Pro overage ($0.15/M) makes the upsell math clean for a customer evaluating which tier to pick. |
| Deployment cap | Unlimited | Production customers need multi-model multi-region deployments. |
| Fine-tune deploy | Included + A/B traffic split | Persona P3's (ML-fluent) signal-bearing feature. See §5 and §7 risk 1. |
| Request log viewer | 90-day retention (vs Pro 30-day) | Concrete Business-vs-Pro upgrade driver. |
| Per-key spend caps | Included + team-level budget rollup | Same as Pro plus team aggregation. |
| SLA | **99.9 % monthly uptime, with service credits** | Table stakes for a production tier; see §6 for how this constrains our compute sourcing. |
| Support | Dedicated solutions engineer (Slack Connect + email, 4-hour business-day response) | Softer than an "enterprise" support SLA; appropriate for the $499 price point. |
| CTA | **`/contact` for MVP launch** (not self-serve) | See §0 — no Stripe wiring in this PR. Operator can flip to `/signup?plan=business` post-approval. |

**Economics at the median Business customer (250M tokens/mo, no overage):**
- Revenue: $499 subscription.
- COGS: 250M ÷ 8.64M × $1.095 + multi-AZ redundancy uplift (~25 %) = **~$39.60**.
- **Margin: ~92 %.**

**Economics at a heavy Business customer (1B tokens/mo = 750M overage):**
- Revenue: $499 + (750M × $0.10/M) = $499 + $75 = **$574**.
- COGS: 1B ÷ 8.64M × $1.095 × 1.25 = **~$158**.
- **Margin: ~72 %.**

**Economics at a very-heavy Business customer (5B tokens/mo = 4.75B overage):**
- Revenue: $499 + (4.75B × $0.10/M) = $499 + $475 = **$974**.
- COGS: 5B ÷ 8.64M × $1.095 × 1.25 = **~$793**.
- **Margin: ~19 %.**

**Custom contract trigger.** Business margin compresses toward zero somewhere around **6–7B tokens/mo**. That's the pressure point for a custom enterprise contract — a post-MVP follow-up issue; Phase 3 does not define enterprise pricing.

---

## 2. Per-model rate table

All rates below are the **blended ($/M token)** rate unless noted as a reasoning model. Blended means we charge the same rate regardless of whether the token is input or output. Reasoning models (§4) are the exception.

### 2.1 Non-reasoning models (blended rates)

| Model | Class | Context | Free ($/M) | Pro ($/M) | Business ($/M) | Notes |
|-------|-------|---------|-----------|-----------|----------------|-------|
| Phi-3 Mini | 3.8B | 4K | $0.12 | $0.09 | $0.06 | Cheapest in catalog; small-model entry point |
| Mistral 7B Instruct | 7B | 32K | $0.18 | $0.13 | $0.09 | Slight premium to Groq's $0.05 LPU price; matches Together's $0.18 GPU price |
| Llama 3.1 8B Instruct | 8B | 128K | **$0.20** | **$0.15** | **$0.10** | Our headline SKU. Matches Fireworks; $0.02 premium to Together's Turbo. |
| DeepSeek R1 7B Distill | 7B | 64K | $0.24 | $0.18 | $0.13 | Non-reasoning distill variant (full R1 is separate, see §4) |
| CodeLlama 13B Instruct | 13B | 16K | $0.25 | $0.18 | $0.13 | |
| Mixtral 8×7B Instruct | 46B MoE | 32K | $0.55 | $0.40 | $0.30 | MoE — memory footprint of 46B, compute of ~14B active |
| Mixtral 8×22B Instruct | 141B MoE | 64K | $1.20 | $0.90 | $0.65 | |
| Llama 3.1 70B Instruct | 70B | 128K | **$0.85** | **$0.65** | **$0.45** | Raised from the current `pages/pricing.jsx` $0.60/$0.45 (below-market); Phase 1 segment median is $0.88. |
| Qwen 2.5 72B Instruct | 72B | 128K | $0.85 | $0.65 | $0.45 | Matched to Llama 70B class |
| Llama 3.1 405B Instruct | 405B | 128K | $3.50 | $2.80 | $2.10 | Matches Together's $3.50 Turbo. **Not shipping at MVP** — see §2.3. Rate reserved for post-MVP launch. |

**Change summary vs. current `pages/pricing.jsx`:**
- Llama 3.1 8B / Mistral 7B / Phi-3 Mini / CodeLlama 13B: unchanged at Free & Pro; **add Business column**.
- **Llama 3.1 70B: raised** from $0.60/$0.45 to $0.85/$0.65/$0.45. Justification: Phase 1 §3.2 showed segment median $0.88; our prior rates were loss-making at any real utilization.
- **Qwen 2.5 72B: raised** similarly for the same reason.
- **Mixtral 8×7B: raised slightly** ($0.48/$0.36 → $0.55/$0.40) to match the Mistral segment-median.
- **Mixtral 8×22B: new row** added.
- **DeepSeek R1 Distill: new row** added.

### 2.2 Reasoning models (input/output split)

Reasoning models (o1-class, DeepSeek R1 full, Gemini 2.0 Flash Thinking-class) generate significantly more output tokens per useful answer than non-reasoning models. Phase 2 §6 #4 committed to input/output split pricing for this class only.

| Model | Input ($/M) | Output ($/M) | Notes |
|-------|-------------|--------------|-------|
| DeepSeek R1 (full) — Free | $3.00 | $7.00 | Matches Together's reference rate |
| DeepSeek R1 (full) — Pro | $2.25 | $5.25 | 25 % discount on both axes |
| DeepSeek R1 (full) — Business | $1.50 | $3.50 | 50 % discount on both axes |

**Why split pricing for reasoning models specifically.**
1. Output volumes for reasoning models are 3–10× the input. If we blend, customers with short prompts and long chain-of-thought bodies get over-charged on an average workload.
2. All public competitors that host reasoning models (Together, Fireworks, Bedrock for o1, Foundry for o1) use input/output split. Blending would be an outlier move.
3. Our cost structure genuinely differs by direction (prefill vs decode throughput on vLLM), so split billing better aligns with our COGS.

**Reasoning-model inclusion in subscription allotment.** Reasoning tokens count toward the subscription included allotment at a **2:1 multiplier** (i.e., 1 reasoning output token counts as 2 against the 25M/250M cap). This prevents a customer from burning through their entire monthly cap on a single expensive reasoning session.

### 2.3 Model catalog sequencing

Not every row in §2.1 ships at launch. The `pages/pricing.jsx` modelPricing table will list:
- **Launch (MVP):** Phi-3 Mini, Mistral 7B, Llama 3.1 8B, DeepSeek R1 7B Distill, CodeLlama 13B, Mixtral 8×7B, Llama 3.1 70B, Qwen 2.5 72B.
- **Post-MVP (Phase 4 or later):** Mixtral 8×22B (capacity planning), Llama 3.1 405B (multi-GPU tensor-parallel setup), DeepSeek R1 full (reasoning-specific pipeline).

Rates in §2.1/§2.2 are published now so the pricing page reflects the full range; models that aren't yet live are marked "Coming soon" in the pricing table (and their CTA is greyed until available).

---

## 3. Unit economics on AWS (show the math)

This section closes the loop between our tier prices and our cost of goods on AWS. It expands Phase 1's closing PR #3 §3 numbers with the added specificity of tier-level margin targets.

### 3.1 Compute baseline

Primary SKU for Llama 3.1 8B / Mistral 7B / Phi-3 / DeepSeek Distill: **AWS `g6.xlarge`** (1× L4, us-east-1).
- On-demand: **$0.805 / hour**.
- Spot (typical): ~$0.32 / hour.
- Throughput at 75 % util: ~6.48M tokens/hr (measured on L4 with vLLM v0.4.2, matches our GCP benchmarks in `docs/cost-model.md`).

Larger-model SKU for 70B / Qwen 72B: **AWS `g6.2xlarge`** (1× L4, 8 vCPU, 32 GB RAM) with FP8 quantization + paged attention. On-demand $0.978/hr; throughput ~1.5M tokens/hr at 75 % util.

405B and large MoE: **`g6.12xlarge`** (4× L4) on-demand $4.602/hr; kept out of MVP per §2.3.

### 3.2 Fixed monthly floor

From prior PR #3 §3, in us-east-1:
- EKS control plane: $73/mo
- RDS Postgres (db.t4g.small, 20 GB gp3): ~$25/mo
- ElastiCache Redis (cache.t4g.micro): ~$12/mo
- EKS system node pool (2× t4g.medium): ~$49/mo
- ALB + Route 53 + NAT: ~$30/mo
- S3 model cache: ~$5/mo
- CloudWatch: ~$15/mo

**Total: ~$210/mo.** This amortizes across all active customers regardless of tier. At 100 active paying customers, that's ~$2/customer/mo; at 1 000, ~$0.20/customer/mo. Inside the noise for Pro/Business margins; only meaningful for Free-tier modeling.

### 3.3 Per-model COGS at headline tier rates

Using 75 % utilization (the realistic average once KEDA autoscaling stabilizes) and the primary SKU above:

| Model | Primary SKU | COGS $/M | Free rate $/M | Pro rate $/M | Business rate $/M |
|-------|-------------|----------|---------------|---------------|------------------|
| Llama 3.1 8B | g6.xlarge | **$0.16** | $0.20 (+25 % margin) | $0.15 (-7 %, subscription-backed) | $0.10 (-60 %, subscription-backed) |
| Mistral 7B | g6.xlarge | $0.16 | $0.18 (+12 %) | $0.13 (-23 %) | $0.09 (-78 %) |
| Llama 3.1 70B | g6.2xlarge | **$0.68** | $0.85 (+20 %) | $0.65 (-5 %) | $0.45 (-51 %) |

**The key insight.** Per-token rates alone do not show the business model. At Pro and Business, per-token rates are often below COGS — the subscription floor makes those tiers profitable. The $49 and $499 monthly fees cover ~300 Pro customers or ~30 Business customers for a single `g6.xlarge` replica at full utilization.

### 3.4 Sensitivity analysis

What breaks these numbers:

**Spot GPU unavailability.** If spot capacity disappears during a demand spike and we must run pure on-demand:
- COGS rises ~25–30 % (spot was ~60 % cheaper).
- Pro @ 1B tokens/mo margin drops from ~35 % to ~18 %.
- Business @ 5B tokens/mo margin flips negative (-5 % to -10 %).
- **Mitigation:** reserved instance commitments (1-year CUD-equivalent at ~37 % off on-demand). Operator question for post-MVP.

**L4 price increases.** AWS raises `g6` on-demand pricing:
- Each 10 % increase drops Pro/Business margin roughly 2 percentage points.
- We have no hedge. Would need to pass through via per-token rate increases with 30-day notice.

**Utilization regresses below 50 %.** Our autoscaler misbehaves and we run at 40 % average:
- COGS rises ~50 %.
- Free-tier loss per user rises from $0.23 to ~$0.35.
- Pro/Business margins still positive thanks to subscription floor.
- **Mitigation:** already in place — KEDA scale-to-zero + `docs/autoscaling-policies.md`.

**Customer concentration risk on 405B / heavy workloads.** Post-MVP concern. Once 405B ships, a single customer running heavy 405B traffic at the Business overage rate ($2.10/M) could run at negative margin on a tensor-parallel 4-GPU deploy. Mitigation: soft usage threshold that triggers a sales conversation ("let's move you to a custom contract").

---

## 4. Reasoning models — separate surface

Covered in §2.2. Three points worth repeating here for prominence:

1. **Input/output split pricing only for reasoning models.** Everything else stays blended.
2. **2:1 multiplier on reasoning output tokens against included allotment** — so a Pro customer with 25M included tokens gets 25M non-reasoning tokens OR ~12.5M reasoning output tokens (or any combination). Prevents runaway single-session burn.
3. **At MVP, only DeepSeek R1 Distill (non-reasoning variant) ships.** Full DeepSeek R1 with reasoning-specific rates is Phase 4+ — the code-path and UI already need to handle split rates at that point, but the surface in the pricing page is marked "Coming soon" for now.

---

## 5. Per-key controls — pricing-grade features, not admin-only

Phase 2 §4.1 and §6 item 5 committed to making per-key spend caps and tags a pricing-page feature, not just an admin setting. This section says what that means concretely.

**Features surfaced in the pricing page:**
- **Per-key monthly spend cap.** Customer sets $N/mo cap per API key; requests above cap return HTTP 402 with error. Copy: "No bill shock — set a spending limit on any API key."
- **Per-key rate limits.** Customer sets RPM / TPM per key. Copy: "Cap your staging key; let production breathe."
- **Per-key cost tagging.** `x-cloudach-tag` header groups usage by feature or tenant. Copy: "Know exactly which feature costs what."

**Tier gating.**
- **Free:** 3 keys, no tags, basic RPM cap only (30 RPM / 100k TPM hard-coded per key, no customer override).
- **Pro:** 20 keys, full tag + spend-cap + user-set RPM/TPM.
- **Business:** unlimited keys, team-level budget rollup on top of per-key controls.

**Page copy implication.** The "What makes Cloudach different?" implicit callout in `pages/pricing.jsx` should include "Per-key spend caps protect you from bill shock" as a marketable line. Design-detail decisions for the actual visual treatment belong in Phase 4.

---

## 6. The 99.9 % SLA commitment on Business — what it constrains

Offering a 99.9 % SLA on the Business tier is a non-trivial operating commitment. It implies:

1. **Multi-AZ redundancy** on Business-tier inference paths (us-east-1a + us-east-1b minimum). Adds ~25 % to COGS vs single-AZ; already modeled in §3.3.
2. **On-demand baseline, not spot-only**, for Business-eligible replicas. Spot preemption incidents break the SLA.
3. **Health webhook endpoints** that customers can wire to their alerting (`BL-07` in `docs/product/backlog.md`).
4. **Service credit automation.** If we fail the SLA in a given month, Business customers auto-receive credits on their next invoice (no ticket required). Credit formula: `(1 - measured_uptime / 0.999) × subscription_fee`, capped at 50 % of the subscription. Example: 99.5 % uptime in a month = (1 - 99.5/99.9) × $499 = ~$200 credit, capped at $250.

**MVP gap to close.** We do not yet have:
- Uptime measurement infrastructure (Prometheus SLO burn-rate recording rules).
- Automated credit-issuance code path in the Stripe webhook handler.
- Health webhook endpoint documented in the public API reference.

**Recommendation.** Launch Business with a **published 99.9 % SLA goal** but without the automated credit mechanism for the first 60 days. Credits issued manually on request until the automation ships. This should be transparent on the pricing page: *"99.9 % monthly uptime target, with service credits on request during our launch period; automated credits live by [date]."*

If operator disagrees with this softer-launch approach, the alternative is delaying Business tier entirely until the SLA plumbing is complete — a 3–6 week slip.

---

## 7. Conservative defaults applied (operator's Phase 2 §7 open questions)

Phase 2 §7 surfaced 5 open questions. I committed in the Phase 2 status comment to proceeding with conservative defaults if no operator input arrived. This section documents each default and names the next-best alternative the operator can push back on.

### 7.1 Risk 1 — P3 (ML-fluent) sequencing

**Default applied:** Business tier **includes fine-tune deploy in the pricing description** (per §1.3 features table), but the actual fine-tune-deploy UX is a Phase 4 (or later) deliverable. If the UX slips past MVP, the Business tier launches with the feature listed but not yet shippable — we'd either delay Business or honor it via white-glove operator-assisted onboarding.

**Alternative:** drop fine-tune deploy from the Business features list for the launch-time page copy; add it back in a subsequent PR once the UX ships.

**What I recommend if operator doesn't weigh in:** list the feature on the page (optimistic), plan Phase 4 to prioritize fine-tune deploy accordingly. Risk is that a Business customer signs up expecting the feature on day 1.

### 7.2 Risk 2 — Free-tier abuse

**Default applied:** 1M/mo cap, phone verify, IP rate limiting at 10 signups/IP/day. Worst-case loss modeled in §1.1 as ~$16/mo at 100 farmed accounts — acceptable.

**Alternative:** require email domain verification (no `@gmail.com` for Free), raising the abuse bar but also the legitimate-user friction bar. Not recommended — kills P2 conversion.

### 7.3 Risk 3 — Subscription-with-included-tokens ambiguity

**Default applied:** the pricing page includes a **calculator** (already in `pages/pricing.jsx`) that shows effective $/M *including* subscription spread across included allotment at the customer's expected volume. This addresses the "Pro looks expensive at low volume" perception.

**Alternative:** pure metered (no included tokens; $49 buys feature access only). Simpler billing; but loses the subscription-shape wedge from Phase 2 §4.4.

### 7.4 Risk 4 — P1 vs P2 Free-tier sizing

**Default applied:** **1M tokens/mo on Free.** This sizing:
- Lets P2 (indie) ship a small side project with meaningful usage (~10 000 Q&A interactions on Llama 3.1 8B with 100-token average).
- Forces P1 (startup) to graduate quickly once they put the feature in front of real users — a production feature at any non-trivial traffic will exceed 1M/mo within days.
- Keeps worst-case abuse loss ≤ $0.50/user/mo.

**Alternative:** 3–5M/mo. More generous, better for P2 retention, risks P1 freeloading. Operator gut check requested in Phase 2 status comment; no reply received.

### 7.5 Risk 5 — Fine-tune deploy readiness

**Default applied:** see §7.1. Same answer.

---

## 8. What this PR changes on `pages/pricing.jsx`

Concrete edits in this same PR (see the actual diff for exact code):

1. **`plans` array** (lines 13–74 today):
   - Free: update `unit` to reflect 1M included + $0.20 overage; features list adds "1M tokens included per month".
   - Pro: update `unit` to reflect 25M included + $0.15 overage; features list adds "25M tokens included per month".
   - Enterprise → **Business**: rename in `name` and `planLabel` fields; replace `price: 'Custom'` with `price: '$499'`; replace features with the §1.3 list; keep `cta: 'Contact sales'` + `href: '/contact'` for the MVP launch (not self-serve yet).

2. **`modelPricing` array** (lines 76–85): add Business column values (§2.1). Raise 70B and Qwen 72B rates per §2.1. Add Mixtral 8×22B and DeepSeek R1 7B Distill rows.

3. **Per-model pricing section hint** (line 318): update "Pro plan customers get 25 % lower token rates across the board" to reflect Business column (new copy: "Pro and Business plans get progressively lower token rates with higher volume commitments.").

4. **Per-model footer** (line 363): "Enterprise rates available on request" → "Custom rates for 6B+ tokens/month — contact sales."

5. **PricingCalculator component** (lines 122–211): add Business option to plan selector; add Business rate/subscription logic.

6. **FAQ entries** (lines 87–120): update payment-methods FAQ and SLA FAQ to use "Business" instead of "Enterprise".

7. **Meta description** (line 259): update to mention Business tier.

8. **CTA band** (line 392–408): unchanged; "Talk to sales" remains appropriate for the MVP launch period.

**Not changed in this PR:** `lib/stripe.js` PLANS constant, DB schema, `pages/signup.jsx`, `pages/admin/*`, `pages/api/*`. These stay aligned with the current `free` / `pro` / `enterprise` plan keys pending the deferred rename sub-issue.

---

## 9. Operator approval gate

This PR is the approval gate for taking the Business tier public and for the adjusted 70B / Qwen 72B / Mixtral rates.

**Approving the PR implies operator sign-off on:**
- All tier-level numbers in §1 (including the conservative defaults in §7).
- All per-model rates in §2.1 and §2.2 (including the rate raises from current `pages/pricing.jsx`).
- The soft-launch SLA approach in §6 (manual credits for 60 days, automated after).
- The scope cuts in §0 (no `lib/stripe.js` changes, no DB migration, no Stripe product creation in this PR).

**Approving the PR does NOT imply:**
- Authorization to create Stripe products (separate sub-issue for the Engineer role).
- Authorization to push `lib/stripe.js` PLANS changes (stays `enterprise` key pending rename).
- Commitment to the Phase 4 timeline for fine-tune deploy, SLA automation, or health webhooks — those are independent engineering decisions.

**Rejection path.** If operator disagrees with any of the defaults in §7 (especially risks 1 and 4), comment on this PR with the revised answer and I will:
1. Amend the tier structure in §1 accordingly.
2. Update the `pages/pricing.jsx` edits to match.
3. Push a follow-up commit to this same PR (not a new one).

---

## 10. Sources

- `docs/research/competitive-landscape.md` (Phase 1, PR #4) — competitor rate data.
- `docs/research/market-fit.md` (Phase 2, PR #5) — personas, wedge, pricing posture commitments.
- `docs/cost-model.md` — GCP throughput baseline carried over to AWS.
- `docs/spot-instance-strategy.md` — spot-vs-on-demand policy.
- `docs/product/backlog.md` — `BL-01` (cost tagging), `BL-02` (per-key rate limits), `BL-04` (request log viewer), `BL-07` (health webhooks).
- `pages/pricing.jsx` — current public pricing surface.
- `lib/stripe.js` — current plan-key constant (unchanged in this PR).
- `infra/db/schema.sql` — verified no `plan`/`tier` column; no DB migration needed.
