# Onboarding Flow Design

> April 2026 · Product Designer
> The onboarding flow is the most critical design surface — it is the first experience developers have with Cloudach and directly determines activation rate.

---

## Design Principles for This Flow

1. **Value before friction** — show the dashboard before asking for payment info
2. **Progressive disclosure** — don't ask for everything upfront; guide step by step
3. **Time-to-first-API-call is the north star metric** — every screen should move the user closer to their first successful request
4. **Developer empathy** — developers hate marketing-speak; be direct, show code

---

## Flow Overview

```
Landing page
    │
    ▼
[Sign up] CTA
    │
    ▼
Sign-up page ──── (social auth path) ────┐
    │                                    │
    ▼                                    ▼
Email/password form            OAuth callback
    │                                    │
    ▼                                    │
Account created ◄────────────────────────┘
    │
    ▼
Dashboard — Welcome state (new user)
    │
    ├─── Step 1: Create API key ──► API Keys page ──► Key created ──► Step 1 ✓
    │
    ├─── Step 2: Choose a model ──► Models page ──► Model deployed ──► Step 2 ✓
    │
    └─── Step 3: First API call ──► Code snippet ──► Copy & test ──► Step 3 ✓
                                                                         │
                                                                         ▼
                                                               Activated user (Usage > 0)
```

---

## Screen-by-Screen Spec

---

### Screen 1: Landing Page CTA

**Goal:** Convert marketing visitor to sign-up attempt

**Primary CTA:** "Deploy your first model free" (blue, `btn-cta` size lg)  
**Secondary CTA:** "View docs" (ghost)

**Copy change needed:**  
Current hero sub-text is too long. Shorten to:  
> "The developer-first cloud for open-source LLMs. One API. Any model. Production-ready in minutes."

**Social proof placement:** Logos of "trusted by" companies should appear *below* the CTA, not before it.

**No credit card language:** Must be visible near the CTA, not buried.  
Current: in footer of pricing section  
Required: inline below the primary CTA button — `No credit card required.`

---

### Screen 2: Sign-up Page

**Current state:** Email + password form. Functional but minimal.

**Required changes:**

#### 2a. Add Google OAuth button

Above the email/password form, add:
```
┌─────────────────────────────────────────┐
│  [G]  Continue with Google              │
└─────────────────────────────────────────┘

        ── or ──

  Email ________________
  Password _____________
  [Create account]
```

Google SSO removes the biggest friction point for developer signup (password creation). Vercel's signup is >70% OAuth.

**Button spec:**  
```
background: #ffffff
border: 1px solid #E5E7EB
border-radius: 8px
padding: 10px 16px
font-size: 14px
font-weight: 500
color: #374151
display: flex; align-items: center; gap: 10px; width: 100%;
```

#### 2b. Add password strength indicator

Below the password field, show a 4-segment progress bar:
- 1 segment: too short (< 8 chars)
- 2 segments: weak (only letters or only numbers)
- 3 segments: fair (mixed alphanumeric)
- 4 segments: strong (mixed case + numbers + symbols)

Colors: red → orange → yellow → green

#### 2c. Reduce legal text weight

Current: privacy/terms links in gray at bottom — correct, keep.  
Do not add newsletter checkbox or marketing consent on this screen. Every field added here costs conversion.

#### 2d. Page title and meta

```html
<title>Create your free account — Cloudach</title>
<meta name="description" content="Sign up for Cloudach and deploy your first open-source LLM in minutes. No credit card required." />
```

---

### Screen 3: Dashboard — New User State (Welcome)

This is the most critical screen. A new user lands here with zero data and must be guided to activation.

**Current state:** Shows the quickstart banner with 3 steps. It disappears on `?welcome=1` being removed from the URL and is never shown again.

**Required changes:**

#### 3a. Persistent checklist widget

Replace the current dismiss-on-load banner with a persistent sidebar widget at the bottom of the left sidebar:

```
┌─────────────────────────────┐
│  Get started               │
│                             │
│  ☑ Create account           │  ← done (green checkmark)
│  ○ Create API key           │  ← current step (blue dot)
│  ○ Deploy a model           │
│  ○ Make first request       │
│                             │
│  1 of 4 steps complete      │
│  ████░░░░░░░░░░░░░░░░░░░░░  │  ← 25% progress bar
└─────────────────────────────┘
```

This widget:
- Persists across sessions (stored in user record: `onboarding_step` field)
- Automatically advances when actions are completed (key created → step 2; model deployed → step 3; first API call → step 4)
- Collapses/hides automatically when all 4 steps are done (stored: `onboarding_complete: true`)
- Is not dismissable — it disappears only when completed

**Sidebar widget CSS:**
```css
.db-onboarding-widget {
  margin: 12px 10px;
  background: rgba(79, 110, 247, 0.10);
  border: 1px solid rgba(79, 110, 247, 0.20);
  border-radius: 10px;
  padding: 14px;
}

.db-onboarding-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #818CF8;
  margin-bottom: 12px;
}

.db-onboarding-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 12.5px;
  color: #9CA3AF;
}

.db-onboarding-step--done {
  color: #6EE7B7;
  text-decoration: line-through;
}

.db-onboarding-step--current {
  color: #E2E8F0;
  font-weight: 600;
}

.db-onboarding-progress {
  margin-top: 12px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  overflow: hidden;
}

.db-onboarding-progress-bar {
  height: 100%;
  background: #4F6EF7;
  border-radius: 99px;
  transition: width 0.4s ease;
}
```

