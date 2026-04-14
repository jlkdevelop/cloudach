# Auto-Scaling Policy Reference — Cloudach Inference Platform

> Last updated: 2026-04-14  
> Cluster: GKE `cloudach-prod`, region `us-central1`  
> Autoscaler: KEDA v2.14 + GKE Cluster Autoscaler

---

## Overview

Cloudach uses a two-layer autoscaling architecture:

1. **Pod autoscaling (KEDA)** — scales vLLM Deployment replicas based on inference queue depth and GPU KV-cache utilization.
2. **Node autoscaling (GKE Cluster Autoscaler)** — provisions or removes GPU nodes as pod replica demand changes.

Scale-to-zero is the cornerstone of cost control: when no requests are in-flight, vLLM pods scale to 0 and GPU nodes are released.

---

## 1. KEDA ScaledObject Configuration

Source file: `infra/k8s/autoscaling/keda-scaledobject.yaml`

### Trigger 1: vLLM Queue Depth (Primary)

```yaml
triggers:
  - type: prometheus
    metadata:
      serverAddress: http://prometheus.monitoring.svc.cluster.local:9090
      metricName: vllm_num_requests_waiting
      threshold: "5"           # 1 new replica per 5 waiting requests
      activationThreshold: "1" # wake from 0 when first request arrives
      query: sum(vllm:num_requests_waiting{namespace="cloudach"})
```

**Behavior:**
- `activationThreshold: "1"` — first queued request wakes the pod from zero. Cold start latency: ~30s (warm disk cache) or ~90s (cold).
- `threshold: "5"` — add one replica per 5 waiting requests. At peak RPS=20 with avg latency 2s, queue depth ≈ 40 → 8 replicas (bounded by `maxReplicaCount: 4`).

### Trigger 2: GPU KV-Cache Utilization (Secondary / Safety)

```yaml
  - type: prometheus
    metadata:
      serverAddress: http://prometheus.monitoring.svc.cluster.local:9090
      metricName: vllm_gpu_cache_usage_perc
      threshold: "0.85"        # scale up if any pod > 85% KV cache
      query: max(vllm:gpu_cache_usage_perc{namespace="cloudach"})
```

**Purpose:** Prevents OOM errors when long-context requests fill KV cache before queue depth spikes. Acts as a guard rail independent of queue depth.

### Scale Bounds

```yaml
spec:
  minReplicaCount: 0     # scale-to-zero when idle
  maxReplicaCount: 4     # matches g2-standard-8 node pool quota
  pollingInterval: 15    # check metrics every 15 seconds
  cooldownPeriod: 300    # wait 5 minutes idle before scaling down
```

### Scale-Down Stabilization

```yaml
advanced:
  horizontalPodAutoscalerConfig:
    behavior:
      scaleDown:
        stabilizationWindowSeconds: 300   # 5-minute window prevents flapping
        policies:
          - type: Pods
            value: 1                       # remove at most 1 pod per 60s
            periodSeconds: 60
      scaleUp:
        stabilizationWindowSeconds: 0     # scale up immediately
        policies:
          - type: Pods
            value: 2                       # add up to 2 pods per 30s
            periodSeconds: 30
```

---

## 2. GKE Node Pool Configuration

### GPU Node Pool (`gpu-l4-spot`)

```
Node pool:          gpu-l4-spot
Machine type:       g2-standard-8 (8 vCPU, 32 GB, 1× L4)
Initial nodes:      0
Min nodes:          0
Max nodes:          4
Autoscaling:        enabled
Spot VMs:           enabled (cloud.google.com/gke-spot=true)
```

### GPU Node Pool (`gpu-l4-ondemand`)

```
Node pool:          gpu-l4-ondemand
Machine type:       g2-standard-8
Initial nodes:      0
Min nodes:          0
Max nodes:          1
Autoscaling:        enabled
Spot VMs:           disabled
```

**Important:** The Cluster Autoscaler provisions a GPU node only after KEDA schedules a pod that cannot fit on existing nodes. Provisioning latency is ~3–5 minutes including node boot and GPU driver initialization. This is why `activationThreshold: "1"` triggers immediately — the pod is `Pending` while the node provisions.

### Terraform Configuration

See `infra/terraform/modules/gke-region/main.tf` for the node pool definitions. Key settings:

```hcl
resource "google_container_node_pool" "gpu_spot" {
  name       = "gpu-l4-spot"
  cluster    = google_container_cluster.primary.name
  node_count = 0

  autoscaling {
    min_node_count = 0
    max_node_count = 4
  }

  node_config {
    machine_type = "g2-standard-8"
    spot         = true
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]

    guest_accelerator {
      type  = "nvidia-l4"
      count = 1
    }

    labels = {
      "cloud.google.com/gke-spot" = "true"
      workload                    = "gpu-inference"
    }

    taint {
      key    = "nvidia.com/gpu"
      value  = "present"
      effect = "NO_SCHEDULE"
    }
  }
}
```

