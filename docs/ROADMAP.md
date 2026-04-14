# Cloudach — Post-Launch Product Roadmap

**Date:** 2026-04-14
**Author:** Head of Product
**Version:** 1.0
**Horizon:** Launch + 30 days

---

## 1. Product Audit — Current State

The following has shipped and is live as of this writing:

| Area | Status | Notes |
|------|--------|-------|
| Homepage | ✅ Done | Social proof, testimonials, hero, features, models, pricing sections, CTA |
| Pricing page | ✅ Done | 3-tier comparison (Free / Pro / Enterprise), per-model rates table, interactive cost calculator |
| Status page | ✅ Done | Real-time service status, 90-day uptime bars, SLA table, incident history |
| Auth (login / signup) | ✅ Done | Email+password auth, JWT session, signup-to-dashboard redirect |
| Dashboard — Overview | ✅ Done | Stats cards, 7-day token chart, onboarding checklist |
| Dashboard — Usage | ✅ Done | Request log list, daily chart, 50-request view |
| Dashboard — API Keys | ✅ Done | Key creation with per-key RPM limit, revoke, copy-on-create |
| Dashboard — Models | ✅ Done | Model catalog with specs and status |
| Dashboard — Settings | ✅ Done | Profile, billing info, account deletion |
| Dashboard — Team | 🚧 In progress | DB schema shipped; UI scaffolded but not complete |
| Monitoring & logging | ✅ Done | Structured logging, Prometheus metrics, alerting rules |
| Performance | ✅ Done | Font self-hosting, HTTP caching, lazy loading |
| API docs — Errors | ✅ Done | Full error reference with examples |
| API docs — Rate limits | ✅ Done | Rate limit docs, headers, retry guidance |
| Integration guides | ✅ Done | LangChain, LlamaIndex |
| Model catalog | ✅ Done | 6 models: Llama 3 8B/70B/3.1, Mistral 7B, Mixtral 8×7B, Command R+, DBRX |
| E2E tests | ✅ Done | Auth, homepage, API keys (Playwright) |
| SDK — Python | 🚧 In progress | Scaffolded, not published |
| SDK — Node.js | 🚧 In progress | Scaffolded, not published |
| Fine-tuning docs | 🚧 In progress | Draft exists, not linked from nav |

---

## 2. Feature Gap Analysis — Top 10

Issues rated by impact on developer acquisition and retention, ordered by launch priority.

### Gap 1 — No interactive API playground
**Why it matters:** Every competitor (Together, Fireworks, Replicate) offers a browser-based playground. Developers who can't try a model without setting up an API key drop off. This is the highest-leverage activation tool.
**Effort:** Medium (M)
**Category:** DX / Activation

### Gap 2 — Request log viewer with prompt + response detail
**Why it matters:** The usage page shows aggregate stats but no individual request detail. Developers debugging production issues have zero visibility into what was sent and received. "Stripe-level" observability is the single most-requested feature in developer tools.
**Effort:** Medium (M)
**Category:** DX

### Gap 3 — Per-API-key spend tagging and cost attribution
**Why it matters:** Developers and PMs can't tell which feature is spending money. All usage rolls into one bill. This is the #1 frustration among the 10 developer interviews conducted: "I need to know which feature is costing me money."
**Effort:** Medium (M)
**Category:** Feature / Billing

### Gap 4 — OpenAI API full compatibility verification and test suite
**Why it matters:** Claiming OpenAI compatibility without a validated test suite is a trust liability. Any deviation in error shapes, streaming format, or parameter names forces developers to write adapters and makes Cloudach feel unreliable. This gap is invisible until it causes a production incident.
**Effort:** Small (S)
**Category:** Infra / DX

### Gap 5 — SDK publication (Python + Node.js)
**Why it matters:** The SDKs are scaffolded but not published to PyPI or npm. Every developer who lands on the docs and sees `pip install cloudach` returning a 404 immediately switches to raw HTTP. SDKs are table stakes for a developer platform.
**Effort:** Small (S)
**Category:** DX

### Gap 6 — Health webhooks for incident notifications
**Why it matters:** The status page is live, but SREs cannot integrate Cloudach incidents into their alerting stacks (PagerDuty, OpsGenie, Slack). Without programmatic notification, enterprise teams cannot justify SLA commitments downstream of Cloudach.
**Effort:** Small (S)
**Category:** Infra

