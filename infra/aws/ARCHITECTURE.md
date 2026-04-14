# Cloudach — AWS Deployment Architecture

## Overview

This document describes the AWS deployment architecture for Cloudach, an LLM hosting platform that serves multiple tenants with GPU-accelerated inference. The design mirrors our GKE-based staging environment and is intended as the production target for enterprise deployments or customers who require AWS residency.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Cloudach AWS Architecture                                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  VPC  10.0.0.0/16                                           │   │
│  │                                                             │   │
│  │  ┌───────────────────┐    ┌───────────────────────────────┐ │   │
│  │  │  Public Subnets   │    │  Private Subnets              │ │   │
│  │  │  10.0.0.0/20 (a)  │    │  10.0.64.0/18 (a)            │ │   │
│  │  │  10.0.16.0/20 (b) │    │  10.0.128.0/18 (b)           │ │   │
│  │  │  10.0.32.0/20 (c) │    │  10.0.192.0/18 (c)           │ │   │
│  │  │                   │    │                               │ │   │
│  │  │  ┌─────────────┐  │    │  ┌───────────────────────┐   │ │   │
│  │  │  │  ALB        │  │    │  │  EKS Cluster          │   │ │   │
│  │  │  │  (api.       │  │    │  │                       │   │ │   │
│  │  │  │  cloudach.   │  │    │  │  ┌─────────────────┐  │   │ │   │
│  │  │  │  com)        │◄─┼────┼──┤  │  CPU Node Group │  │   │ │   │
│  │  │  │             │  │    │  │  │  (api-gateway,   │  │   │ │   │
│  │  │  │  NAT GW     │  │    │  │  │   redis, pg)     │  │   │ │   │
│  │  │  │  (egress)   │  │    │  │  └─────────────────┘  │   │ │   │
│  │  │  └─────────────┘  │    │  │                       │   │ │   │
│  │  └───────────────────┘    │  │  ┌─────────────────┐  │   │ │   │
│  │                           │  │  │  GPU Node Group  │  │   │ │   │
│  │                           │  │  │  (vLLM pods)     │  │   │ │   │
│  │                           │  │  │  g4dn.xlarge/    │  │   │ │   │
│  │                           │  │  │  g5.xlarge       │  │   │ │   │
│  │                           │  │  └─────────────────┘  │   │ │   │
│  │                           │  └───────────────────────┘   │ │   │
│  │                           │                               │ │   │
│  │                           │  ┌───────────────────────┐   │ │   │
│  │                           │  │  RDS (Aurora PG)      │   │ │   │
│  │                           │  │  ElastiCache Redis    │   │ │   │
│  │                           │  │  S3 (model cache)     │   │ │   │
│  │                           │  └───────────────────────┘   │ │   │
│  │                           └───────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Networking

| Component | Details |
|-----------|---------|
| VPC | `10.0.0.0/16`, 3-AZ spread (us-east-1a/b/c) |
| Public subnets | ALB, NAT Gateways |
| Private subnets | EKS nodes, RDS, ElastiCache |
| NAT Gateways | One per AZ for HA egress |
| Internet Gateway | Inbound traffic to ALB |

### Load Balancer (ALB)
- HTTPS termination at ALB with ACM-managed certificate for `api.cloudach.com`
- HTTP → HTTPS redirect via listener rule
- Target group: EKS node port for api-gateway service
- AWS WAF attached — rate-limit per tenant API key header

### EKS Cluster
- Control plane managed by AWS
- Kubernetes version: 1.29+
- Add-ons: aws-load-balancer-controller, cluster-autoscaler, NVIDIA device plugin

#### CPU Node Group (`cloudach-cpu`)
| Field | Value |
|-------|-------|
| Instance type | `t3.large` (2 vCPU / 8 GB) |
| Min / Max / Desired | 2 / 10 / 2 |
| Purpose | api-gateway, Redis side-car, misc |
| Spot | Yes (on-demand fallback: 1) |

#### GPU Node Group (`cloudach-gpu`)
| Field | Value |
|-------|-------|
| Instance types | `g4dn.xlarge` (T4, 16 GB VRAM) or `g5.xlarge` (A10G, 24 GB VRAM) |
| Min / Max / Desired | 0 / 8 / 0 (scale-to-zero) |
| Purpose | vLLM inference pods |
| Spot | Yes — mixed policy; 70% spot / 30% on-demand |

Scale-to-zero is controlled by KEDA (HTTP or queue-depth triggers). The cluster-autoscaler detects pending GPU pods and provisions nodes in ~90 s.

### vLLM Inference
- Container: `vllm/vllm-openai:v0.4.2` (or later pinned tag)
- Model weights cached in EFS (mounted at `/root/.cache/huggingface`); initial download to S3, then synced to EFS on first boot
- One vLLM pod per GPU node; tensor-parallel for larger models (Llama 70B → 2 GPUs)
- Resources: 4 CPU / 16 GiB RAM / 1 GPU requested; pod anti-affinity ensures one pod per node

