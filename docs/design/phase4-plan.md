# Phase 4 Plan — Dashboard Polish + Persona-Tuned Onboarding

> **Status:** Phase 4 sequencing plan (CEO-owned meta-work; individual polish PRs can be delegated to Designer / Engineer agents).
> **Last updated:** 2026-04-17
> **Inputs:** Operator's 4-phase directive (2026-04-17), `design/DASHBOARD_AUDIT.md` (10-issue audit), `design/DESIGN_SYSTEM.md` (component + token spec), `design/ONBOARDING_FLOW.md` (4-step flow design), current dashboard codebase state.
> **Purpose:** Convert the operator's "Dashboard polish" directive into a sequenced, small-branch PR roadmap and spec the one thing the existing design docs don't cover — persona-tuned onboarding.

---

## 0. Context and what this plan commits to

The operator directive (CLO-1, 2026-04-17) said:
- Onboarding checklist tuned **per persona (indie / startup / business)**.
- Visual polish on key pages: dashboard home, API keys, playground, billing, logs.
- First-run experience: copy-paste quickstart that **succeeds in < 60 seconds**.
- Incremental PRs per page. Not one mega-PR.

**This plan commits Phase 4 to:**
- A sequenced ~15-PR rollout (foundations → per-page polish → persona onboarding → cross-cutting).
- Following `design/DASHBOARD_AUDIT.md` priority order for dashboard polish (audit already did the triage work).
- Following `design/DESIGN_SYSTEM.md` component specs verbatim — engineers implement, not re-design.
- Producing the persona-tuning layer spec in §5 below (not in any existing doc).
- Paused operator checkpoints at two points (§7): after foundations land, and after persona-tuning lands.

**This plan does NOT commit to:**
- Every audit issue shipping in Phase 4. Issue #10 (nav active state, Low priority) and some Sprint 3 items may slip to post-MVP; I'll flag explicitly if so.
- A fixed Phase 4 timeline. Operator said "take your time, depth over speed"; I'll ship small PRs as quality allows.
- Enterprise-tier features (audit log retention tuning, SOC 2 UX, SSO/SCIM) — still out of MVP scope per CLO-1 brief.

---

## 1. Current state inventory (what's shipped vs what's gapped)

Walking the tree and comparing against the three design docs.

### 1.1 Already shipped (Phase 4 does not rebuild these)

- **`components/dashboard/OnboardingChecklist.jsx`** — 3 steps (api-key / deploy-model / first-request), localStorage-dismissable, auto-expands first incomplete step, renders a code snippet on step 3. Persona-agnostic; no server-side persistence.
- **`components/dashboard/useToast.js`** — minimal hook (`[toastEl, showToast]`). Per-component local state, not a provider.
- **`components/dashboard/DashboardLayout.jsx`**, **`ErrorBoundary.jsx`**, **`InviteTeamModal.jsx`**, **`SpendingProgress.jsx`** — exist.
- **Dashboard pages:** `alerts`, `api-keys`, `audit-log`, `billing`, `index` (home), `logs`, `models`, `playground`, `settings`, `team/`, `usage`, `webhooks`. Broader than the directive's 5-page list (home / api-keys / playground / billing / logs).
- **"What's new" banner** on dashboard home pointing at `/changelog`.
- **Design tokens** documented in `design/DESIGN_SYSTEM.md` §2 but **not yet extracted to a `tokens.css` file** — currently inlined across `globals.css`, `dashboard.css`.

### 1.2 Audit gaps still open (from `design/DASHBOARD_AUDIT.md`)

Mapping audit issues to current code confirms:

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | No skeleton loaders | Open | `"Loading…"` text pattern still present across pages |
| 2 | `window.confirm()` for destructive actions | Open — **3 sites** | `pages/dashboard/alerts.jsx:126`, `pages/dashboard/team/index.jsx:145`, `pages/dashboard/api-keys.jsx` (per audit) |
| 3 | Toast notification system | Partial | `useToast.js` hook exists but not a provider-scoped system as `DESIGN_SYSTEM.md §7.9` specifies |
| 4 | Usage chart too minimal (80 px, no labels) | Open | |
| 5 | Stat cards lack trend indicators | Open | |
| 6 | JetBrains Mono referenced but not loaded | Open — **confirmed** | Referenced at `styles/dashboard.css:494,520`; only Inter imported in Google Fonts. Trivial 1-line fix. |
| 7 | No mobile layout for dashboard shell | Open | |
| 8 | Usage log table: 9 columns, no filtering | Open | |
| 9 | Empty states use emoji | Open — `EmptyState.jsx` doesn't exist |
| 10 | Nav active state has weak visual weight | Open | 4-line CSS fix |