### Gap 7 — Team workspaces UI completion
**Why it matters:** The DB schema is shipped and the team pages are scaffolded, but the invite flow, role management, and shared billing are not wired. The Pro plan promises team features; shipping the plan without them creates support tickets on day one.
**Effort:** Medium (M)
**Category:** Feature

### Gap 8 — Programmatic API key management
**Why it matters:** There is no `POST /v1/keys` endpoint. CI/CD pipelines, multi-tenant SaaS products, and automated provisioning require programmatic key creation. Dashboard-only key management blocks the enterprise sale.
**Effort:** Small (S)
**Category:** DX / Infra

### Gap 9 — Custom model upload and deployment
**Why it matters:** ML engineers who fine-tune models have no alternative to self-hosting. This is Cloudach's highest-differentiation feature — "upload a safetensors checkpoint and have it live in 5 minutes" — but it is not yet shipped.
**Effort:** Large (L)
**Category:** Feature / Competitive

### Gap 10 — Local development mode without Docker
**Why it matters:** The API gateway requires Postgres + Redis to start. Frontend developers, open-source contributors, and CI environments without Docker cannot run the stack. This creates friction for contributors and internal teams.
**Effort:** Small (S)
**Category:** DX / Infra

---

## 3. Prioritized Roadmap

### Must-Have — Pre-Launch Gate

These ship before public launch is announced. Without them, launch creates a negative first impression or a broken promise.

| # | Feature | Gap | Effort | Owner |
|---|---------|-----|--------|-------|
| 1 | OpenAI API compatibility test suite | Gap 4 | S | Engineering |
| 2 | SDK publication — PyPI + npm | Gap 5 | S | Engineering |
| 3 | Team workspaces UI — invite + roles | Gap 7 | M | Engineering |
| 4 | Health webhooks for incidents | Gap 6 | S | Engineering |
| 5 | Local dev mode (`MOCK_MODE=true`) | Gap 10 | S | Engineering |

**Rationale:** Items 1–2 are trust signals that must exist before any press coverage sends traffic. Item 3 is promised on the Pro plan page. Items 4–5 unblock enterprise evaluation and contributor onboarding.

---

### Should-Have — Week 1 Post-Launch

Ship within the first 7 days. These drive activation and retention for the first wave of users.

| # | Feature | Gap | Effort | Owner |
|---|---------|-----|--------|-------|
| 6 | Interactive API playground in dashboard | Gap 1 | M | Engineering + Design |
| 7 | Request log viewer (prompt + response + cost) | Gap 2 | M | Engineering |
| 8 | Programmatic API key management | Gap 8 | S | Engineering |

**Rationale:** The playground is the highest-leverage activation tool — it turns a sign-up into a first inference call without writing code. The log viewer converts users from "evaluate" to "debug and ship." Programmatic keys unblock the first enterprise integrations.

---

### Nice-to-Have — Month 1

Ship within 30 days of launch. These build the moat and expand the addressable market.

| # | Feature | Gap | Effort | Owner |
|---|---------|-----|--------|-------|
| 9 | Per-API-key spend tagging and cost attribution | Gap 3 | M | Engineering |
| 10 | Custom model upload and deployment | Gap 9 | L | Engineering |

**Rationale:** Cost attribution becomes critical as usage grows — the pain is real but tolerable for the first cohort. Custom model deployment is the long-term differentiator; the engineering investment is large enough to plan across multiple sprints.

---

## 4. Launch Success Metrics

Five key metrics to define launch success. Targets are set for the 30-day post-launch window.

| # | Metric | Definition | 30-Day Target | Measurement |
|---|--------|-----------|--------------|-------------|
| M1 | **Time to first API call (TTFC)** | Median minutes from account creation to first successful inference response | ≤ 5 minutes | API gateway logs: `min(first_inference_at - created_at)` per user |
| M2 | **7-day activation rate** | % of signups that make ≥1 API call within 7 days of signup | ≥ 60% | Cohort analysis: `users_with_call_in_7d / signups` per weekly cohort |
| M3 | **Weekly Active API Keys (WAAK)** | Unique API keys making ≥1 request in a rolling 7-day window | ≥ 50 by end of month | Dashboard usage analytics |
| M4 | **API call volume growth** | Week-over-week growth in total API requests | ≥ 20% WoW | API gateway metrics |
| M5 | **Developer NPS** | Net Promoter Score from in-app survey (shown at day 14 post-signup) | Establish baseline; target ≥ 40 | In-app survey: "How likely are you to recommend Cloudach?" (0–10) |

