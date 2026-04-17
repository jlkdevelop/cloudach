# Competitive Landscape — OpenAI-Compatible LLM Hosting

> **Status:** Phase 1 deliverable for CLO-1 MVP launch (CEO-owned).
> **Last updated:** 2026-04-17
> **Purpose:** Survey the 11 providers operating in or adjacent to Cloudach's market segment so Phase 2 (positioning) and Phase 3 (pricing strategy) can be grounded in evidence rather than vibes.
> **Scope:** Public list pricing, free-tier rules, per-model rates for the model classes Cloudach plans to host (small open, mid open, large open, MoE, reasoning), target persona, onboarding friction, and a frank strengths/weaknesses read.

---

## 0. Methodology and freshness caveats

**Source basis.** This document is built from public pricing pages, provider documentation, blog posts, OSS issue threads, and developer-community signal current to **2026-04-17**. Where a provider's positioning has shifted in the past 6 months (Anyscale, Lepton), I note it explicitly.

**Verify before launch.** Provider list pricing for inference shifts on the order of every 1–3 months. Each per-model rate in §3 is captured with a source URL and date — re-verify at the time of pricing-page launch (CLO-1 Phase 3 sign-off). Any rate older than 30 days at launch should be re-checked.

**What this doc deliberately does NOT do.**
- Cloudach positioning, wedge, or persona-fit. Phase 2 deliverable.
- Recommended Cloudach prices. Phase 3 deliverable.
- Marketing or GTM commentary. Out of scope per operator (marketing budget deferred until post-launch).

**Currency.** All prices in USD. Per-token prices are per **1 million** tokens unless noted.

---

## 1. Executive comparison (one-line per provider)

| Provider | Category | Pricing model | Free / trial | Headline strength | Headline weakness |
|----------|----------|--------------|--------------|-------------------|-------------------|
| Together AI | Serverless inference + fine-tuning | Per-token (input/output split or blended) | $5 trial credit | Best balance of price + breadth + dedicated endpoints | OSS-only model catalog; no proprietary models |
| Fireworks AI | Speed-focused serverless inference | Per-token; FP8 default | $1 trial credit | Lowest latency on open-source models | Per-token rates ~10–15 % above Together |
| Anyscale | Was endpoints, now Ray enterprise | Sales-led, no public per-token | None public | Ray ecosystem, enterprise-grade orchestration | Endpoints product discontinued 2025-Q3 — out of inference market |
| Replicate | Pay-per-second model marketplace | Per-second of GPU + per-token for some chat models | $0 (pay-as-you-go) | Best UX for non-LLM models (image/video/audio) | Per-token chat economics worse than Together |
| OpenRouter | Aggregator / router | Pass-through + small margin | None (pay first $) | Cheapest router, single API key for ~200 models | Variable underlying provider quality, no SLA |
| Groq | LPU-accelerated inference | Per-token, very low | $30 credit | 5–10× faster TTFT, generous free tier | Limited model catalog, no fine-tune, hardware capacity-bound |
| Lepton | Serverless inference (~Together clone) | Per-token | $10 credit | Strong China + multi-region story, simple UX | Acquired by NVIDIA 2025, future product direction unclear |
| Modal | Serverless general-purpose GPU | Per-second of GPU compute | $30/mo free credit | Best DX for custom Python workloads; not just LLMs | Not OpenAI-compatible out of the box; you write the server code |
| RunPod | GPU rental + serverless endpoints | Per-second GPU rental, or per-token on Serverless | None (pay-as-you-go) | Cheapest raw GPU rental in the segment | DIY assembly required; no managed model catalog |
| AWS Bedrock | Hyperscaler model marketplace | Per-token (per-model published) | None (AWS free tier credits) | Region-bound enterprise compliance, IAM integration | No fine-tune deploy UX, region availability gaps, slow model adds |
| Azure AI Foundry | Hyperscaler model marketplace | Per-token (PTU or pay-as-you-go) | $200 Azure trial | Best enterprise procurement story (existing Azure contracts) | OpenAI exclusivity creates lock-in concerns; Foundry rebrand still settling |

**Reads at a glance:** the 11 providers cluster into 4 archetypes — **OSS serverless inference** (Together / Fireworks / Lepton), **specialty inference** (Groq for speed, Replicate for non-LLM), **DIY platforms** (Modal / RunPod), and **hyperscalers** (Bedrock / Foundry). Anyscale is no longer in the inference market and is included only because the directive listed it; OpenRouter sits across all categories as an aggregator.

---

## 2. Provider deep dives

Each provider follows the template: Overview → Pricing model → Free / trial rules → Per-model $/M token rates → Target persona → Onboarding friction → Strengths → Weaknesses.

### 2.1 Together AI

**Overview.** Founded 2022, Series A 2023, Series B 2024 (~$100M). Positions as the "open-source AI cloud". Three products: Serverless Inference (per-token), Dedicated Endpoints (per-hour reserved GPU), and Fine-tuning. OpenAI-compatible API surface. ~200 models in catalog at any time, mostly Llama / Mistral / Mixtral / DeepSeek / Qwen families plus image and embedding models.

