# Changelog Process

This document explains how to add new entries to the Cloudach changelog.

## Where the changelog lives

| File | Purpose |
|------|---------|
| `pages/changelog.jsx` | Public `/changelog` page — rendered HTML |
| `pages/api/changelog/rss.js` | RSS feed at `/api/changelog/rss` |

Both files share the same `ENTRIES` array structure. **Update both files** when adding a new release.

---

## Adding a new changelog entry

### 1. Decide on the version and tag

Use semantic versioning (`vMAJOR.MINOR.PATCH`). Choose a tag that describes the theme:

| Tag | Use when |
|-----|---------|
| `GA Release` | Major milestones, general availability |
| `API` | New endpoints or breaking changes |
| `Dashboard` | Frontend / UI features |
| `Infrastructure` | Deployment, scaling, observability |
| `Security` | Auth, hardening, compliance |
| `Models` | New model deployments |
| `Developer Experience` | SDKs, docs, CLI, playground |
| `Enterprise` | Team management, SLA features |
| `Performance` | Speed, cost, efficiency improvements |

### 2. Edit `pages/changelog.jsx`

Add a new object to the top of the `ENTRIES` array (newest first):

```js
{
  date: 'Apr 2026',          // Month + Year — displayed in the UI
  version: 'v1.1',
  tag: 'API',
  color: '#059669',          // Text / dot colour
  bg: '#ECFDF5',             // Badge background colour
  items: [
    'Short, present-tense description of feature or fix.',
    'Another item.',
  ],
},
```

Pick a color pair from the table below or reuse one already in the file.

| Tag | `color` | `bg` |
|-----|---------|------|
| GA Release / Dashboard | `#6366F1` | `#EEF2FF` |
| API / Models | `#059669` | `#ECFDF5` |
| Security | `#DC2626` | `#FEF2F2` |
| Infrastructure | `#0891B2` | `#ECFEFF` |
| Enterprise | `#7C3AED` | `#F5F3FF` |
| Performance | `#D97706` | `#FFFBEB` |
| Launch / Misc | `#374151` | `#F9FAFB` |

### 3. Edit `pages/api/changelog/rss.js`

Add the same entry to the top of the `ENTRIES` array in the RSS file, using an ISO date:

```js
{
  date: '2026-04-28',        // ISO 8601 — used for RSS pubDate
  version: 'v1.1',
  tag: 'API',
  items: [
    'Short, present-tense description of feature or fix.',
    'Another item.',
  ],
},
```

> The RSS file does not need `color` or `bg` fields.

### 4. Update the dashboard banner (major releases only)

For significant releases, update the "What's new" banner text in `pages/dashboard/index.jsx`:

```jsx
{/* What's new banner */}
<Link href="/changelog" ...>
  <div ...>
    ...
    <span>Cloudach v1.1 is live — describe the biggest change here.</span>
    ...
  </div>
</Link>
```

---

## Writing good changelog entries

- **Present tense, active voice:** "Add webhook signatures" not "Added webhook signatures"
- **Lead with the feature name:** "Fine-tuning: LoRA adapter training via the dashboard"
- **Include concrete details:** context window size, latency numbers, discount %, endpoint path
- **One bullet per feature** — keep each item to one sentence
- **Avoid jargon** — developers outside your team read this

## Review checklist

- [ ] Entry added to `pages/changelog.jsx` (top of `ENTRIES`)
- [ ] Entry added to `pages/api/changelog/rss.js` (top of `ENTRIES`, ISO date)
- [ ] Dashboard banner updated (major releases only)
- [ ] Items are clear and concise
- [ ] PR merged to `main`