**Instrumentation checklist before launch:**
- [ ] Signup timestamp stored in user record
- [ ] First inference timestamp stored per user (or derivable from logs)
- [ ] API key activity queryable by key and date range
- [ ] In-app NPS survey scheduled for day 14 post-signup
- [ ] Weekly metrics review cadence established (Product + Engineering)

---

## 5. Competitive Positioning

### Landscape

| Competitor | Strength | Weakness |
|-----------|----------|----------|
| **Together AI** | Wide model selection, fine-tuning, fast iteration | Opaque billing, no per-team key isolation, UI is secondary to API |
| **Fireworks AI** | Best-in-class inference speed, solid pricing | Complex pricing model, limited DX tooling, limited observability |
| **Replicate** | Easiest model discovery, large community | No persistent deployment — pay-per-run only; expensive for sustained traffic |

### Cloudach's #1 Differentiator

**Developer-owned cost control with full observability.**

While Together AI and Fireworks optimize for raw inference speed, and Replicate optimizes for model variety, Cloudach's wedge is the one thing no competitor does well: giving developers complete, real-time visibility into what they're spending and the controls to manage it.

Specifically:
- **Per-API-key rate limits you set** — not quotas imposed by the provider
- **Per-request cost tagging** (`x-cloudach-tag: feature:summarize`) — see exactly which product feature is spending money
- **Request log viewer** — every prompt, every response, every cost, for 30 days
- **Spend alerts and per-key budget caps** — no surprise bills

The positioning statement: *"Cloudach gives ML teams the inference performance of Fireworks, the model breadth of Together, and the cost transparency that none of them offer."*

This differentiator is also a **moat**: once a team has wired cost attribution into their observability pipeline, switching costs are high.

### Proof points to establish by launch
1. Publish a side-by-side benchmark: Cloudach vs. Together vs. Fireworks on latency (p50, p95, p99) for Llama 3 70B — using the existing `docs/benchmark-report-2026-04.md` data
2. Write a "5-minute migration from OpenAI" guide that demonstrates zero code changes needed
3. Build a cost calculator that shows annual savings vs. Together AI for a 1B token/month workload

---

## 6. Sprint Plan (Weeks 1–4)

### Week 1 (pre-launch gate)
- [ ] OpenAI compatibility test suite: run official SDK against staging, document results
- [ ] Publish Python SDK to PyPI (`cloudach-python`)
- [ ] Publish Node.js SDK to npm (`@cloudach/sdk`)
- [ ] `MOCK_MODE=true` env var in API gateway

### Week 2 (finish pre-launch + begin Week 1 features)
- [ ] Team workspace UI: invite by email, role selection (admin / developer / viewer)
- [ ] Health webhooks: `POST /v1/webhooks` for incident events
- [ ] Interactive playground: model selector, prompt input, live response, token/cost display

### Week 3 (Week 1 post-launch features)
- [ ] Request log viewer: list + detail view, search by key/model/status
- [ ] Programmatic API keys: `POST /v1/keys`, `GET /v1/keys`, `DELETE /v1/keys/:id`
- [ ] NPS survey: in-app trigger at day 14 post-signup

### Week 4 (Month 1 features begin)
- [ ] Per-API-key spend tagging: `x-cloudach-tag` header ingestion + dashboard filter
- [ ] Spend alerts and per-key budget cap (email notification at 80%)
- [ ] Begin custom model upload: presigned S3 URL flow + vLLM health check

---

## 7. Open Questions

1. **Fine-tuning docs:** The draft at `docs/fine-tuning.md` is not linked from the nav. Does it ship at launch or week 1?
2. **E2E test coverage:** Current coverage is auth, homepage, API keys. Do we gate launch on dashboard e2e coverage?
3. **Pricing for custom model hosting:** Storage cost, idle GPU cost, and warm-instance pricing are not yet defined. Needs Finance + Engineering input before BL-10.
4. **Data residency:** Enterprise prospects (Yuki, Raj in interview synthesis) require data residency options. Is this month 1 or quarter 2?

---

*This roadmap is a living document. Update at each weekly product review. Major changes require sign-off from Head of Product + CEO.*