---

## 3. Pod Disruption Budget

To prevent all replicas from being evicted simultaneously during node upgrades or spot preemption:

```yaml
# infra/k8s/vllm/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: vllm-pdb
  namespace: cloudach
spec:
  selector:
    matchLabels:
      app: vllm-inference
  minAvailable: 1   # keep at least 1 pod running during voluntary disruptions
```

> Note: `minAvailable: 1` is only enforced when `replicas >= 2`. When at 0 (scale-to-zero), the PDB is inactive.

---

## 4. Scale-to-Zero Cold Start Mitigation

Scale-to-zero maximizes cost savings but introduces first-request latency. Mitigation strategies:

### Option A: Scheduled Pre-warm (Recommended for Dev Environments)

A Kubernetes CronJob activates the inference pod at the start of the business day:

```yaml
# infra/k8s/autoscaling/prewarm-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: vllm-prewarm
  namespace: cloudach
spec:
  schedule: "0 8 * * 1-5"  # Mon-Fri, 8:00 AM UTC
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: prewarm
              image: curlimages/curl:latest
              command:
                - sh
                - -c
                - |
                  curl -s -X POST http://vllm-service.cloudach.svc.cluster.local:8000/v1/chat/completions \
                    -H "Content-Type: application/json" \
                    -d '{"model":"llama3-8b","messages":[{"role":"user","content":"ping"}],"max_tokens":1}'
```

### Option B: KEDA Activation Window

Configure KEDA to keep 1 replica alive during peak hours:

```yaml
# In ScaledObject spec
advanced:
  scalingModifiers:
    formula: "max(target, 1)"   # never go below 1 during business hours
```

### Option C: Model PVC Cache

The `infra/k8s/vllm/deployment.yaml` mounts a PVC for the model weights:

```yaml
volumes:
  - name: model-cache
    persistentVolumeClaim:
      claimName: vllm-model-cache   # pre-populated via init container
```

With a warm PVC, model reload on pod restart takes ~30s instead of ~90s (network download).

---

## 5. Scaling Decision Matrix

| Condition | Action | Trigger Source |
|-----------|--------|----------------|
| First request arrives, replicas=0 | Scale to 1 | KEDA activation |
| Queue depth ≥ 5 per replica | Add 1 replica | KEDA queue trigger |
| KV-cache > 85% on any pod | Add 1 replica | KEDA cache trigger |
| Queue depth 0 for 5 min | Start scale-down | KEDA cooldown |
| Pod count reaches min (0) | Release GPU nodes | GKE Cluster Autoscaler |
| Node utilization < 50% for 10 min | Remove node | GKE Cluster Autoscaler |
| GPU node needed for new pod | Provision node | GKE Cluster Autoscaler |

---

## 6. Cost Impact of Autoscaling Policies

### Scale-to-Zero vs Always-On

| Policy | GPU-hours/month | GPU cost/month | Notes |
|--------|-----------------|----------------|-------|
| Always-on (1 replica) | 720 hr | $646 | No cold starts |
| Scale-to-zero, 8hr/day active | 240 hr | $215 | Dev workloads |
| Scale-to-zero, 12hr/day active | 360 hr | $323 | Mixed workloads |
| Scale-to-zero + spot burst | 240 hr OD + burst | $215 + burst | Production |

### Scale-Down Cooldown Tuning

The 5-minute cooldown (`cooldownPeriod: 300`) is a deliberate trade-off:

- Too short (60s): excessive scale-up/scale-down cycles → higher startup latency for bursty traffic
- Too long (900s): idle GPU node costs $0.897/15min = ~$0.22 wasted after each idle period
- 300s: ~$0.07 overhead per idle event; acceptable for most traffic patterns

For SLO-sensitive production, increase to 600s. For cost-sensitive staging, decrease to 120s.

---

## 7. Multi-Model Autoscaling

When running multiple models (e.g., Llama 3 8B + Mistral 7B), deploy independent ScaledObjects per model deployment:

```
vllm-llama3-8b       → ScaledObject: vllm-llama3-8b-scaler
vllm-mistral-7b      → ScaledObject: vllm-mistral-7b-scaler
vllm-mixtral-8x7b    → ScaledObject: vllm-mixtral-8x7b-scaler
```

Each scaler references model-specific Prometheus metrics:
```yaml
query: sum(vllm:num_requests_waiting{namespace="cloudach", model="llama3-8b"})
```

Node pools can be shared (models compete for GPU nodes) or dedicated (separate node pools per model tier). Shared node pools improve utilization but require careful quota management.
