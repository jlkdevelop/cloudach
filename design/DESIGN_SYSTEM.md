# Cloudach Design System

> Version 1.0 — April 2026
> Canonical reference for colors, typography, spacing, and component patterns. Engineers should implement UI exactly to these specs without interpretation.

---

## 1. Brand Identity

**Product name:** Cloudach  
**Tagline:** Deploy any LLM to the cloud  
**Voice:** Developer-first. Precise, direct, no marketing fluff. Reads like Stripe/Vercel documentation.  
**Visual personality:** Clean, minimal, high information density. Dark sidebar, white content area, one accent color.

---

## 2. Color Tokens

All colors are defined as CSS custom properties. Use the token name, never raw hex values in component code.

```css
:root {
  /* Brand */
  --color-accent:          #4F6EF7;   /* Primary blue — CTAs, active states, links */
  --color-accent-hover:    #3B5BDB;   /* Hover/pressed variant */
  --color-accent-light:    #EEF1FF;   /* Tinted backgrounds (badges, eyebrow) */
  --color-accent-border:   #D0D8FF;   /* Accent-tinted borders */
  --color-accent-muted:    #818CF8;   /* Sidebar active label */

  /* Neutrals */
  --color-ink:             #0D0F1A;   /* Headings, strong text, sidebar bg */
  --color-ink-secondary:   #374151;   /* Body text */
  --color-muted:           #6B7280;   /* Secondary labels, captions */
  --color-subtle:          #9CA3AF;   /* Placeholders, disabled, tertiary */
  --color-rule:            #E5E7EB;   /* Borders, dividers */
  --color-surface:         #F3F4F6;   /* Page background */
  --color-surface-raised:  #F9FAFB;   /* Card background variant, table headers */
  --color-white:           #FFFFFF;   /* Card foreground */

  /* Sidebar (dark surface) */
  --color-sidebar-bg:      #0D0F1A;
  --color-sidebar-border:  rgba(255, 255, 255, 0.07);
  --color-sidebar-item:    #9CA3AF;   /* Default nav label */
  --color-sidebar-hover:   rgba(255, 255, 255, 0.07);
  --color-sidebar-active:  rgba(79, 110, 247, 0.20);

  /* Semantic — status */
  --color-success:         #10B981;
  --color-success-bg:      #D1FAE5;
  --color-success-text:    #065F46;
  --color-warning-bg:      #FEF3C7;
  --color-warning-text:    #92400E;
  --color-error:           #DC2626;
  --color-error-bg:        #FEE2E2;
  --color-error-border:    #FECACA;
  --color-error-text:      #991B1B;
  --color-neutral-bg:      #F3F4F6;
  --color-neutral-text:    #6B7280;

  /* Code */
  --color-code-bg:         #0D0F1A;
  --color-code-text:       #E2E8F0;
  --color-code-border:     #1E2235;
}
```

### Color usage rules

| Scenario | Token |
|---|---|
| CTA buttons, primary actions | `--color-accent` |
| Active nav item background | `--color-sidebar-active` |
| Active nav item text | `--color-accent-muted` |
| Badge backgrounds (info) | `--color-accent-light` |
| Page background | `--color-surface` |
| Card background | `--color-white` |
| All body text | `--color-ink-secondary` |
| Labels, captions | `--color-muted` |
| Disabled / placeholder | `--color-subtle` |
| Borders everywhere | `--color-rule` |

**Never use raw hex values in component CSS.** Always use the token.

---

## 3. Typography

**Primary font:** Inter (Google Fonts)  
**Monospace font:** JetBrains Mono (Google Fonts) — used for code, API keys, endpoints

```html
<!-- In _document.jsx or _app.jsx -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

### Type scale

| Token | Size | Weight | Line-height | Letter-spacing | Usage |
|---|---|---|---|---|---|
| `--text-hero` | 52px | 700 | 1.07 | -2.5px | Marketing hero H1 |
| `--text-h1` | 36px | 700 | 1.15 | -1px | Section headings |
| `--text-h2` | 22px | 700 | 1.2 | -0.5px | Page titles (dashboard) |
| `--text-h3` | 17px | 700 | 1.3 | -0.3px | Modal titles, card headings |
| `--text-h4` | 15px | 600 | 1.4 | -0.2px | Card sub-headings |
| `--text-body-lg` | 16px | 400 | 1.75 | 0 | Marketing body copy |
| `--text-body` | 14px | 400 | 1.6 | 0 | Dashboard body, form hints |
| `--text-body-sm` | 13.5px | 400 | 1.5 | 0 | Table cells, secondary content |
| `--text-caption` | 12px | 400/600 | 1.4 | 0 | Timestamps, stat labels |
| `--text-label` | 11px | 700 | 1 | 0.08em | Section tags, uppercase labels |
| `--text-code` | 12.5px | 400 | 1.65 | 0 | Code blocks, API keys |

### Typography rules

- All headings: `letter-spacing` must be negative (tighter)
- Uppercase labels: always `font-weight: 700` with `letter-spacing: 0.08em`
- Never use `font-size` below 11px
- Body text color: `--color-ink-secondary` (`#374151`)
- Secondary/muted text: `--color-muted` (`#6B7280`)

