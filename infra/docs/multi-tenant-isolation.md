# Multi-Tenant Isolation Architecture

**Last updated:** 2026-04-14  
**Status:** Production design — partial implementation in staging

---

## Goals

1. **Data isolation** — one tenant's data (requests, usage, API keys) cannot be accessed by another.
2. **Compute isolation** — a tenant's high-volume traffic cannot starve other tenants.
3. **Network isolation** — tenant pods cannot reach each other's inference endpoints directly.
4. **Billing isolation** — usage is tracked per tenant for accurate invoicing.
5. **Failure isolation** — a model crash in one tenant's namespace does not affect others.

---

## Tenant Tiers

| Tier | Isolation model | Dedicated GPU | Namespace |
|------|----------------|---------------|-----------|
| Developer | Shared | No | `cloudach` (shared) |
| Startup | Shared, higher rate limit | No | `cloudach` (shared) |
| Enterprise | Dedicated namespace + GPU node | Yes | `tenant-<id>` |

Shared-namespace tenants are isolated by the API gateway (JWT validation + per-key rate limiting). Enterprise tenants get hard namespace-level isolation with dedicated compute.

---

## Shared Namespace Architecture (Developer / Startup)

```
┌─────────────────────────────────────────────┐
│  Namespace: cloudach                        │
│                                             │
│  api-gateway (validates JWT + API key)      │
│      │                                      │
│      ├─► vllm-llama3-8b (shared pod)       │
│      ├─► vllm-mistral-7b (shared pod)      │
│      └─► ... (other models)                │
│                                             │
│  Redis: per-key rate limit buckets          │
│  RDS:   per-user usage rows                 │
└─────────────────────────────────────────────┘
```

**Isolation mechanisms in the shared tier:**

| Mechanism | Where | What it enforces |
|-----------|-------|-----------------|
| JWT / API key validation | api-gateway | Only valid keys can send requests |
| Per-key rate limiting | Redis (sliding window) | Default: 60 req/min; burst: 120 |
| vLLM max-tokens limit | vLLM `--max-model-len` | Prevents runaway context windows |
| Request timeout | api-gateway | 60 s hard timeout; frees GPU slot |
| Usage logging | RDS `usage_events` table | Scoped to `user_id` |
| Network policy | Kubernetes | Deny all pod-to-pod except gateway → vLLM |

---

## Dedicated Namespace Architecture (Enterprise)

```
┌────────────────────────────────────────────────────┐
│  Namespace: tenant-<tenant_id>                     │
│                                                    │
│  vllm-<model>  (dedicated GPU node via taint)     │
│      ▲                                             │
│      │ (only api-gateway in cloudach ns           │
│      │  with tenant-scoped JWT can reach here)    │
│                                                    │
│  ResourceQuota: max 2 GPUs, 8 CPU, 32 GiB RAM     │
│  NetworkPolicy: deny-all + allow from api-gateway  │
│  PodDisruptionBudget: minAvailable=1               │
└────────────────────────────────────────────────────┘
```

Dedicated tenants are provisioned via the namespace template at `infra/k8s/tenancy/namespace-template.yaml`.

### Provisioning a new Enterprise tenant

```bash
export TENANT_ID="acme"
export TENANT_GPU_QUOTA=2
export TENANT_CPU_QUOTA=8
export TENANT_MEM_QUOTA=32Gi

envsubst < infra/k8s/tenancy/namespace-template.yaml | kubectl apply -f -
```

The template creates:
- Namespace `tenant-acme`
- `ResourceQuota` capping GPU/CPU/memory
- Default deny-all `NetworkPolicy`
- Explicit allow: api-gateway in `cloudach` namespace → vLLM pods in `tenant-acme`
- `LimitRange` so containers without explicit requests get sensible defaults

---

## Network Policies

The default policy in every namespace (shared and dedicated) is **deny-all ingress and egress**.

Explicit allow rules:

```
cloudach namespace:
  internet → ALB → api-gateway          (port 80/443)
  api-gateway → vllm-*                  (port 8000)
  vllm-* → 0.0.0.0/0 (HTTPS)           (port 443, for HuggingFace download)
  vllm-* → kube-dns                     (UDP 53)
  prometheus → vllm-* (scrape)          (port 8000)
  api-gateway → RDS                     (port 5432)
  api-gateway → Redis                   (port 6379)

tenant-<id> namespace:
  api-gateway (cloudach ns) → vllm      (port 8000, namespace selector)
  vllm → 0.0.0.0/0 (HTTPS)             (port 443)
  vllm → kube-dns                       (UDP 53)
```

