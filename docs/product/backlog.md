# Cloudach — Prioritized Product Backlog

**Date:** 2026-04-14
**Author:** Head of Product
**Informed by:** 10 developer interviews (see `docs/product/interview-synthesis.md`)
**Scope:** Top 10 backlog items with acceptance criteria

---

## How to Read This Backlog

- **Priority:** Critical > High > Medium > Low
- **Effort:** S (days), M (1–2 weeks), L (3–4 weeks), XL (quarter)
- **Type:** Feature, Infra, DX (developer experience), Growth
- **Acceptance criteria** are the minimum bar for "done" — exhaustive edge cases belong in sub-tasks.

---

## Backlog Items

---

### BL-01 — Per-API-Key Usage Dashboard with Cost Tagging

**Priority:** Critical | **Effort:** M | **Type:** Feature

**Problem:** Developers and PMs cannot attribute LLM costs to specific features, teams, or users. Billing is opaque. This is the #1 pain point across 7/10 interviews.

**User story:**
> As a developer or PM, I want to see a dashboard that shows token usage and cost broken down by API key, request tag, and time period, so I can identify which features are expensive and set spending alerts.

**Acceptance criteria:**
- [ ] Each API request can include an optional `x-cloudach-tag` header (free-form string, e.g., `feature:summarize` or `user:u_123`)
- [ ] Dashboard shows total tokens in / out, total cost, and requests per day for each API key
- [ ] Dashboard supports filtering by tag and date range (last 7d, 30d, custom)
- [ ] Users can set a per-key monthly spend limit; requests above limit return HTTP 402 with a clear error
- [ ] Email alert fires when spend reaches 80% of the configured limit
- [ ] Data is available via REST API (`GET /v1/usage?key=...&tag=...&from=...&to=...`) for programmatic access

**Out of scope (v1):** Real-time (sub-second) streaming metrics, per-user spend breakdowns requiring identity integration.

---

### BL-02 — Multiple API Keys with Per-Key Rate Limits

**Priority:** Critical | **Effort:** M | **Type:** Feature

**Problem:** Teams share a single API key with a single rate limit, causing one team's spike to hurt others. Developers want developer-controlled rate limits, not provider-set quotas.

**User story:**
> As a team lead, I want to create multiple API keys with independent rate limits (RPM, TPM), so I can isolate features and prevent one service from starving another.

**Acceptance criteria:**
- [ ] Users can create up to 20 API keys per account from the dashboard
- [ ] Each key has a configurable RPM (requests per minute) and TPM (tokens per minute) limit, set by the user (not a global cap)
- [ ] Requests over the key's limit return HTTP 429 with `Retry-After` header and body: `{"error": "rate_limit_exceeded", "limit": N, "reset_at": "<ISO8601>"}`
- [ ] Keys can be labelled (e.g., "production-summarizer", "staging-chat") and have a description field
- [ ] Keys can be revoked instantly from the dashboard with a confirmation step
- [ ] Key creation and revocation events appear in the audit log

---

### BL-03 — Perfect OpenAI API Drop-In Compatibility

**Priority:** Critical | **Effort:** M | **Type:** Infra / DX

**Problem:** OpenAI API compatibility is table stakes for adoption. Any deviation in request/response shape, error codes, or streaming format forces developers to write adapters and makes Cloudach a second-class citizen.

**User story:**
> As a developer, I want to point the OpenAI SDK at `api.cloudach.com` and have everything work without changing any code, so I can switch from OpenAI in under 5 minutes.

**Acceptance criteria:**
- [ ] The following OpenAI endpoints are supported with identical request/response schemas: `POST /v1/chat/completions`, `GET /v1/models`, `GET /v1/models/{model}`
- [ ] Streaming (`stream: true`) works with identical SSE format including `[DONE]` sentinel
- [ ] Error response shapes match OpenAI's format exactly: `{"error": {"message": "...", "type": "...", "code": "..."}}`
- [ ] HTTP status codes match OpenAI conventions: 400 for invalid requests, 401 for bad auth, 429 for rate limits, 500 for inference errors
- [ ] The official OpenAI Python SDK and Node.js SDK work with only a `base_url` change — verified by automated compatibility tests
- [ ] Function calling / tool use is supported with the same schema as OpenAI
- [ ] `max_tokens`, `temperature`, `top_p`, `stop`, `n`, `logit_bias` parameters all function identically

---

### BL-04 — Request Log Viewer (Prompt + Response + Latency + Cost)

**Priority:** High | **Effort:** M | **Type:** DX

**Problem:** Developers can't debug failing requests or optimize prompts without seeing exactly what was sent and received. "Stripe-like" visibility is the most common DX request.

