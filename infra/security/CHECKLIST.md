# Security Checklist — Cloudach

_Inspired by Stripe and Cloudflare security posture. Updated: 2026-04-14._

---

## HTTP Security Headers

| Header | Value | Status |
|--------|-------|--------|
| `Content-Security-Policy` | Restricts scripts, styles, fonts, connect to `'self'`; blocks framing | ✅ Configured in `next.config.js` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (2 years) | ✅ Configured |
| `X-Frame-Options` | `DENY` | ✅ Configured |
| `X-Content-Type-Options` | `nosniff` | ✅ Configured |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ Configured |
| `Permissions-Policy` | Denies camera, microphone, geolocation | ✅ Configured |

> All headers applied globally via `next.config.js` `headers()` async function.

---

## Dependency Vulnerabilities (npm audit)

Run `npm audit` before every production deploy. Target: **0 critical, 0 high**.

| Package | CVE / Advisory | Severity | Status |
|---------|----------------|----------|--------|
| `next` (≤14.2.2) | GHSA-f82v-jwr5-mffw — Authorization bypass in middleware | critical | ✅ Fixed — upgraded to 14.2.35 |
| `cookie` (<0.7.0) | GHSA-pxg6-pf52-xh8x — Out-of-bounds chars in cookie name | low | ✅ Fixed — upgraded to ^1.0.2 |
| `next` (9.5.0–15.5.14) | GHSA-9g9p-9gw9-jx7f — DoS via Image Optimizer remotePatterns | high | ⚠️ Not affected — `remotePatterns` not configured |
| `next` (9.5.0–15.5.14) | GHSA-ggv3-7p47-pfv8 — HTTP request smuggling in rewrites | high | ⚠️ Not affected — no user-controlled rewrites |
| `next` (9.5.0–15.5.14) | GHSA-h25m-26qc-wcjf — RSC deserialization DoS | high | ⚠️ Not affected — using Pages Router, not App Router |
| `next` (9.5.0–15.5.14) | GHSA-q4gf-8mx6-v5v3 / GHSA-3x4c-7xq6-9pq8 — Server Components DoS / disk cache growth | high | ⚠️ Not affected — Pages Router only |

**Standing mitigations for "not affected" items:**
- Do NOT add `remotePatterns` to image config without security review.
- Do NOT use user-controlled values in `rewrites()`.
- Do NOT migrate to App Router without re-auditing these advisories.

---

## Authentication & Authorization

- [ ] JWT secrets stored in environment variables, never in source code.
- [ ] JWT tokens expire (check `jsonwebtoken` `expiresIn` option in all signing calls).
- [ ] Passwords hashed with `bcryptjs` (min cost factor 10) — never stored in plaintext.
- [ ] All API routes validate the JWT before processing requests.
- [ ] Admin-only routes check role claims, not just authentication status.
- [ ] No secrets committed to git — run `git log --all -S 'secret'` periodically.

---

## Database (PostgreSQL)

- [ ] DB credentials loaded from environment variables (`DATABASE_URL` or individual vars).
- [ ] DB not exposed to public internet — reachable only from application VPC/subnet.
- [ ] Parameterized queries used everywhere (`pg` library — use `$1`, `$2` placeholders).
- [ ] DB user has least-privilege access (no `SUPERUSER`; only SELECT/INSERT/UPDATE/DELETE on app tables).
- [ ] Automatic backups enabled (daily, retention ≥ 7 days).
- [ ] DB SSL connections enforced (`ssl: { rejectUnauthorized: true }` in `pg` config).

---

## CI/CD Pipeline (GitHub Actions)

- [ ] `GITHUB_TOKEN` scoped to minimum required permissions.
- [ ] Production secrets (`GCP_SA_KEY`, `VERCEL_TOKEN`) stored as GitHub environment secrets, not repository secrets where possible.
- [ ] Workflows use pinned action versions (`@v4`, not `@latest` or `@main`).
- [ ] `npm ci` used instead of `npm install` in CI for reproducible installs.
- [ ] `npm audit` step added to CI — fail on critical/high.
- [ ] Docker images tagged with commit SHA (not `latest`) for traceability.
- [ ] Deployment only triggers on `main` branch pushes (not PRs or feature branches).

### Recommended CI audit step (add to `ci.yml`):
```yaml
- name: Security audit
  run: npm audit --audit-level=critical
```

---

## Secrets Management

- [ ] No hardcoded credentials in code, configs, or Dockerfiles.
- [ ] `.env` and `.env.local` files in `.gitignore`.
- [ ] Production secrets rotated quarterly or after any suspected compromise.
- [ ] GCP Service Account key (`GCP_SA_KEY`) has minimum IAM roles: `roles/artifactregistry.writer`, `roles/container.developer`.
- [ ] API keys have expiry dates where the provider supports it.

---

## Network & Infrastructure (GKE)

- [ ] All inter-service traffic uses mTLS (Istio or GKE Workload Identity).
- [ ] Network Policies restrict pod-to-pod communication to required paths only.
- [ ] Kubernetes namespaces separate production and staging workloads.
- [ ] Ingress controller configured with TLS termination (cert-manager or GCP-managed certs).
- [ ] No container runs as `root` — Dockerfiles use non-root user.
- [ ] Resource limits (CPU/memory) defined for all Kubernetes deployments.
- [ ] Public endpoints proxied through Cloudflare for DDoS protection and WAF.

---

## Monitoring & Alerting

- [ ] Prometheus + Grafana deployed in `cloudach` namespace (see `infra/k8s/monitoring/`).
- [ ] Alerts configured for: HTTP 5xx spike, p95 latency > 2s, pod crash loop, DB connection pool exhaustion.
- [ ] Logs centralized (GCP Cloud Logging or equivalent).
- [ ] Abnormal auth failures (>10/min per IP) trigger an alert and rate-limit.
- [ ] Dependency vulnerability scan runs weekly (GitHub Dependabot or Snyk).

---

## Cloudflare / Stripe Security Posture Lessons

**Cloudflare:**
- Every public endpoint sits behind a WAF with OWASP ruleset enabled.
- Bot protection (Bot Fight Mode) on all unauthenticated API routes.
- Rate limiting: 100 req/min per IP on `/api/*`, stricter on auth endpoints (10 req/min).
- DDoS mitigation is automatic via Cloudflare's Anycast network.
- All HTTP traffic force-redirected to HTTPS at the CDN edge.

**Stripe:**
- Secrets scoped to the minimum: restricted keys per service, never full-access keys in application code.
- All API calls authenticated via HMAC signature verification (for webhooks).
- Idempotency keys used on all mutating API requests to prevent replay attacks.
- Audit logs retained for 90 days minimum, immutable (write-once).
- Regular penetration testing with results tracked as security tickets.

---

## Checklist Review Schedule

| Frequency | Action |
|-----------|--------|
| Every deploy | `npm audit --audit-level=critical` passes |
| Weekly | Review Dependabot / GitHub Security alerts |
| Monthly | Rotate any short-lived credentials; review IAM permissions |
| Quarterly | Full checklist audit; penetration test (or external review) |
| On incident | Post-mortem → update RUNBOOK.md and this checklist |
