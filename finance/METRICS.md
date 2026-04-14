# Cloudach — Fundraising Metrics Template

> **For:** Series A Investor Conversations
> **Company:** Cloudach — LLM Cloud Infrastructure
> **Period:** Monthly/Quarterly reporting

---

## Instructions for Use

Update this template monthly. All metrics should be captured at end-of-month. Share with investors as part of standard investor updates. Highlight in red any metric that has regressed >10% MoM without explanation.

---

## 1. Revenue & Growth

| Metric | Definition | Current | MoM Δ | QoQ Δ | Target (M12) |
|---|---|---|---|---|---|
| **MRR** | Monthly recurring revenue (contracted + usage-based 3-month trailing avg) | | | | $215K |
| **ARR** | MRR × 12 | | | | $2.59M |
| **MoM Revenue Growth** | (MRR_current - MRR_prev) / MRR_prev | | | | 15%+ |
| **Revenue by Tier** | Dev / Startup / Growth / Enterprise MRR split | | | | 25/27/26/22% |
| **Non-subscription Revenue** | One-time fees, professional services | | | | <10% of total |

### Revenue Quality

| Metric | Definition | Current | Target |
|---|---|---|---|
| **Contracted ARR** | Signed annual contracts (not pay-as-you-go) | | >40% of ARR |
| **Expansion Revenue** | MRR from upsells to existing customers | | >20% of new MRR |
| **Revenue Concentration** | Top customer as % of ARR | | <15% |
| **Net Revenue Retention** | (Starting MRR + Expansion - Contraction - Churn) / Starting MRR × 100 | | >110% |

---

## 2. Customer Metrics

| Metric | Definition | Current | MoM Δ | Target (M12) |
|---|---|---|---|---|
| **Total Paying Customers** | Unique billing accounts with >$1 charge | | | 3,339 |
| **Developer Tier** | Pay-as-you-go accounts | | | 2,980 |
| **Startup Tier** | $99/mo+ accounts | | | 276 |
| **Growth Tier** | $499/mo+ accounts | | | 69 |
| **Enterprise Tier** | $2,500+/mo accounts | | | 14 |
| **Free Trial Users** | Active free tier / trial accounts | | | |

### Acquisition & Retention

| Metric | Definition | Current | Target |
|---|---|---|---|
| **New Customers (MoM)** | Net new paying accounts | | +15% MoM |
| **Gross Churn Rate** | Customers lost / beginning customers | | <6% MoM (Dev), <2% (Enterprise) |
| **Logo Churn Rate** | Enterprise logos lost / beginning logos | | <1% MoM |
| **Customer Payback** | CAC / (ARPU × GM%) in months | | <4 months |
| **Trial → Paid Conversion** | % free trial users converting to paid | | >25% |

### Enterprise Metrics

| Metric | Definition | Current | Target |
|---|---|---|---|
| **Enterprise Logos** | Named enterprise accounts paying >$2.5K/mo | | 14 |
| **Enterprise ACV** | Average contract value per enterprise logo | | $40.8K |
| **Enterprise Pipeline** | Qualified enterprise pipeline value | | 3× current ARR |
| **Time to Close** | Days from first contact to signed contract | | <60 days |

---

## 3. Usage & Product Metrics

| Metric | Definition | Current | Target |
|---|---|---|---|
| **Total Tokens Processed/Mo** | Input + output tokens across all models | | 50B+ |
| **API Calls/Mo** | Total inference requests | | 10M+ |
| **P50 Latency (TTFT)** | Median time-to-first-token | | <200ms |
| **P99 Latency (TTFT)** | 99th percentile time-to-first-token | | <800ms |
| **API Uptime** | Monthly uptime % (excluding planned maintenance) | | >99.9% |
| **Avg Tokens/Request** | Input + output tokens per API call | | ~2,500 |
| **DAU/MAU (API active days)** | % of monthly users active on any given day | | >40% |

### Model Mix

| Model | % of Traffic | % of Revenue | Trend |
|---|---|---|---|
| Llama 3 8B | | | |
| Llama 3 70B | | | |
| Mistral 7B | | | |
| Mixtral 8x7B | | | |
| Other | | | |

---

## 4. Unit Economics

