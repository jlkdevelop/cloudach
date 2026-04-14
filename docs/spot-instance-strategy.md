# Spot Instance Strategy — Cloudach GPU Inference

> Last updated: 2026-04-14  
> Applies to: GCP g2-standard-8 (L4 GPU), AWS g6.2xlarge (L4 GPU)

---

## Summary

Spot/preemptible GPU instances offer **~65–70% savings** vs. on-demand but can be interrupted with short notice. This document defines which Cloudach workloads can safely run on spot and how to minimize user impact when preemption occurs.

---

## 1. Spot Interruption Characteristics

### GCP Preemptible / Spot VMs

| Property | Value |
|----------|-------|
| Notice before termination | 30 seconds (ACPI shutdown signal) |
| Average preemption rate (L4, us-central1) | ~2–5% per instance-hour |
| Maximum runtime | 24 hours (preemptible); unlimited (Spot VM) |
| Spot VM pricing | ~70% discount vs on-demand |
| GKE support | `cloud.google.com/gke-spot: "true"` node label |
| Availability | Subject to capacity; may be unavailable during regional spikes |

### AWS EC2 Spot

| Property | Value |
|----------|-------|
| Notice before termination | 2-minute Spot Instance Interruption Notice (via EC2 metadata) |
| Average interruption rate (g6.2xlarge, us-east-1) | ~5–10% per instance-hour |
| Spot pricing | ~60–75% discount vs on-demand |
| EKS support | `eks.amazonaws.com/capacityType: SPOT` node label |
| Fault-tolerant feature | Spot interruption handler DaemonSet (aws-node-termination-handler) |

---

## 2. Workload Classification

### Tier A — Spot-Unsafe (On-Demand / Reserved Only)

These workloads must not run on spot:

| Workload | Reason |
|----------|--------|
| Baseline production replica (≥1 pod per tenant) | Cold restart = 30–90s downtime; SLO breach |
| Real-time streaming completions with TTFT SLO < 2s | In-flight requests interrupted = failed API calls |
| Enterprise-tier dedicated inference pods | SLA contractual obligation |
| Fine-tuning jobs with uncommitted checkpoints | Preemption loses training progress |

**Policy:** Always maintain at least **1 on-demand pod per active tenant namespace**.

---

### Tier B — Spot-Tolerant (Recommended for Cost Savings)

| Workload | Justification | Spot Config |
|----------|---------------|-------------|
| Burst replicas (beyond baseline) | Requests queue-dispatched; baseline handles failover | Up to max_replicas - 1 |
| Staging / development inference | Dev tolerance for cold restarts | All-spot acceptable |
| Batch inference jobs | See Section 5; checkpointing mitigates preemption | All-spot |
| Model evaluation / benchmarking | Stateless; re-run on failure | All-spot |
| Load testing | Disposable workload | All-spot |

---

### Tier C — Spot with Guard Rails

| Workload | Guard Rail |
|----------|-----------|
| SLO-governed production burst (TTFT < 5s) | Spot pods with client-side retry (3× exponential backoff) |
| Multi-replica inference with KEDA | On-demand baseline; spot pods scale in/out before on-demand |

---

## 3. KEDA-Based Spot Burst Policy

The production autoscaling stack (KEDA ScaledObject at `infra/k8s/autoscaling/keda-scaledobject.yaml`) implements:

```
Scaling tier:
  Replica 0:  on-demand  (baseline, cloud.google.com/gke-spot=false)
  Replicas 1+: spot      (burst, cloud.google.com/gke-spot=true)
```

### Pod Priority Classes

Two `PriorityClass` resources enforce eviction order:

```yaml
# infra/k8s/autoscaling/priority-classes.yaml (reference)
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: inference-baseline
value: 1000          # on-demand pods — evict last
globalDefault: false
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: inference-burst
value: 500           # spot pods — evict first under resource pressure
globalDefault: false
```

### Node Affinity for Spot Burst Pods

```yaml
# In the burst replica PodTemplateSpec
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
            - key: cloud.google.com/gke-spot
              operator: In
              values: ["true"]
tolerations:
  - key: cloud.google.com/gke-spot
    operator: Equal
    value: "true"
    effect: NoSchedule
```

