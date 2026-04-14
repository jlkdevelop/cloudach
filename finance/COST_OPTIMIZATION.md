# Cloudach — Top 5 AWS Inference Cost Optimization Strategies

> **Prepared for:** Engineering & Finance leadership
> **Goal:** Reduce AWS GPU inference COGS from ~42% of revenue → ~30% by Month 12
> **Estimated annual savings:** $180K–$340K at $2M ARR scale

---

## Strategy 1: Reserved Instance Commitments

**Potential savings: 33–40% on GPU compute**

### What
Purchase AWS Reserved Instances (1-year or 3-year) for baseline GPU capacity instead of paying on-demand rates.

### Why it works
On-demand pricing carries a 40–60% premium over reserved pricing. For predictable baseline load (which Cloudach will develop as customer contracts stabilize), reserved instances are the highest-ROI optimization available.

### Implementation

| Step | Action | Timeline |
|---|---|---|
| 1 | Instrument current utilization per instance type for 30 days | Month 3 |
| 2 | Identify baseline vs. burst capacity split | Month 4 |
| 3 | Purchase 1-year reserved instances for baseline (start conservative: 40% of fleet) | Month 5 |
| 4 | Increase to 60% reserved as enterprise contracts provide commit visibility | Month 9 |
| 5 | Evaluate 3-year convertible reservations for heavily-used instances | Month 18 |

### Savings Model

| Scenario | On-Demand Spend | Reserved Spend | Monthly Savings |
|---|---|---|---|
| 40% reserved (Month 5) | $28K | $20.8K | $7.2K |
| 60% reserved (Month 9) | $56K | $38.7K | $17.3K |
| 60% reserved (Month 12) | $90K | $62.1K | **$27.9K/mo** |

**Year 1 cumulative savings: ~$110K**

### Risks & Mitigations
- **Risk:** Demand lower than projected → stranded reserved capacity
- **Mitigation:** Start at 40% reserved; use convertible RIs (can swap instance types); sell unused capacity on RI Marketplace
- **Risk:** GPU model mix shifts (e.g., away from A100s)
- **Mitigation:** Prefer convertible reservations; review quarterly

---

## Strategy 2: Spot Instance Arbitrage for Batch & Async Workloads

**Potential savings: 60–90% on eligible workloads**

### What
Use EC2 Spot Instances (unused AWS capacity sold at steep discounts) for non-latency-sensitive inference workloads.

### Why it works
Spot instances for GPU types (especially L4, A10G) are available at 60–90% discounts vs. on-demand. Many Cloudach use cases — document processing, fine-tuning, embeddings generation, async summarization — have flexible timing and can tolerate 2-minute interruption notices.

### Implementation

```
Workload Classification:
├── Real-time inference (<500ms SLA) → On-demand / Reserved [NO SPOT]
├── Near-real-time (500ms–5s SLA) → On-demand only
├── Async batch inference (>5s, queued) → SPOT ELIGIBLE ✓
├── Embedding generation → SPOT ELIGIBLE ✓
└── Dev/sandbox environments → SPOT ELIGIBLE ✓
```

**Architecture:**
1. Tag inbound API requests with `priority: realtime | async | batch`
2. Route async/batch to a separate SQS queue
3. Spot fleet: mix g6.2xlarge, g5.2xlarge (fallback instances) for interruption resilience
4. On interruption: requeue request; mark in-flight tokens as failed; retry up to 3x

### Savings Model

| Workload Type | % of Traffic | On-Demand Cost/mo (M12) | Spot Cost/mo | Savings |
|---|---|---|---|---|
| Async / batch | 30% | $27K | $5.4K | $21.6K |
| Dev environments | 10% | $9K | $1.8K | $7.2K |
| **Total** | | $36K | $7.2K | **$28.8K/mo** |

**Year 1 cumulative savings (from Month 6): ~$87K**

### Risks & Mitigations
- **Risk:** Spot interruptions mid-inference → incomplete responses
- **Mitigation:** Implement request checkpointing; use streaming tokens to detect interruption early; SLA covers async workloads only
- **Risk:** Spot availability drops during EC2 crunch
- **Mitigation:** Multi-instance-type Spot Fleet; automatic fallback to on-demand if Spot unavailable for >2 min

---

## Strategy 3: Model Quantization and Efficient Serving

