# Dashboard Audit — Cloudach vs Vercel/Stripe Quality Bar

> April 2026 · Auditor: Product Designer

---

## Audit Methodology

Evaluated the Cloudach dashboard against two reference benchmarks:

- **Vercel Dashboard** — benchmark for developer tooling UX: clean information hierarchy, excellent empty states, skeleton loading, inline feedback, polished data visualization
- **Stripe Dashboard** — benchmark for data-dense developer products: table quality, filtering, toast notifications, destructive action safety, responsive design

Pages audited: Overview, API Keys, Models, Usage, Settings, Login, Sign-up

---

## Summary Score

| Dimension | Score | Notes |
|---|---|---|
| Visual hierarchy | 7/10 | Typography and spacing are solid; stat cards are clear |
| Loading states | 3/10 | "Loading…" text throughout; no skeletons |
| Empty states | 4/10 | Present but use emoji, no actionable CTAs |
| Destructive action safety | 3/10 | `window.confirm()` is not production-quality |
| Feedback / notifications | 4/10 | No toast system; key creation lacks success signal |
| Data visualization | 4/10 | Usage chart is too minimal (80px, no labels) |
| Responsive design | 2/10 | Dashboard shell has no mobile breakpoints |
| Font loading | 6/10 | JetBrains Mono referenced but not loaded from Google Fonts |
| Navigation UX | 7/10 | Sidebar is clean; active state slightly weak |
| Consistency | 8/10 | Design tokens are well applied throughout |

**Overall: 5.2/10** — A solid foundation that needs polish work before it reaches the Vercel/Stripe quality bar.

---

## Top 10 Design Issues (Prioritized)

---

### Issue #1: No skeleton loading states

**Priority: Critical**  
**Affects:** All dashboard pages (Overview, API Keys, Usage, Models, Settings)

**Current behavior:**  
All async-loaded content renders a plain text "Loading…" string while data is fetched. This causes layout shift when content appears and signals an unfinished product.

**Vercel/Stripe behavior:**  
Both use skeleton screens — placeholder shapes that mirror the real layout — so the page feels instant even when data is slow.

**Fix:**  
Create a `<Skeleton />` component with a shimmer animation. Replace all `loading ? <p>Loading…</p>` patterns with skeleton layouts that match the actual content shape.

```jsx
// Stat card skeleton
<div className="db-stat-card">
  <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 12 }} />
  <div className="skeleton" style={{ height: 28, width: 100, marginBottom: 6 }} />
  <div className="skeleton" style={{ height: 10, width: 60 }} />
</div>
```

**Effort:** Medium — 1 component + 5 page updates

---

### Issue #2: `window.confirm()` for destructive actions

**Priority: Critical**  
**Affects:** API Keys page (Revoke action)

**Current behavior:**  
```js
if (!confirm('Revoke this key? This cannot be undone.')) return;
```
Browser-native `confirm()` dialogs are unstyled, block the main thread, and are inconsistent across browsers. Stripe and Vercel never use them.

**Fix:**  
Replace with an inline confirmation modal:

```
[Revoke] button click
  → Opens modal: "Revoke key 'Production server'?"
  → Body: "This cannot be undone. Any request using this key will be rejected immediately."
  → Actions: [Cancel] [Revoke key] (danger variant)
```

**Effort:** Small — add `RevokeConfirmModal` component

---

### Issue #3: No toast/notification system

**Priority: Critical**  
**Affects:** API Keys (key creation), Models (deployment), Settings (save)

**Current behavior:**  
After creating an API key, the only feedback is the key reveal box appearing in place. There's no global success confirmation. If an action fails after initial load (e.g., a network error when creating a key), the error appears inline in a modal but disappears when the modal closes.

**Fix:**  
Implement a `<Toast />` system with a context provider:
- Success toast: "API key created" with 4s auto-dismiss
- Error toast: persistent until dismissed, with error message
- Position: bottom-right, 16px from viewport edge

**Effort:** Medium — Toast component + provider + hook

---

### Issue #4: Usage chart is too minimal

**Priority: High**  
**Affects:** Overview page, Usage page

**Current behavior:**  
The bar chart is 80px tall with no Y-axis labels, no tooltip component (uses native browser `title` attribute), and no time range selector. Compare to Vercel's analytics chart which shows precise values on hover and allows switching between 24h / 7d / 30d views.

**Fix:**
1. Increase chart height to 180–200px
2. Add Y-axis labels (formatted token counts at 0%, 50%, 100% of max)
3. Replace native `title` tooltip with a styled `<ChartTooltip />` component that appears on hover
4. Add a time range toggle: 7d / 30d / 90d (query param based)
5. Add a trend line or horizontal average line

**Effort:** Medium-High — Chart component refactor

---

### Issue #5: Stat cards lack trend indicators

**Priority: High**  
**Affects:** Overview page, Usage page

**Current behavior:**  
Stat cards show a label, value, and static subtitle. There's no indication of whether metrics are improving or worsening. Vercel and Stripe both show percentage change vs. prior period next to key metrics.

**Fix:**  
Add a `trend` prop to StatCard:
```jsx
<StatCard
  label="Requests Today"
  value="1,240"
  sub="API calls in the last 24h"
  trend={{ delta: 23, direction: 'up' }}   // "+23% vs yesterday"
/>
```

Render as a small colored chip: `↑ 23%` in green or `↓ 8%` in red.

**Effort:** Small — API change + component update

---

