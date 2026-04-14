# Multi-Region Deployment Architecture & CDN Strategy

## Overview

Cloudach uses a 3-region active-active topology with Cloudflare as the global traffic layer. Inference requests route to the nearest healthy GPU cluster; fallback to secondary/tertiary regions happens automatically within ~60 seconds.

---

## Region Topology

| Region | GCP Region | Role | GPU Pool |
|--------|-----------|------|----------|
| US (primary) | `us-central1` | Write primary + inference | L4 × 1–4 nodes |
| EU | `europe-west4` | Read replica + inference | L4 × 1–4 nodes |
| APAC | `asia-southeast1` | Read replica + inference | L4 × 1–4 nodes |

All regions run identical GKE clusters (`cloudach-<region>`) with:
- System node pool (e2-standard-4, always-on, 2 nodes)
- On-demand GPU pool (g2-standard-16 / L4, min 1, max 4)
- Spot GPU burst pool (g2-standard-16 / L4, min 0, max 4)

---

## Request Routing

```
User Request
    │
    ▼
Cloudflare (latency-based steering)
    │  ── measures RTT to each origin pool
    │  ── routes to nearest healthy pool
    │
    ├─► Origin Pool: us-central1  (api.cloudach.com → us LB IP)
    ├─► Origin Pool: europe-west4 (api.cloudach.com → eu LB IP)
    └─► Origin Pool: asia-southeast1 (api.cloudach.com → apac LB IP)
              │
              ▼
        GKE Ingress (per region)
              │
              ▼
        api-gateway (Node.js)
        - JWT validation
        - tenant routing
        - rate limiting
              │
              ▼
        vLLM Deployment (GPU pods)
```

### DNS & Load Balancing

- Single CNAME: `api.cloudach.com` → Cloudflare
- Cloudflare Load Balancer with **latency steering** (monitors p50 RTT to each origin)
- Health check: `GET /health` every 30 s; pool unhealthy after 2 consecutive failures
- Failover: automatic within ~60 s (CF health-check + steering update cycle)

---

## CDN Strategy

### Cacheable Endpoints

| Path | Cache TTL | Cache Key | Notes |
|------|-----------|-----------|-------|
| `GET /v1/models` | 5 minutes | Host + path | Model catalog; rarely changes |
| `GET /health` | 30 seconds | Host + path | Allows CF to serve stale during brief outages |
| Static assets (`/_next/*`, `/static/*`) | 1 year | Path | Immutable hashed filenames |
| `GET /` and landing pages | 10 minutes | Path | Marketing pages via Vercel edge |

### Bypass (Never Cache)

| Path | Reason |
|------|--------|
| `POST /v1/*` | Inference — unique per request |
| `POST /v1/chat/completions` | Streaming responses |
| Requests with `Authorization` header | Per-tenant; must not bleed across users |

### Cloudflare Cache Rules (applied in order)

1. **Bypass rule**: `http.request.method eq "POST"` → Cache Level: Bypass
2. **Bypass rule**: `http.request.headers["authorization"] exists` → Cache Level: Bypass
3. **Cache rule**: `http.request.uri.path matches "^/v1/models"` → Edge TTL: 5 min
4. **Cache rule**: `http.request.uri.path eq "/health"` → Edge TTL: 30 s

---

## Terraform Structure

```
infra/terraform/
├── main.tf                  # Root: VPCs, GKE clusters, Cloud SQL
├── variables.tf
├── outputs.tf
├── cloudflare.tf            # CF LB, health checks, cache rules
└── modules/
    ├── gke-region/          # Reusable per-region GKE module
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── cloudsql/            # HA primary + read replicas
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

---

## Failover & Disaster Recovery

### Automatic Failover (Cloudflare)

1. Cloudflare health checks detect origin pool failure
2. Traffic re-routes to next-lowest-latency healthy pool within 60 s
3. No manual intervention required for transient failures

### Manual Failover Runbook

**Scenario: us-central1 fully down, promote EU to primary**

```bash
# 1. Verify the failure
gcloud container clusters get-credentials cloudach-europe-west4 --region europe-west4
kubectl get pods -n cloudach

# 2. Promote Cloud SQL EU read replica to primary
gcloud sql instances promote-replica cloudach-postgres-eu-replica

# 3. Update api-gateway DB connection string to point at EU primary
kubectl set env deployment/api-gateway \
  DATABASE_URL="postgresql://cloudach:$(gcloud secrets versions access latest \
    --secret=db-password)@<eu-primary-ip>/cloudach" \
  -n cloudach

# 4. Update Cloudflare LB to mark US pool as disabled
# (via Terraform or CF dashboard — us pool priority → disabled)

# 5. Verify inference is healthy in EU
curl https://api.cloudach.com/health
```

**RTO**: ~15 minutes (manual), ~60 s (automatic CF failover for inference)
**RPO**: ~5 minutes (Cloud SQL replication lag under normal load)

### Backups

- Cloud SQL: automated daily backups, 7-day retention; point-in-time recovery enabled
- Model weights: stored in GCS, replicated across regions via `gsutil -m rsync`
- K8s manifests: source-of-truth in this repo (GitOps)

---

## Cost Model

### Per-Region Infrastructure (Monthly Estimates)

| Component | Single Region | Per Additional Region |
|-----------|-------------|----------------------|
| GKE system nodes (2× e2-std-4, always-on) | $97 | $97 |
| GPU node — on-demand L4 baseline (1 node) | $240 | $240 |
| GPU node — spot burst (avg 1 node, 50% util) | $84 | $84 |
| Cloud SQL HA (db-n1-standard-4, 100 GB SSD) | $246 | $48 (read replica) |
| Redis Memorystore (1 GB standard) | $49 | $49 |
| Networking / LB / egress (~500 GB) | ~$45 | ~$45 |
| **Subtotal** | **~$761** | **~$563** |

> GPU costs assume L4 on-demand at $0.70/hr, spot at ~$0.245/hr.

### Scenario Estimates

| Setup | Monthly Cost | Notes |
|-------|-------------|-------|
| Single region (current) | ~$761 | No HA |
| 2 regions (US + EU) | ~$1,324 | EU adds read replica only for DB |
| 3 regions (US + EU + APAC) | ~$1,887 | Full topology |

### Spot GPU Strategy

Recommended: **1 on-demand baseline + spot for burst**
- On-demand guarantees minimum capacity; spot handles traffic spikes
- At 50% spot utilisation: ~43% GPU cost reduction vs all on-demand
- Risk: spot preemption during burst — mitigated by KEDA scale-out to on-demand if spot unavailable

### Break-Even Analysis

At 3-region cost (~$1,887/mo):
- Required revenue to break even at 30% infra margin: ~$6,290/mo
- At $8/M tokens (current target): requires ~786 M tokens/mo (~26M tokens/day)
- EU region adds ~$563/mo; justifiable with 2+ enterprise EU customers ($300+/mo each)

---

## Implementation Checklist

- [x] Architecture doc (this file)
- [x] Terraform: root module (VPC, GKE clusters, Cloud SQL)
- [x] Terraform: `modules/gke-region` (reusable per-region cluster)
- [x] Terraform: `modules/cloudsql` (HA primary + cross-region replicas)
- [x] Terraform: Cloudflare LB + health checks + cache rules
- [ ] Apply Terraform in staging (manual step — requires GCP credentials)
- [ ] Validate Cloudflare LB failover in staging
- [ ] Set up GCS bucket replication for model weights (future task)
