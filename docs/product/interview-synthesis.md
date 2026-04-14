# Developer Interview Synthesis — Cloudach LLM Platform

**Date:** 2026-04-14
**Conducted by:** Head of Product
**Method:** Async research synthesis (10 developer personas based on public forums, OSS issues, competitor reviews, and developer community patterns)
**Goal:** Surface developer pain points with existing LLM inference platforms to inform Cloudach's prioritized backlog.

---

## Participant Overview

| # | Persona | Role | Company Stage | Primary LLM Platform Used |
|---|---------|------|--------------|--------------------------|
| 1 | Alex T. | Startup CTO | Series A, 15 engineers | OpenAI API |
| 2 | Priya K. | ML Engineer | Growth-stage startup | Together AI + self-hosted vLLM |
| 3 | Marcus J. | Senior Backend Engineer | B2B SaaS, 50 engineers | OpenAI API |
| 4 | Yuki N. | Platform Engineer | Enterprise, 500+ engineers | Azure OpenAI |
| 5 | Sam R. | Indie Developer | Solo | Replicate |
| 6 | Chen W. | AI Product Manager | Mid-stage startup | OpenAI API |
| 7 | Fatima A. | DevOps/SRE | Fintech startup | AWS Bedrock |
| 8 | Jordan L. | Full-Stack Developer | Early-stage startup | OpenAI API |
| 9 | Raj M. | Enterprise Architect | Large Financial Institution | Azure OpenAI |
| 10 | Emma D. | Developer Advocate | Dev tools company | Multiple (OpenAI, Anthropic, Cohere) |

---

## Interview Script

**Section 1: Current Setup**
- What LLM platforms are you using today? Why did you choose them?
- How are you deploying / calling LLMs in production?
- How many tokens/requests per day are you running?

**Section 2: Pain Points**
- What is your single biggest frustration with your current LLM platform?
- Have you ever had a production incident caused by your LLM provider? Describe it.
- What's the hardest part of budgeting for LLM costs?
- Have you ever switched providers? What triggered the switch?

**Section 3: Feature Gaps**
- What feature do you wish existed that doesn't?
- What would make you move all your inference workloads to a new provider?
- How important is OpenAI API compatibility to you?
- Do you need to run custom/fine-tuned models? If so, how are you doing it today?

**Section 4: Pricing & Trust**
- How do you feel about your current pricing model?
- What SLA do you need for production workloads?
- What would a "perfect" pricing model look like?
- Any concerns about data privacy or model behavior?

---

## Key Findings by Participant

### 1. Alex T. — Startup CTO
**Profile:** Running 3 AI features in production on OpenAI. Burn rate on LLM costs is 30% of infra spend and growing.

**Top pain points:**
- Cost is unpredictable — token usage spikes unexpectedly. Hard to set budgets.
- No per-feature cost breakdown; all usage rolls up to one API key.
- OpenAI rate limits caused a production incident during a viral moment (HTTP 429s).

**Quote:** *"I need to know which feature is costing me money. Right now it's one bill for everything."*

**Switching trigger:** Per-feature usage tracking, cheaper per-token pricing.

---

### 2. Priya K. — ML Engineer
**Profile:** Fine-tunes Llama models for domain-specific tasks. Currently self-hosting vLLM on a $3k/mo GPU instance that sits idle 60% of the time.

**Top pain points:**
- Self-hosted GPU is over-provisioned because autoscaling is painful to set up.
- Deploying a new fine-tuned checkpoint requires SSH + manual restart of vLLM.
- No way to test two model versions in parallel (A/B test fine-tunes).

**Quote:** *"I want to upload a safetensors checkpoint and have it live in 5 minutes without touching kubectl."*

**Switching trigger:** Model upload UI, automatic GPU autoscaling, A/B traffic split.

---

### 3. Marcus J. — Senior Backend Engineer
**Profile:** Backend engineer who integrated GPT-4 for a doc summarization feature. Hit rate limits in production.

**Top pain points:**
- OpenAI rate limits are opaque — no clear signal before hitting the wall.
- No retry-with-backoff built into the SDK in a way that works at his scale.
- RPM limits are per-organization, so multiple teams fight over quota.

**Quote:** *"I want per-team API keys with configurable rate limits that I control."*

**Switching trigger:** Per-key rate limits the developer sets themselves, not the provider.

---

### 4. Yuki N. — Platform Engineer
**Profile:** Manages internal AI gateway for 40+ product teams at an enterprise. Uses Azure OpenAI for compliance.

**Top pain points:**
- Azure OpenAI deployment model is painful — each model is a separate deployment resource.
- No unified model registry across regions.
- Audit logs for who called what model when are incomplete.

**Quote:** *"I need a single API endpoint my teams use, with full audit logs and per-team billing."*

**Switching trigger:** SSO/SCIM provisioning, per-team API keys, audit log export, SLA with credits.

---

### 5. Sam R. — Indie Developer
**Profile:** Building a personal project. Budget: $20/mo.

**Top pain points:**
- Replicate is easy but expensive for continuous inference.
- Cold starts on serverless GPU are 10–30 seconds — kills UX.
- Minimum spend requirements on some platforms exclude hobbyists.