**Potential savings: 40–60% on compute per token via higher throughput**

### What
Run quantized model variants (INT8, AWQ, GPTQ) instead of full FP16/BF16 models. Quantization reduces memory footprint and increases token throughput per GPU, effectively cutting cost per token.

### Why it works
A quantized Llama 3 8B model (INT8) can serve ~2,000 tokens/sec on a single L4 GPU vs. ~1,200 tokens/sec for FP16 — a 67% throughput improvement with negligible quality degradation (<2% benchmark drop).

### Implementation (vLLM-based stack)

```yaml
# Current: FP16
model: meta-llama/Meta-Llama-3-8B-Instruct
dtype: float16

# Optimized: AWQ quantized
model: meta-llama/Meta-Llama-3-8B-Instruct-AWQ
quantization: awq
dtype: float16  # compute dtype
```

**Rollout plan:**
| Month | Action |
|---|---|
| M3 | Benchmark AWQ vs. FP16 on internal quality tests (MMLU, HumanEval) |
| M4 | Enable INT8 for Llama 3 8B, Mistral 7B in Developer/Startup tiers |
| M5 | A/B test quality perception with 10% of users |
| M6 | Full rollout for 7B/8B models; offer FP16 as "premium quality" opt-in |
| M8 | Evaluate AWQ-quantized Mixtral 8x7B |

### Throughput & Cost Impact

| Model | Format | Tok/sec | Cost/1M tok | Savings vs. FP16 |
|---|---|---|---|---|
| Llama 3 8B | FP16 | 1,200 | $0.27 | baseline |
| Llama 3 8B | INT8 | 2,000 | $0.16 | **41%** |
| Llama 3 8B | AWQ | 2,200 | $0.15 | **44%** |
| Mistral 7B | FP16 | 1,400 | $0.23 | baseline |
| Mistral 7B | INT8 | 2,400 | $0.13 | **43%** |
| Mixtral 8x7B | FP16 | 2,200 | $0.61 | baseline |
| Mixtral 8x7B | AWQ | 3,400 | $0.39 | **36%** |

**Year 1 cumulative savings: ~$65K** (assuming 40% of traffic on small models shifts to quantized by M6)

### Risks & Mitigations
- **Risk:** Quality regression for some tasks
- **Mitigation:** Keep FP16 option for enterprise customers; measure MMLU/MT-Bench scores before rollout
- **Risk:** Some models lack production-quality quantized weights
- **Mitigation:** Use TheBloke/HuggingFace community weights only after benchmark validation

---

## Strategy 4: Multi-Tenant GPU Packing (Continuous Batching Optimization)

**Potential savings: 25–35% via improved GPU utilization**

### What
Optimize vLLM's continuous batching configuration to maximize GPU utilization. Most inference deployments run at 50–60% utilization; target is 80%+.

### Why it works
GPU compute costs are fixed per hour regardless of utilization. Moving from 60% → 80% utilization means serving 33% more tokens with the same GPU fleet — equivalent to a 25% cost reduction.

### Implementation

```python
# vLLM engine configuration
engine_args = EngineArgs(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    # Maximize batch size for throughput
    max_num_batched_tokens=32768,    # was 8192
    max_num_seqs=512,                # was 128
    # PagedAttention for memory efficiency
    block_size=16,
    gpu_memory_utilization=0.92,     # was 0.85
    # Preemption for fairness
    preemption_mode="swap",
    # Chunked prefill for consistent latency
    enable_chunked_prefill=True,
    max_num_chunked_tokens=8192,
)
```

**Autoscaling to maintain utilization target:**
- Scale up when P95 queue depth > 50ms
- Scale down when GPU utilization < 60% for 10+ minutes
- Use KEDA with custom vLLM metrics for precise HPA

### Utilization Impact

| Metric | Before | After | Improvement |
|---|---|---|---|
| GPU utilization | 60% | 82% | +37% |
| Token throughput/GPU | 1,200 tok/s | 1,640 tok/s | +37% |
| Effective cost/1M tok | $0.27 | $0.20 | **-26%** |
| Fleet size at M12 demand | 14 GPUs | 10 GPUs | -4 GPUs |

**Monthly savings at M12: ~$12K/mo (4× g6.2xlarge on-demand equivalent)**
**Year 1 cumulative savings: ~$36K**