| Metric | Definition | Current | Target (M12) |
|---|---|---|---|
| **Blended Gross Margin** | (Revenue - COGS) / Revenue | | 58% |
| **Gross Margin by Tier** | Dev / Startup / Growth / Enterprise | | 52/58/58/72% |
| **COGS % of Revenue** | GPU compute + bandwidth + APIs | | <42% |
| **GPU Utilization** | Avg utilization across fleet | | >75% |
| **Cost per 1M Tokens (blended)** | Total COGS / total tokens × 1M | | ~$1.45 |
| **Reserved Instance Coverage** | % of baseline fleet on reserved pricing | | 60% |

---

## 5. Sales & Marketing

| Metric | Definition | Current | Target |
|---|---|---|---|
| **CAC (blended)** | Total S&M spend / new customers | | <$120 |
| **CAC (enterprise)** | Enterprise S&M + AE cost / new enterprise logos | | <$8,000 |
| **LTV:CAC (blended)** | LTV / CAC | | >8:1 |
| **Sales Efficiency** | Net new ARR / S&M spend (Magic Number) | | >0.7 |
| **Pipeline Coverage** | Total qualified pipeline / quarterly revenue target | | 3× |
| **Website → Trial Conversion** | Visitors → free trial / account creation | | >3% |
| **SQL → Close Rate** | Sales-qualified leads converted to paying | | >25% |

---

## 6. Financial Health

| Metric | Definition | Current | Target |
|---|---|---|---|
| **Monthly Net Burn** | Total OpEx + COGS - Revenue | | <$50K by M6 |
| **Cash on Hand** | Available cash + invested capital | | |
| **Runway** | Cash / Monthly burn | | >18 months |
| **Burn Multiple** | Net burn / Net new ARR | | <2× |
| **Headcount** | Full-time employees | | 6 by M12 |
| **Revenue per Employee** | ARR / headcount | | >$400K by M12 |

---

## 7. Series A Benchmark Comparison

*Based on Bessemer, a16z, and Sequoia AI infrastructure portfolio benchmarks (2023–2025)*

| Metric | Cloudach Target (Series A) | Industry Benchmark |
|---|---|---|
| ARR at raise | $3M+ | $2–5M (infra) |
| ARR growth (YoY) | >100% | >80% |
| Gross margin | >58% | 50–70% |
| Net Revenue Retention | >110% | >110% |
| Enterprise logos | 10+ | 5–15 |
| Burn multiple | <2× | <3× |
| Runway post-raise | 24 months | 18–24 months |
| Raise amount | $8–12M | $6–15M (infra) |
| Valuation | 8–12× ARR | 8–15× ARR |

### Series A Investor Narrative Checklist

- [ ] Demonstrated product-market fit (>110% NRR)
- [ ] Repeatable GTM motion (consistent MoM growth >15%)
- [ ] Enterprise traction (10+ logos, named reference customers)
- [ ] Technical differentiation (latency, reliability, multi-model)
- [ ] Clear path to 70%+ gross margin
- [ ] SOC 2 Type II (or in progress)
- [ ] Strong founding team with AI/infra credentials
- [ ] Total addressable market narrative ($50B+ LLM inference market by 2028)

---

## 8. Investor Update Template (Monthly)

```markdown
# Cloudach Investor Update — [Month YYYY]

## Highlights
- MRR: $XXX (+X% MoM)
- New logos: X (including [notable name])
- [One major product milestone]

## Key Metrics
| Metric | This Month | Last Month | Δ |
|--------|-----------|------------|---|
| MRR | | | |
| Customers | | | |
| GM% | | | |
| Burn | | | |
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

## 9. Board Meeting Metrics Dashboard

*Quarterly board reporting cadence*

**Financial KPIs:**
1. ARR bridge (new, expansion, churn, contraction)
2. Cohort revenue retention (by signup quarter)
3. CAC efficiency by channel
4. Gross margin trend
5. Cash burn and runway

**Operational KPIs:**
6. Token volume and model mix trends
7. API reliability (uptime, latency percentiles)
8. Enterprise pipeline and velocity
9. Headcount and revenue-per-employee
10. NPS / CSAT scores

**Leading Indicators:**
11. Free trial signups (2-month leading indicator)
12. Developer community size (GitHub stars, Discord members)
13. Enterprise POC conversions in progress
14. Inbound demo requests

---

*Fundraising metrics template prepared by CFO Agent. Last updated: April 2026.*
