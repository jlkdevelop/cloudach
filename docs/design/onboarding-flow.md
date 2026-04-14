# Onboarding Flow Design

April 2026 — Product Designer

---

## Problem

The current onboarding is a dismissible banner (`db-welcome-banner`) shown once after signup. Once dismissed, there's no recovery path. New users have no persistent signal of what to do next.

Developer-tool benchmarks (Vercel, Stripe, Render, Railway) all use a **persistent onboarding checklist** that lives in the product until completion. This is the single highest-impact design change for new user activation.

---

## Proposed Flow

### Phase 1: Improved Persistent Checklist (Ship First)

Replace the one-time banner with a persistent checklist card at the top of the Overview page. Checklist state persists server-side (or localStorage as a fallback).

#### Three onboarding steps

| Step | Trigger to complete | API signal |
|---|---|---|
| 1. Create an API key | User has ≥1 active API key | `stats.apiKeyCount > 0` |
| 2. Deploy a model | User has ≥1 active model deployment | `stats.activeDeployments > 0` |
| 3. Make your first request | User has ≥1 API request | `stats.totalRequests > 0` |

Completion is detected automatically from existing stats — no new API work needed.

#### Checklist card wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  Get started with Cloudach                          2 of 3 done │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ✓  Create an API key                    [Done — View keys →]   │
│                                                                  │
│  ✓  Deploy a model                       [Done — View models →] │
│                                                                  │
│  ○  Make your first request              [View docs →]          │
│     Use your key to call the API.                               │
│     curl https://api.cloudach.com/v1/chat/completions \         │
│       -H "Authorization: Bearer <your-key>" \                   │
│       -d '{"model":"llama3-8b","messages":[...]}'               │
│                                                                  │
│  [Dismiss checklist]                                             │
└─────────────────────────────────────────────────────────────────┘
```

#### Visual treatment

- Completed steps: checkmark circle (filled `--color-success`), text `--color-text-muted` with strikethrough on label
- Incomplete active step: outlined circle with `--color-brand` ring, text `--color-text-primary`, expanded with description + code snippet
- The currently active step (first incomplete) auto-expands
- Progress fraction shown in card header: "2 of 3 complete"
- A thin `--color-brand` progress bar across the top of the card (0→33→66→100%)
- Once all 3 complete: show a "You're all set 🎉" success state for 24h, then auto-hide

#### Dismiss behavior

- "Dismiss checklist" link at bottom hides the card permanently (stored in localStorage or a `/api/user/preferences` endpoint)
- Should NOT require all steps to be complete — respect the user's intent

---

### Phase 2: Sidebar Progress Indicator

After Phase 1 ships, add a sidebar indicator so the progress is visible even on non-overview pages.

#### Sidebar addition (below nav items, above footer)

```
 ─────────────────
  Get started
  ██████░░░  2/3
 ─────────────────
```

- Small section above sidebar footer, only shown until checklist dismissed
- Progress bar: `--color-brand` fill, `rgba(255,255,255,0.1)` track (on dark sidebar)
- Clicking this navigates to `/dashboard` (overview) where the checklist lives
- Auto-hides once dismissed or all 3 complete

---

### Phase 3: Signup Improvements (Future)

Future improvement to the signup page itself — collect more context to personalize onboarding:

#### Additional fields (optional, shown as step 2 after email/password)

```
┌─────────────────────────────────────────────────────────────────┐
│           Tell us about yourself  (optional — skip →)           │
│                                                                  │
│  What best describes you?                                        │
│  ○ Solo developer    ○ Engineering team    ○ Enterprise          │
│                                                                  │
│  What are you building?                                          │
│  ○ Chatbot / assistant                                           │
│  ○ Code generation                                               │
│  ○ Document processing                                           │
│  ○ Other                                                         │
│                                                                  │
│  [Continue →]  or  [Skip]                                        │
└─────────────────────────────────────────────────────────────────┘
```

Use-case personalization enables:
- Pre-selecting a suggested model on the Models page
- Showing relevant code examples (Python vs cURL vs Node)
- Surfacing the right docs section in the welcome flow

---

## Implementation Spec

### Component: `OnboardingChecklist`

File: `components/dashboard/OnboardingChecklist.jsx`

Props:
```ts
{
  stats: {
    apiKeyCount: number,
    activeDeployments: number,
    totalRequests: number,
  }
}
```

State:
- `dismissed`: boolean — read/write localStorage key `cloudach_onboarding_dismissed`
- `expandedStep`: index of currently expanded step (default: first incomplete)

Steps config:
```js
const STEPS = [
  {
    id: 'api-key',
    title: 'Create an API key',
    description: 'API keys authenticate your requests to the Cloudach API.',
    ctaLabel: 'Go to API Keys',
    ctaHref: '/dashboard/api-keys',
    isComplete: (stats) => stats.apiKeyCount > 0,
  },
  {
    id: 'deploy-model',
    title: 'Deploy a model',
    description: 'Choose from open-source LLMs and deploy a private endpoint.',
    ctaLabel: 'Go to Models',
    ctaHref: '/dashboard/models',
    isComplete: (stats) => stats.activeDeployments > 0,
  },
  {
    id: 'first-request',
    title: 'Make your first request',
    description: 'Call the API with your key and see a response.',
    ctaLabel: 'View docs',
    ctaHref: '/docs',
    codeSnippet: true,  // show curl snippet
    isComplete: (stats) => stats.totalRequests > 0,
  },
];
```

Render logic:
```
if dismissed → return null
if all complete → show success state (24h then auto-dismiss)