---

## 4. Spacing System

Base unit: **4px**. All spacing is multiples of 4.

```
4px   — xs  (icon gaps, tight badge padding)
8px   — sm  (inline gaps, compact padding)
12px  — md- (nav item padding, small card gaps)
16px  — md  (field margin, button padding)
20px  — md+ (card padding vertical)
24px  — lg  (card padding, section gap)
28px  — lg+ (page header margin)
32px  — xl  (main content padding)
36px  — xl+ (dashboard main horizontal padding)
48px  — 2xl (section padding)
64px  — 3xl (large section gaps)
88px  — 4xl (marketing section padding)
```

**Sidebar width:** 220px (fixed)  
**Dashboard main max-width:** 1200px  
**Marketing max-width:** 1180px  

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Tags, tiny badges |
| `--radius-md` | 6px | Small buttons, code spans |
| `--radius-base` | 8px | Standard buttons, inputs, nav items |
| `--radius-lg` | 10px | Model cards |
| `--radius-xl` | 12px | Stat cards, standard cards |
| `--radius-2xl` | 14px | Modals, large cards, feature grid |
| `--radius-3xl` | 16px | Login card |
| `--radius-full` | 9999px | Pills, avatar, status dots |

---

## 6. Shadows

```css
--shadow-sm:   0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md:   0 4px 24px rgba(0, 0, 0, 0.06);
--shadow-lg:   0 8px 32px rgba(0, 0, 0, 0.10);
--shadow-xl:   0 24px 64px rgba(0, 0, 0, 0.15);   /* Modals */
--shadow-card-hover: 0 2px 12px rgba(79, 110, 247, 0.08);
```

Cards use no box-shadow by default (border only). Shadow appears on hover for interactive cards.

---

## 7. Components

### 7.1 Button

Four variants, three sizes.

**Variants:**
- `primary` — filled blue (`--color-accent`), white text
- `ghost` — transparent, `--color-rule` border, `--color-ink-secondary` text
- `danger` — transparent, `--color-error-border` border, `--color-error` text
- `link` — no background, no border, `--color-accent` text

**Sizes:**
- `default` — `padding: 8px 16px`, `font-size: 13.5px`, `border-radius: 8px`
- `sm` — `padding: 5px 12px`, `font-size: 12.5px`, `border-radius: 6px`
- `lg` — `padding: 13px 28px`, `font-size: 15px`, `border-radius: 9px`

**States:** default → hover → active → disabled (opacity 0.5, cursor not-allowed)

**Implementation rules:**
- Never use `<a>` styled as a button for actions (navigation only)
- Always include explicit `type` attribute on `<button>` inside `<form>`
- Destructive actions (Revoke, Delete) must use `danger` variant, never `primary`

---

### 7.2 Input / Form Controls

```
height: auto (padding-driven)
padding: 9px 13px
border: 1px solid --color-rule
border-radius: 8px
font-size: 14px
font-family: Inter
transition: border-color 0.12s, box-shadow 0.12s
```

**States:**
- Default: `border-color: --color-rule` (`#D1D5DB`)
- Focus: `border-color: --color-accent`, `box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.15)`
- Error: `border-color: --color-error`, `box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12)`
- Disabled: `opacity: 0.5`, `cursor: not-allowed`

**Labels:** Always rendered as `<label>` with explicit `htmlFor`, `font-size: 13px`, `font-weight: 600`, `color: --color-ink-secondary`, `margin-bottom: 6px`.

---

### 7.3 Card

```
background: --color-white
border: 1px solid --color-rule
border-radius: 12px
padding: 24px
margin-bottom: 24px
```

Card variants:
- **Default** — white background
- **Subtle** — `--color-surface-raised` background (used for code hints, secondary content)
- **Accent** — `border-color: --color-accent`, 2px border (used for featured pricing, highlighted state)

**Card header:** `display: flex`, `align-items: center`, `justify-content: space-between`, `margin-bottom: 20px`

---

### 7.4 Badge / Status Chip

```
display: inline-flex
align-items: center
gap: 5px
padding: 3px 10px
border-radius: 9999px
font-size: 12px
font-weight: 600
```

| Status | Background | Text |
|---|---|---|
| active / success | `--color-success-bg` | `--color-success-text` |
| deploying / warning | `--color-warning-bg` | `--color-warning-text` |
| stopped / neutral | `--color-neutral-bg` | `--color-neutral-text` |
| revoked / error | `--color-error-bg` | `--color-error-text` |

Active badges include a pulsing dot (7px circle, `--color-success`, animation: pulse 2s infinite).

---

### 7.5 Table

```
width: 100%
border-collapse: collapse
font-size: 13.5px
```