### API Gateway
- Stateless Node.js container; 2 replicas minimum
- Validates tenant JWT (signed with `JWT_SECRET` in AWS Secrets Manager)
- Proxies to the correct vLLM service by model name
- Writes usage metrics to Redis, flushes to RDS every 60 s

### Storage
| Service | Use |
|---------|-----|
| Amazon S3 | Model weight repository (source of truth) |
| Amazon EFS | Shared model cache mounted across GPU nodes |
| Amazon RDS (Aurora PostgreSQL 15) | User data, API keys, billing, usage records |
| Amazon ElastiCache (Redis 7) | Rate-limit counters, request queue, session cache |
| Amazon ECR | Private container registry for api-gateway and custom model images |

### Secrets
All secrets stored in **AWS Secrets Manager**:
- `cloudach/db-url` — RDS connection string
- `cloudach/redis-url` — ElastiCache endpoint
- `cloudach/jwt-secret` — API JWT signing key
- `cloudach/hf-token` — HuggingFace Hub token for model downloads
- `cloudach/stripe-secret` — Billing (if enabled)

EKS pods access secrets via the **AWS Secrets Store CSI driver** with IRSA (IAM Roles for Service Accounts) — no secrets in Kubernetes Secrets or env vars.

### IAM
| Role | Attached To | Purpose |
|------|-------------|---------|
| `cloudach-node-role` | EC2 node instances | ECR pull, EFS mount, CloudWatch logs |
| `cloudach-vllm-irsa` | vLLM service account | S3 model bucket read, Secrets Manager read |
| `cloudach-gateway-irsa` | api-gateway service account | Secrets Manager read, CloudWatch metrics |
| `cloudach-cluster-autoscaler` | cluster-autoscaler service account | EC2 Auto Scaling describe/update |

---

## Data Flow

```
User Request
    │
    ▼
Route 53 (api.cloudach.com)
    │
    ▼
ALB (TLS termination, WAF)
    │
    ▼
api-gateway (EKS, CPU nodes)
 ├─ Verify JWT / API key
 ├─ Check rate limit (Redis)
 ├─ Record request start (Redis queue)
 └─────────────────────────────────────┐
                                       ▼
                              vLLM pod (GPU node)
                               └─ Stream tokens back
    │
    ▼
api-gateway
 ├─ Stream response to client
 └─ Write usage event to Redis → flushed to RDS
```

---

## High Availability

| Layer | Strategy |
|-------|---------|
| API Gateway | 2+ pods across AZs via pod anti-affinity |
| GPU nodes | Multi-AZ node group; KEDA restores lost pods |
| RDS | Aurora Multi-AZ with read replica in second AZ |
| ElastiCache | Redis 7 cluster mode (3 shards × 2 replicas) |
| EFS | Regional (durability across all AZs) |
| ALB | Managed service; inherently multi-AZ |

---

## Security Zones

```
Internet ──► ALB (public) ──► api-gateway (private) ──► vLLM (private)
                                     │                        │
                              ElastiCache              EFS (model cache)
                                     │
                                    RDS
```

- GPU nodes have **no public IP**; egress only via NAT Gateway
- Security groups enforce least-privilege: only api-gateway can reach vLLM port 8000
- Network ACLs block all inter-subnet traffic except explicitly allowed flows
- EFS access point scoped to vLLM pods via POSIX UID/GID

---

## Observability

| Tool | Purpose |
|------|---------|
| CloudWatch Container Insights | Node and pod metrics |
| CloudWatch Logs | Application logs (structured JSON) |
| Prometheus + Grafana (in-cluster) | vLLM GPU metrics, queue depth, token throughput |
| AWS X-Ray | Distributed tracing for api-gateway |
| CloudWatch Alarms | GPU utilisation, queue depth, error rate → PagerDuty |

---

## Disaster Recovery

| Scenario | RTO | RPO | Mechanism |
|----------|-----|-----|-----------|
| GPU node failure | < 5 min | 0 | KEDA reschedules pod; CA provisions replacement node |
| AZ outage | < 10 min | 0 | Multi-AZ node group; Aurora failover |
| Region outage | < 30 min | ≤ 5 min | S3 cross-region replication; Aurora global database (opt-in) |

---

## Cost Summary (us-east-1, April 2026)

See [`../scripts/cost_calculator.py`](../scripts/cost_calculator.py) for the interactive cost model.

| Resource | $/month (est.) |
|----------|---------------|
| EKS control plane | $73 |
| CPU nodes (2 × t3.large, on-demand) | $120 |
| GPU nodes (1 × g4dn.xlarge spot, 50% utilisation) | $190 |
| RDS Aurora (db.t4g.medium, Multi-AZ) | $115 |
| ElastiCache (cache.t3.small × 2) | $52 |
| ALB + data transfer | $25 |
| NAT Gateway (3 AZ) | $98 |
| EFS (50 GB) | $16 |
| S3 (100 GB model storage) | $2 |
| CloudWatch / misc | $30 |
| **Total (staging, 1 model)** | **~$721** |

Production multi-model: ~$1,800/month with 4 GPU nodes (2 on-demand + 2 spot).