### Risks & Mitigations
- **Risk:** High batching increases P99 latency
- **Mitigation:** Set per-tier SLA budgets; chunked prefill prevents head-of-line blocking
- **Risk:** Memory pressure causes OOM with large context windows
- **Mitigation:** PagedAttention handles fragmentation; set hard context limits per tier

---

## Strategy 5: AWS Inferentia2 / Trainium2 for High-Volume Models

**Potential savings: 40–50% on 70B model inference vs. A100**

### What
Migrate high-volume Llama 3 70B inference from NVIDIA A100 (p4d instances) to AWS Inferentia2 (inf2 instances) or Trainium2. AWS custom silicon is purpose-built for inference and 40–50% cheaper for supported models.

### Why it works
The p4d.24xlarge (8× A100) costs $32.77/hr. The inf2.48xlarge (12× Inferentia2 chips) costs ~$12.98/hr and delivers comparable throughput for autoregressive inference once model is compiled to Neuron SDK format.

### Instance Comparison

| Instance | Accelerator | Memory | Throughput (70B) | Cost/hr | Cost/1M tok |
|---|---|---|---|---|---|
| p4d.24xlarge | 8× A100 40GB | 320GB | 1,800 tok/s | $32.77 | $5.05 |
| p4de.24xlarge | 8× A100 80GB | 640GB | 2,200 tok/s | $40.97 | $5.17 |
| inf2.48xlarge | 12× Inferentia2 | 384GB | ~1,600 tok/s | $12.98 | **$2.25** |
| inf2.48xlarge (reserved) | 12× Inferentia2 | 384GB | ~1,600 tok/s | $8.31 | **$1.44** |

**Savings: 55% vs. on-demand A100, 71% vs. A100 on reserved-to-reserved comparison**

### Implementation

```bash
# Compile Llama 3 70B to Neuron format
optimum-neuron convert \
  --model meta-llama/Meta-Llama-3-70B-Instruct \
  --task text-generation \
  --batch_size 4 \
  --sequence_length 4096 \
  --num_cores 24 \
  --auto_cast_type bf16

# Deploy on vLLM with neuron backend
python -m vllm.entrypoints.openai.api_server \
  --model ./llama3-70b-neuron \
  --device neuron \
  --tensor-parallel-size 24
```

### Rollout Plan

| Month | Action |
|---|---|
| M6 | Evaluate Neuron SDK compatibility with vLLM; compile test model |
| M8 | Shadow traffic: run Inferentia2 in parallel, compare outputs |
| M9 | Migrate 30% of Llama 70B traffic to inf2 |
| M12 | Migrate 70%+ of steady-state 70B traffic to inf2 |

**Year 1 cumulative savings (from Month 9): ~$38K**

### Risks & Mitigations
- **Risk:** Neuron SDK doesn't support all vLLM features (speculative decoding, custom ops)
- **Mitigation:** Keep A100 fallback; migrate only supported model configurations
- **Risk:** Model compilation is slow (2–4 hours per model version)
- **Mitigation:** Pre-compile and cache compiled models in S3; automate in CI/CD
- **Risk:** Inferentia2 throughput lower than A100 for low-latency requests
- **Mitigation:** Route high-SLA enterprise traffic to A100; route async/standard to inf2

---

## Summary: Total Savings Opportunity

| Strategy | Year 1 Savings | Complexity | Priority |
|---|---|---|---|
| 1. Reserved Instances | $110K | Low | **Start immediately** |
| 2. Spot for Async | $87K | Medium | Month 4 |
| 3. Model Quantization | $65K | Low-Medium | Month 3 |
| 4. Continuous Batching | $36K | Medium | Month 4 |
| 5. Inferentia2 Migration | $38K | High | Month 6 |
| **Total** | **$336K** | | |

### Recommended Execution Order

```
Month 3: Quantization (quick win, low risk, dev-only first)
Month 4: Reserved instances (commit after 60 days of data)
Month 4: Spot instances for async queue
Month 5: Continuous batching optimization
Month 6: Begin Inferentia2 POC
Month 9: Inferentia2 production for 70B models
```

**If only one thing:** Reserved instances. 33–40% savings on baseline compute with minimal engineering work. Do this first.

---

*Cost optimization report prepared by CFO Agent. Last updated: April 2026.*