| Element | Spec |
|---|---|
| `th` | 11.5px, 600 weight, uppercase, `--color-muted`, letter-spacing 0.4px, `--color-surface-raised` bg |
| `td` | `--color-ink-secondary`, `padding: 12px 14px`, `border-bottom: 1px solid #F3F4F6` |
| Row hover | `background: #FAFAFA` |
| Last row | No bottom border |

Overflow: always wrap in `.db-table-wrap` with `overflow-x: auto`.

---

### 7.6 Modal

```
background: --color-white
border-radius: 14px
padding: 28px 32px
width: 440px
max-width: 95vw
box-shadow: --shadow-xl
```

Backdrop: `rgba(13, 15, 26, 0.5)`, click-outside to dismiss.  
Destructive modals require explicit typed confirmation, never `window.confirm()`.

---

### 7.7 Sidebar Navigation

```
width: 220px
background: --color-sidebar-bg (#0D0F1A)
position: sticky; top: 0; height: 100vh
```

Nav item spec:
```
padding: 9px 12px
border-radius: 8px
font-size: 13.5px
font-weight: 500
color: --color-sidebar-item (#9CA3AF)
gap: 10px (icon + label)
transition: background 0.12s, color 0.12s
```

Active state: `background: --color-sidebar-active`, `color: --color-accent-muted (#818CF8)`  
Hover state: `background: --color-sidebar-hover`, `color: #E5E7EB`

Icons: 16×16px SVG, `fill: currentColor` or `stroke: currentColor`. Stroke weight: 1.5px.

---

### 7.8 Skeleton Loader

Use skeleton screens instead of loading text. Pattern:

```css
.skeleton {
  background: linear-gradient(90deg, #F0F0F0 25%, #E0E0E0 50%, #F0F0F0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s infinite;
  border-radius: var(--radius-base);
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

Skeleton shapes mirror the real content layout — stat card: 3 rectangles (label, value, sub). Never show "Loading…" text in the main content area.

---

### 7.9 Toast Notification

Position: `bottom-right`, 16px margin from viewport edges.  
Auto-dismiss: 4000ms. Always accessible via `role="status"`.

Variants: success (green left border), error (red left border), info (blue left border).

```
background: --color-white
border: 1px solid --color-rule
border-radius: 10px
padding: 14px 16px
box-shadow: --shadow-lg
min-width: 280px
max-width: 380px
font-size: 13.5px
```

---

### 7.10 Empty State

Structure: icon → title → description → optional CTA button.

```
text-align: center
padding: 48px 24px
```

- Icon: 48px SVG illustration (not emoji)
- Title: 15px, 600 weight, `--color-muted`
- Description: 13px, `--color-subtle`
- CTA: `primary` or `ghost` button with relevant action

---

## 8. Icon System

All icons are inline SVG, 16×16px for UI, 24×24px for marketing. Stroke weight: 1.5px. Use `currentColor` to inherit from parent.

Do not use icon font libraries. Do not use emoji in UI.

---

## 9. Code Block

Use JetBrains Mono. Two variants:

**Dark (terminal):**
```
background: #0D0F1A
color: #E2E8F0
border-radius: 8px
padding: 14px 18px
font-size: 12.5px
line-height: 1.65
overflow-x: auto
```

**Inline code span:**
```
font-family: JetBrains Mono
font-size: 12px
background: #F3F4F6
color: #374151
padding: 2px 6px
border-radius: 4px
```

---

## 10. Animation & Motion

```css
/* Standard transition */
transition: all 0.12s ease;

/* Color-only transitions */
transition: color 0.12s, background 0.12s, border-color 0.12s;

/* Entrance animations */
--duration-fast:   120ms;
--duration-base:   200ms;
--duration-slow:   300ms;
--easing-default:  ease;
--easing-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
```

No animation for purely functional state changes (toggling visibility). Use transitions only for interactive state changes (hover, focus, active).

---

## 11. Brand Consistency Checklist

| Surface | Font | Primary color | Nav |
|---|---|---|---|
| Marketing site | Inter | `#4F6EF7` | Top nav |
| Dashboard | Inter + JetBrains Mono | `#4F6EF7` | Left sidebar |
| Docs | Inter + JetBrains Mono | `#4F6EF7` | Left sidebar |
| Emails | System sans | `#4F6EF7` | None |

**Logo:** Always render using the `<Logo />` SVG component. Never use a raster image. The wordmark "cloud**ach**" uses `color: --color-ink` for "cloud" and `color: --color-accent` for "ach".

---

## 12. File Organization

```
styles/
  globals.css          — Marketing site + shared reset
  dashboard.css        — Dashboard shell and component classes
  tokens.css           — (TO CREATE) CSS custom properties (tokens above)

components/
  dashboard/
    DashboardLayout.jsx
    Skeleton.jsx        — (TO CREATE) Skeleton loader component
    Toast.jsx           — (TO CREATE) Toast notification system
    EmptyState.jsx      — (TO CREATE) Standardized empty state
  Logo.jsx
  Nav.jsx
  ...
```
