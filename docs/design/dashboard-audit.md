# Dashboard Audit: Cloudach vs Vercel/Stripe Quality Bar

April 2026 — Product Designer review

---

## Methodology

Audited each dashboard screen against Vercel (vercel.com/dashboard) and Stripe (dashboard.stripe.com) as the quality benchmark for developer tools. Focus areas: information hierarchy, empty states, onboarding clarity, interaction quality, data visualization, and brand consistency.

---

## Score Summary

| Area | Current Score | Target |
|---|---|---|
| Information hierarchy | 6/10 | 9/10 |
| Empty states | 3/10 | 8/10 |
| Onboarding | 4/10 | 9/10 |
| Data visualization | 4/10 | 8/10 |
| Interaction quality | 6/10 | 9/10 |
| Brand consistency | 7/10 | 9/10 |
| Navigation clarity | 7/10 | 9/10 |
| **Overall** | **5.3/10** | **8.7/10** |

---

## Top 10 Issues (Prioritized)

### #1 — Onboarding flow is a dismissible banner, not a workflow `CRITICAL`

**Current state:** After signup, users land on `/dashboard?welcome=1` which shows a dismissible banner with 3 text steps. Once dismissed it's gone — there's no way to recover it.

**Vercel/Stripe standard:** Stripe has a persistent "Get started" checklist in the left sidebar with checkmarks that fill in as tasks complete. Vercel shows an onboarding wizard on the projects page with progress percentage. Both survive page reload and can be resumed.

**Impact:** First-time users bounce because they don't know their next action. This is the single highest-impact design change.

**Fix:** See `docs/design/onboarding-flow.md` for full spec. Short version: replace the banner with a persistent progress checklist stored in the DB (already have a `/api/auth/me` endpoint to hang state on). Show checklist in sidebar until all 3 steps complete.

---

### #2 — Empty states use emoji instead of structured UI `HIGH`

**Current state:** Usage chart empty state: `📊` emoji, "No usage yet", plain text. API Keys and Models pages likely have similar patterns.

**Vercel/Stripe standard:** Empty states use 24–48px SVG illustrations or icon-in-circle motifs, a clear heading, a one-sentence description, and always a primary action button ("Deploy a model", "Create API key").

**Impact:** Emoji feel low-fidelity in a developer tool. Empty state is often the first thing new users see — it sets quality expectations immediately.

**Fix:**
- Replace all emoji with 32px SVG icons (can be inline, no library needed)
- Add a visible CTA button in every empty state
- Example structure:
```jsx
<div className="db-empty">
  <IconChartBar className="db-empty-icon" />
  <div className="db-empty-title">No usage yet</div>
  <div className="db-empty-desc">Make your first API request to see data here.</div>
  <Link href="/dashboard/models">
    <button className="db-btn db-btn--primary" style={{ marginTop: 16 }}>
      Deploy a model
    </button>
  </Link>
</div>
```

---

### #3 — Usage chart is too small and non-interactive `HIGH`

**Current state:** Chart container is 80px tall — too small for any meaningful visualization. No Y-axis labels. No hover tooltips. No date range selector. No total tokens shown.

**Vercel/Stripe standard:** Vercel bandwidth charts are ~200px tall with clear Y-axis values, hover tooltips showing exact values, and a date range dropdown (7d / 30d / 90d). Stripe revenue charts show daily/weekly/monthly toggles.

**Impact:** The "Token usage" card currently communicates almost no information. It exists but doesn't help.

**Fix (phased):**
- **Phase 1 (this sprint):** Increase chart height from 80px to 160px. Add hover tooltip with exact token count. Add total at top right of card header.
- **Phase 2 (next sprint):** Add 7d/30d date range toggle. Distinguish prompt vs completion tokens with two colors.

CSS change: `.db-chart { height: 160px; }` (currently 80px)

---

### #4 — Stat cards lack trend indicators `HIGH`

**Current state:** Stat cards show current values only. No comparison to previous period.

**Vercel/Stripe standard:** Every key metric card shows a percentage change vs the prior period with a green up-arrow or red down-arrow. Even if the change is +0%, it's shown. This gives operators immediate context.

**Fix:**
- Add `trend` prop to `StatCard` component: `{ direction: 'up' | 'down' | 'neutral', pct: '12%' }`
- API change needed: `GET /api/dashboard/stats` should return `requestsTodayDelta`, `totalTokensDelta`, `costDelta` (% change vs prior period)
- UI: small badge below stat value: `↑ 12% vs yesterday` in green, `↓ 5%` in red

Stat card with trend:
```
[REQUESTS TODAY]
1,240
↑ 12% vs yesterday  ← new
API calls in the last 24h
```

---

### #5 — No global search or command palette `MEDIUM`

**Current state:** No search anywhere in the dashboard.

**Vercel/Stripe standard:** Both have `Cmd+K` command palettes. Vercel: navigate to any project, deployment, domain. Stripe: search for any customer, payment, invoice by ID or email instantly.

