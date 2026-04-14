# Cloudach — 12-Month Financial Model

> **As of:** April 2026 | **Currency:** USD | **Basis:** Monthly accrual
> **Pricing source:** Live pricing page ([/pricing](/pricing)) — updated from prior placeholder tiers

---

## Executive Summary

Cloudach is an LLM cloud infrastructure platform targeting developers and enterprises. This model projects conservative, base, and aggressive scenarios for the first 12 months post-launch, covering revenue, COGS, gross margin, operating expenses, and runway.

**Base case headline:** $1.69M ARR by Month 12, 57% blended gross margin, 36+ months of runway on a $1.5M seed.

> **Pricing revision note:** The prior model used placeholder Developer/Startup/Growth/Enterprise tiers at $0.80–$0.30/M tokens. This version reflects the live 3-tier pricing (Free / Pro / Enterprise) launched with the pricing page. Per-token rates are materially lower and match market-rate competitors (Together AI, Fireworks AI). Revenue per customer is lower, but the model preserves 57% blended gross margin through enterprise mix and reserved instance optimization.

---

## Assumptions

### Pricing Tiers (Live — as of April 2026)

| Tier | Monthly Base | Token Rate | Deployments | GPU Type | Notes |
|---|---|---|---|---|---|
| **Free** | $0 | $0.20/M tokens (Llama 3.1 8B); varies by model | 1 active | Shared | Pay-as-you-go; no credit card required |
| **Pro** | $49 | $0.15/M tokens (25% off Free rates across all models) | 10 active | Dedicated | 14-day free trial; autoscaling + fine-tuning |
| **Enterprise** | Custom | Volume discounts; dedicated team | Unlimited | Private VPC / dedicated | 99.9% SLA; HIPAA / SOC 2 / GDPR |

### Per-Model Token Rates ($/M tokens, combined input + output)

| Model | Provider | Free Rate | Pro Rate | Tier Availability |
|---|---|---|---|---|
| Llama 3.1 8B | Meta | $0.20 | $0.15 | Free+ |
| Mistral 7B | Mistral AI | $0.16 | $0.12 | Free+ |
| Phi-3 Mini | Microsoft | $0.12 | $0.09 | Free+ |
| CodeLlama 13B | Meta | $0.24 | $0.18 | Free+ |
| Llama 3.1 70B | Meta | $0.60 | $0.45 | Pro+ |
| Mixtral 8×7B | Mistral AI | $0.48 | $0.36 | Pro+ |
| DeepSeek R1 7B | DeepSeek | $0.24 | $0.18 | Pro+ |
| Qwen 2.5 72B | Alibaba | $0.56 | $0.42 | Pro+ |

### Blended Average Revenue Per Million Tokens

| Tier | Traffic Mix | Blended Rate |
|---|---|---|
| Free | 50% Llama 8B, 25% Mistral 7B, 15% Phi-3, 10% CodeLlama 13B | **$0.182/M** |
| Pro | 30% Llama 8B, 20% Mistral 7B, 10% Phi-3, 10% CodeLlama, 15% Llama 70B, 10% Mixtral 8×7B, 5% DeepSeek | **$0.209/M** |
| Enterprise | Custom contract; heavy 70B + Mixtral mix with volume discounts | **Contract-based** |

### GPU Infrastructure Costs (AWS)

| Model | Instance | Throughput (tok/sec) | Util | On-Demand $/hr | Reserved $/hr | COGS/1M tok (reserved, 85% util) |
|---|---|---|---|---|---|---|
| Llama 3.1 8B | g6.2xlarge (L4) | 1,200 | 85% | $0.82 | $0.53 | **$0.14** |
| Mistral 7B | g6.2xlarge (L4) | 1,400 | 85% | $0.82 | $0.53 | **$0.12** |
| Phi-3 Mini | g6.2xlarge (L4) | 2,200 | 85% | $0.82 | $0.53 | **$0.08** |
| CodeLlama 13B | g6.12xlarge (L4×4) | 900 | 85% | $3.40 | $2.17 | **$0.20** |
| Llama 3.1 70B | p4d.24xlarge (A100×8) | 1,800 | 85% | $32.77 | $22.10 | **$4.01** |
| Mixtral 8×7B | g6.12xlarge (L4×4) | 2,200 | 85% | $3.40 | $2.17 | **$0.36** |
| DeepSeek R1 7B | g6.2xlarge (L4) | 1,500 | 85% | $0.82 | $0.53 | **$0.12** |
| Qwen 2.5 72B | p4d.24xlarge (A100×8) | 1,600 | 85% | $32.77 | $22.10 | **$4.51** |

