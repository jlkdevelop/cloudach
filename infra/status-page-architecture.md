# Status Page Architecture

**File:** `pages/status.jsx`
**Route:** `/status`
**Last updated:** 2026-04-14

---

## Overview

The Cloudach status page (`/status`) is a customer-facing Next.js page that displays:

1. **Real-time service health** — grouped by functional area (API, Inference, Dashboard, Database)
2. **90-day uptime history** — per-service bar chart showing operational / degraded / outage states
3. **SLA commitments** — uptime guarantees and support response times per pricing tier
4. **Incident history** — chronological record of past incidents with root cause and resolution

---

## Current Architecture (Phase 1 — Static)

The page is currently **statically rendered** with placeholder uptime data hardcoded in `pages/status.jsx`.

```
pages/status.jsx
  └── services[]        — list of services with current status and 30-day uptime %
  └── uptimeBars{}      — 90-day bar data derived from uptime % (pseudo-random, seeded)
  └── slaTable[]        — SLA commitments by tier (Starter / Pro / Enterprise)
  └── incidents[]       — empty array; populated manually or via API in Phase 2
```

**Rendering:** `next build` produces a static HTML page. No API calls at runtime.

**Update flow:** To change a service status, edit the `services` array in `pages/status.jsx` and redeploy.

---

## Planned Architecture (Phase 2 — Dynamic)

### Data Sources

| Signal | Source | Update frequency |
|---|---|---|
| Service health | Kubernetes readiness/liveness probes via Prometheus | 30s |
| Uptime history | Prometheus `up{}` metric aggregated over 90d | Hourly |
| Incidents | Internal incident management API or GitHub Issues | On incident |

### API Route

Add `pages/api/status.js` (or `pages/api/status/route.js` in App Router):

```js
// GET /api/status
// Returns { services[], uptimeHistory{}, activeIncidents[], resolvedIncidents[] }
// Cached at Vercel edge for 60 seconds
```

### Health Check Endpoints

Each service exposes a health check that the status API polls:

| Service | Endpoint |
|---|---|
| API Gateway | `GET /health` → 200 |
| vLLM inference | `GET /metrics` (Prometheus scrape) |
| Dashboard | Vercel deployment health |
| Database | PostgreSQL connection pool probe |

### Kubernetes Monitoring

Prometheus scrapes are defined in `infra/k8s/monitoring/`. The status API queries Prometheus using the following example queries:

```promql
# Current availability (1 = up, 0 = down)
up{job="api-gateway"}

# 30-day uptime %
avg_over_time(up{job="api-gateway"}[30d]) * 100

# 90-day uptime, 1-day resolution (for bar chart)
avg_over_time(up{job="api-gateway"}[1d] offset ${i}d)
```

### Caching Strategy

- Vercel Edge Cache: `s-maxage=60, stale-while-revalidate=120`
- Prometheus query results cached in Redis with 5-minute TTL
- Uptime history (slow-changing) cached for 1 hour

---

## SLA Definitions

### Uptime Calculation

```
Monthly Uptime % = (Total minutes in month − Downtime minutes) / Total minutes in month × 100
```

- **Downtime** = any minute in which the service returns non-2xx responses for >50% of health checks
- **Excluded:** scheduled maintenance (announced ≥48h in advance via this status page)
- **Measurement window:** calendar month (UTC)

### Tier Commitments

| Tier | SLA | Credits on breach |
|---|---|---|
| Starter | 99.5% (best effort) | None |
| Pro | 99.9% | 10× monthly credit for affected service |
| Enterprise | 99.9% (custom available) | 25× monthly credit + dedicated review |

### Credit Calculation

Credits are issued as a percentage of monthly service fees:

| Uptime achieved | Credit (Pro) | Credit (Enterprise) |
|---|---|---|
| 99.0% – 99.9% | 10% | 25% |
| 95.0% – 99.0% | 25% | 50% |
| < 95.0% | 50% | 100% |

---

## Incident Response

When an incident occurs:

1. On-call engineer updates `services[]` status to `degraded` or `outage` in `pages/status.jsx` (Phase 1) or via the incidents API (Phase 2)
2. Post a new entry in the `incidents[]` array using the format template below
3. Redeploy (Phase 1) or trigger cache invalidation (Phase 2)
4. Notify subscribed users via `status@cloudach.com` mailing list

### Incident Record Format

```md
## YYYY-MM-DD — [Affected Service]: [Short title]

**Duration:** X hours Y minutes
**Severity:** SEV-1 | SEV-2 | SEV-3
**Affected services:** [list]

**Summary:** One-sentence description.

**Timeline:**
- HH:MM UTC — Issue first detected
- HH:MM UTC — On-call engineer paged
- HH:MM UTC — Root cause identified
- HH:MM UTC — Fix deployed
- HH:MM UTC — All systems operational

**Root cause:** [description]
**Resolution:** [description]

**Follow-up actions:**
- [ ] Action item
```

### Severity Levels

| Level | Definition | Response target |
|---|---|---|
| SEV-1 | Full service outage — no requests served | Page on-call immediately; resolve < 1h |
| SEV-2 | Partial outage or significant degradation (>10% error rate) | Page on-call; resolve < 4h |
| SEV-3 | Minor degradation; service functional but slower | Notify team; resolve < 24h |

---

## File Locations

| File | Purpose |
|---|---|
| `pages/status.jsx` | Customer-facing status page |
| `pages/api/status.js` | *(Phase 2)* Dynamic health API |
| `infra/k8s/monitoring/` | Prometheus scrape configs |
| `docs/incident-response-runbook.md` | Full incident playbook |
| `infra/status-page-architecture.md` | This document |