#### 3b. Step-specific guidance on each page

When a user is on Step 2 (create API key) and visits the API Keys page, show an inline tip at the top:

```
┌────────────────────────────────────────────────────────┐
│ ✨ Step 2: Create your first API key                   │
│    This key will authenticate your API requests.       │
│    Give it a name like "Development" or "Testing".     │
└────────────────────────────────────────────────────────┘
```

This contextual tip:
- Only shows during onboarding, for the current step
- Disappears once the step is complete
- Style: `background: #EEF1FF`, `border: 1px solid #D0D8FF`, `border-radius: 8px`, `padding: 14px 16px`

#### 3c. Inline code snippet step (Step 4)

After a model is deployed and a key is created, Step 4 ("Make your first request") should show a pre-populated code snippet that the user can copy immediately:

```
┌──────────────────────────────────────────────────────────────┐
│ Your first request                                           │
│                                                              │
│ Run this in your terminal:                                   │
│                                                              │
│  curl https://api.cloudach.com/v1/chat/completions \         │
│    -H "Authorization: Bearer sk-cloudach-••••••••" \         │
│    -H "Content-Type: application/json" \                     │
│    -d '{"model":"llama3-8b","messages":[                     │
│          {"role":"user","content":"Hello!"}]}'               │
│                                                              │
│  [Copy]    [View docs]                                       │
└──────────────────────────────────────────────────────────────┘
```

The API key in the snippet is automatically the first active key. If no key exists, show a placeholder and link to create one.

---

### Screen 4: Activated State (Post-Onboarding)

Once all 4 steps are complete:

1. **Remove the onboarding widget from the sidebar** — store `onboarding_complete: true` on the user
2. **Show a one-time success toast:** "You're all set! Your first request was successful."
3. **Transform the Overview page stat cards** from the skeleton/empty state to live data
4. **Show a "Getting started" docs link card** in the Overview for 7 days after activation:

```
┌──────────────────────────────────────────────────────┐
│  📖 Read the docs                                    │
│  Explore rate limits, model parameters, and          │
│  fine-tuning guides.   [Open docs →]                 │
└──────────────────────────────────────────────────────┘
```

---

## Data Requirements (Backend)

| Field | Table | Type | Purpose |
|---|---|---|---|
| `onboarding_step` | `users` | int (0–4) | Track current step |
| `onboarding_complete` | `users` | boolean | Widget hide state |
| `first_key_created_at` | `users` | timestamp | Step 2 completion |
| `first_model_deployed_at` | `users` | timestamp | Step 3 completion |
| `first_request_at` | `users` | timestamp | Step 4 completion (activation) |

These fields should be set server-side when the relevant actions occur (key created → update user record; first usage log row inserted → update user record).

---

## Email Sequence (Post-Signup)

Three triggered emails. All use plain HTML (no templates that look like marketing newsletters):

### Email 1: Welcome (immediate)
```
Subject: Welcome to Cloudach

Hey [first name or "there"],

Your account is ready. Here's how to make your first request:

1. Create an API key: https://cloudach.com/dashboard/api-keys
2. Deploy a model: https://cloudach.com/dashboard/models
3. Make a request with the code snippet on your dashboard

If you run into anything, reply to this email.

— The Cloudach Team
```

### Email 2: Nudge at 24h (if not activated)
```
Subject: Quick question about Cloudach

Did you get a chance to try Cloudach?

If you hit a snag, we'd love to help. Just reply with what you're trying to build.

→ Jump back in: https://cloudach.com/dashboard
```

### Email 3: Activation confirmation (when first request received)
```
Subject: First request ✓ — you're live on Cloudach

Your first request just went through.

[Model]: llama3-8b
[Tokens used]: 143
[Latency]: 420ms

You're all set. Check your usage dashboard for full details:
https://cloudach.com/dashboard/usage
```

---

## Success Metrics

| Metric | Baseline (assumed) | Target |
|---|---|---|
| Sign-up → first API key created | ~40% | >65% |
| Sign-up → first API request | ~20% | >45% |
| Time to first request (median) | unknown | < 8 minutes |
| 7-day retention (any usage in week 1) | unknown | > 50% |

Track these via the `first_key_created_at`, `first_model_deployed_at`, and `first_request_at` fields on the user record.

---

## Accessibility Notes

- All form labels must have explicit `htmlFor` associations
- Loading states must use `aria-busy="true"` on the loading container
- Toast notifications must use `role="status"` and `aria-live="polite"`
- The onboarding checklist must be navigable via keyboard
- Color alone must not be the only differentiator for step states (use checkmark icons, not just green)
- Code snippets must be accessible to screen readers (`role="region"`, `aria-label="Code example"`)
