# Batch Inference Pricing — Cloudach

> Last updated: 2026-04-14

---

## Overview

Batch inference processes large volumes of requests offline — no real-time user is waiting for a response. This unlocks aggressive cost savings via:

- **Spot/preemptible GPUs** at ~70% discount
- **Off-peak scheduling** (low capacity competition)
- **Bin-packing** (100% GPU utilization vs ~70% for real-time)
- **No SLO constraints** on latency

This document defines Cloudach's batch pricing model, the infrastructure strategy, and when customers should use batch vs. real-time inference.

---

## 1. When to Use Batch Inference

| Workload | Real-Time | Batch |
|----------|-----------|-------|
| Chatbot / assistant replies | Required | Not applicable |
| RAG retrieval (< 200ms budget) | Required | Not applicable |
| Document summarization (user waiting) | Acceptable | Better choice if > 1 doc |
| Bulk document classification | No | **Yes** |
| Dataset annotation / labeling | No | **Yes** |
| Fine-tuning dataset generation | No | **Yes** |
| Offline evaluation / scoring | No | **Yes** |
| Embedding generation at scale | Marginal | **Yes** |
| Scheduled report generation | No | **Yes** |
| Data pipeline enrichment | No | **Yes** |

**Rule of thumb:** If the user is not waiting and the job can tolerate completion within 4–24 hours, use batch.

---

## 2. Batch Pricing Tiers

All rates below are for Llama 3.1 8B (the primary batch model). Larger models have separate rates.

### 2a. Pay-As-You-Go Batch (no commitment)

| Volume/month | Rate per 1M tokens |
|-------------|-------------------|
| First 100M tokens | $0.10/1M |
| 100M – 1B tokens | $0.07/1M |
| 1B+ tokens | $0.05/1M |

Billed at end of month. Jobs run within 24 hours of submission during off-peak windows (02:00–08:00 UTC by default).

### 2b. Priority Batch (faster SLA)

| SLA | Rate per 1M tokens |
|-----|-------------------|
| 4-hour turnaround | $0.14/1M |
| 1-hour turnaround | $0.18/1M |

### 2c. Committed Batch (annual contract)

| Commitment | Rate per 1M tokens | Minimum monthly |
|------------|-------------------|-----------------|
| 10B tokens/month | $0.04/1M | $400/mo |
| 50B tokens/month | $0.03/1M | $1,500/mo |
| 100B+ tokens/month | Custom | Custom |

Available on Enterprise tier with reserved GPU capacity allocation.

---

## 3. Model-Specific Batch Rates

| Model | Batch Rate $/1M | Real-Time Free Rate $/1M | Batch vs Real-Time Savings |
|-------|----------------|--------------------------|---------------------------|
| Llama 3.1 8B | $0.10 | $0.20 | 50% |
| Llama 3.1 70B | $0.30 | $0.60 | 50% |
| Mistral 7B | $0.08 | $0.16 | 50% |
| Mixtral 8×7B | $0.24 | $0.48 | 50% |
| DeepSeek R1 7B | $0.09 | $0.18 | 50% |
| DeepSeek R1 70B | $0.32 | $0.65 | 51% |

Batch discount is consistently ~50% off real-time rates due to spot GPU savings + higher utilization.

---

## 4. Infrastructure Cost Model for Batch

### GPU Cost per Batch Job

Assumptions:
- Llama 3.1 8B, vLLM, bf16, 8K context
- Spot GPU: `g2-standard-8` at $0.269/hr
- Throughput (100% utilization): ~1,500 tokens/sec per replica
- Off-peak scheduling window: 6 hours per job run

| Tokens to process | Replicas needed | Runtime (hr) | Spot GPU cost | Margin at $0.10/1M |
|-------------------|-----------------|--------------|---------------|-------------------|
| 100M | 1 | 18.5 (cap 6hr) | $0.269 × 6 = $1.61 | $10.00 – $1.61 = **$8.39** |
| 500M | 2 | 46hr → 6hr window | $0.269 × 2 × 6 = $3.23 | $50.00 – $3.23 = **$46.77** |
| 1B | 3 | 6hr window | $0.269 × 3 × 6 = $4.84 | $100.00 – $4.84 = **$95.16** |
| 5B | 4 (max) | ~23hr window | $0.269 × 4 × 23 = $24.75 | $500.00 – $24.75 = **$475.25** |