### 1.3 Directive-specific gaps (not in any existing design doc)

These are the directive's unique additions. Existing docs are silent on them.

- **Persona tuning of onboarding.** `ONBOARDING_FLOW.md` designs a single 4-step flow for all users. The directive says tune it per persona (indie / startup / business). This plan specs the persona layer in §5.
- **Copy-paste quickstart that succeeds in < 60 seconds.** `OnboardingChecklist.jsx` step 3 already has a code snippet but uses `<your-api-key>` placeholder (user must paste the key manually — adds 20–40 s of friction). `ONBOARDING_FLOW.md §3c` specs auto-filling the first active key; currently unimplemented. §5 addresses this.
- **Persona selector at signup.** Not present today; signup just asks for email + password. §5.1.

### 1.4 Doc consistency issue to flag

Two design system docs exist: `design/DESIGN_SYSTEM.md` (v1.0, canonical per its own preamble) and `docs/design/design-system.md` (older). They don't contradict each other on substance but the duplication risks drift. **Post-Phase 4:** consolidate to one canonical file; for Phase 4, `design/DESIGN_SYSTEM.md` is the source of truth.

---

## 2. Sequencing rationale

Why the order in §3 and not something else.

**Foundations before per-page.** Skeleton / toast-provider / EmptyState / destructive-action modal are referenced across 5+ pages. Shipping them first means the per-page PRs apply a shared component rather than each defining its own. This prevents the "5 different toast implementations" drift that shows up when page polish goes first.

**Persona onboarding after pages.** Persona tuning modifies an already-working onboarding checklist. If the checklist itself needs polish (dismissal logic, server-side persistence), that work should land before persona layering — cleaner diffs.