**Quote:** *"I want always-warm inference for $10/mo that doesn't make my users wait 15 seconds."*

**Switching trigger:** Low-cost tier with warm instances, pay-as-you-go, no minimum.

---

### 6. Chen W. — AI Product Manager
**Profile:** Oversees a product with 3 LLM-powered features. Manages budget for LLM costs.

**Top pain points:**
- No forecasting — can't predict what next month's bill will be.
- Can't tie LLM usage to product outcomes (conversions, retention).
- Engineering has to build custom logging to get any analytics.

**Quote:** *"I want a dashboard showing cost-per-user, cost-per-feature, and projected monthly spend."*

**Switching trigger:** Built-in analytics dashboard, per-feature tagging, cost alerts.

---

### 7. Fatima A. — DevOps/SRE
**Profile:** On-call for a fintech that uses AWS Bedrock for a loan underwriting feature. High stakes for reliability.

**Top pain points:**
- AWS Bedrock had a 2-hour outage that took down their underwriting pipeline.
- No easy fallback to another model/provider.
- Alerting from Bedrock is limited — had to build custom CloudWatch dashboards.

**Quote:** *"I need 99.9% SLA with real credits, not apologies. And I need health webhooks so my alerts fire before users notice."*

**Switching trigger:** Published SLA with credits, health webhook endpoints, automatic failover routing.

---

### 8. Jordan L. — Full-Stack Developer
**Profile:** Non-ML developer integrating LLMs into a product for the first time.

**Top pain points:**
- OpenAI docs are great but setup is still complex for streaming, function calling, etc.
- No visual playground to test prompts before writing code.
- Hard to debug why a request failed — error messages are unhelpful.

**Quote:** *"I want a Stripe-like dashboard where I can see every API call, the prompt, the response, and the cost."*

**Switching trigger:** Excellent onboarding docs, prompt playground, request log viewer.

---

### 9. Raj M. — Enterprise Architect
**Profile:** Evaluating LLM platforms for a 10,000-person bank. Data residency and compliance are requirements, not preferences.

**Top pain points:**
- Most platforms can't guarantee data stays in a specific region.
- No enterprise agreement with BAA (for healthcare) or SOC 2 for financial services.
- Team/department billing and approval workflows don't exist.

**Quote:** *"We need a vendor who can sign a BAA, prove SOC 2, and guarantee data doesn't leave the EU."*

**Switching trigger:** SOC 2 report, BAA availability, EU data residency, enterprise agreement template.

---

### 10. Emma D. — Developer Advocate
**Profile:** Uses 5+ LLM providers daily. Writes tutorials. Cares deeply about DX.

**Top pain points:**
- Every provider has subtly different API shapes even when "OpenAI-compatible."
- Rate limit error messages vary — hard to write provider-agnostic retry logic.
- No unified SDK that works across providers without custom adapters.

**Quote:** *"The best inference provider is the one that gets out of my way. Perfect OpenAI drop-in compatibility is table stakes now."*

**Switching trigger:** Perfect API compatibility, excellent error messages, low latency, great docs.

---

## Theme Analysis

### Theme 1: Cost Visibility & Predictability (7/10 participants)
Developers cannot predict or attribute LLM costs. Per-feature tagging, usage dashboards, and spend alerts are universally desired.

### Theme 2: API Key Management & Rate Control (6/10 participants)
Teams need multiple API keys with distinct rate limits and budgets — not a single organization-wide quota.

### Theme 3: OpenAI API Compatibility (5/10 participants)
Drop-in compatibility is baseline. Any deviation — even minor — creates friction and prevents adoption.

### Theme 4: Custom/Fine-tuned Model Deployment (4/10 participants)
ML teams need easy model upload, versioning, and traffic splitting. Self-hosting is painful and expensive.

### Theme 5: Reliability & SLA (4/10 participants)
Production teams need a published SLA with meaningful credits, health endpoints, and fallback routing.

### Theme 6: Developer Experience & Onboarding (4/10 participants)
Playground, request logs, and excellent error messages dramatically reduce time-to-first-success.

### Theme 7: Enterprise Features (3/10 participants)
SSO, audit logs, data residency, and compliance certifications are blockers for enterprise deals.

### Theme 8: Autoscaling & Cold Starts (3/10 participants)
GPU cold starts kill UX. Warm instances and automatic scale-to-zero are both needed.

---

## Prioritization Framework

Scored on: **Frequency** (how many participants) × **Impact** (severity of pain) × **Strategic fit** (alignment with Cloudach's positioning as developer-first GPU inference)

| Theme | Frequency | Impact | Strategic Fit | Priority Score |
|-------|-----------|--------|---------------|---------------|
| Cost visibility & tagging | 7 | High | High | **Critical** |
| API key management | 6 | High | High | **Critical** |
| OpenAI compatibility | 5 | High | High | **Critical** |
| Custom model deployment | 4 | High | High | **High** |
| Reliability / SLA | 4 | High | Medium | **High** |
| DX & onboarding | 4 | Medium | High | **High** |
| Enterprise features | 3 | High | Low (now) | **Medium** |
| Autoscaling / cold starts | 3 | Medium | High | **Medium** |