### Issue #6: JetBrains Mono is referenced but not loaded

**Priority: High**  
**Affects:** Code blocks on API Keys page, dashboard code hints, endpoint URLs

**Current behavior:**  
`dashboard.css` references `'JetBrains Mono', 'Fira Code', 'Courier New'` but only Inter is imported from Google Fonts in `globals.css`. The browser falls back to Fira Code or Courier New. Code blocks look inconsistent between marketing and dashboard.

**Fix:**  
Update the Google Fonts import in `_app.jsx` (or `_document.jsx`):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

**Effort:** Trivial — one line change

---

### Issue #7: No mobile layout for the dashboard shell

**Priority: High**  
**Affects:** All dashboard pages on screens < 768px

**Current behavior:**  
The dashboard uses a fixed 220px sidebar + flex main layout with no responsive breakpoints. On a phone or narrow tablet, the sidebar overflows and content is inaccessible.

**Fix:**  
Two-phase responsive approach:
1. **Tablet (< 900px):** Collapse sidebar to 64px icon-only rail. Show label on hover (tooltip).
2. **Mobile (< 640px):** Hide sidebar entirely. Add a hamburger button in a top bar that opens a drawer overlay.

CSS breakpoints to add to `dashboard.css`:
```css
@media (max-width: 900px) {
  .db-sidebar { width: 64px; }
  .db-sidebar-brand, .db-user-email { display: none; }
  .db-nav-item span { display: none; }
  .db-nav-item { justify-content: center; padding: 12px; }
}

@media (max-width: 640px) {
  .db-sidebar { display: none; }
  /* Add mobile top bar */
}
```

**Effort:** Medium — CSS additions + optional drawer component

---

### Issue #8: Usage log table has 9 columns with no filtering

**Priority: Medium**  
**Affects:** Usage page

**Current behavior:**  
The usage log shows 9 columns (Time, Model, Prompt tokens, Completion tokens, Total, Cost, Latency, Status, Key) for up to 50 rows with no filtering, sorting, or pagination. On a 1280px screen some columns are cramped.

**Fix:**
1. Reduce to 6 primary columns: Time, Model, Total tokens, Cost, Latency, Status
2. Expand row on click to show full details (prompt/completion token split, key name)
3. Add column header sorting (client-side for ≤50 rows)
4. Add simple filter: model selector + status filter
5. Add "Load more" button if `hasMore` returned from API

**Effort:** Medium

---

### Issue #9: Empty states use emoji instead of SVG illustrations

**Priority: Medium**  
**Affects:** Overview (usage chart), API Keys (no keys), Usage (no logs), Models (no deployments)

**Current behavior:**  
Empty states display emoji icons (📊, 🔑, 📡) with plain text. Stripe and Vercel use purpose-designed SVG illustrations that communicate the empty state's meaning at a glance.

**Fix:**  
Create a standardized `<EmptyState />` component:
```jsx
<EmptyState
  icon={<IconApiKey />}           // 48px SVG
  title="No API keys yet"
  description="Create a key to authenticate your first request."
  action={{ label: 'Create key', onClick: () => setShowCreate(true) }}
/>
```

Design 4 SVG illustrations: chart-empty, key-empty, log-empty, model-empty. Each should be ~48×48px, using `--color-rule` and `--color-subtle` colors.

**Effort:** Medium — 4 SVG illustrations + EmptyState component

---

### Issue #10: Navigation active state has weak visual weight

**Priority: Low**  
**Affects:** All dashboard pages — sidebar nav

**Current behavior:**  
Active nav item uses `background: rgba(79, 110, 247, 0.20)` which is very subtle on the dark sidebar. The active item looks almost the same as a hovered item. Vercel uses a solid white pill; Stripe uses a solid slightly-lighter dark background with left border accent.

**Fix (recommended):**  
Use a left border accent for the active state:
```css
.db-nav-item--active {
  background: rgba(79, 110, 247, 0.15);
  color: #ffffff;
  border-left: 2px solid #4F6EF7;
  padding-left: 10px;  /* compensate for border */
}
```

This provides a clear visual anchor without being heavy-handed.

**Effort:** Trivial — 4 CSS lines

---

## Implementation Roadmap

### Sprint 1 — Critical (Week 1)
- [ ] Issue #1: Skeleton loading states
- [ ] Issue #2: Replace `window.confirm()` with modal
- [ ] Issue #3: Toast notification system
- [ ] Issue #6: Load JetBrains Mono (trivial, do immediately)

### Sprint 2 — High (Week 2)
- [ ] Issue #4: Usage chart improvements
- [ ] Issue #5: Stat card trend indicators
- [ ] Issue #7: Responsive dashboard shell

### Sprint 3 — Polish (Week 3)
- [ ] Issue #8: Usage log table filtering
- [ ] Issue #9: SVG empty state illustrations
- [ ] Issue #10: Active nav state refinement

---

## Positive Observations (What to Preserve)

- **Color consistency is excellent** — `#4F6EF7` accent is applied correctly throughout
- **Typography hierarchy is solid** — Inter at the right weights, correct letter-spacing on headings
- **Card and table patterns are clean** — the `db-card` / `db-table` pattern is consistent
- **The welcome/quickstart banner is a great pattern** — the 3-step guide on first signup is exactly right; it just needs persistence
- **API key reveal pattern is correct** — showing the key once with copy is the Stripe-standard pattern
- **Sidebar structure is well-designed** — logo, nav, user footer is the right hierarchy
