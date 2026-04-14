# Cloudach GPU Infrastructure — Cost Model

> Last updated: 2026-04-14  
> Region: `us-central1` (GCP)  
> GPU: NVIDIA L4 (24 GB VRAM) on GKE

---

## 1. Instance Types & On-Demand Rates

| Node type | vCPUs | RAM | GPU | On-demand $/hr | Spot $/hr (est.) |
|-----------|-------|-----|-----|---------------|-----------------|
| `g2-standard-8` | 8 | 32 GB | 1× L4 | $0.897 | ~$0.27 (70% off) |
| `g2-standard-16` | 16 | 64 GB | 1× L4 | $1.117 | ~$0.34 |
| `g2-standard-24` | 24 | 96 GB | 2× L4 | $1.783 | ~$0.54 |
| `g2-standard-48` | 48 | 192 GB | 4× L4 | $3.503 | ~$1.05 |

We use **`g2-standard-8`** as our baseline (1 L4, sufficient for Llama 3 8B at bf16 with 90% GPU memory utilization).

### Supporting infrastructure (shared, always-on)

| Resource | Spec | $/hr |
|----------|------|------|
| GKE Control Plane | Standard tier | $0.10 |
| Cloud SQL Postgres | `db-g1-small`, 20 GB SSD | ~$0.03 |
| Memorystore Redis | 1 GB standard | ~$0.016 |
| GKE system node pool | `e2-medium` × 2 | ~$0.067 |
| Load Balancer + static IP | — | ~$0.025 |

**Fixed monthly floor (no GPU active):** ~$180/month  

---

## 2. Per-Hour Cost at Various Replica Counts

| Active vLLM pods | GPU nodes | On-demand $/hr | Spot $/hr |
|-----------------|-----------|---------------|----------|
| 0 (scale-to-zero) | 0 | $0.00 | $0.00 |
| 1 | 1 | $0.897 | ~$0.27 |
| 2 | 2 | $1.794 | ~$0.54 |
| 4 (max) | 4 | $3.588 | ~$1.08 |

> Add ~$0.24/hr fixed infra overhead to each row for total cluster cost.

---

## 3. Throughput & Cost Per Token

### Llama 3 8B on L4 (vLLM v0.4.2, bf16, 8 K context)

Measured at 90% GPU memory utilization, mixed input/output lengths (avg 200 in / 400 out tokens):

| Concurrency | Throughput (tok/s) | p50 TTFT (ms) | p99 TTFT (ms) |
|-------------|-------------------|--------------|--------------|
| 1 request | ~800 tok/s | 80 | 120 |
| 4 requests | ~2 400 tok/s | 200 | 600 |
| 8 requests | ~3 600 tok/s | 500 | 1 800 |
| 16 requests | ~4 200 tok/s | 1 200 | 4 500 |

> Beyond 16 concurrent requests, TTFT degrades past our 5 s SLO — the HPA/KEDA trigger fires at 5 waiting requests per pod.

### Cost per 1M tokens (on-demand, 1 replica, 4 req concurrency)

```
throughput     = 2,400 tokens/sec = 8,640,000 tokens/hr
cost/hr        = $0.897 (GPU) + $0.24 (fixed) = $1.137
cost/M tokens  = $1.137 / 8.64 ≈ $0.132 per million tokens
```

| Utilization | tok/hr | $/M tokens (on-demand) | $/M tokens (spot) |
|-------------|--------|----------------------|-----------------|
| 25% (1 replica) | ~2.16 M | $0.53 | ~$0.16 |
| 50% (1 replica) | ~4.32 M | $0.26 | ~$0.08 |
| 75% (1 replica) | ~6.48 M | $0.18 | ~$0.05 |
| 100% (1 replica)| ~8.64 M | $0.13 | ~$0.04 |
| 100% (4 replicas)| ~34.6 M | $0.13 | ~$0.04 |

> Key insight: **utilization is the biggest cost lever**. Scale-to-zero + KEDA keeps cost at ~$0 when idle, while on-demand cost at low utilization is 4× the fully-loaded rate.

---

## 4. Spot Instance Viability