Tenants **cannot**:
- Reach pods in other tenant namespaces
- Reach the shared vLLM pods directly (only via api-gateway)
- Send requests to internal services (Redis, RDS) directly

---

## API-Level Tenant Isolation

### JWT Claims

Every API request carries a JWT signed by the gateway:

```json
{
  "sub": "user-uuid",
  "tenant_id": "acme",
  "tier": "enterprise",
  "model_allowlist": ["llama3-8b", "llama3-70b"],
  "rate_limit_rpm": 600,
  "exp": 1715000000
}
```

The gateway validates:
1. Signature (HMAC-SHA256, key from Secrets Manager)
2. `exp` not in the past
3. `model_allowlist` contains the requested model
4. `tenant_id` matches the API key's registered tenant

### Rate Limiting

Redis sliding-window counters keyed by `{tenant_id}:{api_key_prefix}`:

```
EXPIRE cloudach:ratelimit:{tenant_id}:{key_prefix} 60
INCR   cloudach:ratelimit:{tenant_id}:{key_prefix}
```

| Tier | Requests / min | Burst (10 s) |
|------|---------------|-------------|
| Developer | 20 | 5 |
| Startup | 60 | 15 |
| Enterprise | Configurable (default 600) | 150 |

Rate limit headers are returned on every response (`X-RateLimit-Remaining`, `X-RateLimit-Reset`).

### Model Routing

The gateway inspects `model` in the request body and routes to:
- Shared pod if `tenant.tier != enterprise`
- `http://vllm-<model>.tenant-<id>.svc.cluster.local:8000` for enterprise tenants

Enterprise tenants get a dedicated vLLM process so their context windows and KV-cache are not shared with other users.

---

## Data Isolation (Database)

All tables with user-scoped data carry a `user_id UUID NOT NULL` foreign key:

```sql
SELECT * FROM usage_events WHERE user_id = $1;
SELECT * FROM api_keys       WHERE user_id = $1;
SELECT * FROM billing_records WHERE user_id = $1;
```

**No cross-tenant query is possible through the application layer** — every query is parameterised with the JWT-extracted `sub` claim.

For enterprise tenants, `user_id` maps to the enterprise account's root user; sub-users within the account are scoped by `tenant_id`.

Row-level security (RLS) is enabled on sensitive tables as a defence-in-depth measure:

```sql
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_events_tenant_isolation ON usage_events
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

---

## GPU Isolation (Enterprise Tier)

Enterprise tenants get a dedicated node via Kubernetes node taints:

```yaml
# Node label added at provisioning time
kubectl label node <node-name> cloudach/tenant=acme

# Taint to keep shared pods off the node
kubectl taint node <node-name> cloudach/tenant=acme:NoSchedule
```

The enterprise vLLM pod has a matching toleration + node affinity:

```yaml
tolerations:
  - key: cloudach/tenant
    value: acme
    effect: NoSchedule
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: cloudach/tenant
              operator: In
              values: [acme]
```

This guarantees the enterprise vLLM process has exclusive GPU access.

---

## Security Audit Checklist

- [ ] Network policies applied and tested with `kubectl exec` cross-namespace ping (must fail)
- [ ] JWT validation rejects expired, tampered, and wrong-issuer tokens
- [ ] Rate limiter returns 429 when limits are exceeded
- [ ] Model allowlist blocks requests to models not in the tenant's plan
- [ ] `usage_events` rows for one tenant cannot be fetched with another tenant's JWT
- [ ] RLS policies verified with `SET app.current_user_id = '<wrong-user>'`
- [ ] Enterprise GPU node cannot be scheduled with shared pods (taint test)
- [ ] Secrets (JWT key, DB URL) not present in pod env vars — only via CSI driver mount

---

## Roadmap

| Feature | Status | Priority |
|---------|--------|---------|
| Shared namespace network policies | Done (CLO-32) | — |
| Enterprise namespace template | Done (CLO-32) | — |
| Redis RLS enforcement | Planned | High |
| Per-tenant VPC (ultra-isolation) | Backlog | Low |
| Audit log per tenant (CloudTrail) | Planned | Medium |
| Model allowlist enforcement in gateway | In progress | High |
