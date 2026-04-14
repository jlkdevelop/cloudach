# Cloudach Design System

Version 1.0 — April 2026

---

## Overview

Cloudach targets developers and engineering teams. The design language mirrors best-in-class dev tools (Vercel, Stripe, Linear): clean, high-information density, minimal chrome, strong typographic hierarchy. Everything is built on Inter + a blue-indigo primary accent.

This document is the canonical reference. When in doubt, match this spec.

---

## Color Tokens

All tokens are available as CSS custom properties via `:root` in `globals.css`.

### Brand

| Token | Value | Usage |
|---|---|---|
| `--color-brand` | `#4F6EF7` | Primary buttons, links, active states, accents |
| `--color-brand-hover` | `#3B5BDB` | Hover state for brand elements |
| `--color-brand-light` | `#EEF1FF` | Badge backgrounds, highlight fills |
| `--color-brand-border` | `#D0D8FF` | Eyebrow borders, subtle brand borders |
| `--color-brand-muted` | `#818CF8` | Active sidebar nav text (on dark bg) |
| `--color-brand-active-bg` | `rgba(79,110,247,0.2)` | Active sidebar nav item background |

### Text

| Token | Value | Usage |
|---|---|---|
| `--color-text-primary` | `#0D0F1A` | Headings, primary body text |
| `--color-text-secondary` | `#374151` | Secondary body, table cells |
| `--color-text-muted` | `#6B7280` | Subtitles, descriptions, nav links |
| `--color-text-subtle` | `#9CA3AF` | Stat subs, footer links, timestamps |
| `--color-text-disabled` | `#D1D5DB` | Disabled form fields, placeholder |
| `--color-text-on-dark` | `#E2E8F0` | Body text on dark (sidebar, dark cards) |

### Background

| Token | Value | Usage |
|---|---|---|
| `--color-bg-base` | `#FFFFFF` | Page background (marketing), cards |
| `--color-bg-subtle` | `#F9FAFB` | Table headers, alternating rows |
| `--color-bg-muted` | `#F3F4F6` | Dashboard shell background |
| `--color-bg-dark` | `#0D0F1A` | Sidebar, CTA band, code blocks |
| `--color-bg-dark-elevated` | `#141626` | Code topbar, elevated dark surfaces |
| `--color-bg-dark-hover` | `rgba(255,255,255,0.07)` | Hover on dark sidebar items |

### Border

| Token | Value | Usage |
|---|---|---|
| `--color-border` | `#E5E7EB` | Default border for cards, nav, tables |
| `--color-border-dark` | `#1E2235` | Borders on dark backgrounds |
| `--color-border-dark-subtle` | `rgba(255,255,255,0.07)` | Dividers on dark sidebar |
| `--color-border-input` | `#D1D5DB` | Default input border |

### Semantic

| Token | Value | Usage |
|---|---|---|
| `--color-success` | `#10B981` | Active status dot, success states |
| `--color-success-text` | `#065F46` | Success badge text |
| `--color-success-bg` | `#D1FAE5` | Success badge background |
| `--color-success-light` | `#ECFDF5` | Model "custom" badge bg |
| `--color-warning-text` | `#92400E` | Warning badge text |
| `--color-warning-bg` | `#FEF3C7` | Warning / deploying badge background |
| `--color-error` | `#DC2626` | Error text, danger button text |
| `--color-error-text` | `#991B1B` | Error banner text |
| `--color-error-bg` | `#FEF2F2` | Error banner background |
| `--color-error-border` | `#FECACA` | Error banner border |
| `--color-info-text` | `#3730A3` | Info badge text |
| `--color-info-bg` | `#EEF1FF` | Info badge background |

---

## Typography

Font family: **Inter** (Google Fonts, weights 400/500/600/700). Monospace: `JetBrains Mono` > `Fira Code` > `Menlo` > `monospace`.

### Scale

