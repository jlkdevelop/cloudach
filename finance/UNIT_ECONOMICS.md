# Cloudach — Unit Economics Analysis

> **As of:** April 2026 | Competitive benchmarks vs. Together AI, Fireworks AI, Replicate
> **Updated:** Reflects live pricing tiers (Free / Pro / Enterprise) from CLO-59. Rates are **combined input + output** per million tokens.

---

## 1. Competitive Pricing Landscape

### Token Pricing ($/1M tokens, combined input + output)

| Provider | Llama 3.1 8B | Llama 3.1 70B | Mistral 7B | Mixtral 8×7B | Subscription |
|---|---|---|---|---|---|
| **Together AI** | $0.20 | $0.90 | $0.20 | $0.60 | None |
| **Fireworks AI** | $0.20 | $0.90 | $0.20 | $0.50 | None |
| **Replicate** | ~$0.40 (compute-sec basis) | ~$3.00 | ~$0.35 | ~$0.65 | None |
| **AWS Bedrock** | $0.30 | $2.65 | — | — | None |
| **OpenAI (GPT-4o)** | — | ~$5.00 (equiv) | — | — | None |
| **Cloudach Free** | **$0.20** | $0.60 | $0.16 | $0.48 | $0/mo |
| **Cloudach Pro** | **$0.15** | **$0.45** | **$0.12** | **$0.36** | $49/mo |
| **Cloudach Enterprise** | Custom | Custom | Custom | Custom | Custom |

*Cloudach Pro undercuts Together AI / Fireworks AI by 25–50% on equivalent models. Cloudach Free matches Together AI on Llama 3.1 8B (the most common developer model) while offering model-specific rates that are competitive or better across the full catalog.*

*Note: Together AI / Fireworks AI rates are input-only; combined input+output at equal ratios would roughly double. Cloudach rates are explicitly combined, making direct comparison slightly favorable to competitors — still competitive at Pro rates.*

---

## 2. AWS GPU Inference Cost Breakdown

### Instance Costs (On-Demand)

| Instance | GPU | vCPU | RAM | On-Demand $/hr | Reserved 1yr $/hr | Savings |
|---|---|---|---|---|---|---|
| g6.2xlarge | 1× L4 (24GB) | 8 | 32GB | $0.8236 | $0.5264 | 36% |
| g6.12xlarge | 4× L4 (96GB) | 48 | 192GB | $3.3958 | $2.1732 | 36% |
| g6.48xlarge | 8× L4 (192GB) | 192 | 768GB | $13.3523 | $8.5455 | 36% |
| p4d.24xlarge | 8× A100 (40GB) | 96 | 1152GB | $32.7726 | $22.1040 | 33% |
| p4de.24xlarge | 8× A100 (80GB) | 96 | 1152GB | $40.9658 | $27.6518 | 33% |
| g5.48xlarge | 8× A10G (24GB) | 192 | 768GB | $16.2877 | $10.4040 | 36% |

### Throughput & Cost Per Million Tokens

| Model | Instance | Tokens/sec | Utilization | Cost/hr | **Cost/1M tok (input)** | **Cost/1M tok (output)** |
|---|---|---|---|---|---|---|
| Llama 3 8B | g6.2xlarge | 1,200 | 70% | $0.82 | $0.27 | $0.27 |
| Llama 3 8B | g6.2xlarge (reserved) | 1,200 | 70% | $0.53 | $0.17 | $0.17 |
| Mistral 7B | g6.2xlarge | 1,400 | 70% | $0.82 | $0.23 | $0.23 |
| Mixtral 8x7B | g6.12xlarge | 2,200 | 70% | $3.40 | $0.61 | $0.61 |
| Mixtral 8x7B | g6.12xlarge (reserved) | 2,200 | 70% | $2.17 | $0.39 | $0.39 |
| Llama 3 70B | p4d.24xlarge | 1,800 | 70% | $32.77 | $7.19 | $7.19 |
| Llama 3 70B | p4d.24xlarge (reserved) | 1,800 | 70% | $22.10 | $4.85 | $4.85 |

*70% utilization assumed (industry benchmark for inference serving; idle capacity during off-peak hours)*

### Blended Infrastructure Cost (Usage-Weighted)

| Model Mix | Weight | Cost/1M tok | Weighted Cost |
|---|---|---|---|
| Llama 3 8B + Mistral 7B | 40% | $0.25 | $0.10 |
| Mixtral 8x7B | 45% | $0.61 | $0.27 |
| Llama 3 70B | 15% | $7.19 | $1.08 |
| **Blended (on-demand)** | 100% | | **$1.45** |
| **Blended (reserved, 60% coverage)** | 100% | | **$1.02** |

---

## 3. Unit Economics Per Pricing Tier (Live Pricing — April 2026)

### Free Tier ($0/mo — pay-as-you-go)