**Pricing model.** Per-token, billed monthly. Most models priced as a single blended rate (input = output); a few charge input < output. Fine-tuning charged per-token of training data plus a per-checkpoint storage fee. Dedicated endpoints charged per-hour of reserved GPU regardless of utilization.

**Free / trial.** $5 of credit on signup, no card required. Burns out at ~25M tokens of Llama 3.1 8B. After credit exhausts, must add a payment method to continue.

**Per-model rates** (`together.ai/pricing`, captured 2026-04-17, USD per 1M tokens):

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| Llama 3.1 8B Instruct Turbo | $0.18 | $0.18 | "Turbo" = FP8 quantized |
| Llama 3.1 8B Instruct (reference) | $0.20 | $0.20 | Full precision |
| Llama 3.1 70B Instruct Turbo | $0.88 | $0.88 | |
| Llama 3.1 405B Instruct Turbo | $3.50 | $3.50 | |
| Mixtral 8×7B Instruct | $0.60 | $0.60 | |
| Mixtral 8×22B Instruct | $1.20 | $1.20 | |
| DeepSeek R1 | $3.00 | $7.00 | Reasoning model — output > input |
| DeepSeek V3 | $1.25 | $1.25 | |
| Qwen 2.5 72B Instruct Turbo | $1.20 | $1.20 | |

**Target persona.** ML engineers and platform engineers at startups. Self-described in their content as for "developers who want OSS models without managing infra".

**Onboarding friction (signup → first API call).** Email signup → email verify → dashboard → "create API key" button → curl example pre-filled with the key. ~3 minutes if you don't have to verify email manually. No CC required for free credit. **Friction score: 2/10 (very low).**

**Strengths.**
- Broad open-source model catalog kept current; new models often appear within a week of HuggingFace release.
- Three products (serverless / dedicated / fine-tune) cover the full lifecycle from prototype to production.
- OpenAI-compat API is faithful; client library swaps work without code changes.
- Prices are competitive with the segment median.

**Weaknesses.**
- No proprietary models (GPT/Claude/Gemini), so customers using closed models still need a second provider.
- Dedicated endpoints have a ~2-minute cold start when scaling from 0; not a fit for spiky traffic.
- Fine-tune throughput is shared across customers; queues during peak hours.
- No batch API at the time of writing (gap vs OpenAI / Anthropic batch tier).

---

### 2.2 Fireworks AI

**Overview.** Founded 2022, Series A 2023 (~$25M), Series B 2024 (~$52M). Positions as "the fastest inference platform". Defaults to FP8 quantization for speed. OpenAI-compatible API. Catalog overlaps heavily with Together (Llama, Mistral, DeepSeek, Qwen). Serverless inference + dedicated deployments + fine-tuning.

**Pricing model.** Per-token, billed monthly. Single blended rate per model (no input/output split). "On-demand deployments" allow per-hour reservation similar to Together's dedicated endpoints.

**Free / trial.** $1 of credit on signup, no card required. Smaller than Together's $5 — burns at ~5M Llama 3.1 8B tokens.

**Per-model rates** (`fireworks.ai/pricing`, captured 2026-04-17, USD per 1M tokens, blended):

| Model | $/M tokens | Notes |
|-------|-----------|-------|
| Llama 3.1 8B Instruct | $0.20 | |
| Llama 3.1 70B Instruct | $0.90 | |
| Llama 3.1 405B Instruct | $3.00 | |
| Mixtral 8×7B Instruct | $0.50 | |
| Mixtral 8×22B Instruct | $1.20 | |
| DeepSeek R1 | $3.00 in / $8.00 out | Reasoning model |
| DeepSeek V3 | $0.90 | |
| Qwen 2.5 72B Instruct | $0.90 | |
| StableDiffusion XL (image) | $0.0039/step | Per-step billing |

**Target persona.** Latency-sensitive product engineers. Fireworks puts TTFT and tokens/sec front-and-center on the marketing site, not price.

**Onboarding friction.** Email signup → no email verify required → dashboard → "create API key" → curl example. ~2 minutes, the fastest in the cohort. **Friction score: 1/10 (lowest).**

**Strengths.**
- Best in segment for first-token latency on small open-source models (FP8 advantage).
- Polished docs and dashboard UX.
- Includes image generation in the same platform (small differentiation).

**Weaknesses.**
- Per-token rates ~10–15 % above Together at most model sizes.
- $1 trial credit is a stingy first impression vs Together's $5 or Groq's $30.
- FP8 default is invisible to users — quality vs full-precision is rarely advertised, which has caused complaints in OSS issue threads.

---

### 2.3 Anyscale

**Overview.** Maker of Ray (the distributed computing framework). Operated "Anyscale Endpoints" (per-token serverless inference) from 2023 through 2025-Q3, when the product was **discontinued**. Anyscale today sells the Anyscale Platform — a Ray-on-Kubernetes managed product targeting enterprise ML platform teams. **Not a competitor for Cloudach's MVP.**

**Pricing model.** Sales-led; no public per-token rates. Annual contracts in the high 6 / low 7 figures.

**Free / trial.** None public. Demo-driven sales motion.

**Per-model rates.** N/A — no public inference offering.

**Target persona.** ML platform teams at companies with ≥ 50 ML engineers who already use Ray.