| Role | Size | Weight | Letter-spacing | Line-height | Used for |
|---|---|---|---|---|---|
| Display | 52px | 700 | -2.5px | 1.07 | Hero H1 |
| Heading 1 | 42px | 700 | -1.5px | 1.12 | CTA band H2 |
| Heading 2 | 36px | 700 | -1px | 1.15 | Section titles |
| Heading 3 | 22px | 700 | -0.5px | 1.3 | Dashboard page title |
| Heading 4 | 17–18px | 700 | -0.4px | 1.3 | Modal titles, login title |
| Heading 5 | 16px | 600–700 | -0.3px | 1.3 | Card headings, feature titles |
| Body Large | 16px | 400 | 0 | 1.7–1.75 | Hero sub, section descriptions |
| Body | 14px | 400 | 0 | 1.65 | Default body text |
| Body Small | 13–13.5px | 400–500 | 0 | 1.5–1.6 | Table cells, form help text |
| Caption | 12px | 400–600 | 0–0.5px | 1.4 | Stat subs, timestamps, footer |
| Label | 11–12px | 600–700 | 0.08–0.1em | 1.2 | Section tags, table headers, nav labels |
| Monospace | 11.5–13px | 400 | 0 | 1.65–1.9 | Code blocks, API keys, endpoints |

### Rules
- Headings always use `letter-spacing` negative values for tighter optical fit at larger sizes
- Body text max-width: `480px` for readable line length in single-column layouts
- Never use font-weight below 400 in UI

---

## Spacing

8-point grid. All padding, margins, and gaps should snap to multiples of 4 or 8.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Micro gaps (badge padding, icon-text gaps) |
| `--space-2` | 8px | Tight component gaps, small padding |
| `--space-3` | 12px | Standard component padding |
| `--space-4` | 16px | Card padding, list item spacing |
| `--space-5` | 20px | Standard card padding |
| `--space-6` | 24px | Section internal padding |
| `--space-7` | 28px | Page header margin-bottom |
| `--space-8` | 32px | Dashboard main padding |
| `--space-10` | 40px | Hero stats padding-top |
| `--space-12` | 48px | Section vertical padding (mobile) |
| `--space-16` | 64px | Section horizontal padding |
| `--space-20` | 80px | Large section gap |
| `--space-22` | 88px | Full section padding (desktop) |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4–5px | Tags, small badges |
| `--radius-md` | 6–8px | Buttons, inputs, small cards |
| `--radius-lg` | 10–12px | Standard cards, stat cards |
| `--radius-xl` | 14px | Large modals, feature cards, model cards |
| `--radius-full` | 9999px | Pill badges, eyebrow labels |

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 4px 24px rgba(0,0,0,0.06)` | Login card elevation |
| `--shadow-md` | `0 8px 32px rgba(0,0,0,0.10)` | Dropdowns, tooltips |
| `--shadow-lg` | `0 24px 64px rgba(0,0,0,0.15)` | Modals |
| `--shadow-brand` | `0 2px 12px rgba(79,110,247,0.08)` | Model card hover |

---

## Components

### Button

Four variants:

**Primary** (`db-btn--primary` / `btn-solid` / `btn-cta`)
- Background: `--color-brand`
- Text: white, 600 weight
- Padding: 8px 16px (default), 13px 28px (CTA)
- Radius: 8–9px
- Hover: `--color-brand-hover`
- Disabled: opacity 50%

**Ghost** (`db-btn--ghost` / `btn-ghost` / `btn-cta-ghost`)
- Background: transparent
- Border: 1px `--color-border`
- Text: `--color-text-secondary`
- Hover bg: `--color-bg-subtle`

**Danger** (`db-btn--danger`)
- Background: transparent
- Border: 1px `--color-error-border`
- Text: `--color-error`
- Hover bg: `--color-error-bg`

**Sizes:**
- Default: 8px/16px padding, 13.5px font
- SM: 5px/12px padding, 12.5px font
- CTA: 13–14px/28–32px padding, 15px font

**Rules:**
- Always `display: inline-flex; align-items: center; gap: 6px` to accommodate icons
- Loading state: show spinner, disable interaction, keep width stable
- Never resize on hover

### Input

```
border: 1px solid --color-border-input
border-radius: 8px
padding: 9px 13px
font-size: 14px
focus: border --color-brand, box-shadow 0 0 0 3px rgba(79,110,247,0.15)
```

Always pair with a `<label>` using `.db-label` (13px, 600, `--color-text-secondary`).

### Card

```
background: #fff
border: 1px solid --color-border
border-radius: 12px
padding: 24px
```

Card header: `display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px`
Card title: 15px, 600, `--color-text-primary`

### Badge / Status

Four status variants:
- Active: green bg `#D1FAE5`, text `#065F46`
- Deploying: yellow bg `#FEF3C7`, text `#92400E`
- Stopped/None: grey bg `#F3F4F6`, text `#6B7280`
- Revoked: red bg `#FEE2E2`, text `#991B1B`