**User story:**
> As a developer, I want to see a log of every API request — prompt, response, latency, token counts, and cost — so I can debug issues and optimize my prompts without building custom logging.

**Acceptance criteria:**
- [ ] Every request is logged and viewable in the dashboard for 30 days
- [ ] Each log entry shows: timestamp, API key used, model, prompt (system + user), response, latency (ms), prompt tokens, completion tokens, total cost
- [ ] Log list is searchable by API key, tag, date range, model, and status (success / error)
- [ ] Individual log entries are expandable to show full prompt/response, with syntax highlighting
- [ ] Failed requests (4xx / 5xx) are flagged with the error message
- [ ] Log data is exportable as CSV or JSONL for the selected date range
- [ ] Sensitive data masking: users can enable regex-based field redaction for privacy compliance

---

### BL-05 — 5-Minute Onboarding: SDK Quickstart & Interactive Playground

**Priority:** High | **Effort:** S | **Type:** DX / Growth

**Problem:** New developers take too long to reach their first successful inference call. Every minute of friction increases drop-off. Non-ML developers especially need guided onboarding.

**User story:**
> As a new developer, I want to be able to make my first API call within 5 minutes of signing up, so I can evaluate Cloudach without investing hours in setup.

**Acceptance criteria:**
- [ ] Sign-up → API key creation flow completes in ≤3 clicks
- [ ] After key creation, user sees a working code snippet (Python, Node.js, curl) with their actual key pre-filled
- [ ] An interactive playground in the dashboard lets users select a model, write a prompt, and see the response — without writing any code
- [ ] Playground shows live token count, latency, and cost per request
- [ ] Quickstart documentation covers: Python, Node.js, and curl in ≤500 words each
- [ ] A "Hello World" test request can be executed from the dashboard in one click

---

### BL-06 — Custom Model Upload & Deployment

**Priority:** High | **Effort:** L | **Type:** Feature

**Problem:** ML engineers fine-tune models but have no easy way to deploy them. Self-hosting is expensive and operationally painful. This is a key differentiator vs. pure API providers.

**User story:**
> As an ML engineer, I want to upload a fine-tuned model checkpoint and serve it via the Cloudach API in under 10 minutes, without managing GPU infrastructure.

**Acceptance criteria:**
- [ ] Users can upload models in safetensors or GGUF format via the dashboard or `POST /v1/models/upload` (multipart or presigned S3 URL)
- [ ] Supported architectures: Llama 3.x, Mistral, Qwen 2.5 (expandable)
- [ ] Model is loaded into vLLM and health-checked automatically; user receives a notification when ready
- [ ] Deployed custom models appear in `GET /v1/models` with prefix `custom/`
- [ ] Users can set the serving configuration: max context length, tensor parallelism
- [ ] Models not receiving traffic for 30 minutes scale to zero; first request after idle triggers a warm-up (with a clear latency warning)
- [ ] Versioning: each upload creates a new version; users can route traffic between versions with a percentage split

---

### BL-07 — Uptime SLA with Health Webhooks & Status Page

**Priority:** High | **Effort:** S | **Type:** Infra

**Problem:** Production teams need guaranteed uptime and proactive alerting. SREs need health webhooks to integrate with PagerDuty/OpsGenie before users notice an outage.

**User story:**
> As an SRE, I want a published SLA, a live status page, and webhook notifications for incidents, so I can integrate Cloudach uptime into my alerting stack.

**Acceptance criteria:**
- [ ] Public status page at `status.cloudach.com` showing real-time and 90-day uptime per model and API endpoint
- [ ] Published 99.9% monthly uptime SLA for paid plans; downtime beyond SLA earns automatic credit (no manual claim)
- [ ] Users can register a webhook URL to receive incident notifications with payload: `{event: "incident_started"|"incident_resolved", affected: [...], started_at, message}`
- [ ] `GET /v1/health` endpoint returns: `{status: "ok"|"degraded"|"down", latency_p99_ms: N, models: [...]}`
- [ ] Incident postmortems are published within 72 hours for incidents > 15 minutes

---

### BL-08 — Intelligent Prompt Playground with Model Comparison

**Priority:** Medium | **Effort:** M | **Type:** DX / Growth

**Problem:** Developers iterate on prompts manually and can't easily compare outputs or costs across models. A side-by-side playground accelerates evaluation and drives multi-model usage.

**User story:**
> As a developer, I want to test a prompt across multiple models side-by-side and see latency and cost differences, so I can choose the best model for my use case.