**Impact:** As users accumulate API keys and model deployments, navigation becomes painful. This is a retention issue more than an acquisition issue.

**Fix (Phase 2):** Add a `Cmd+K` handler that opens a modal with fuzzy search over: API keys (by name), models (by name), nav pages. This is ~1 day of engineering work. For now, add a visible search icon in the sidebar header as a placeholder.

---

### #6 — API key creation lacks "shown once" UX `MEDIUM`

**Current state:** After creating an API key, the key is shown inline in the table row or a reveal box. The warning that it won't be shown again is present but styled as small text.

**Vercel/Stripe standard:** Stripe shows the new secret key in a dedicated modal step with a bright yellow/orange banner: "Secret key will only be displayed once — copy it now." The key is in a large monospace box with a prominent "Copy" button. You cannot dismiss the modal without acknowledging.

**Fix:**
- After key creation, show a modal (not inline) with the key
- Modal header: "Copy your API key" in a warning-styled banner
- Key in large `db-key-value` box with auto-copy on click
- "I've saved this key" checkbox required before "Done" button enables
- Implementation: modify `pages/dashboard/api-keys.jsx` modal post-create step

---

### #7 — No activity or audit log `MEDIUM`

**Current state:** The dashboard overview shows stats and a usage chart, but no feed of recent activity.

**Vercel/Stripe standard:** Stripe's dashboard home shows "Recent activity" — last 5 transactions/events. Vercel shows "Recent deployments" on the projects list. Both give operators immediate situational awareness.

**Fix (Phase 2):** Add a "Recent API requests" table to the overview page — last 10 requests showing timestamp, model, tokens, status. This needs a `GET /api/dashboard/recent-requests` endpoint.

---

### #8 — Models page doesn't distinguish deployed vs available `MEDIUM`

**Current state:** All models show the same card layout. Deployed models have an "Active" badge but the visual hierarchy doesn't emphasize the distinction.

**Vercel/Stripe standard:** Vercel clearly separates "Your deployments" from "Available frameworks". Stripe separates "Live" from "Test" mode with a prominent toggle.

**Fix:**
- Add a "Deployed" section above an "Available" section on the Models page
- If no models deployed, show the available section with a prominent CTA
- Deployed models get a left-border highlight in `--color-success`

---

### #9 — No breadcrumbs or workspace context header `LOW`

**Current state:** Each page shows its title ("Overview", "API Keys") but no breadcrumb trail and no workspace/organization context.

**Vercel/Stripe standard:** Vercel shows org > project > environment. Stripe shows account name in the header. Users always know where they are.

**Fix:** Add org name and plan tier to the sidebar below the logo:
```
cloudach
[FREE PLAN]  ← small badge
```
This requires a `plan` field in the user/org API response.

---

### #10 — Dashboard shell has no mobile layout `LOW`

**Current state:** `globals.css` has responsive breakpoints for the marketing site but `dashboard.css` has no `@media` rules. The sidebar has no collapse mechanism. On mobile, the dashboard is completely broken — sidebar takes ~40% of width.

**Vercel/Stripe standard:** Both collapse sidebar to icon-only on tablet, hamburger on mobile.

**Fix:**
```css
@media (max-width: 768px) {
  .db-shell { flex-direction: column; }
  .db-sidebar { width: 100%; min-height: auto; height: auto; flex-direction: row; }
  .db-nav { flex-direction: row; padding: 8px; overflow-x: auto; }
  .db-nav-item span { display: none; } /* icon-only on mobile */
}
```
This is a ~30 min engineering fix that meaningfully expands the addressable audience.

---

## Brand Consistency Issues

1. **Logo mark** — The SVG polygon logo in `Logo.jsx` is used consistently. Good.
2. **Color naming** — The codebase uses hardcoded hex values throughout. No CSS custom properties. Risk of drift as the product grows. **Fix: add `:root` token block — see `design-system.md`.**
3. **Font loading** — Inter is loaded from Google Fonts with no `font-display: swap`. On slow connections the text is invisible until the font loads. **Fix: add `&display=swap` to the Google Fonts URL** (already present in `globals.css` — good).
4. **Marketing ↔ Dashboard consistency** — Marketing uses `.btn-solid` / `.btn-cta`; dashboard uses `.db-btn`. These have slightly different border-radii (8px vs 9px) and padding. Should unify to one button component across both.

---

## Quick Wins (Can ship this week)

| Issue | Effort | Impact |
|---|---|---|
| CSS custom properties / design tokens | 1h | High — unblocks consistency at scale |
| Increase chart height 80px → 160px | 15m | Medium — immediate readability gain |
| Replace emoji empty states with SVG | 2h | High — quality perception |
| Persistent onboarding checklist | 1 day | Critical — retention |
| Mobile sidebar layout | 1h | Medium — expands reach |
| "Shown once" API key modal | 2h | Medium — trust/security signal |