Structure: `display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600`

Include pulse dot for live/active states: 7px circle, `--color-success`, animated opacity.

### Table

- Header: 11.5px, uppercase, `--color-text-muted`, `--color-bg-subtle` background
- Row: 13.5px, `--color-text-secondary`, border-bottom `--color-bg-muted`
- Hover: `background: #FAFAFA`
- Last row: no border

### Modal

- Backdrop: `rgba(13,15,26,0.5)`
- Card: white, 14px radius, 28px/32px padding, 440px width
- Shadow: `--shadow-lg`
- Title: 17px 700, subtitle: 13.5px muted
- Actions: `display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px`

### Empty State

Structure:
```
text-align: center
padding: 48px 24px
icon: 36px (SVG, not emoji — see Icon Library below)
title: 15px 600 --color-text-muted
description: 13px --color-text-subtle
optional CTA button below description
```

**Rule: Never use emoji in production UI. Use SVG icons only.**

### Sidebar Navigation (Dashboard)

Dark sidebar (`--color-bg-dark`, width 220px, sticky):
- Logo area: 20px padding, border-bottom `rgba(255,255,255,0.07)`
- Nav items: 9px/12px padding, 8px radius, 13.5px 500
- Default: `#9CA3AF`
- Hover: `rgba(255,255,255,0.07)` bg, `#E5E7EB` text
- Active: `rgba(79,110,247,0.2)` bg, `#818CF8` text
- Footer: user avatar chip (28px circle, brand bg) + email (12px muted) + logout icon

---

## Icon Library

All icons are inline SVG, 16x16, `currentColor` fill/stroke. Icons use 1.5px strokeWidth on stroked variants.

| Icon | File | Usage |
|---|---|---|
| Overview | `DashboardLayout.jsx:IconOverview` | Dashboard nav |
| Models | `DashboardLayout.jsx:IconModels` | Models nav |
| API Key | `DashboardLayout.jsx:IconKey` | API Keys nav |
| Usage | `DashboardLayout.jsx:IconUsage` | Usage nav |
| Settings | `DashboardLayout.jsx:IconSettings` | Settings nav |
| Logout | `DashboardLayout.jsx:IconLogout` | Sidebar footer |

**To add a new icon:** Create a local function `function IconName() { return <svg ...>...</svg> }` in the component that uses it. Do not import an icon library — keep the bundle lean.

---

## Marketing Site vs Dashboard

Two distinct visual contexts sharing the same tokens:

| | Marketing | Dashboard |
|---|---|---|
| Background | `#FFFFFF` | `#F3F4F6` |
| Nav | White sticky top nav | Dark left sidebar |
| Typography | Display/heading scale | Smaller, dense scale |
| Max-width | `1180px` | `1200px` |
| Padding | `88px 48px` sections | `32px 36px` main content |

Both must use the same color tokens, font, and component primitives.

---

## Do / Don't

| Do | Don't |
|---|---|
| Use `-0.5px` to `-2.5px` letter-spacing for headings | Use default letter-spacing on large headings |
| Use Inter 600 for all button labels | Use 400 weight on buttons |
| Use `transition: 0.12–0.15s` for hover states | Use transitions over 200ms on small UI |
| Use SVG icons at 16×16 with `currentColor` | Use emoji in production UI |
| Align to 4/8px grid | Use arbitrary spacing values like 7px, 11px margins |
| Use `box-shadow` focus rings with brand color | Use browser default outlines on form inputs |
| Use negative letter-spacing on headings ≥22px | Apply letter-spacing to body text |
