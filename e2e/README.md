# E2E Tests

End-to-end tests for critical Cloudach user flows, built with [Playwright](https://playwright.dev).

## Running locally

```bash
# Install dependencies (first time)
npm ci
npx playwright install chromium

# Run all E2E tests (starts dev server automatically)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

The test runner starts `next dev` on port 3000 automatically. If a server is already running on port 3000, it is reused.

## Test coverage

| File | Flows covered |
|---|---|
| `homepage.spec.ts` | Homepage loads, hero text, nav links, no JS errors |
| `auth.spec.ts` | Signup redirect, signup error, login redirect, login error, unauthenticated redirect |
| `api-keys.spec.ts` | Empty state, create key → raw key reveal → table entry, clipboard copy, revoke key |
| `usage.spec.ts` | Stats after API call, request log entry, empty state, unauthenticated redirect |
| `api-gateway.spec.ts` | Valid key → 200, invalid key → 401, missing auth → 401, health check |

## API mocking

Tests mock all backend API routes using `page.route()` so they run without a database. This keeps them fast and deterministic in CI.

## API gateway tests

`api-gateway.spec.ts` tests run against a live gateway. Set the `GATEWAY_URL` environment variable to enable them:

```bash
GATEWAY_URL=http://localhost:8080 E2E_VALID_API_KEY=sk-cloudach-... npm run test:e2e
```

In CI, these tests run when the full docker-compose stack is available.

## CI

E2E tests run in the `e2e` job in `.github/workflows/ci.yml` on every push and PR to `main`/`develop`. The Playwright HTML report is uploaded as an artifact on every run (retained for 7 days).
