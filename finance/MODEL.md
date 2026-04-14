# Cloudach — 12-Month Financial Model

> **As of:** April 2026 | **Currency:** USD | **Basis:** Monthly accrual

---

## Executive Summary

Cloudach is an LLM cloud infrastructure platform targeting developers and enterprises. This model projects conservative, base, and aggressive scenarios for the first 12 months post-launch, covering revenue, COGS, gross margin, operating expenses, and runway.

**Base case headline:** $2.1M ARR by Month 12, 42% gross margin, 18 months of runway on a $1.5M seed.

---

## Assumptions

### Pricing Tiers

| Tier | Target | Price/1M tokens (input) | Price/1M tokens (output) | Monthly base fee |
|---|---|---|---|---|
| **Developer** | Indie devs, hobbyists | $0.80 | $2.40 | $0 (pay-as-you-go) |
| **Startup** | Early-stage teams | $0.60 | $1.80 | $99/mo |
| **Growth** | Scaling companies | $0.45 | $1.35 | $499/mo |
| **Enterprise** | Large orgs, custom SLAs | $0.30 | $0.90 | $2,500+/mo |

### GPU Infrastructure Costs (AWS)

| Model | GPU Type | Cost/hr | Throughput (tok/sec) | Cost/1M tokens |
|---|---|---|---|---|
| Llama 3 8B | g6.2xlarge (L4) | $0.82 | 1,200 | $0.19 |
| Llama 3 70B | p4d.24xlarge (A100×8) | $32.77 | 1,800 | $5.05 |
| Mistral 7B | g6.2xlarge (L4) | $0.82 | 1,400 | $0.16 |
| Mixtral 8x7B | g6.12xlarge (L4×4) | $3.28 | 2,200 | $0.41 |

*Blended average cost: ~$0.38/1M tokens (weighted by expected usage mix)*

### Usage Mix Assumption
- 40% Llama 3 8B / Mistral 7B (cheap, fast models)
- 45% Mixtral 8x7B (mid-tier)
- 15% Llama 3 70B (premium)

---

## Monthly Revenue Projections

### Customer Acquisition (Base Case)

| Month | Dev Customers | Startup Customers | Growth Customers | Enterprise Customers |
|---|---|---|---|---|
| M1 | 80 | 5 | 1 | 0 |
| M2 | 160 | 12 | 2 | 0 |
| M3 | 280 | 22 | 4 | 1 |
| M4 | 420 | 35 | 7 | 1 |
| M5 | 600 | 52 | 11 | 2 |
| M6 | 820 | 72 | 16 | 3 |
| M7 | 1,080 | 96 | 22 | 4 |
| M8 | 1,380 | 124 | 29 | 5 |
| M9 | 1,720 | 156 | 37 | 7 |
| M10 | 2,100 | 192 | 46 | 9 |
| M11 | 2,520 | 232 | 57 | 11 |
| M12 | 2,980 | 276 | 69 | 14 |

*Monthly churn: Dev 8%, Startup 4%, Growth 2%, Enterprise 1%*

### Average Revenue Per User (ARPU)

| Tier | ARPU/month | Basis |
|---|---|---|
| Developer | $18 | ~22M tokens avg usage + no base |
| Startup | $210 | $99 base + ~55M tokens avg |
| Growth | $820 | $499 base + ~360M tokens avg |
| Enterprise | $3,400 | $2,500 base + ~700M tokens avg |

### Monthly Revenue (Base Case, $000s)

| Month | Dev | Startup | Growth | Enterprise | **Total MRR** | **ARR Run Rate** |
|---|---|---|---|---|---|---|
| M1 | 1.4 | 1.1 | 0.8 | 0 | **3.3** | 39.6 |
| M2 | 2.9 | 2.5 | 1.6 | 0 | **7.0** | 84.0 |
| M3 | 5.0 | 4.6 | 3.3 | 3.4 | **16.3** | 195.6 |
| M4 | 7.6 | 7.4 | 5.7 | 3.4 | **24.1** | 289.2 |
| M5 | 10.8 | 10.9 | 9.0 | 6.8 | **37.5** | 450.0 |
| M6 | 14.8 | 15.1 | 13.1 | 10.2 | **53.2** | 638.4 |
| M7 | 19.4 | 20.2 | 18.0 | 13.6 | **71.2** | 854.4 |
| M8 | 24.8 | 26.0 | 23.8 | 17.0 | **91.6** | 1,099.2 |
| M9 | 31.0 | 32.8 | 30.3 | 23.8 | **117.9** | 1,414.8 |
| M10 | 37.8 | 40.3 | 37.7 | 30.6 | **146.4** | 1,756.8 |
| M11 | 45.4 | 48.7 | 46.7 | 37.4 | **178.2** | 2,138.4 |
| M12 | 53.6 | 58.0 | 56.6 | 47.6 | **215.8** | **2,589.6** |