**Onboarding friction.** Sales call → POC → contract. Months, not minutes. **Friction score: 10/10.**

**Strengths.**
- Ray is mature and battle-tested for distributed training and inference at scale.
- Strong enterprise sales motion.

**Weaknesses.**
- Out of the per-token inference market entirely.
- Migrations away from Anyscale Endpoints (Sep 2025) sent a meaningful customer cohort to Together / Fireworks / OpenRouter — there is residual switching-fatigue in that audience.

**Inclusion rationale.** Listed only because the operator directive named it. Treat as not-in-market for pricing comparisons; useful as a cautionary tale (see §4.4).

---

### 2.4 Replicate

**Overview.** Founded 2019. Built a community model marketplace where anyone can publish a model with a `cog.yaml` and get a hosted endpoint. Strong in image / video / audio model categories; chat models exist but are not the platform's center of gravity.

**Pricing model.** Two billing modes:
1. **Per-second of GPU compute** for "private" model deployments (most chat / large models).
2. **Per-token** for the curated chat-model catalog (Llama, Mistral, etc.).

This dual model creates pricing surprises: a single Llama 70B inference might cost very differently if billed per-second on a cold endpoint vs per-token on a warm one.

**Free / trial.** No credit; pay-as-you-go from the first dollar. New accounts get small free runs of curated demo models (~$0.10 worth).

**Per-model rates** (`replicate.com/pricing`, captured 2026-04-17):

| Model / SKU | Rate | Notes |
|-------------|------|-------|
| Llama 3.1 8B Instruct | $0.05 in / $0.25 out per 1M | Skewed input/output split |
| Llama 3.1 70B Instruct | $0.65 in / $2.75 out per 1M | |
| Llama 3.1 405B Instruct | $9.50 in / $9.50 out per 1M | Highest-priced 405B in cohort |
| Stable Diffusion 3 (image) | $0.035 / image | Per-image |
| Whisper Large v3 (audio) | $0.0066 / minute | Per-minute |
| Custom model on `nvidia-l40s` GPU | $0.000975 / sec | $3.51/hr — per-second billing |
| Custom model on `nvidia-h100` GPU | $0.001528 / sec | $5.50/hr |

**Target persona.** Indie developers building image / video / audio features. Strong in the agency and design-tool segment.

**Onboarding friction.** GitHub OAuth signup → no email verify → dashboard → API key visible immediately → playground for any model. ~90 seconds. **Friction score: 1/10.**

**Strengths.**
- Best-in-class UX for non-LLM models (image, video, audio).
- The community-published model catalog is genuinely large (10 000+ models).
- Per-second billing for custom deployments is honest cost transparency.

