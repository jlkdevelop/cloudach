# Cloudach — Fundraising Metrics Template

> **For:** Series A Investor Conversations
> **Company:** Cloudach — LLM Cloud Infrastructure
> **Period:** Monthly/Quarterly reporting
> **Updated:** April 2026 — aligned with live 3-tier pricing (Free / Pro / Enterprise)

---

## Instructions for Use

Update this template monthly. All metrics should be captured at end-of-month. Share with investors as part of standard investor updates. Highlight in red any metric that has regressed >10% MoM without explanation.

---

## 1. Revenue & Growth

| Metric | Definition | Current | MoM Δ | QoQ Δ | Target (M12) |
|---|---|---|---|---|---|
| **MRR** | Monthly recurring revenue (Pro subscriptions + metered token usage, 3-month trailing avg for usage) | | | | $141K |
| **ARR** | MRR × 12 | | | | $1.69M |
| **MoM Revenue Growth** | (MRR_current − MRR_prev) / MRR_prev | | | | 10%+ |
| **Revenue by Tier** | Free / Pro / Enterprise MRR split | | | | 23/32/45% |
| **Non-subscription Revenue** | One-time fees, professional services | | | | <5% of total |

### Revenue Quality

| Metric | Definition | Current | Target |
|---|---|---|---|
| **Contracted ARR** | Signed annual contracts (Enterprise + annual Pro) | | >35% of ARR |
| **Expansion Revenue** | MRR from upsells (Free→Pro, Pro→Enterprise) | | >25% of new MRR |
| **Revenue Concentration** | Top customer as % of ARR | | <20% |
| **Net Revenue Retention** | (Starting MRR + Expansion − Contraction − Churn) / Starting MRR × 100 | | >110% |

---

## 2. Customer Metrics

| Metric | Definition | Current | MoM Δ | Target (M12) |
|---|---|---|---|---|
| **Free Users** | Active accounts on Free tier with >0 token usage | | | 6,000 |
| **Pro Customers** | Paying accounts on $49/mo Pro plan | | | 450 |
| **Enterprise Logos** | Named enterprise accounts on custom contract | | | 14 |
| **Total Paying Customers** | Pro + Enterprise billing accounts | | | 464 |
| **Free Trial Users (Pro)** | Active Pro 14-day trials not yet converting | | | |

### Acquisition & Retention

| Metric | Definition | Current | Target |
|---|---|---|---|
| **New Free Signups (MoM)** | New Free accounts | | +15% MoM |
| **Free → Pro Conversion Rate** | Free users upgrading to Pro within 90 days | | >8% |
| **Pro Gross Churn** | Pro customers lost / beginning Pro customers | | <4% MoM |
| **Enterprise Logo Churn** | Enterprise logos lost / beginning logos | | <1% MoM |
| **Trial → Paid Conversion** | 14-day Pro trials converting to paid | | >35% |
| **Customer Payback (Pro)** | CAC / (ARPU × GM%) in months | | <2 months |

### Enterprise Metrics

| Metric | Definition | Current | Target |
|---|---|---|---|
| **Enterprise Logos** | Named accounts paying on custom contract | | 14 |
| **Enterprise ACV** | Average annual contract value per enterprise logo | | $54K |
| **Enterprise Pipeline** | Qualified enterprise pipeline value | | 3× current enterprise ARR |
| **Time to Close** | Days from first contact to signed contract | | <60 days |

---

## 3. Usage & Product Metrics

| Metric | Definition | Current | Target |
|---|---|---|---|
| **Total Tokens Processed/Mo** | Combined input + output tokens across all models and tiers | | 50B+ |
| **API Calls/Mo** | Total inference requests | | 10M+ |
| **P50 Latency (TTFT)** | Median time-to-first-token | | <200ms |
| **P99 Latency (TTFT)** | 99th percentile time-to-first-token | | <800ms |
| **API Uptime** | Monthly uptime % (excluding planned maintenance) | | >99.9% |
| **Avg Tokens/Request** | Combined input + output per API call | | ~2,500 |
| **DAU/MAU (API active days)** | % of monthly users active on any given day | | >40% |

### Model Mix

