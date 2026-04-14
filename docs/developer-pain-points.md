# Top 3 Developer Pain Points

Analysis of the current codebase and docs as of April 2026. These are the most likely friction points for a developer trying to integrate Cloudach.

---

## Pain Point 1: No public API reference

**What's missing:** There is no `/docs` or API reference listing endpoints, parameters, and response shapes. A developer looking at `api.cloudach.com` has no machine-readable or human-readable spec.

**Evidence in codebase:** `services/api-gateway/src/routes/` defines endpoints inline in Express routes with no OpenAPI annotations or schema exports. The `/v1/models` response, error envelope shape (`{ error: { message, type, param? } }`), and streaming SSE format are all undocumented.

**Impact:** Developers waste time guessing parameter names, misread error responses, and may default to OpenAI docs (which can diverge — e.g. Cloudach uses `sk-cloudach-` prefix, not `sk-`).

**Fix:** Generate an OpenAPI 3.1 spec from the gateway routes and host it at `api.cloudach.com/docs`. Minimal effort: add `@openapi` JSDoc comments to each route and run `swagger-jsdoc`.

---

## Pain Point 2: API key creation is only available via the dashboard UI

**What's missing:** There is no programmatic API key management endpoint. Developers building CI/CD pipelines, multi-tenant apps, or automated provisioning have to click through the dashboard.

**Evidence in codebase:** `pages/api/dashboard/api-keys.js` is a Next.js route behind `requireAuth` (session cookie auth). The API gateway (`services/api-gateway/`) has no `/v1/keys` endpoint. Provisioning a key requires a browser session.

**Impact:** Enterprises wanting to automate key rotation or provision keys per-customer are blocked. Common pattern in developer tools: `POST /v1/keys` with an admin/root key.

**Fix:** Add `POST /v1/keys`, `GET /v1/keys`, and `DELETE /v1/keys/:id` routes to the API gateway, gated by a root-level API key scope.

---

## Pain Point 3: No local development path without Docker

**What's missing:** The only documented way to run the API gateway locally is `docker-compose up`. There is no `npm run dev` equivalent for the backend, and no mock mode that works without Postgres and Redis.

**Evidence in codebase:** `services/api-gateway/src/index.js` unconditionally calls `await db.connect()` and `await redis.ping()` before starting — the process exits with code 1 if either is unavailable. The `vllm-mock` service is only available inside Docker Compose.

**Impact:** Frontend developers, contributors without Docker, and CI environments that spin up only the gateway face an error on startup. Adding a simple `MOCK_MODE=true` env that skips DB/Redis and returns canned responses would unblock most quickstart scenarios.

**Fix:** Add a `CLOUDACH_LOCAL_DEV=true` / `MOCK_MODE=true` env var path in `index.js` that skips `db.connect()` and `redis.ping()`, uses an in-memory auth stub, and routes all inference to the mock backend. Document this in the quickstart.
