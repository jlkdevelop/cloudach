# Cloudach Engineering Standards

## Repository Layout

```
cloudach/
├── pages/              # Next.js frontend (landing page + dashboard)
├── components/         # React components
├── styles/             # CSS
├── services/
│   └── api-gateway/    # OpenAI-compatible API gateway (Node.js)
├── infra/
│   ├── k8s/            # Kubernetes manifests
│   └── db/             # Database migration scripts
├── .github/
│   └── workflows/      # CI/CD pipelines
├── docker-compose.yml  # Local dev environment
└── .env.example        # Environment variable template
```

## Branching Strategy

- `main` — production. Protected. Requires PR + 1 approval + passing CI.
- `develop` — integration branch. PRs merge here first when coordination is needed.
- Feature branches: `feat/<short-description>` (e.g., `feat/api-key-auth`)
- Bug fixes: `fix/<short-description>`
- Infra changes: `infra/<short-description>`

## Pull Request Process

1. Branch off `main` (or `develop` for coordinated work).
2. Keep PRs focused — one logical change per PR.
3. Required: CI passes (lint, type-check, build, test).
4. Required: 1 approval from a team member.
5. Squash-merge to keep `main` history clean.
6. PR title format: `[type] Short description` where type is `feat`, `fix`, `infra`, `chore`, `docs`.

## Testing Requirements

| Layer | Requirement |
|-------|-------------|
| API Gateway | Unit tests for auth, rate-limiting, routing logic. Integration tests against real Postgres + Redis (via docker-compose). |
| Frontend | Smoke tests for critical pages. No required coverage floor initially. |
| Infra | `kubectl diff` preview in CI before apply. |

Run tests locally before pushing:
```bash
# Backend
cd services/api-gateway && npm test

# Frontend
npm test
```

## Git Push Requirement (Mandatory for All Agents)

All code work MUST be pushed to GitHub. Before any git push, configure the remote with the GITHUB_TOKEN:

```bash
git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/jlkdevelop/cloudach.git
```

The `GITHUB_TOKEN` environment variable is available as a Paperclip secret. Every task must end with code committed and pushed to GitHub.

Workflow per task:
1. Configure remote with GITHUB_TOKEN (as above)
2. Create branch: `feat/<task-name>` or `fix/<task-name>`
3. Commit work with descriptive messages
4. Push branch to origin
5. Squash-merge to main when complete

## Local Development Setup

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- `kubectl` (for K8s interaction)
- `gcloud` CLI (for GCP)

### Steps

```bash
# 1. Clone
git clone https://github.com/jlkdevelop/cloudach.git
cd cloudach

# 2. Environment
cp .env.example .env.local
# Edit .env.local with your values

# 3. Start backend services
docker-compose up -d

# 4. Start frontend
npm install && npm run dev
# → http://localhost:3000

# 5. API gateway runs at http://localhost:8080
```

## Deploy Cadence

- **Frontend** (Vercel): Auto-deploys on every push to `main`. Preview deployments for every PR.
- **Backend** (GKE): Deploys on push to `main` when `services/**` or `infra/k8s/**` changes.
- **Infra changes**: Apply K8s manifests via CI only — no manual `kubectl apply` in production.

## Cloud Infrastructure

| Resource | Provider | Details |
|----------|----------|---------|
| Kubernetes | GCP GKE | `cloudach-prod` cluster, `us-central1-a` |
| Container Registry | GCP Artifact Registry | `us-central1-docker.pkg.dev/PROJECT_ID/cloudach` |
| GPU Nodes | GCP (L4) | Node pool `gpu-pool`, auto-scaled 1–4 nodes |
| Database | GCP Cloud SQL (Postgres 16) | Private IP, automated backups |
| Cache | GCP Memorystore (Redis) | 1GB, standard tier |
| Frontend | Vercel | Auto-deploy from GitHub |
| DNS | Cloudflare | `cloudach.com`, `api.cloudach.com` |

## Secrets Management

- **Never commit secrets.** Use `.env.local` locally (gitignored).
- Production secrets live in **GCP Secret Manager** and are injected into K8s as `Secret` objects.
- GitHub Actions uses **GitHub Secrets** for CI/CD credentials.
- Rotate all secrets on engineer offboarding.

## Monitoring

- **Metrics**: GKE built-in Cloud Monitoring + custom dashboards for GPU utilization, inference latency, token throughput.
- **Logs**: Cloud Logging with structured JSON logs.
- **Alerts**: PagerDuty integration for P0/P1 issues (error rate >1%, latency p99 >5s, GPU OOM).
- **Uptime**: Vercel analytics for frontend. Custom health endpoint `/health` on API gateway.

## On-Call

- On-call rotation established once first engineer joins.
- Runbooks live in `infra/runbooks/`.
- Escalation: CTO → CEO for infrastructure P0s.
