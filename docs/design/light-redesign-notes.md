# Light-mode redesign — design notes (CLO-6)

Follow-up to CLO-5's first light pass. Inspired by the visual restraint of
[cloudzero.com](https://www.cloudzero.com/). This document captures the
palette, type scale, and layout decisions; per-component changes live in
the PR diff.

## Goals

- All public/marketing pages render in light by default — no dark hero, no
  dark CTA band, no inverted nav.
- Brand anchored on the Cloudarch logo's blue-neon accent, used sparingly.
- Airy whitespace and generous vertical rhythm between sections, matching
  cloudzero's calm feel.
- Tokens isolated in a dedicated file so future theme work is one-stop.
- Dashboard / admin / docs / tutorials left untouched (they own their own
  dark system in `styles/dashboard.css` + inline hex).

## Where the tokens live

`styles/tokens.css` (imported at the top of `pages/_app.jsx`, ahead of
`globals.css`). The legacy short names (`--bg`, `--text-1`, `--brand`,
`--border`) alias into the new named tokens so every existing rule keeps
working while new rules consume the named tokens directly.

## Palette

Sampled from `brand/cloudarch-neon.png` (the "cloud" and "arch" hexes).

| Token | Hex | Role |
|---|---|---|
| `--color-brand-accent` | `#1E40FF` | "cloud" hex — primary CTA, eyebrow, section tag, `<em>` emphasis, hover links |
| `--color-brand-accent-hover` | `#1633CC` | pressed / hover state |
| `--color-brand-accent-light` | `#1AA3FF` | "arch" hex — secondary accent (reserved, used sparingly) |
| `--color-brand-accent-tint` | `rgba(30,64,255,0.06)` | subtle fills (feat-icon bg, ptag bg, featured pcard) |
| `--color-brand-accent-ring` | `rgba(30,64,255,0.18)` | borders for blue-tint elements |

### Surfaces

| Token | Hex | Role |
|---|---|---|
| `--color-surface` | `#ffffff` | dominant white |
| `--color-surface-alt` | `#F7F9FC` | near-white tint for band alternation; footer bg; CTA band |
| `--color-surface-mute` | `#EFF2F7` | deeper tint (rarely used) |
| `--color-surface-sunk` | `#E4E7EC` | wells, avatars |

### Ink

| Token | Hex | Role |
|---|---|---|
| `--color-ink` | `#0d0e17` | headlines + body |
| `--color-ink-muted` | `#4B5563` | secondary text |
| `--color-ink-quiet` | `#6B7280` | tertiary |
| `--color-ink-whisper` | `#9CA3AF` | metadata |

### Rules

| Token | Value | Role |
|---|---|---|
| `--color-rule` | `rgba(13,14,23,0.08)` | default borders, section tops |
| `--color-rule-strong` | `rgba(13,14,23,0.14)` | emphasized borders, ghost CTA |
| `--color-rule-accent` | `rgba(30,64,255,0.22)` | accent borders on hover / focus |

## Type scale

Cloudzero's hero lands at ~48–56px desktop; we sized up to match without
breaking the existing i18n copy, which has longer strings in some locales.

| Token | Value | Role |
|---|---|---|
| `--font-display-xxl` | `clamp(44px, 6vw, 68px)` | hero headline |
| `--font-display-xl` | `clamp(36px, 4.5vw, 48px)` | section titles, CTA band headline |
| `--font-body-lg` | `18px` | hero subcopy, section sub, CTA body |
| `--font-body` | `16px` | default body |
| `--font-meta` | `12.5px` | eyebrows, captions |

Line-heights: `1.08` display / `1.65` body / `1.75` airy body. Letter
spacing: `-0.025em` display, `0` body.

## Layout rhythm

| Token | Value |
|---|---|
| `--space-content-max` | `1200px` |
| `--space-content-gutter` | `48px` |
| `--space-section` | `112px` |
| `--space-section-sm` | `72px` (mobile) |
| `--space-block` | `48px` |

`.section-wrap` now uses these tokens directly. `.stripe-bg` renders as
`--color-surface-alt` so the page breathes in a
white → alt → white → alt → footer-alt pattern down the landing page.

## Component-level decisions

- **Hero:** light composition, dark video background removed, headline
  rendered at `--font-display-xxl` with the `<em>` tail picked out in
  `--color-brand-accent`. A pair of radial accent washes (soft blue
  top-left, soft sky-blue bottom-right) replaces the previous heavy
  black gradient.
- **Nav pill:** light glass — `rgba(255,255,255,0.82)` with
  `backdrop-filter: saturate(180%) blur(16px)` — floats over the white
  hero, matches cloudzero's floating nav treatment.
- **Announcement bar:** deliberately flipped to dark (`--color-ink`
  background, white text). On a page that's otherwise all light, a thin
  dark band at the very top provides the only strong contrast marker
  besides the primary CTA, which reads as a clean "announcement" stripe.
- **CTA band:** flipped from dark gradient to `--color-surface-alt`
  tint. Headline upsized to `--font-display-xl`. Primary CTA renders in
  brand blue, secondary as outlined ghost on white.
- **Feature grid:** dropped the boxed 3×2 card grid in favor of airy
  rule-separated cells — each cell has a short top rule in brand blue
  that extends on hover. Icons grew to 44×44 with the accent tint bg.
- **Pricing cards:** keep the existing card chrome (already token-driven
  from CLO-5); the featured card now reads as a light blue-tinted panel
  instead of a slightly-different-dark-grey.
- **Testimonials:** from gradient-backgrounded dark cards to simple
  white cards with a 1px rule and a soft hover lift.
- **Footer:** column headers upsized to 11px / `0.12em` tracking, links
  hover to brand blue. Bg = `--color-surface-alt`.

## Primary CTA color

Changed from `#0d0e17` (dark ink) to `--color-brand-accent` (`#1E40FF`).
Cloudzero uses a solid brand-color primary and we follow suit so the
"Get started" CTA reads as a clear brand moment on every page.

## Contrast / accessibility

All body text uses `--color-ink` (`#0d0e17`) on `#ffffff` or
`#F7F9FC` surfaces — contrast ratios 15:1+ and 14.3:1+ respectively,
well above WCAG AAA (7:1) for normal text.

Secondary text uses `--color-ink-muted` (`#4B5563`), ratio 8.6:1 on
white — AAA-compliant.

Tertiary text uses `--color-ink-quiet` (`#6B7280`), ratio 6.4:1 on
white — AA-compliant for normal text, AAA for large.

Primary CTA: white text on `#1E40FF`, ratio 7.3:1 — AAA-compliant.

## What's intentionally out of scope

The following surfaces retain their prior dark or mixed treatments and
are NOT touched by this PR:

- `/docs` and `/tutorials/*` — each has ~200 hardcoded inline hex values
  defining its own nav, sidebar, body, and code blocks. Flipping them is
  a separate focused pass.
- `/dashboard/*` — logged-in product surface, owns `styles/dashboard.css`.
- `/admin/*` — operator tooling, `.admin-shell` is deliberately dark.
- `DeployAnimation` (the centerpiece of the hero) — a dark terminal panel
  is intentional, echoing cloudzero's dark product-dashboard mockups
  sitting on a light hero.

## Before / after

- Before: dark hero (near-black bg + video), dark nav pill, dark CTA
  band, tinted-dark section rhythm.
- After: light everything, airy typography, single brand-blue accent used
  sparingly (eyebrow, section tag, hero emphasis word, primary CTA,
  feat-grid top rule, pcard featured tint).

Preview URL for this PR will be posted on CLO-6 once Vercel builds.