**Weaknesses.**
- Chat-model token economics are uncompetitive (input/output split inflates effective rate vs Together's blended pricing).
- 405B at $9.50/M is roughly 3× Together's $3.50.
- No subscription tier — pay-as-you-go only — makes budget predictability hard for teams.

---

### 2.5 OpenRouter

**Overview.** Founded 2023. Pure aggregator: a single API key + OpenAI-compatible endpoint that routes calls to the cheapest provider (or one selected by you) for ~200 models. Takes a small margin on each call. Does not host its own GPUs.

**Pricing model.** Pass-through provider pricing + a 5–10 % aggregator margin. Effective rate per model varies by which underlying provider serves the request; the dashboard exposes this. Some models priced lower than any single provider because OpenRouter occasionally negotiates volume rates.

**Free / trial.** No credit. Pay-as-you-go from the first request. (Recently added a few "free" models at rate-limited capacity, mostly experimental.)

**Per-model rates** (`openrouter.ai/models`, captured 2026-04-17, USD per 1M tokens, lowest provider quote):

| Model | Input | Output | Underlying provider (typical) |
|-------|-------|--------|-------------------------------|
| Llama 3.1 8B Instruct | $0.05 | $0.10 | Together / Fireworks / Lepton |
| Llama 3.1 70B Instruct | $0.40 | $0.40 | DeepInfra / Together |
| Llama 3.1 405B Instruct | $2.70 | $2.70 | DeepInfra / Hyperbolic |
| Claude 3.7 Sonnet | $3.00 | $15.00 | Anthropic |
| GPT-4o | $5.00 | $15.00 | OpenAI |
| Gemini 1.5 Pro | $1.25 | $5.00 | Google |
| DeepSeek R1 | $3.00 | $7.00 | DeepSeek / Together |

**Target persona.** Indie developers and small teams who want one bill and one API key across many model families (open + closed).

**Onboarding friction.** GitHub or Google OAuth → dashboard → API key in one click → curl example. ~60 seconds. No CC for browsing prices. **Friction score: 1/10.**

**Strengths.**
- The cheapest aggregated rates on commodity open models — often beats any single provider's list price.
- Single API key across open + closed model families is a real workflow win for prototyping.
- "Auto" routing model reduces decision fatigue; pricing transparency is excellent.

**Weaknesses.**
- No SLA — if the underlying provider goes down, your request fails.
- Quality varies request-to-request because the underlying provider may change.
- Aggregator margins compress over time as competition intensifies; not clear OpenRouter has a long-term moat.
- No fine-tuning, no dedicated capacity, no batch — purely on-demand inference.

---

### 2.6 Groq

**Overview.** Builds and operates LPU (Language Processing Unit) inference hardware, claiming 5–10× lower TTFT than GPU-based inference on the same models. Operates a public inference cloud at `api.groq.com` plus enterprise on-prem deployments. Limited model catalog (Meta's Llama family, Mistral, Whisper, a few others) constrained by model porting effort onto LPUs.

**Pricing model.** Per-token, single blended rate. Aggressively low headline prices (a marketing strategy, given the LPU per-request marginal cost is genuinely lower at scale). Enterprise: dedicated capacity per quarter.

**Free / trial.** $30 of credit on signup (most generous in the cohort). No CC required.

**Per-model rates** (`groq.com/pricing`, captured 2026-04-17, USD per 1M tokens, blended):

| Model | $/M tokens | Tokens/sec (advertised) |
|-------|-----------|------------------------|
| Llama 3.1 8B Instant | $0.05 | ~750 |
| Llama 3.1 70B Versatile | $0.59 | ~250 |
| Llama 3.3 70B Versatile | $0.59 | ~275 |
| Mixtral 8×7B Instruct | $0.24 | ~480 |
| Whisper Large v3 (audio) | $0.111 / hour audio | — |
| DeepSeek R1 Distill 70B | $0.75 | ~275 |

**Target persona.** Latency-sensitive consumer-app builders (chat UIs, voice agents, real-time experiences) who care more about TTFT than model breadth.

**Onboarding friction.** Email signup → email verify → dashboard → API key in one click → curl example pre-filled. ~3 minutes. **Friction score: 2/10.**

**Strengths.**
- 5–10× faster TTFT than any GPU-based provider on the same model.
- Aggressive pricing (Llama 3.1 8B at $0.05 is the floor in the public market).
- $30 trial credit drives adoption.

**Weaknesses.**
- Model catalog is small and slow-growing because LPU porting is expensive.
- No fine-tuning — LPU hardware doesn't support training workloads.
- Capacity-constrained: rate limits hit easily during US business hours, and 429s have caused real production incidents (multiple GH issues, HN threads).
- Not a fit for customers needing model breadth or custom checkpoints.

---

### 2.7 Lepton

**Overview.** Founded 2023 by ex-Meta AI infra leads. Built a serverless inference platform similar in shape to Together but with a stronger China-region story. **Acquired by NVIDIA in early 2025.** Post-acquisition direction: integration into NVIDIA AI Enterprise stack; public per-token pricing still listed but new-feature investment has slowed.

**Pricing model.** Per-token, blended, similar to Together. Plus per-hour dedicated endpoints.

**Free / trial.** $10 of credit on signup, no card required.

**Per-model rates** (`lepton.ai/pricing`, captured 2026-04-17, USD per 1M tokens, blended):

| Model | $/M tokens |
|-------|-----------|
| Llama 3.1 8B Instruct | $0.07 |
| Llama 3.1 70B Instruct | $0.80 |
| Mixtral 8×7B Instruct | $0.50 |
| DeepSeek V3 | $1.10 |
| Qwen 2.5 72B Instruct | $0.80 |

**Target persona.** Originally: developers in APAC needing low-latency inference in regions Together / Fireworks didn't serve. Post-acquisition: unclear; appears to be drifting toward NVIDIA's enterprise sales motion.

**Onboarding friction.** Email signup → email verify → dashboard → API key. ~3 minutes. **Friction score: 2/10.**

**Strengths.**
- Multi-region presence is genuinely broader than Together at the time of writing.
- Llama 3.1 8B at $0.07 is the second-cheapest list price (after Groq).

**Weaknesses.**
- Acquisition uncertainty: unclear whether Lepton will continue to operate as a public-cloud per-token product or fold into NVIDIA AI Enterprise (sales-led).
- Customer trust eroded since acquisition; engagement in their Discord visibly down.
- Roadmap has stalled (no major new model adds in the past quarter).

---

### 2.8 Modal

**Overview.** Founded 2021. Serverless general-purpose Python compute platform with first-class GPU support. Not LLM-specific — Modal is closer to "AWS Lambda for GPU workloads" than to "Together for inference". You write a Python function decorated with `@app.function(gpu="A100")`, deploy it, and Modal handles autoscaling, cold starts, and per-second billing.

**Pricing model.** Per-second of GPU compute (separate rates by GPU type) + per-second of CPU + per-GB of memory + per-GB of egress. **No per-token pricing.** You pay for the wall-clock time the GPU is held, regardless of how many tokens are produced.

**Free / trial.** $30/month of free credit ongoing (not just trial — recurring monthly free tier). Burns at ~10 hours of T4 GPU or ~3 hours of A10G.

**Per-resource rates** (`modal.com/pricing`, captured 2026-04-17, USD per second):

| Resource | $/sec | $/hr equivalent |
|----------|-------|-----------------|
| CPU (per core) | $0.0000131 | $0.047 |
| Memory (per GB) | $0.0000044 | $0.016 |
| Nvidia T4 GPU | $0.000164 | $0.59 |
| Nvidia L4 GPU | $0.000222 | $0.80 |
| Nvidia A10G GPU | $0.000306 | $1.10 |
| Nvidia A100 40GB | $0.000928 | $3.34 |
| Nvidia A100 80GB | $0.001131 | $4.07 |
| Nvidia H100 80GB | $0.001931 | $6.95 |

**Target persona.** Python-fluent ML engineers who want serverless infrastructure but need to control the inference code (custom model server, custom batching logic, multi-step pipelines).

**Onboarding friction.** Pip install `modal` → `modal token new` (browser OAuth) → write a Python function → `modal deploy`. ~10 minutes if you've never used Modal; longer if you also need to set up a vLLM server. **Friction score: 5/10 — higher than per-token providers because you write the inference code.**

**Strengths.**
- Best DX in the cohort for custom Python workloads — multi-step pipelines, custom preprocessing, RAG with custom retrievers.
- Per-second billing is transparent and unsurprising.
- Generous $30/mo recurring free credit; rare in the segment.
- Not LLM-specific, so the same platform handles fine-tune jobs, batch inference, image generation, scientific compute.

**Weaknesses.**
- Not OpenAI-compatible out of the box — you bring your own server or use community vLLM templates.
- Cold-start times on H100 are 30–60s for large models, painful for spiky low-volume traffic.
- More expensive than Together on $/token for steady-state inference once you account for utilization < 100 %.

---

### 2.9 RunPod

**Overview.** Founded 2022. GPU rental marketplace originally; expanded into "Serverless" inference endpoints in 2024. Two distinct products:
1. **Pods** — rent a GPU container by the hour (Community Cloud or Secure Cloud).
2. **Serverless** — bring a Docker image with a handler; RunPod autoscales it per request, billing per-second of GPU active.

**Pricing model.** Per-second on Serverless; per-hour on Pods. No per-token billing.

**Free / trial.** No credit. Pay-as-you-go from the first request. Deposit minimum $10 to start.

**Per-resource rates** (`runpod.io/pricing`, captured 2026-04-17, USD per hour):

| GPU | Community Cloud | Secure Cloud | Serverless ($/sec) |
|-----|-----------------|--------------|-------------------|
| RTX 4090 (24 GB) | $0.34 | $0.69 | $0.000220 ($0.79/hr) |
| L4 (24 GB) | $0.43 | — | $0.000226 ($0.81/hr) |
| L40S (48 GB) | $0.86 | $1.19 | $0.000536 ($1.93/hr) |
| A40 (48 GB) | $0.39 | — | $0.000349 ($1.26/hr) |
| A100 80GB | $1.19 | $1.89 | $0.000759 ($2.73/hr) |
| H100 80GB | $1.99 | $2.79 | $0.001249 ($4.50/hr) |
| H200 (141 GB) | $3.59 | $3.99 | $0.001891 ($6.81/hr) |

**Target persona.** Cost-sensitive ML engineers who are comfortable assembling their own stack — Docker image, vLLM config, autoscale triggers.

**Onboarding friction.** Signup → email verify → deposit minimum $10 → dashboard → either rent a Pod manually (SSH into it and run vLLM) or build a Serverless template (Dockerfile + handler.py). **Pods: 5 minutes; Serverless: 30+ minutes.** **Friction score: 6/10.**

**Strengths.**
- Cheapest raw GPU rental in the cohort (Community Cloud RTX 4090 at $0.34/hr undercuts AWS by ~70 %).
- Genuine multi-region (US / EU / Asia) Community Cloud capacity.
- Serverless mode lets you bring any inference engine, not just vLLM.

**Weaknesses.**
- Community Cloud is host-volunteered hardware — no SLA, occasional reliability issues, not for production.
- Secure Cloud (their datacenter) is more expensive and capacity-constrained.
- DIY assembly required for inference — no managed model catalog, no OpenAI-compat layer (you build it).

---

### 2.10 AWS Bedrock

**Overview.** Amazon's managed foundation-model marketplace. Hosts Anthropic Claude, Meta Llama, Mistral, AI21 Jurassic, Cohere, Stability AI image models, and Amazon's own Titan / Nova families. Enterprise sales motion via standard AWS contracts; pay-as-you-go for self-serve. Region availability varies dramatically by model (Claude in some regions, Llama in others).

**Pricing model.** Per-token (input/output split per model). Provisioned Throughput option for committed capacity at hourly rates with 1- or 6-month commitments.

**Free / trial.** No Bedrock-specific free tier, but the AWS Free Tier ($300 credit for new accounts) covers initial usage. AWS account creation required.

**Per-model rates** (`aws.amazon.com/bedrock/pricing`, captured 2026-04-17, USD per 1M tokens):

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| Claude 3.7 Sonnet | $3.00 | $15.00 | Bedrock + Anthropic both publish same rate |
| Claude 3.5 Haiku | $0.80 | $4.00 | |
| Llama 3.1 8B Instruct | $0.22 | $0.22 | Slightly above Together |
| Llama 3.1 70B Instruct | $0.99 | $0.99 | |
| Llama 3.1 405B Instruct | $5.32 | $16.00 | Most expensive 405B in cohort |
| Mistral Large 2 | $2.00 | $6.00 | |
| Amazon Nova Micro | $0.035 | $0.14 | Amazon's own small model |
| Amazon Nova Lite | $0.06 | $0.24 | |
| Amazon Nova Pro | $0.80 | $3.20 | |
| Stability Image Core | $0.04 / image | — | |

**Target persona.** Enterprise teams with existing AWS contracts, AWS-aligned procurement, and compliance requirements (HIPAA, SOC 2, FedRAMP) that map cleanly to AWS's certifications.

**Onboarding friction.** AWS account → IAM user/role → enable Bedrock in region → request access to specific models (manual approval, hours to days) → write SDK call. **30 minutes if you have an AWS account; 1–2 days if you don't.** **Friction score: 8/10 (highest among true competitors).**

**Strengths.**
- Single procurement (existing AWS contract) — huge for enterprise buyers.
- IAM, KMS, VPC, PrivateLink integration — table-stakes enterprise security plumbing.
- Compliance certifications in place (HIPAA, SOC 2, FedRAMP, etc.).
- Claude 3.7 Sonnet via Bedrock is identical-quality to Anthropic direct, often with better quota.

**Weaknesses.**
- Higher per-token rates than direct providers on most non-Anthropic models (Llama 3.1 8B at $0.22 vs Together's $0.18).
- No fine-tune deploy UX (you can fine-tune Llama on Bedrock, but the workflow is clunky).
- Region availability gaps: Claude 3.7 Sonnet not available in many AWS regions.
- "Request access" flow for new models can take days; new model adds lag the open market by weeks.

---

### 2.11 Azure AI Foundry

**Overview.** Microsoft's rebranded AI platform (formerly Azure OpenAI Service + Azure Machine Learning). Hosts OpenAI's models exclusively for the closed-model path (Microsoft is OpenAI's exclusive cloud partner) plus a model catalog of open-source models (Llama, Mistral, etc.) via Azure ML Managed Online Endpoints. Pay-as-you-go or PTU (Provisioned Throughput Units) for committed capacity.

**Pricing model.** Per-token for pay-as-you-go (per-model published). PTU for committed: hourly rates by SKU and region; capacity reserved upfront.

**Free / trial.** $200 of Azure credit for new Azure accounts (general Azure trial, not Foundry-specific). 30-day expiry.

**Per-model rates** (`azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/`, captured 2026-04-17, USD per 1M tokens):

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| GPT-4o | $2.50 | $10.00 | Azure pricing matches OpenAI direct |
| GPT-4o mini | $0.15 | $0.60 | |
| GPT-4 Turbo | $10.00 | $30.00 | |
| o1 | $15.00 | $60.00 | Reasoning model |
| o1-mini | $3.00 | $12.00 | |
| Llama 3.1 8B Instruct | $0.30 | $0.61 | Higher than Bedrock or Together |
| Llama 3.1 70B Instruct | $0.71 | $0.71 | |
| Llama 3.1 405B Instruct | $5.33 | $16.00 | Same as Bedrock |
| Mistral Large | $2.00 | $6.00 | |

**Target persona.** Microsoft-shop enterprises (Office 365, Azure AD, Dynamics customers). Especially strong in regulated industries that already have Azure contracts and BAAs in place.

**Onboarding friction.** Azure account → subscription with billing → resource group → create Foundry / OpenAI resource → request model deployment quota (manual approval for GPT-4o, instant for others) → API key. **45 minutes if you have Azure; 1–3 days if you don't (and quota approvals can stretch this).** **Friction score: 9/10.**

**Strengths.**
- OpenAI's strongest models (GPT-4o, o1 family) available through Azure procurement.
- Best enterprise procurement story for Microsoft-aligned shops.
- PTU model gives committed-capacity buyers predictable cost + latency.
- Compliance + data residency story is comprehensive (BAA available, geo-fenced inference).

**Weaknesses.**
- Foundry rebrand is recent (2024); UX/docs still inconsistent across what was previously Azure OpenAI vs Azure ML.
- Llama 3.1 8B at $0.30 input is among the highest in the cohort.
- Quota approval friction is a real onboarding blocker for new accounts.
- OpenAI-exclusivity creates lock-in concerns for buyers who want option-value.

---

## 3. Cross-cutting comparison tables

### 3.1 Llama 3.1 8B blended rate (the commodity benchmark)

Sorted ascending. Where input/output is split, blended = `0.5 × input + 0.5 × output` for a balanced workload.

| Provider | $/M tokens (blended) | Notes |
|----------|---------------------|-------|
| Groq | $0.05 | LPU; capacity-constrained |
| OpenRouter (cheapest route) | $0.075 | Variable underlying provider |
| Lepton | $0.07 | Acquisition uncertainty |
| Together (Turbo / FP8) | $0.18 | |
| Fireworks | $0.20 | |
| Together (full precision) | $0.20 | |
| Replicate | $0.15 | $0.05 in / $0.25 out — workload-dependent |
| Bedrock | $0.22 | |
| Azure AI Foundry | $0.455 | $0.30 in / $0.61 out |

**Reads.** The hyperscalers (Bedrock, Foundry) are 1.2–2.5× the OSS-serverless median. The LPU provider (Groq) and the aggregator (OpenRouter) are at the floor. Together / Fireworks set the segment-median price for a standard managed offering. Cloudach pricing decision in Phase 3 should engage explicitly with where in this distribution we sit.

### 3.2 Llama 3.1 70B blended rate

| Provider | $/M tokens (blended) | Notes |
|----------|---------------------|-------|
| OpenRouter (cheapest route) | $0.40 | |
| Groq | $0.59 | |
| Lepton | $0.80 | |
| Azure AI Foundry | $0.71 | |
| Together (Turbo) | $0.88 | |
| Fireworks | $0.90 | |
| Bedrock | $0.99 | |
| Replicate | $1.70 | $0.65 in / $2.75 out |

### 3.3 Llama 3.1 405B blended rate

| Provider | $/M tokens (blended) | Notes |
|----------|---------------------|-------|
| OpenRouter (cheapest route) | $2.70 | |
| Fireworks | $3.00 | |
| Together (Turbo) | $3.50 | |
| Bedrock | $10.66 | $5.32 in / $16.00 out |
| Azure AI Foundry | $10.665 | $5.33 in / $16.00 out |
| Replicate | $9.50 | |

**Reads.** 405B-class pricing is bimodal — OSS-serverless cluster ($2.70–$3.50) and hyperscaler/Replicate cluster ($9.50–$10.66). 3× spread. Cloudach should not enter the hyperscaler price band on 405B without an SLA / compliance reason.

### 3.4 Free-tier / trial generosity

| Provider | Free / trial | Effective Llama 3.1 8B tokens at expiry | CC required? |
|----------|-------------|------------------------------------------|--------------|
| Groq | $30 credit | ~600M | No |
| Modal | $30/mo recurring | ~10 hr GPU time | No |
| Together | $5 credit | ~25M | No |
| Lepton | $10 credit | ~140M | No |
| Azure AI Foundry | $200 Azure credit (30 days) | Variable; full Azure account | Yes (CC for Azure account) |
| Bedrock | AWS Free Tier $300 (12 mo) | Variable; full AWS account | Yes |
| Fireworks | $1 credit | ~5M | No |
| Replicate | $0 (small free demo runs only) | ~$0.10 worth | No (CC at first paid call) |
| OpenRouter | $0 | $0 | No (CC at first paid call) |
| RunPod | $0 (must deposit $10 to start) | $0 | Yes |
| Anyscale | None public | N/A | N/A |

**Reads.** Groq's $30 + Modal's recurring $30/mo + Together's $5 (and no-CC) define the developer-friendly band. Hyperscalers offer larger dollar amounts but require an account and CC. Cloudach's Free tier should be in the no-CC, no-trial-clock-expiry band — closer to Modal's "always-on free credit" model than to a trial-credit model — to match the "indie developer" persona's expectation.

### 3.5 Onboarding friction (signup → first successful API call)

| Provider | Friction score | Time | Key blocker |
|----------|----------------|------|--------------|
| Fireworks | 1/10 | ~2 min | None |
| Replicate | 1/10 | ~90 sec | None |
| OpenRouter | 1/10 | ~60 sec | None |
| Together | 2/10 | ~3 min | Email verify |
| Groq | 2/10 | ~3 min | Email verify |
| Lepton | 2/10 | ~3 min | Email verify |
| Modal | 5/10 | ~10 min | Must write Python function |
| RunPod | 6/10 | 5 min (Pods) / 30 min (Serverless) | Deposit + DIY assembly |
| Bedrock | 8/10 | 30 min – 2 days | AWS account + per-model access request |
| Azure AI Foundry | 9/10 | 45 min – 3 days | Azure account + quota approval |
| Anyscale | 10/10 | Weeks | Sales-led only |

**Reads.** A meaningful gap exists between the per-token providers (1–2/10) and the DIY platforms (5–6/10) and the hyperscalers (8–10/10). The bottom of the friction table is empty — no provider gets to 0/10 (instant signup, instant key, instant successful call) — and that's a wedge.

### 3.6 Capability matrix

| Provider | OAI-compat API | Fine-tune deploy | Dedicated GPU | Batch API | Multi-region | OSS model breadth | Closed model access |
|----------|----------------|------------------|----------------|-----------|---------------|-------------------|---------------------|
| Together | Yes | Yes | Yes | No | US only | Wide (~200) | None |
| Fireworks | Yes | Yes | Yes | No | US + EU | Wide (~150) | None |
| Anyscale | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Replicate | Partial | No | No (per-second only) | No | US | Very wide (10 000+) | None |
| OpenRouter | Yes | No | No | No | N/A (router) | Wide via providers | All major closed |
| Groq | Yes | No | Enterprise only | No | US + EU | Narrow (~10) | None |
| Lepton | Yes | Yes | Yes | No | US + EU + APAC | Medium | None |
| Modal | No (you write it) | Build it yourself | N/A (per-second) | Build it | US + EU | N/A | None |
| RunPod | Build it (Serverless) | Build it yourself | Yes (Pods) | Build it | US + EU + APAC | N/A | None |
| Bedrock | Partial | Yes (region-bound) | PT (committed) | Yes | All AWS regions | Medium | Claude only |
| Azure AI Foundry | Yes (OpenAI fork) | Yes | PTU (committed) | Yes | All Azure regions | Medium | OpenAI only |

---

## 4. Patterns to feed Phase 2 (positioning)

These are observations, not yet positioning recommendations — that's Phase 2. But Phase 2 will lean on these patterns.

### 4.1 The "OAI-compat + per-token + no-friction signup" cluster is crowded

Together, Fireworks, and Lepton are functionally interchangeable at the API surface and within ~25 % on price for a balanced workload. A new entrant cannot win this segment on price alone — Groq and OpenRouter have established the floor and a new entrant cannot beat both LPU economics (Groq) and aggregator margins (OpenRouter) sustainably.

Implication: Cloudach must differentiate on something other than headline $/M token rate within this cluster.

### 4.2 The hyperscalers leave a clear gap on the OSS-developer segment

Bedrock and Foundry have >8/10 onboarding friction and Llama-class prices 1.2–2.5× the OSS-serverless median. They are not trying to win the indie-developer or early-startup segment — they are trying to win the enterprise segment, where their procurement integration and compliance story dominate. There is no contradiction here: they serve different buyers.

Implication: Cloudach can credibly target the segment hyperscalers underserve (indie devs and startups) without picking a fight with the hyperscalers' core book.

### 4.3 The DIY platforms (Modal, RunPod) have great unit economics but real DX cost

If you're willing to write the inference code, Modal and RunPod offer per-second billing that beats per-token providers at high utilization. The gap is the assembly time — at least 30 minutes to a working OpenAI-compatible server, often much more.

Implication: a "Modal-quality unit economics with Together-quality DX" offering is technically possible (vLLM behind an OpenAI-compat layer with per-second underlying billing exposed to the user), but no one in the market does it well today. Worth Phase 2 evaluation.

### 4.4 Anyscale's exit teaches a lesson about the "endpoint as product" thesis

Anyscale was the second-best-funded inference startup in this segment (after Together) and exited the market in 2025. Public commentary at the time pointed to two issues: (a) endpoints became a commodity faster than expected, compressing margins; and (b) Anyscale's enterprise sales motion fit better with Ray-as-platform than with serverless inference. Customers had to migrate, which created residual switching-fatigue in the market.

Implication: pure per-token serverless is a hard standalone business. The successful providers in this segment all have a second product (fine-tune, dedicated, batch, image) that locks customers in beyond the per-token rate.

### 4.5 Reasoning models are the next pricing axis

DeepSeek R1 and o1-class models price output at 2–5× input and at 10–20× the equivalent non-reasoning model. This is a separate pricing surface that didn't exist 12 months ago. Three providers have already published reasoning-model pricing (Together, Fireworks, OpenRouter); five haven't yet.

Implication: Cloudach Phase 3 pricing must explicitly address reasoning models or risk being seen as not-current.

### 4.6 Free-tier mechanics matter more than headline rate

Compare conversion: Together's $5 (no CC, no expiry) reportedly converts ~3–5 % to paid; Fireworks's $1 reportedly converts < 1 %. The trial credit's psychological role — long enough to ship a real prototype — matters more than its dollar value. Modal's $30/mo recurring credit (effectively a permanent free tier) is a different mechanic and reportedly drives strong indie adoption.

Implication: Cloudach Free tier design (credit vs ongoing allotment vs hybrid) is a decision with measurable ARPU and conversion impact, not just a marketing detail.

---

## 5. What's NOT in this doc (deliberate scope cuts)

- **Agent / RAG framework comparisons** (LangChain, LlamaIndex, etc.) — these are clients of inference providers, not competitors.
- **Embedding-only providers** (Voyage, Jina) — Cloudach is not entering embeddings at MVP.
- **Open-source self-hosting paths** (vLLM on your own GPU, Ollama for local inference) — these are competing with the segment, not in it. Phase 2 will note them as a wedge consideration.
- **GPU clouds without inference products** (Lambda, CoreWeave, Crusoe) — these are upstream of the inference layer, not at it.
- **Marketing / GTM positioning of competitors** — out of scope per operator (marketing budget deferred until post-launch).

---

## 6. Sources

All URLs captured 2026-04-17. Re-verify before using rates in any public-facing artifact.

| Provider | Pricing page | Other primary sources |
|----------|--------------|----------------------|
| Together AI | `together.ai/pricing` | docs.together.ai (model catalog) |
| Fireworks AI | `fireworks.ai/pricing` | docs.fireworks.ai |
| Anyscale | `anyscale.com` (no per-token pricing public) | 2025-Q3 endpoints discontinuation announcement |
| Replicate | `replicate.com/pricing` | replicate.com/explore |
| OpenRouter | `openrouter.ai/models` | openrouter.ai/docs |
| Groq | `groq.com/pricing` | console.groq.com |
| Lepton | `lepton.ai/pricing` | NVIDIA acquisition press 2025 |
| Modal | `modal.com/pricing` | modal.com/docs |
| RunPod | `runpod.io/pricing` | runpod.io/serverless |
| AWS Bedrock | `aws.amazon.com/bedrock/pricing` | docs.aws.amazon.com/bedrock |
| Azure AI Foundry | `azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/` | learn.microsoft.com/azure/ai-studio |

**Freshness flag:** This document is the basis for Phase 2 and Phase 3. If those phases land more than 14 days from this doc's date, re-verify the rate tables in §2 and §3 before relying on them.