> Batch jobs are highly profitable. Spot GPU cost is typically 3–5% of revenue at standard batch rates.

### Infrastructure overhead

Fixed infra (Postgres, Redis, API gateway) is shared with real-time workloads — no incremental cost for batch.

---

## 5. Batch Job API

### Submit a batch job

```bash
POST /v1/batch/jobs
Authorization: Bearer sk-cloudach-xxx
Content-Type: application/json

{
  "model": "llama3-1-8b",
  "requests": [
    {"custom_id": "req-001", "messages": [{"role": "user", "content": "Classify: ..."}]},
    {"custom_id": "req-002", "messages": [{"role": "user", "content": "Classify: ..."}]}
  ],
  "completion_window": "24h",  // or "4h", "1h"
  "output_format": "jsonl"     // or "csv"
}
```

Response:
```json
{
  "batch_id": "batch_abc123",
  "status": "queued",
  "estimated_completion": "2026-04-14T08:00:00Z",
  "token_estimate": 45000,
  "cost_estimate_usd": 0.0045
}
```

### Check batch status

```bash
GET /v1/batch/jobs/batch_abc123
Authorization: Bearer sk-cloudach-xxx
```

### Download results

```bash
GET /v1/batch/jobs/batch_abc123/output
Authorization: Bearer sk-cloudach-xxx
```

Output is JSONL with `custom_id` preserved for easy row matching.

---

## 6. Large-Scale Batch via File API

For batches > 1M requests, use the file-based API to avoid payload size limits:

```bash
# 1. Upload input file
curl -X POST https://api.cloudach.com/v1/files \
  -H "Authorization: Bearer sk-cloudach-xxx" \
  -F "file=@batch_input.jsonl" \
  -F "purpose=batch"

# Response: {"file_id": "file_xyz789"}

# 2. Submit batch referencing file
curl -X POST https://api.cloudach.com/v1/batch/jobs \
  -H "Authorization: Bearer sk-cloudach-xxx" \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3-1-8b", "input_file_id": "file_xyz789", "completion_window": "24h"}'

# 3. Download output file when done
curl https://api.cloudach.com/v1/batch/jobs/batch_abc123/output/file \
  -H "Authorization: Bearer sk-cloudach-xxx" \
  -o output.jsonl
```

Input file format (JSONL):
```jsonl
{"custom_id": "r1", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "llama3-1-8b", "messages": [{"role": "user", "content": "..."}]}}
{"custom_id": "r2", "method": "POST", "url": "/v1/chat/completions", "body": {"model": "llama3-1-8b", "messages": [{"role": "user", "content": "..."}]}}
```

---

## 7. Comparison: Batch vs. Real-Time for Common Use Cases

### Document Classification at Scale

**Scenario:** 10M documents to classify, avg 500 tokens/doc = 5B tokens

| Approach | Time | Cost (at $0.10/1M) | Cost (at $0.20/1M real-time) |
|----------|------|-------------------|------------------------------|
| Batch (24h window) | < 24hr | **$500** | — |
| Real-time API (sequential) | ~139 hours | — | $1,000 |
| Real-time API (parallel, 10 workers) | ~14 hours | — | $1,000 |

Batch is 50% cheaper and the single worker runs faster than sequential real-time.

### Fine-Tuning Dataset Generation

**Scenario:** Generate 100K training examples, avg 2K tokens/example = 200M tokens

| Approach | Time | Cost |
|----------|------|------|
| Batch inference | < 24hr | **$20** |
| Real-time (sequential) | ~37hr | $40 |
| Together AI / Fireworks AI real-time | — | $40 |

---

## 8. Batch Scheduling Architecture

```
Customer submits job
        ↓
Batch Job Queue (Redis Stream)
        ↓
Batch Scheduler (chooses window based on real-time load)
        ↓
GKE CronJob or Job object → spot GPU node
        ↓
vLLM processes requests (100% utilization target)
        ↓
Results written to GCS bucket → Customer downloads
```

**Key design decisions:**

- **Separate namespace** (`cloudach-batch`) from real-time (`cloudach`) to prevent resource contention.
- **Dedicated spot node pool** (`batch-gpu-spot`) — does not share nodes with real-time inference.
- **Job checkpointing every 100 requests** — spot preemption loses at most 100 requests of progress.
- **Priority: real-time > batch** at the GKE Cluster Autoscaler level — batch nodes scale down first when capacity is needed.