**Cross-cutting last.** Responsive (Issue #7) and nav active state (Issue #10) touch CSS files that every page depends on. Landing them after per-page polish means we don't have to re-test every page twice.

**Within each group, easiest-first.** Within foundations, JetBrains Mono load is 1 line — ship it first to establish cadence. Within per-page, start with dashboard home (highest-traffic surface, most visible improvement) and fan out from there.

**One concern per PR, per ground rule #2.** Each PR below does one thing. Even where two issues could technically ride together (e.g., stat trend chips + skeleton on dashboard home), they ship separately so operator can approve/reject independently.

---

## 3. PR roadmap

15 planned PRs. Each entry: title, scope (files touched), concern, effort, delegation.

### 3.1 Foundations (6 PRs, operator checkpoint after)

**PR F1 — Load JetBrains Mono via Google Fonts.** *Audit Issue #6.*
- Scope: `pages/_document.jsx` (or `pages/_app.jsx`) — single `<link>` tag addition.
- Effort: **Trivial (XS)** — 1 line.
- Delegation: CEO direct (too small to delegate).

**PR F2 — Extract design tokens to `styles/tokens.css`.** *Per `DESIGN_SYSTEM.md §12`.*
- Scope: new `styles/tokens.css`, updates to `styles/globals.css` and `styles/dashboard.css` to `@import` tokens and replace any hex literals with var(--token).
- Effort: **S (1–2 days)** — mostly mechanical `--color-accent: #4F6EF7` etc.
- Delegation: Engineer sub-issue.

**PR F3 — Ship `components/dashboard/Skeleton.jsx`.** *Audit Issue #1 (component only, no page rollout yet).*
- Scope: new component per `DESIGN_SYSTEM.md §7.8` + shimmer keyframes in `dashboard.css`.
- Effort: **S** — standalone component, no page integration in this PR.
- Delegation: Engineer sub-issue.

**PR F4 — Upgrade toast system to provider-scoped.** *Audit Issue #3.*
- Scope: new `components/dashboard/ToastProvider.jsx` + `useToast.js` upgrade (keep backward-compat API so existing call sites work). Register provider in `DashboardLayout.jsx`.
- Effort: **M (2–3 days)** — provider + queue + transition animations.
- Delegation: Engineer sub-issue.

**PR F5 — Build `components/dashboard/EmptyState.jsx` + first 4 SVG illustrations.** *Audit Issue #9.*
- Scope: new component per `DESIGN_SYSTEM.md §7.10` + 4 purpose-built SVGs (chart-empty, key-empty, log-empty, model-empty) per audit §9.
- Effort: **M** — component is small, illustrations take time.
- Delegation: Designer owns SVGs; Engineer wires component. Single PR.

**PR F6 — Build `components/dashboard/ConfirmModal.jsx` (destructive-action replacement).** *Audit Issue #2, component only.*
- Scope: new modal component per `DESIGN_SYSTEM.md §7.6` + danger variant. **Does NOT touch the 3 `confirm()` call sites yet** — that's in per-page PRs.
- Effort: **S**.
- Delegation: Engineer sub-issue.

**Operator checkpoint 1 after F1–F6.** PR-merge pace allows operator to review the shared-component vocabulary before it gets applied across 5+ pages. If any component needs respec, cheaper to fix here than retrofit after page rollouts.

### 3.2 Per-page polish (6 PRs, all depend on foundations)

**PR P1 — Dashboard home (`pages/dashboard/index.jsx`): apply skeleton, stat trends, chart upgrade.** *Audit Issues #1 (rollout) + #4 + #5.*
- Scope: replace `PageLoader` / "Loading…" on stats + usage chart with `<Skeleton />`. Add `trend` prop to StatCard. Upgrade usage chart to 180 px + y-axis labels + tooltip + time range toggle.
- Effort: **M**.
- Delegation: Designer + Engineer (Designer: chart tooltip styling; Engineer: logic).

**PR P2 — API Keys (`pages/dashboard/api-keys.jsx`): ConfirmModal, toast on create, skeleton.** *Audit Issue #2 site #1 + #3 rollout + #1 rollout.*
- Scope: replace `window.confirm()` with `<ConfirmModal />`. Replace inline success state on key create with toast. Skeleton on key-list load.
- Effort: **S**.
- Delegation: Engineer sub-issue.

**PR P3 — Alerts (`pages/dashboard/alerts.jsx`): ConfirmModal, skeleton.** *Audit Issue #2 site #2.*
- Scope: replace `confirm()` call at line 126. Skeleton on alert-config load.
- Effort: **XS**.
- Delegation: Engineer sub-issue.

**PR P4 — Team (`pages/dashboard/team/index.jsx`): ConfirmModal.** *Audit Issue #2 site #3.*
- Scope: replace `confirm()` call at line 145. Add skeleton if not already present.
- Effort: **XS**.
- Delegation: Engineer sub-issue.

**PR P5 — Logs / Usage (`pages/dashboard/logs.jsx` + `pages/dashboard/usage.jsx`): table filtering, 6-column reduction, row expand.** *Audit Issue #8.*
- Scope: reduce visible columns to 6 (Time / Model / Total / Cost / Latency / Status), move rest to expand-on-click. Add model + status filter. Add "Load more" if `hasMore`.
- Effort: **M**.
- Delegation: Engineer sub-issue.

**PR P6 — Playground + Billing visual polish.** *Directive-named pages, not in audit.*
- Scope: walk both pages, apply `DESIGN_SYSTEM.md` tokens + spacing + typography. Likely includes skeleton on billing invoice list and EmptyState on playground when no model is selected. Audit against the design system checklist; open a follow-up PR per page if the scope grows.
- Effort: **M–L** (may split into P6a / P6b if too broad).
- Delegation: Designer audits + identifies gaps; Engineer implements.

### 3.3 Persona-tuned onboarding (3 PRs, after per-page polish)

These are spec'd in §5.

**PR O1 — Persona selection at signup + user field.** *§5.1.*
- Scope: `pages/signup.jsx` adds a persona picker (3 options, optional — allows skip). DB migration adds `persona TEXT NULL` column to `users`. Backend persists selection.
- Effort: **M** — includes DB migration (first one since PR #2 merged? — verify).
- Delegation: Engineer sub-issue. CEO reviews copy.

**PR O2 — Persona-tuned OnboardingChecklist variants.** *§5.2.*
- Scope: `OnboardingChecklist.jsx` reads `user.persona`, swaps step list based on value. Adds per-persona step variants (see §5.2). Removes localStorage-dismiss (per `ONBOARDING_FLOW.md §3a`) in favor of server-side `onboarding_complete`.
- Effort: **M**.
- Delegation: CEO owns copy + step sequencing per persona; Engineer implements.

**PR O3 — Auto-fill first API key in step 3 code snippet + < 60 s quickstart harness.** *Directive's "copy-paste quickstart that succeeds in < 60 s".*
- Scope: `OnboardingChecklist.jsx` step 3 fetches user's first active API key (if any) and substitutes into the curl example. Adds a "Verify this request works" button that runs the call from the browser and surfaces the result inline (no leaving the dashboard). Updates `ONBOARDING_FLOW.md §3c` to describe the actual shipping behavior.
- Effort: **M**.
- Delegation: Engineer sub-issue. **Operator review required** (new surface: in-browser proxy call through our own backend).

**Operator checkpoint 2 after O1–O3.** Persona tuning is the unique directive ask; checkpoint here to validate the persona mechanic + the < 60 s quickstart experience before cross-cutting polish lands.

### 3.4 Cross-cutting (2 PRs, last)

**PR C1 — Responsive dashboard shell.** *Audit Issue #7.*
- Scope: CSS additions to `dashboard.css` per audit §7; optional drawer component for mobile nav.
- Effort: **M**.
- Delegation: Designer + Engineer.

**PR C2 — Nav active state refinement.** *Audit Issue #10.*
- Scope: 4 CSS lines per audit §10.
- Effort: **Trivial (XS)**.
- Delegation: CEO direct.

---

## 4. Effort-totalled view

Rough estimate to set expectations:

| Group | PRs | Aggregate effort |
|-------|-----|------------------|
| Foundations (F1–F6) | 6 | ~8–12 days |
| Per-page polish (P1–P6) | 6 | ~10–15 days |
| Persona onboarding (O1–O3) | 3 | ~6–10 days |
| Cross-cutting (C1–C2) | 2 | ~3 days |
| **Total** | **17** | **~27–40 days** |

That's 4–6 weeks of sustained work at 1 agent working, less with delegation. The operator's "take your time" framing is compatible; the MVP doesn't need all 17 to land. **Minimum for launch-ready dashboard:** F1, F2, F3, F4, F5, F6, P1, P2, P5 (for P5 logs), O1, O2, O3, C1 — 13 PRs. C2 and P3/P4 are polish that can slip to post-MVP.

---

## 5. Persona-tuning spec (the directive's unique addition)

The existing `ONBOARDING_FLOW.md` specs a single 4-step checklist. This section specs how to branch that into 3 persona variants per operator directive.

### 5.1 Persona selection at signup

**When.** After the user creates their account and before they land on the dashboard welcome state. A single-screen picker (modal or post-signup card) between `/signup` POST success and `/dashboard` redirect.

**What.** Three options + a skip link:
- **"I'm an indie developer"** (subtitle: *"Side projects, prototypes, personal apps"*) → persona = `indie`.
- **"I'm building at a startup"** (subtitle: *"Production app, small team, scaling"*) → persona = `startup`.
- **"I'm running a business product"** (subtitle: *"Customer-facing workload, SLA matters"*) → persona = `business`.
- **Skip link** (*"Not sure yet — I'll decide later"*) → persona = `null`; treat as `indie` for onboarding defaults, let user change it in Settings later.

**Visual spec.** Three vertically-stacked cards matching `DESIGN_SYSTEM.md §7.3` with an icon illustration on each. Clicking a card sets persona and advances to dashboard; no intermediate save button.

**Copy principles.**
- Never use "which persona are you" framing — developers find it grating. Ask what they're building.
- Never use marketing-speak ("transform your workflow"). Plain direct English.

**Data model.** Add `persona VARCHAR(16) NULL CHECK (persona IN ('indie','startup','business'))` to `users`. Nullable because existing users don't have it; Settings page allows selection.

**Settings page.** Add a "What are you building?" field to `pages/dashboard/settings.jsx` (same 3 options + a null option). Persona change retriggers onboarding checklist if user hasn't completed it.

**Skip path.** Users who skip get the `indie` onboarding (simplest, fewest steps). When they complete indie onboarding, surface a one-time "Tell us what you're building" prompt in the dashboard to collect persona retroactively — helps future product-analytics.

### 5.2 Persona-tuned OnboardingChecklist variants

The current 3 steps (API key → deploy model → first request) stay as the **core** for all personas. Persona tuning layers **additional steps before / after the core** that are most relevant to the persona's success path.

**Indie (`persona = 'indie'`):** 3 steps, unchanged from current. Goal: lowest possible friction, fastest first-successful-request.

1. Create an API key
2. Deploy a model (pre-selected: Llama 3.1 8B — cheapest, fastest, covers 80 % of indie use cases)
3. Make your first request (copy-paste curl in browser → see response inline)

**Startup (`persona = 'startup'`):** 5 steps. Goal: set up for production before first deploy to prod.

1. Create an API key — **with tagging hint** (*"Tip: use `x-cloudach-tag` to track per-feature costs later"*)
2. Deploy a model (pre-selected: Llama 3.1 8B, with a callout to "Switch to 70B for harder tasks")
3. Make your first request
4. **Set a monthly spend cap** (new step — deep-links to per-key spend-cap UI from `BL-01`)
5. **Invite a teammate** (new step — opens `InviteTeamModal.jsx`, already built)

**Business (`persona = 'business'`):** 6 steps. Goal: ensure the customer understands SLA / observability / team controls before hitting production scale.

1. Create an API key
2. Deploy a model
3. Make your first request
4. **Enable audit logging** (new step — toggles audit log retention to max; links to `pages/dashboard/audit-log.jsx`)
5. **Set up alerts** (new step — deep-links to `pages/dashboard/alerts.jsx`)
6. **Review your SLA and service credits policy** (new step — links to a new `/docs/sla` page or inline modal; marks complete on "I've read this" click)

**Common UX rules across all personas:**
- The widget shows N steps where N depends on persona. Progress bar scales accordingly.
- Skipping a persona-specific step is allowed (X button on the step row) — but shows a "Are you sure? This helps you avoid [specific problem]" modal first.
- After completing all core steps (first 3), the widget can be collapsed by the user — but persona-specific steps 4+ continue to surface as cards in the main dashboard area until completed.

### 5.3 < 60 s quickstart guarantee

The directive's bar is that a new user can copy-paste the step 3 code and see it succeed in under 60 seconds from signup. Current state: step 3 shows a curl example with `<your-api-key>` placeholder and links to docs. The user has to (a) go create a key, (b) copy it, (c) paste it into the snippet, (d) open a terminal, (e) run the curl. That's closer to 5 minutes than 60 seconds for a new developer.

**Target flow for < 60 s (PR O3):**
1. Signup → dashboard (< 10 s).
2. Step 1 auto-creates a default API key named "Default" on first visit (server-side, invisible to user unless they want to rename it). Step 1 checkmarks automatically.
3. Step 2 pre-selects Llama 3.1 8B and warms the endpoint in the background. User clicks "Deploy" — 5–15 s for the vLLM endpoint to become ready (already within the existing deployment flow).
4. Step 3 shows the curl snippet with the actual API key substituted in. Next to the snippet, a "Try it here" button runs the request from the browser (proxied through our backend to avoid CORS issues) and renders the response inline in < 5 s.

**Server-side work required for O3:**
- Endpoint: `POST /api/onboarding/first-request` — takes a pre-built canned prompt, uses the user's first active key, proxies to our inference API, returns result + latency + token count. **Only callable for users in onboarding state** (prevents abuse as a free inference proxy).
- Auto-create default API key on first dashboard visit if user has zero keys.

**Measuring success.** The `first_request_at` field from `ONBOARDING_FLOW.md §Data Requirements` captures activation; add `signup_at` if not already present; `time_to_first_request = first_request_at - signup_at`. Target: p50 < 60 s for indie persona; < 3 min for startup; < 8 min for business (business has more steps intentionally).

### 5.4 Persona-mediated default copy throughout the dashboard

Small touch but high leverage. Display strings that contain the word "project" for indie, "product" for startup, "workload" for business. Example: the dashboard home greeting subtitle changes:
- Indie: *"Here's how your projects are doing."*
- Startup: *"Here's how your product's inference is performing."*
- Business: *"Here's how your workloads are running today."*

Implementation: a small helper `lib/persona-copy.js` with a getter function keyed on persona. CEO owns the copy file; Engineer wires the helper.

### 5.5 What persona-tuning deliberately does NOT do

To avoid over-engineering:
- **No persona-specific pricing.** Pricing is tier-based, not persona-based. Persona affects onboarding and copy only.
- **No persona-gated features.** All features remain available on all plans; persona changes default visibility and emphasis, never access.
- **No dynamic UI recoloring by persona.** One design system, always. Persona-aware copy / step-order / default-selections only.

---

## 6. Delegation proposal

| Role | PRs they own | Rationale |
|------|--------------|-----------|
| **CEO** (me) | F1, C2; copy/spec for O1–O3; this plan doc; operator checkpoint reviews | Smallest PRs + meta-planning + copy decisions + approvals. |
| **Designer** | SVG illustrations (part of F5); chart tooltip + trend-chip styling (part of P1); mobile drawer component (part of C1); visual QA on all page-polish PRs | Anything requiring pixel judgment or illustration. |
| **Engineer** | F2, F3, F4, F6, P1 logic, P2, P3, P4, P5, P6, O1, O2, O3 backend | Implementation-heavy work. |

**Delegation mechanism.** I'll create Paperclip sub-issues for Engineer / Designer work as each phase becomes ready. Sub-issues will reference this plan's PR ID (F1, P2, etc.) so the chain stays traceable.

**Worktree constraint.** Agents can't edit the same working copy in parallel (per local-board's heartbeat 1 comment). Delegation is therefore sequential: one agent picks up a sub-issue, ships its PR, hands back to me, I delegate the next. Worktree isolation (when it lands) will unblock parallel work and let me fan out.

**Operator review cadence.** Default: every PR gets operator review before merge (per ground rule #1). I won't auto-merge anything.

---

## 7. Operator checkpoints

Two explicit pause points where I'll stop and wait for operator feedback:

**Checkpoint 1 — after F1–F6 foundations land.** The shared components (Skeleton, Toast provider, EmptyState, ConfirmModal) set the vocabulary for 5+ per-page PRs. If any component spec needs revision, cheaper to do it before applying across pages.

**Checkpoint 2 — after O1–O3 persona onboarding lands.** The persona tuning is the directive's unique ask. Once it's shippable end-to-end (pick persona at signup → see tuned checklist → hit < 60 s quickstart), operator should sanity-check that the three personas feel distinct and useful before we move to cross-cutting polish.

**Between checkpoints:** I won't stop-and-ask on every PR. If an audit issue's fix diverges from the existing doc spec, I'll comment on the PR describing what changed and why; operator can push back before merge.

---

## 8. What Phase 4 does NOT do

Explicit scope cuts so this doesn't grow into a mega-phase.

- **No backend architecture changes.** The `first_key_created_at` / `first_model_deployed_at` / `first_request_at` fields on `users` (per `ONBOARDING_FLOW.md`) are lightweight additions, not schema restructuring.
- **No Stripe integration work.** Pricing tiers approved in Phase 3; wiring is a separate sub-issue.
- **No `infra/aws` changes** (still forbidden per operator directive).
- **No SOC 2 / BAA / audit certifications UX.** Business persona onboarding mentions audit logging and SLA but does not imply shipping compliance programs.
- **No marketing surface changes.** Pricing page, homepage, docs marketing — out of scope (marketing budget deferred until post-launch).
- **No docs rewrite.** Existing `docs/quickstart.md`, `docs/errors.md`, etc. stay as-is unless a specific PR touches their referenced surfaces.

---

## 9. Success criteria for Phase 4 as a whole

**Minimum-viable (MVP launch-ready):**
- F1, F2, F3, F4, F5, F6 shipped (shared vocabulary in place).
- P1, P2, P5 shipped (dashboard home, api keys, logs polished).
- O1, O2, O3 shipped (persona onboarding end-to-end, < 60 s quickstart).
- C1 shipped (dashboard works on phone).

**Stretch:**
- P3, P4, P6 shipped (all 5 directive-named pages polished).
- C2 shipped (nav active state refined).

**Metrics to track** (instrumentation in O1/O3):
- p50 time-to-first-request by persona.
- Signup → API-key-created conversion.
- Signup → first-request conversion.
- Onboarding widget dismissal rate (should trend to 0 with persisted completion).

Baseline metrics come from existing customer data once onboarding instrumentation ships (O1 adds the fields); comparison targets per `ONBOARDING_FLOW.md §Success Metrics`.

---

## 10. Sources

- Operator directive on CLO-1, comment `a1ae66ff` (2026-04-17) + approval comment `cde0e00e` (2026-04-17).
- `design/DASHBOARD_AUDIT.md` — 10 audit issues in 3 sprints, referenced by issue number throughout.
- `design/DESIGN_SYSTEM.md` v1.0 — canonical component and token spec.
- `design/ONBOARDING_FLOW.md` — baseline 4-step flow (persona-agnostic).
- `docs/product/backlog.md` — `BL-01` (spend caps, referenced in startup persona step 4), `BL-02`, `BL-04`.
- `components/dashboard/OnboardingChecklist.jsx`, `useToast.js`, `DashboardLayout.jsx`, `SpendingProgress.jsx`, `InviteTeamModal.jsx` — current state.
- Dashboard pages under `pages/dashboard/*` — verified extent of directive's 5-page list + 7 additional pages that exist today.

**Freshness flag.** This plan is current as of 2026-04-17. If per-page polish begins more than 30 days out, re-walk the current-state inventory in §1 to catch drift before sequencing.