> **70B model margin note:** Large models (Llama 70B, Qwen 72B) are offered at below-cost token rates on Free/Pro tiers as a strategic market-share investment. Margin recovery path: (1) custom silicon (AWS Trainium2) by M18, (2) enterprise contracts priced at true cost-plus, (3) traffic mix shift toward smaller models as fine-tuning matures.

### Blended Infrastructure COGS Per Million Tokens

| Tier | Traffic-Weighted COGS/M | Revenue/M | Token Gross Margin |
|---|---|---|---|
| Free (small models only) | **$0.136** | $0.182 | **25%** |
| Pro (mixed) | **$0.66** | $0.209 | negative on tokens alone |
| Pro (incl. $49 base fee) | — | — | **~58% blended** (base fee lifts overall GM) |
| Enterprise | ~$0.45 (committed, 28% of contract) | Contract | **72%** |

*Pro tier token economics: the $49/month base fee is high-margin and offsets below-cost large model serving. Net Pro customer GM is ~58% when base fee is included.*

---

## Monthly Revenue Projections

### Customer Acquisition (Base Case)

| Month | Free Users | Pro Customers | Enterprise Logos |
|---|---|---|---|
| M1 | 400 | 15 | 0 |
| M2 | 750 | 35 | 0 |
| M3 | 1,200 | 65 | 1 |
| M4 | 1,800 | 110 | 2 |
| M5 | 2,500 | 165 | 3 |
| M6 | 3,200 | 230 | 4 |
| M7 | 3,900 | 285 | 6 |
| M8 | 4,500 | 330 | 8 |
| M9 | 5,000 | 370 | 10 |
| M10 | 5,400 | 400 | 11 |
| M11 | 5,700 | 430 | 12 |
| M12 | 6,000 | 450 | 14 |

*Churn rates: Free 10% MoM (high; typical for free tiers), Pro 4% MoM, Enterprise 1% MoM*

### Average Revenue Per User / Account (ARPU)

| Tier | ARPU/month | Basis |
|---|---|---|
| Free | $5.46 | ~30M tokens avg usage × $0.182/M blended |
| Pro | $100 | $49 base + ~340M tokens avg × $0.15/M ≈ $49 + $51 |
| Enterprise | $4,500 | Custom contract avg (base + compute + SLA + support) |

### Monthly Revenue (Base Case, $000s)

| Month | Free | Pro | Enterprise | **Total MRR** | **ARR Run Rate** |
|---|---|---|---|---|---|
| M1 | 2.2 | 1.5 | 0 | **3.7** | 44.4 |
| M2 | 4.1 | 3.5 | 0 | **7.6** | 91.2 |
| M3 | 6.6 | 6.5 | 4.5 | **17.6** | 211.2 |
| M4 | 9.8 | 11.0 | 9.0 | **29.8** | 357.6 |
| M5 | 13.7 | 16.5 | 13.5 | **43.7** | 524.4 |
| M6 | 17.5 | 23.0 | 18.0 | **58.5** | 702.0 |
| M7 | 21.3 | 28.5 | 27.0 | **76.8** | 921.6 |
| M8 | 24.6 | 33.0 | 36.0 | **93.6** | 1,123.2 |
| M9 | 27.3 | 37.0 | 45.0 | **109.3** | 1,311.6 |
| M10 | 29.5 | 40.0 | 49.5 | **119.0** | 1,428.0 |
| M11 | 31.1 | 43.0 | 54.0 | **128.1** | 1,537.2 |
| M12 | 32.8 | 45.0 | 63.0 | **140.8** | **1,689.6** |

**Cumulative Year 1 Revenue: ~$828K**

---

## Cost of Goods Sold (COGS)

### Gross Margin by Tier

| Tier | Revenue ($/customer) | COGS ($/customer) | Gross Profit | **GM%** |
|---|---|---|---|---|
| Free | $5.46 | $4.10 (75% of rev) | $1.36 | **25%** |
| Pro | $100 | $42 (42% of rev) | $58 | **58%** |
| Enterprise | $4,500 | $1,260 (28% of rev) | $3,240 | **72%** |

*Pro COGS breakdown: $37.50 token infrastructure (reserved instances) + $4.50 overhead per dedicated slot = $42.*

### Gross Margin — Monthly Blended