---

## 4. Handling Preemption Events

### GCP 30-Second Shutdown Grace Period

When GCP signals preemption (SIGTERM → ACPI shutdown):

1. **vLLM** receives SIGTERM, stops accepting new requests.
2. In-flight requests (≤30s outstanding) complete or time out.
3. KEDA detects pod loss → re-provisions a replacement spot pod.
4. API gateway routes new requests to remaining on-demand pod (queue depth increase tolerated).

**Configuration required** in the vLLM `Deployment`:
```yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 25  # flush in 25s; leaves 5s buffer
```

### AWS 2-Minute Notice

For AWS deployments, deploy `aws-node-termination-handler`:
```bash
helm install aws-node-termination-handler \
  aws/aws-node-termination-handler \
  --set enableSpotInterruptionDraining=true \
  --set enableScheduledEventDraining=true
```

This cordons the node 2 minutes before termination and drains pods gracefully.

---

## 5. Spot for Batch Inference

Batch jobs (non-real-time, large offline workloads) are the highest-value spot use case:

- **Preemption tolerance:** HIGH — jobs checkpoint every N tokens; restart resumes from checkpoint.
- **Scheduling window:** 2:00–8:00 UTC (low on-demand spot competition).
- **Savings:** All-spot batch cluster saves ~70% vs on-demand.

### Checkpoint Strategy

```python
# Pseudo-code for batch inference with checkpointing
CHECKPOINT_INTERVAL = 100  # requests per checkpoint

for i, request in enumerate(batch_requests):
    result = vllm_client.complete(request)
    results.append(result)

    if i % CHECKPOINT_INTERVAL == 0:
        save_checkpoint(results, checkpoint_path=f"gs://cloudach-batch/{job_id}/ckpt_{i}.jsonl")
```

### Kubernetes Job with Restart Policy

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: batch-inference-job
spec:
  backoffLimit: 10           # retry up to 10 times on spot preemption
  template:
    spec:
      restartPolicy: OnFailure
      nodeSelector:
        cloud.google.com/gke-spot: "true"
      tolerations:
        - key: cloud.google.com/gke-spot
          operator: Equal
          value: "true"
          effect: NoSchedule
      containers:
        - name: batch-worker
          image: cloudach/batch-worker:latest
          env:
            - name: CHECKPOINT_BUCKET
              value: gs://cloudach-batch
```

---

## 6. Cost Impact Summary

| Configuration | Monthly GPU Cost (1 replica, 24hr) | Preemption Risk |
|--------------|-------------------------------------|-----------------|
| All on-demand | $646/mo | None |
| All spot | $194/mo | 2–5%/hr |
| 1 on-demand + spot burst (50% utilization) | ~$420/mo | Burst only |
| Reserved 1yr | $413/mo | None |
| Reserved 1yr + spot burst | ~$430/mo | Burst only |

> **Recommended for production:** 1 on-demand baseline + KEDA spot burst → ~$420/mo (35% vs all on-demand)

---

## 7. Monitoring Spot Health

Add these Prometheus alerts to the monitoring stack:

```yaml
# infra/k8s/monitoring/spot-alerts.yaml
groups:
  - name: spot-preemption
    rules:
      - alert: SpotNodePreempted
        expr: kube_node_status_condition{condition="Ready",status="false"} == 1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Spot node not ready — possible preemption"

      - alert: BaselineReplicaDown
        expr: kube_deployment_status_replicas_available{deployment="vllm-inference"} < 1
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "All vLLM replicas down — check on-demand node pool"
```

---

## 8. Recommendations by Environment

| Environment | Strategy | Rationale |
|-------------|----------|-----------|
| Staging | All spot (1 pod) | Developers tolerate cold starts; 70% savings |
| Production (≤ 10 customers) | 1 on-demand + spot burst | SLO preserved via baseline; burst is cheap |
| Production (> 50 customers) | 2 reserved + spot burst | Reserved for predictable base load |
| Enterprise dedicated | All on-demand or reserved | SLA contractual; no spot risk |
| Batch jobs | All spot | Stateless + checkpointed; highest savings |