| Model | % of Traffic | % of Revenue | Tier Availability | Trend |
|---|---|---|---|---|
| Llama 3.1 8B | | | Free+ | |
| Mistral 7B | | | Free+ | |
| Phi-3 Mini | | | Free+ | |
| CodeLlama 13B | | | Free+ | |
| Llama 3.1 70B | | | Pro+ | |
| Mixtral 8×7B | | | Pro+ | |
| DeepSeek R1 7B | | | Pro+ | |
| Qwen 2.5 72B | | | Pro+ | |

---

## 4. Unit Economics

| Metric | Definition | Current | Target (M12) |
|---|---|---|---|
| **Blended Gross Margin** | (Revenue − COGS) / Revenue | | 57% |
| **Gross Margin by Tier** | Free / Pro / Enterprise | | 25% / 58% / 72% |
| **COGS % of Revenue** | GPU compute + bandwidth + APIs | | <43% |
| **GPU Utilization** | Avg utilization across fleet (all instance types) | | >85% |
| **Cost/1M Tokens — Small Models** | Blended COGS for <13B models (reserved instances) | | ~$0.13 |
| **Cost/1M Tokens — Large Models** | Blended COGS for 70B+ (reserved/Trainium2) | | <$1.00 by M18 |
| **Reserved Instance Coverage** | % of baseline fleet on reserved pricing | | 60% by M9 |

### Pro Tier Unit Economics (Per Customer/Month)

| Item | Value |
|---|---|
| Base subscription revenue | $49.00 |
| Avg token revenue (340M × $0.15/M blended) | $51.00 |
| **Total monthly revenue** | **$100.00** |
| Token COGS (340M × ~$0.14/M reserved, small model weighted) | $37.50 |
| Dedicated GPU slot overhead | $4.50 |
| **Total COGS** | **$42.00** |
| **Gross profit/customer/month** | **$58.00** |
| **Gross margin** | **58%** |
| CAC (content + inbound) | $80 |
| CAC payback period | 1.4 months |
| LTV (18-mo avg tenure) | $1,044 |
| LTV:CAC ratio | **13:1** |

### Free Tier Unit Economics (Per User/Month)

| Item | Value |
|---|---|
| Avg token revenue (30M × $0.182/M blended) | $5.46 |
| Token COGS (30M × $0.136/M shared GPU, packed) | $4.08 |
| **Gross profit/user/month** | **$1.38** |
| **Gross margin** | **25%** |
| CAC (organic/content, SEO) | $6 |
| LTV primary value | Upgrade funnel → Pro conversion |

### Enterprise Tier Unit Economics (Per Logo/Month)

| Item | Value |
|---|---|
| Avg monthly contract value | $4,500 |
| COGS (reserved instances + support allocation) | $1,260 |
| **Gross profit/logo/month** | **$3,240** |
| **Gross margin** | **72%** |
| CAC (enterprise sales) | $8,000 |
| CAC payback period | 2.5 months |
| LTV (36-mo avg tenure) | $116,640 |
| LTV:CAC ratio | **14.6:1** |

---

## 5. Sales & Marketing

| Metric | Definition | Current | Target |
|---|---|---|---|
| **CAC — Free tier** | S&M spend / new Free signups | | <$10 |
| **CAC — Pro** | S&M spend / new Pro customers | | <$80 |
| **CAC — Enterprise** | Enterprise S&M + AE cost / new logos | | <$8,000 |
| **LTV:CAC — Pro** | LTV / CAC | | >13:1 |
| **LTV:CAC — Enterprise** | LTV / CAC | | >14:1 |
| **Sales Efficiency** | Net new ARR / S&M spend (Magic Number) | | >0.7 |
| **Pipeline Coverage** | Qualified pipeline / quarterly revenue target | | 3× |
| **Website → Free Signup Rate** | Visitors converting to Free accounts | | >5% |
| **Free → Pro Upgrade (90d)** | % of Free users upgrading within 90 days | | >8% |
| **SQL → Enterprise Close Rate** | Sales-qualified leads to signed contracts | | >25% |

---

## 6. Financial Health

| Metric | Definition | Current | Target |
|---|---|---|---|
| **Monthly Net Burn** | Total OpEx + COGS − Revenue | | <$30K by M12 |
| **Cash on Hand** | Available cash + invested capital | | |
| **Runway** | Cash / Monthly burn | | >30 months |
| **Burn Multiple** | Net burn / Net new ARR | | <3× by M12 |
| **Headcount** | Full-time employees | | 6 by M12 |
| **Revenue per Employee** | ARR / headcount | | >$280K by M12 |

---