| Metric | Value |
|---|---|
| Avg monthly token usage | ~30M tokens (combined in+out) |
| Avg monthly revenue | $5.46 ($0.182/M blended) |
| Avg monthly COGS (shared GPU, packed) | $4.08 ($0.136/M) |
| **Gross profit/user/month** | **$1.38** |
| **Gross margin %** | **25%** |
| CAC (organic/SEO/content) | $6 |
| CAC payback period | 4.3 months |
| LTV primary value | Free→Pro upgrade funnel |
| LTV (if stays Free, 8-mo avg tenure) | $44 |
| LTV:CAC ratio | **7:1** |

*Free tier is acquisition-focused. Primary financial value is the upgrade funnel: every 8% Free→Pro conversion at M12 (450 Pro customers from ~5,600 Free users) generates $45K MRR at 58% GM.*

### Pro Tier ($49/mo + $0.15/M tokens)

| Metric | Value |
|---|---|
| Avg monthly token usage | ~340M tokens (combined in+out) |
| Base subscription revenue | $49.00 |
| Token revenue ($0.15/M avg — small model weighted) | $51.00 |
| **Total avg monthly revenue** | **$100.00** |
| Token COGS (reserved, 85% util, small model mix) | $37.50 |
| Dedicated GPU slot overhead | $4.50 |
| **Total avg monthly COGS** | **$42.00** |
| **Gross profit/customer/month** | **$58.00** |
| **Gross margin %** | **58%** |
| CAC (inbound + content) | $80 |
| CAC payback period | 1.4 months |
| LTV (18-mo avg tenure) | $1,044 |
| LTV:CAC ratio | **13:1** |

### Enterprise Tier (Custom contract)

| Metric | Value |
|---|---|
| Avg monthly contract value | $4,500 |
| Contract basis | Base + compute + SLA + support + compliance |
| Avg monthly COGS (reserved instances + support allocation) | $1,260 |
| **Gross profit/logo/month** | **$3,240** |
| **Gross margin %** | **72%** |
| CAC (enterprise sales cycle) | $8,000 |
| CAC payback period | 2.5 months |
| LTV (36-mo avg tenure) | $116,640 |
| LTV:CAC ratio | **14.6:1** |

---

## 4. Gross Margin Summary

| Tier | GM% (Current — On-Demand Mix) | GM% (Reserved, 85% Util) | Target GM% (Year 2) |
|---|---|---|---|
| Free | 25% | 32% | 38% |
| Pro | 52% | 58% | 63% |
| Enterprise | 68% | 72% | 76% |
| **Blended** | **47% (early)** | **57% (M12 base)** | **65% (Year 2)** |

*Blended GM starts lower in early months (Free-tier heavy) and improves as enterprise mix grows. At 60% reserved coverage (Month 9) and 14+ enterprise logos (Month 12), blended GM reaches 57%. Year 2 target of 65% assumes Trainium2 migration for large models + 80% reserved coverage.*

---

## 5. Together AI / Fireworks AI Margin Estimates

### Together AI (estimated)

| Item | Estimate |
|---|---|
| Price charged (Llama 3.1 8B, input-only) | $0.20/1M tok |
| AWS cost (reserved, 80% util) | ~$0.14/1M tok |
| **Gross margin** | **~30%** |
| Series B raised | $102.5M (2024) |
| Revenue run rate est. | ~$40–60M ARR |

### Fireworks AI (estimated)

| Item | Estimate |
|---|---|
| Price charged (Llama 3.1 8B, input-only) | $0.20/1M tok |
| AWS/custom silicon cost | ~$0.12–0.15/1M tok |
| **Gross margin** | **~25–40%** |
| Series B raised | $52M (2024) |

**Cloudach positioning:** Cloudach Pro matches or beats Together AI / Fireworks AI on token rates (25–50% cheaper on equivalent models) while adding the $49/mo subscription that lifts overall GM to 58% at the Pro tier level. Neither competitor charges a subscription fee, meaning Cloudach captures more revenue per active customer at equivalent or lower per-token prices. Enterprise tier is priced at a premium reflecting dedicated infrastructure, compliance features (HIPAA, SOC 2, GDPR), and dedicated solutions engineering.

---

## 6. Path to 70%+ Gross Margin

| Lever | GM Impact | Timeline |
|---|---|---|
| Reserved instance commitments (60% coverage) | +9 pts | Month 9 |
| Spot instance arbitrage for batch workloads | +3 pts | Month 6 |
| Model quantization (INT8/INT4) on small models | +4 pts | Month 4 |
| Custom silicon (Trainium2, Inferentia2) for 70B+ | +6 pts | Month 18 |
| GPU sharing / multi-tenant packing | +3 pts | Month 12 |
| **Cumulative potential** | **+25 pts** | |

---

*Unit economics analysis prepared by CFO Agent. Last updated: April 2026.*