### Pros
- ~70% cheaper than on-demand for GPU nodes
- GKE Spot Pods support (`cloud.google.com/gke-spot: "true"`)

### Cons & Mitigations

| Risk | Mitigation |
|------|-----------|
| Preemption at any time (avg L4 spot preemption: ~2–5% per hour) | Always keep ≥1 on-demand pod as a baseline; use spot for burst replicas (2–4) |
| Model re-load latency (~90s after pod restart) | PVC-based model cache reduces reload to ~30s on warm disks |
| No spot SLA | Accept for staging; on-demand minimum for production tenants |

### Recommended policy

```
replica 0:   on-demand   (baseline, never evicted)
replicas 1+: spot        (burst capacity, tolerate occasional cold start)
```

Estimated blended rate (1 on-demand + 1 spot burst at 50% utilization):
- On-demand pod: $0.897/hr
- Spot pod (50% of time): $0.27/hr × 0.5 = $0.135/hr
- **Blended: ~$1.03/hr vs $1.794/hr all on-demand → ~43% savings**

---

## 5. Right-Sizing Recommendations

| Scenario | Recommendation |
|----------|---------------|
| Llama 3 8B, single-tenant staging | 1× `g2-standard-8`, KEDA scale-to-zero |
| Llama 3 8B, production, SLO <2s TTFT | 1× on-demand + KEDA burst to 3 spot |
| Llama 3 70B | 2× `g2-standard-24` (2× L4 tensor parallel) — not yet deployed |
| High throughput batch inference | Reserved 1-year CUD: ~37% savings vs on-demand |

---

## 6. Monthly Cost Scenarios

### Staging (this environment)
Scale-to-zero. Assume GPU is active 8 hrs/day (developer working hours):

```
GPU: 1 × $0.897 × 8hr × 30d = $215/month
Fixed infra:                  = $180/month
Total:                        ≈ $395/month
```

### Light production (10 customers, low traffic)
1 on-demand GPU + spot burst 2 hrs/day:

```
On-demand GPU: $0.897 × 24 × 30   = $645/month
Spot burst:    $0.27 × 2 × 30     = $16/month
Fixed infra:                       = $180/month
Total:                             ≈ $841/month
Revenue at $0.50/M tokens, 100M tokens/month = $50/month  ← not yet profitable
```

### Mid-tier production (50 customers, 500M tokens/month)
2 on-demand + 2 spot burst 6 hrs/day:

```
On-demand:  2 × $0.897 × 24 × 30  = $1,290/month
Spot burst: 2 × $0.27 × 6 × 30   = $97/month
Fixed:                             = $180/month
Total:                             ≈ $1,567/month
Revenue at $0.50/M tokens, 500M tokens = $250/month  ← still needs pricing review
```

> **Action item:** Pricing review needed with CEO/CTO. At $0.50/M tokens we're at ~6× cost. Break-even at ~$8/M tokens for mid-tier production, or need higher volume to amortize fixed infra costs.

---

## 7. Autoscaling Cost Controls

The KEDA ScaledObject (`infra/k8s/autoscaling/keda-scaledobject.yaml`) implements:

1. **Scale to zero** — `minReplicaCount: 0`, 5-minute cooldown before scale-down
2. **Queue-depth trigger** — 1 replica per 5 waiting requests; activates on first request
3. **GPU cache trigger** — secondary trigger prevents OOM at high utilization
4. **Scale-down stabilization** — 5-minute window prevents flapping

Expected staging cost without this: ~$645/month (always-on 1 GPU).  
Expected staging cost with KEDA scale-to-zero: ~$215/month (8 hr active/day).

---

## 8. Monitoring Cost Signals

Track these metrics to catch cost anomalies:

| Metric | Alert threshold | Action |
|--------|----------------|--------|
| GPU idle time > 30 min | `vllm:num_requests_waiting == 0` for 30m | Verify KEDA scale-down fired |
| Replica count stuck at max | 4 pods for > 1 hr | Check for stuck requests or autoscaler bug |
| Cost/token > $1.00/M | Cloud Billing alert | Review concurrency, check for unoptimized prompts |
| Node pool > 4 nodes | GKE cluster autoscaler | Verify quota and check for runaway scaling |