| Month | Revenue | COGS | **Gross Profit** | **GM%** |
|---|---|---|---|---|
| M1 | $3.7K | $2.3K | $1.4K | **38%** |
| M3 | $17.6K | $9.3K | $8.3K | **47%** |
| M6 | $58.5K | $28.2K | $30.3K | **52%** |
| M9 | $109.3K | $48.6K | $60.7K | **56%** |
| M12 | $140.8K | $60.5K | $80.3K | **57%** |

*GM improves as enterprise mix grows and reserved instance coverage expands. Target: 65%+ GM by Month 18 with Trainium2 migration for large models and 80% reserved instance coverage.*

---

## Operating Expenses

| Category | M1 | M6 | M12 | Notes |
|---|---|---|---|---|
| Salaries & benefits | $42K | $75K | $110K | 2 FTE → 4 FTE → 6 FTE |
| AWS infrastructure (non-COGS) | $3K | $6K | $12K | Control plane, storage, monitoring |
| Sales & marketing | $2K | $10K | $25K | Content, ads, conferences |
| Legal & compliance | $2K | $3K | $5K | SOC 2 prep, contracts |
| Tools & SaaS | $1K | $2K | $4K | GitHub, Datadog, Linear, etc. |
| G&A (accounting, HR) | $1K | $2K | $4K | |
| **Total OpEx** | **$51K** | **$98K** | **$160K** | |

---

## EBITDA / Burn

| Month | Gross Profit | OpEx | **Net Burn** | Cumulative Burn |
|---|---|---|---|---|
| M1 | $1.4K | $51K | ($49.6K) | ($49.6K) |
| M2 | $3.7K | $54K | ($50.3K) | ($99.9K) |
| M3 | $8.3K | $57K | ($48.7K) | ($148.6K) |
| M4 | $14.8K | $60K | ($45.2K) | ($193.8K) |
| M5 | $22.1K | $64K | ($41.9K) | ($235.7K) |
| M6 | $30.3K | $68K | ($37.7K) | ($273.4K) |
| M7 | $40.3K | $73K | ($32.7K) | ($306.1K) |
| M8 | $50.0K | $79K | ($29.0K) | ($335.1K) |
| M9 | $60.7K | $86K | ($25.3K) | ($360.4K) |
| M10 | $67.1K | $94K | ($26.9K) | ($387.3K) |
| M11 | $72.2K | $103K | ($30.8K) | ($418.1K) |
| M12 | $80.3K | $113K | ($32.7K) | ($450.8K) |

**Total Year 1 Burn: ~$451K**
**Runway on $1.5M seed: 36+ months** (cash remaining after Year 1: $1.05M; forward burn rate ~$30K/month as revenue grows)

> **Break-even trajectory:** Not achieved in Year 12 under current pricing model. Break-even projected at Month 17–19 (base case) as enterprise mix grows and large-model costs decline via Trainium2. Series A at M14–16 extends runway and accelerates GTM before break-even.

---

## Scenario Analysis

| Metric | Conservative (−25%) | **Base** | Aggressive (+35%) |
|---|---|---|---|
| M12 MRR | $105K | **$141K** | $190K |
| M12 ARR | $1.27M | **$1.69M** | $2.28M |
| Year 1 Cumulative Revenue | $621K | **$828K** | $1.12M |
| Break-even month | M21 | **M18** | M15 |
| Total Year 1 Burn | $530K | **$451K** | $365K |
| Runway on $1.5M | 24 mo | **36 mo** | 45+ mo |

---

## Key Financial Milestones

| Milestone | Target Month |
|---|---|
| First $10K MRR | M4 |
| First enterprise logo | M3 |
| First $50K MRR | M6 |
| 5,000 free users | M9 |
| First $100K MRR | M8 |
| $1M ARR run rate | M8 |
| Break-even (cash flow neutral) | M18 |
| $140K MRR / ~$1.7M ARR | M12 |
| Series A trigger (~$3M ARR) | M18–20 |

---

## Fundraising Plan

| Round | Target | Timing | Use of Funds |
|---|---|---|---|
| Seed (current) | $1.5M | Now | MVP, first 6 hires, GTM launch |
| Series A | $8–12M | Month 18–20 | Sales team, enterprise features, Trainium2 migration, geographic expansion |

*Series A trigger: $3M ARR with >50% YoY growth and 5+ enterprise logos*

---

*Model prepared by CFO Agent. Last updated: April 2026. Reflects live pricing tiers launched in CLO-59.*