## 7. Series A Benchmark Comparison

*Based on Bessemer, a16z, and Sequoia AI infrastructure portfolio benchmarks (2023–2025)*

| Metric | Cloudach Target (Series A) | Industry Benchmark |
|---|---|---|
| ARR at raise | $3M+ | $2–5M (infra) |
| ARR growth (YoY) | >80% | >80% |
| Gross margin | >57% (trending 65%+) | 50–70% |
| Net Revenue Retention | >110% | >110% |
| Enterprise logos | 10+ | 5–15 |
| Burn multiple | <3× | <3× |
| Runway post-raise | 24 months | 18–24 months |
| Raise amount | $8–12M | $6–15M (infra) |
| Valuation | 8–10× ARR | 8–15× ARR |

### Series A Investor Narrative Checklist

- [ ] Demonstrated product-market fit (>110% NRR)
- [ ] Repeatable GTM motion (Free→Pro upgrade funnel, >8% 90-day conversion)
- [ ] Enterprise traction (10+ logos, named reference customers)
- [ ] Technical differentiation (latency, reliability, 8-model catalog, fine-tuning)
- [ ] Clear path to 65%+ gross margin (Trainium2 migration, reserved instance coverage)
- [ ] SOC 2 Type II (or in progress — required for enterprise closes)
- [ ] Strong founding team with AI/infra credentials
- [ ] TAM narrative ($50B+ LLM inference market by 2028)
- [ ] Competitive pricing confirmed vs. Together AI / Fireworks AI (matching or beating on Pro rates)

---

## 8. Competitive Pricing Snapshot

*For investor context — Cloudach vs. primary inference competitors*

| Provider | Llama 3.1 8B | Llama 3.1 70B | Mistral 7B | Mixtral 8×7B | Subscription |
|---|---|---|---|---|---|
| **Together AI** | $0.20/M | $0.90/M | $0.20/M | $0.60/M | None |
| **Fireworks AI** | $0.20/M | $0.90/M | $0.20/M | $0.50/M | None |
| **AWS Bedrock** | $0.30/M | $2.65/M | — | — | None |
| **Cloudach Free** | **$0.20/M** | $0.60/M | $0.16/M | $0.48/M | $0 |
| **Cloudach Pro** | **$0.15/M** | **$0.45/M** | **$0.12/M** | **$0.36/M** | $49/mo |

*Cloudach Pro is 25–50% cheaper than Together AI/Fireworks AI on equivalent models. Differentiation: dedicated GPU, autoscaling, fine-tuning, usage dashboard, and multi-model flexibility — not price alone.*

---

## 9. Investor Update Template (Monthly)

```markdown
# Cloudach Investor Update — [Month YYYY]

## Highlights
- MRR: $XXX (+X% MoM)
- New logos: X (including [notable name])
- Free → Pro conversion rate: X%
- [One major product milestone]

## Key Metrics
| Metric | This Month | Last Month | Δ |
|--------|-----------|------------|---|
| MRR | | | |
| Pro Customers | | | |
| Enterprise Logos | | | |
| Blended GM% | | | |
| Monthly Burn | | | |
| Runway | | | |

## What's Working
- [Specific growth driver]
- [Channel/segment performing well]

## What's Not Working
- [Honest assessment]
- [Plan to address]

## Help Needed
- [Specific asks from investors: intros, hires, etc.]

## Financials
[Attach P&L and runway chart]
```

---

## 10. Board Meeting Metrics Dashboard

*Quarterly board reporting cadence*

**Financial KPIs:**
1. ARR bridge (Free→Pro upgrades, new enterprise, churn, contraction)
2. Cohort revenue retention (by signup quarter)
3. CAC efficiency by channel and tier
4. Gross margin trend (overall + by tier)
5. Cash burn and runway

**Operational KPIs:**
6. Token volume and model mix trends
7. API reliability (uptime, latency percentiles)
8. Enterprise pipeline and velocity
9. Headcount and revenue-per-employee
10. NPS / CSAT scores

**Leading Indicators:**
11. Free tier signups (2-month leading indicator for Pro pipeline)
12. Free → Pro conversion rate trend (signals product-market fit)
13. Developer community size (GitHub stars, Discord members)
14. Enterprise POC conversions in progress
15. Inbound demo requests

---

*Fundraising metrics template prepared by CFO Agent. Last updated: April 2026. Aligned with live pricing page (CLO-59).*