**Acceptance criteria:**
- [ ] Playground supports running the same prompt against 2–4 models simultaneously
- [ ] Results show response text, latency, token counts, and cost per model
- [ ] Users can save playground sessions and share them via a URL
- [ ] System prompt field is separate from user turn; temperature and max_tokens are adjustable per run
- [ ] Playground sessions can be exported as ready-to-paste code (Python, Node.js, curl)

---

### BL-09 — Team Workspaces with Role-Based Access

**Priority:** Medium | **Effort:** L | **Type:** Feature

**Problem:** Enterprise and team customers need to share API keys, view shared usage, and have role-based access (admin vs. member) without sharing personal credentials.

**User story:**
> As a team admin, I want to invite teammates to a shared workspace where we can manage API keys, view combined usage, and control what each member can see or modify.

**Acceptance criteria:**
- [ ] Workspace owner can invite members by email; invites expire after 7 days
- [ ] Roles: `admin` (full access), `developer` (can use keys, view logs, cannot create/delete keys), `viewer` (read-only dashboard)
- [ ] API keys belong to the workspace, not individual users; all members with access can use them
- [ ] Usage dashboard shows per-member breakdowns when request is tagged with `x-cloudach-user-id`
- [ ] Workspace billing is unified; workspace admin receives invoices
- [ ] Audit log shows who created, used, or revoked each key

---

### BL-10 — Automatic GPU Autoscaling with Configurable Warm Instances

**Priority:** Medium | **Effort:** L | **Type:** Infra

**Problem:** Cold GPU starts (10–30 seconds) are a UX killer. Self-hosted teams over-provision to avoid cold starts. Cloudach should offer a configurable "always-warm" option.

**User story:**
> As a developer with latency-sensitive workloads, I want to configure a minimum number of warm GPU instances for my model so that my users never wait for a cold start.

**Acceptance criteria:**
- [ ] Users can set a `min_warm_instances` (0–N) per deployed model from the dashboard
- [ ] `min_warm_instances: 0` means scale-to-zero (default, cheapest); requests during cold start receive `Retry-After: N` or queue with estimated wait time
- [ ] `min_warm_instances: 1+` keeps at least N GPU instances warm; cost for idle instances is shown clearly before confirming
- [ ] Autoscaling triggers when queue depth exceeds 5 pending requests; new instance ready in ≤90 seconds
- [ ] Users see current instance count, GPU utilization %, and queue depth on the model detail page
- [ ] Burst scaling cap: configurable max instances to prevent runaway costs

---

## Weekly Product Review Cadence

**Proposed cadence — starting Week 2:**

| Cadence | Meeting | Participants | Purpose |
|---------|---------|-------------|---------|
| Weekly | Product Review (45 min) | Head of Product, Full-Stack Engineer, Designer | Review backlog priorities, sprint progress, design decisions |
| Weekly | User Feedback Synthesis (async) | Head of Product | Summarize new user signals; update backlog |
| Bi-weekly | Metrics Review (30 min) | Head of Product, Full-Stack Engineer | Review KPIs: activation rate, API calls, churn indicators |
| Monthly | Roadmap Review (60 min) | Head of Product + CEO | Review quarterly roadmap vs. goal alignment |

**Proposed KPIs for Month 1:**
- Time to first API call (target: ≤5 minutes from sign-up)
- 7-day activation rate (target: ≥60% of sign-ups make ≥1 API call within 7 days)
- Weekly active API keys (target: 10+ by end of month)
- Developer NPS (target: collect first baseline via in-app survey)

---

## Backlog Summary

| # | Item | Priority | Effort | Type |
|---|------|----------|--------|------|
| BL-01 | Per-API-Key Usage Dashboard with Cost Tagging | Critical | M | Feature |
| BL-02 | Multiple API Keys with Per-Key Rate Limits | Critical | M | Feature |
| BL-03 | Perfect OpenAI API Drop-In Compatibility | Critical | M | Infra/DX |
| BL-04 | Request Log Viewer | High | M | DX |
| BL-05 | 5-Minute Onboarding & Playground | High | S | DX/Growth |
| BL-06 | Custom Model Upload & Deployment | High | L | Feature |
| BL-07 | Uptime SLA with Health Webhooks | High | S | Infra |
| BL-08 | Multi-Model Prompt Playground | Medium | M | DX/Growth |
| BL-09 | Team Workspaces with RBAC | Medium | L | Feature |
| BL-10 | GPU Autoscaling with Warm Instances | Medium | L | Infra |

**Recommended sprint 1 focus (first 2 weeks):**
BL-03 (OpenAI compatibility) + BL-05 (onboarding) + BL-07 (status page) — highest ratio of impact to effort, unblocks developer acquisition.