completedCount = STEPS.filter(s => s.isComplete(stats)).length
expandedStep = first incomplete step

return (
  <OnboardingCard>
    <ProgressBar value={completedCount / STEPS.length} />
    <CardHeader>
      Get started with Cloudach
      <span>{completedCount} of {STEPS.length} done</span>
    </CardHeader>
    {STEPS.map(step => <StepRow expanded={step.id === expandedStep.id} ... />)}
    <DismissLink onClick={() => setDismissed(true)}>Dismiss checklist</DismissLink>
  </OnboardingCard>
)
```

### CSS additions (dashboard.css)

```css
/* Onboarding checklist */
.db-onboarding-card {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.db-onboarding-progress {
  height: 3px;
  background: #E5E7EB;
  border-radius: 3px 3px 0 0;
}

.db-onboarding-progress-fill {
  height: 100%;
  background: #4F6EF7;
  border-radius: inherit;
  transition: width 0.4s ease;
}

.db-onboarding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 16px;
  border-bottom: 1px solid #F3F4F6;
}

.db-onboarding-title {
  font-size: 14px;
  font-weight: 600;
  color: #0D0F1A;
}

.db-onboarding-count {
  font-size: 12px;
  color: #9CA3AF;
}

.db-onboarding-step {
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
}

.db-onboarding-step:last-of-type {
  border-bottom: none;
}

.db-onboarding-step-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
}

.db-onboarding-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #E5E7EB;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.db-onboarding-check--done {
  background: #10B981;
  border-color: #10B981;
}

.db-onboarding-check--active {
  border-color: #4F6EF7;
}

.db-onboarding-step-label {
  font-size: 13.5px;
  font-weight: 500;
  color: #0D0F1A;
  flex: 1;
}

.db-onboarding-step-label--done {
  color: #9CA3AF;
  text-decoration: line-through;
}

.db-onboarding-step-body {
  padding: 0 24px 16px 56px;
  display: none;
}

.db-onboarding-step-body--expanded {
  display: block;
}

.db-onboarding-step-desc {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 12px;
  line-height: 1.5;
}

.db-onboarding-dismiss {
  display: block;
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: #9CA3AF;
  border-top: 1px solid #F3F4F6;
  background: none;
  border-left: none;
  border-right: none;
  border-bottom: none;
  width: 100%;
  cursor: pointer;
  transition: color 0.12s;
}

.db-onboarding-dismiss:hover {
  color: #6B7280;
}

/* Success state */
.db-onboarding-success {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #065F46;
}
```

---

## Success Metrics

| Metric | Baseline | Target (30 days post-ship) |
|---|---|---|
| % users who create an API key | ~30% | 60% |
| % users who deploy a model | ~20% | 45% |
| % users who make ≥1 request | ~15% | 40% |
| Day-7 retention | Unknown | Establish baseline |

Track these via the existing `stats` API aggregated over cohorts.

---

## What NOT to do

- **Don't make the checklist a blocking modal or gate** — Stripe and Vercel both let you skip onboarding entirely. Forcing it creates friction and resentment.
- **Don't add a "verify email" step** unless actually implemented — fake steps destroy trust.
- **Don't gamify it** — progress bars and checkmarks are enough. No confetti, no "level up" language.
- **Don't show it to returning users who have already completed steps** — auto-detect completion state on each page load.
