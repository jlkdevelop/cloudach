# Monitoring Setup

Production monitoring for Cloudach. This guide covers uptime monitoring, alerting, and error tracking.

---

## 1. Health Endpoints

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/health` | None | Deep health check — DB, API gateway, Redis, inference. Returns 200/503. |
| `GET /api/status` | None | Aggregated component status. Safe for public status pages. |
| `GET /health` (gateway:8080) | None | Gateway-level check — DB, Redis, inference. Returns 200/503. |

Example healthy response from `/api/health`:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-04-14T08:00:00.000Z",
  "latencyMs": 12,
  "checks": {
    "db": { "status": "ok" },
    "gateway": { "status": "ok", "checks": { "redis": "ok", "inference": "ok" } }
  },
  "env": {
    "DATABASE_URL": true,
    "JWT_SECRET": true,
    "API_GATEWAY_URL": true
  }
}
```

---

## 2. Uptime Robot

Free tier supports 50 monitors with 5-minute intervals.

### Dashboard monitor

1. Sign in at https://uptimerobot.com and click **+ Add New Monitor**.
2. Settings:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Cloudach Dashboard
   - **URL**: `https://your-domain.com/api/health`
   - **Monitoring Interval**: 5 minutes
   - **Alert Contacts**: add your email or Slack webhook
3. Under **Advanced Settings**:
   - **Keyword**: `"status":"ok"` (alert if keyword is missing)
   - **HTTP Auth**: none required

### API Gateway monitor

Repeat the above with:
- **Friendly Name**: Cloudach API Gateway
- **URL**: `https://your-domain.com` → port 8080 if exposed, or proxy via `/api/health` which already pings the gateway

### Status page

1. Go to **Status Pages** → **Create Status Page**.
2. Add both monitors.
3. Use the public URL as your status page (e.g. `https://stats.uptimerobot.com/XXXXXXXX`).

---

## 3. Checkly

Checkly supports API checks and browser checks with programmable assertions.

### API check

1. Sign in at https://checklyhq.com → **API checks** → **+ Add check**.
2. Settings:
   - **Name**: Cloudach Health
   - **URL**: `https://your-domain.com/api/health`
   - **Method**: GET
   - **Frequency**: 1 minute (paid) or 5 minutes (free)
3. Under **Assertions**:
   - `status` equals `200`
   - `json body` → `$.status` equals `ok`
   - `response time` less than `3000` ms

### Alert channels

Go to **Alert channels** → add Slack, PagerDuty, or email. Attach the alert channel to your check.

### Checkly CLI (IaC)

Track checks in code alongside your app:

```bash
npm install --save-dev checkly
npx checkly login
```

Create `checkly.config.js` at the repo root, then `npx checkly deploy` from CI.

---

## 4. Environment variable for API gateway URL

The Next.js `/api/health` endpoint reads `API_GATEWAY_URL` to reach the gateway internally.
Set this in Vercel (or your deployment environment):

```
API_GATEWAY_URL=http://api-gateway:8080   # internal Docker network name
# or, if publicly reachable:
API_GATEWAY_URL=https://api.your-domain.com
```

If unset, it falls back to `NEXT_PUBLIC_API_URL`.

---

## 5. Error Tracking — Sentry

### Installation

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

The wizard creates:
- `sentry.client.config.js`
- `sentry.server.config.js`
- `sentry.edge.config.js`
- Updates `next.config.js`

### Minimal manual setup (no wizard)

`sentry.server.config.js`:

```js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,         // 10 % of traces in production
  enabled: process.env.NODE_ENV === 'production',
});
```

Add to Vercel (or `.env.production`):

```
SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxx   # for source map uploads
```

### Capturing errors in API routes

```js
import * as Sentry from '@sentry/nextjs';
import { log } from '../../lib/logger';

export default async function handler(req, res) {
  try {
    // ... your logic
  } catch (err) {
    Sentry.captureException(err);
    log.error({ event: 'unhandled_error', err: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Sentry for the API gateway

```bash
cd services/api-gateway
npm install @sentry/node
```

In `src/index.js`, before other middleware:

```js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

app.use(Sentry.Handlers.requestHandler());
// ... routes ...
app.use(Sentry.Handlers.errorHandler());
```

---

## 6. Alerting thresholds (recommendations)

| Metric | Warning | Critical |
|---|---|---|
| `/api/health` response time | > 1 s | > 3 s |
| `/api/health` status | degraded | down |
| Error rate (Sentry) | > 1 % | > 5 % |
| DB query latency | > 200 ms | > 1 s |
| Redis latency | > 50 ms | > 200 ms |
| Inference (vLLM) latency | > 5 s | > 15 s |

---

## 7. Log aggregation

The api-gateway uses [pino](https://getpino.io) (JSON by default). The Next.js dashboard uses `lib/logger.js` which writes JSON to stdout in production.

Pipe logs to your preferred aggregator:

- **Datadog**: set `DD_API_KEY` + use Datadog log forwarder or Docker log driver
- **Logtail / Better Stack**: use their Node.js transport or log drain
- **CloudWatch** (ECS/EC2): logs auto-captured from stdout when `awslogs` log driver is configured
- **Vercel**: logs visible in the Vercel dashboard; export via Log Drains (Settings → Log Drains)
