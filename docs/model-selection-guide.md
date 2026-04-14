# Model Selection Guide

**How to choose the right open-source LLM for your use case on Cloudach**

---

## Quick decision tree

```
What is your primary requirement?
│
├─ Lowest latency / highest throughput?
│   └─ → mistral-7b  (35 ms TTFT p50, 1,560 tok/s)
│
├─ Best quality for general English tasks?
│   ├─ Budget: low → llama3-8b  (good quality, 38 ms TTFT p50)
│   └─ Budget: flexible → llama3-70b or mixtral-8x7b
│
├─ Code generation or debugging?
│   └─ → codellama-13b  (fine-tuned on 500 B tokens of code)
│
├─ Long context window (>8 K tokens)?
│   ├─ Up to 32 K → mistral-7b or mixtral-8x7b
│   └─ Up to 128 K → llama31-8b or llama31-70b
│
├─ Best quality regardless of cost?
│   └─ → llama3-70b or llama31-70b
│
└─ Mixed workload (quality + reasonable speed)?
    └─ → mixtral-8x7b  (near-70B quality, ~half 70B latency)
```

---

## Use case matrix

| Use case | Recommended model | Why | Alternative |
|---|---|---|---|
| **Customer support chatbot** | `llama3-8b` | Fast, low cost, handles common Q&A well | `mixtral-8x7b` for complex tickets |
| **Code generation / review** | `codellama-13b` | Purpose-trained on code, strong fill-in-middle | `llama3-70b` for multi-language tasks |
| **Document summarisation** | `llama3-8b` | Short-context summaries are within 8 K limit | `mistral-7b` for faster throughput |
| **Long-doc summarisation (>8 K)** | `llama31-8b` | 128 K context, comparable speed to llama3-8b | `mistral-7b` up to 32 K |
| **Translation** | `gemma-7b` | Trained with multilingual data, compact footprint | `mixtral-8x7b` for 30+ language pairs |
| **RAG (retrieval-augmented gen)** | `mistral-7b` | Low latency for fast retrieval → response cycles | `llama3-8b` for higher quality answers |
| **Agents / function calling** | `mixtral-8x7b` | Strong instruction-following, longer context | `llama3-70b` for complex planning |
| **High-throughput batch jobs** | `mistral-7b` | Highest tok/s at concurrency 8 (4,820 tok/s) | `llama3-8b` (4,410 tok/s) |
| **Low-latency real-time UX** | `mistral-7b` | 35 ms TTFT p50, 79 ms TTFT p99 | `llama3-8b` (38 ms / 88 ms) |
| **Domain-specific fine-tune base** | `llama3-8b` | Best fine-tune ROI — supports full + LoRA, low cost | `mistral-7b` for instruction-tuned base |

---

## Performance comparison

All results from the [April 2026 vLLM benchmark](./benchmark-report-2026-04.md) run on Cloudach's production cluster.

### Time to first token (TTFT) — concurrency 1

| Model | p50 (ms) | p95 (ms) | p99 (ms) | Notes |
|---|---|---|---|---|
| `mistral-7b` | **35** | 57 | 79 | Fastest across all concurrency levels |
| `llama3-8b` | 38 | 62 | 88 | Close second, better quality |
| `llama31-8b` | 41 | 68 | 94 | 128 K context, ~8% slower than llama3-8b |
| `mixtral-8x7b` | 74 | 118 | 163 | MoE routing overhead; quality justifies it |
| `llama3-70b` | 142 | 218 | 287 | Dense 70B — expected higher latency |
| `llama31-70b` | 156 | 231 | 304 | Largest model; 128 K context |

### Output throughput — concurrency 8

| Model | tok/s | vs. mistral-7b |
|---|---|---|
| `mistral-7b` | **4,820** | baseline |
| `llama3-8b` | 4,410 | −9% |
| `llama31-8b` | 4,120 | −15% |
| `mixtral-8x7b` | 2,980 | −38% |
| `llama3-70b` | 1,120 | −77% |
| `llama31-70b` | 1,040 | −78% |

### Quality benchmarks (standard evals)

| Model | MMLU | HumanEval | MT-Bench | HellaSwag |
|---|---|---|---|---|
| `mistral-7b` | 62.5 | 30.5 | 6.84 | 81.3 |
| `llama3-8b` | 66.6 | 33.0 | 7.10 | 82.0 |
| `llama31-8b` | 66.6 | 33.0 | 7.10 | 82.0 |
| `codellama-13b` | 35.1 | **62.0** | 6.01 | 61.2 |
| `mixtral-8x7b` | 70.6 | 40.2 | 8.30 | 86.7 |
| `llama3-70b` | **79.5** | 50.4 | **9.00** | 88.0 |
| `llama31-70b` | 79.5 | 50.4 | 9.00 | 88.0 |

> Source: published model cards (HuggingFace) + Cloudach internal evals. MMLU = 5-shot accuracy. HumanEval = pass@1 (Python). MT-Bench = GPT-4-as-judge score (1–10).

---

## Cost-performance tradeoffs: 7B vs 70B

### When 7B / 8B models are the right call

Use a smaller model when:

- **Latency matters**: p99 TTFT under 100 ms is a hard requirement (7B/8B models pass; 70B does not).
- **Your task is well-defined**: customer support, summarisation, RAG retrieval, and classification all have clear success criteria that a well-prompted 8B model meets.
- **You plan to fine-tune**: a fine-tuned `llama3-8b` routinely outperforms a prompted `llama3-70b` on domain tasks, at 5–8× lower cost per token.
- **Throughput > quality**: high-volume batch pipelines (email processing, log analysis, embeddings) benefit from more parallelism per dollar.

**Rule of thumb**: start with `llama3-8b`. Only move to a larger model if quality evaluation scores fall short after fine-tuning.

### When 70B models are worth the cost

Use a 70B model when:

- **Reasoning depth**: multi-step problems, complex agents, code that requires understanding cross-file dependencies.
- **Zero-shot performance**: you don't have training data and can't fine-tune yet.
- **Accuracy is critical**: medical, legal, or financial text where a small factual error has real consequences.
- **MMLU-class tasks**: knowledge-intensive Q&A where the model's parametric knowledge matters.

### Cost comparison at Cloudach pricing

| Model | Tokens/$ (input) | Tokens/$ (output) | Relative cost vs llama3-8b |
|---|---|---|---|
| `mistral-7b` | 4,000,000 | 4,000,000 | **0.8×** (cheapest) |
| `llama3-8b` | 3,000,000 | 3,000,000 | 1× (baseline) |
| `llama31-8b` | 3,000,000 | 3,000,000 | 1× |
| `gemma-7b` | 3,500,000 | 3,500,000 | 0.86× |
| `codellama-13b` | 2,000,000 | 2,000,000 | 1.5× |
| `mixtral-8x7b` | 1,500,000 | 1,500,000 | 2× |
| `llama3-70b` | 600,000 | 600,000 | **5×** |
| `llama31-70b` | 600,000 | 600,000 | **5×** |

> See [Pricing](https://cloudach.com/pricing) for current per-token rates.

### Decision framework by workload

| Workload | Model family | Expected monthly token volume | Approximate cost vs. 70B |
|---|---|---|---|
| Real-time chatbot (SLA < 100 ms) | 7B/8B | 100 M+ | **−83%** |
| Background batch summarisation | 7B/8B (fine-tuned) | 500 M+ | **−83%** |
| Code review assistant | 13B code model | 50 M | −67% |
| Complex agent (multi-step planning) | 70B | 10 M | baseline |
| RAG pipeline (retrieval leg) | 7B | 200 M | −83% |
| RAG pipeline (synthesis leg) | 13B–70B | 50 M | −67% to baseline |

---

## Model quick-reference card

| Model | Size | Context | Best for | Avoid if |
|---|---|---|---|---|
| `mistral-7b` | 7B | 32 K | Throughput, RAG retrieval, real-time | You need strong reasoning |
| `llama3-8b` | 8B | 8 K | General chat, summarisation, fine-tuning | Context >8 K |
| `llama31-8b` | 8B | 128 K | Long docs, extended conversations | Latency-critical (<40 ms) |
| `gemma-7b` | 7B | 8 K | Multilingual, compact deployments | English-only fine-tuning |
| `codellama-13b` | 13B | 16 K | Code gen, fill-in-middle, debugging | General NLP tasks |
| `mixtral-8x7b` | 8×7B MoE | 32 K | Agents, mixed tasks, instruction following | Cost-sensitive workloads |
| `llama3-70b` | 70B | 8 K | Max quality, reasoning, zero-shot | Latency or cost constraints |
| `llama31-70b` | 70B | 128 K | Max quality + long context | Latency or cost constraints |

---

## Frequently asked questions

**Q: Can I mix models in one application?**  
Yes. Use a fast 7B model for the retrieval/re-ranking step and a 70B model only for the final synthesis pass. This hybrid pattern cuts cost by 60–70% with minimal quality loss.

**Q: My fine-tuned 8B model still underperforms — should I upgrade to 70B?**  
First, check your dataset quality (>1,000 diverse examples, consistent formatting). If quality is still short after fine-tuning, try `mixtral-8x7b` as a fine-tune base before jumping to 70B — it offers a better quality ceiling at 2× the cost of 8B, vs 5× for 70B.

**Q: How does context window size affect latency?**  
Long prompts increase TTFT linearly with prefill length. At 8 K input tokens, expect TTFT to roughly double compared to a 256-token prompt. Plan your chunking strategy accordingly.

**Q: Is streaming always faster for users?**  
Yes, from a perceived-latency perspective. Even if total generation time is the same, streaming starts showing tokens at TTFT. Enable `stream: true` for any user-facing interface.

**Q: Which model is best for structured output (JSON)?**  
`mixtral-8x7b` and `llama3-70b` produce the most reliable structured output. For 7B-class models, use a strict JSON schema prompt and validate output client-side. See the [Integrations docs](./integrations/) for tool-use patterns.

---

## Further reading

- [Models reference](./models.md) — full model catalog, API examples, fine-tune support table
- [Benchmark report — April 2026](./benchmark-report-2026-04.md) — full TTFT, throughput, and latency data
- [Fine-Tuning Guide](./fine-tuning.md) — when and how to fine-tune for domain tasks
- [Blog: Llama 3 vs Mistral vs Mixtral](./blog-llama3-vs-mistral-vs-mixtral.md) — head-to-head benchmark deep dive
- [Pricing](https://cloudach.com/pricing) — per-token rates for all models