**Cumulative Year 1 Revenue: ~$963K**

---

## Cost of Goods Sold (COGS)

### Variable Costs (per month)

| Cost Item | Basis | M1 | M6 | M12 |
|---|---|---|---|---|
| GPU compute (AWS) | ~38% of revenue | $1.3K | $20.2K | $82.0K |
| Bandwidth / egress | ~3% of revenue | $0.1K | $1.6K | $6.5K |
| Third-party APIs | ~1% of revenue | $0.03K | $0.5K | $2.2K |
| **Total COGS** | | **$1.4K** | **$22.3K** | **$90.7K** |

### Gross Margin

| Month | Revenue | COGS | **Gross Profit** | **GM%** |
|---|---|---|---|---|
| M1 | $3.3K | $1.4K | $1.9K | 57% |
| M3 | $16.3K | $6.8K | $9.5K | 58% |
| M6 | $53.2K | $22.3K | $30.9K | 58% |
| M9 | $117.9K | $49.5K | $68.4K | 58% |
| M12 | $215.8K | $90.7K | $125.1K | 58% |

*Note: Gross margin improves as enterprise mix grows (lower token cost via committed instances). Target: 60–65% GM by Month 18 with reserved instance discounts.*

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

| Month | Gross Profit | OpEx | **Net Burn / (Profit)** | Cumulative Burn |
|---|---|---|---|---|
| M1 | $1.9K | $51K | ($49.1K) | ($49.1K) |
| M2 | $4.1K | $54K | ($49.9K) | ($99.0K) |
| M3 | $9.5K | $57K | ($47.5K) | ($146.5K) |
| M4 | $14.0K | $60K | ($46.0K) | ($192.5K) |
| M5 | $21.8K | $64K | ($42.2K) | ($234.7K) |
| M6 | $30.9K | $68K | ($37.1K) | ($271.8K) |
| M7 | $41.3K | $73K | ($31.7K) | ($303.5K) |
| M8 | $53.1K | $79K | ($25.9K) | ($329.4K) |
| M9 | $68.4K | $86K | ($17.6K) | ($347.0K) |
| M10 | $84.9K | $94K | ($9.1K) | ($356.1K) |
| M11 | $103.4K | $103K | **$0.4K** | ($355.7K) |
| M12 | $125.1K | $113K | **$12.1K** | ($343.6K) |

**Break-even: Month 11 (base case)**
**Total burn Year 1: ~$344K**
**Runway on $1.5M seed: 24+ months**

---

## Scenario Analysis

| Metric | Conservative (-30%) | **Base** | Aggressive (+40%) |
|---|---|---|---|
| M12 MRR | $151K | **$215K** | $302K |
| M12 ARR | $1.81M | **$2.59M** | $3.62M |
| Year 1 Cumulative Revenue | $674K | **$963K** | $1.35M |
| Break-even month | M14 | **M11** | M9 |
| Total Year 1 Burn | $476K | **$344K** | $198K |
| Runway on $1.5M | 18 mo | **24 mo** | 30+ mo |

---

## Key Financial Milestones

| Milestone | Target Month |
|---|---|
| First $10K MRR | M4 |
| First $50K MRR | M6 |
| First enterprise logo | M3 |
| Break-even (cash flow neutral) | M11 |
| $100K MRR | M9 |
| $200K MRR / ~$2.4M ARR | M12 |
| Series A trigger (~$3M ARR) | M14–16 |

---

## Fundraising Plan

| Round | Target | Timing | Use of Funds |
|---|---|---|---|
| Seed (current) | $1.5M | Now | MVP, first 6 hires, GTM launch |
| Series A | $8–12M | Month 14–16 | Sales team, enterprise features, geographic expansion |

*Series A trigger: $3M ARR with >50% YoY growth and 3+ enterprise logos*

---

*Model prepared by CFO Agent. Last updated: April 2026.*
