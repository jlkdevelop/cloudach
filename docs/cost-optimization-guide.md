# Cloudach Cost Optimization Guide

> This guide helps you get the most out of your Cloudach budget. Whether you're on the Free tier running experiments or an enterprise team processing billions of tokens, these strategies can reduce your costs by 30–70%.

---

## Quick Wins (Do These First)

### 1. Use the right model for the task

Bigger models cost more per token. Many tasks don't need a 70B parameter model:

| Task | Recommended Model | vs. Llama 70B savings |
|------|------------------|-----------------------|
| Simple classification | Mistral 7B | ~70% cheaper |
| Short text extraction | Llama 3.1 8B | ~67% cheaper |
| Code generation (< 500 lines) | Llama 3.1 8B | ~67% cheaper |
| Complex reasoning / multi-step | Llama 3.1 70B | baseline |
| Long-context analysis (> 32K tokens) | Llama 3.1 70B | baseline |
| Creative writing | Mixtral 8×7B | ~25% cheaper |

**How to check your model usage:**
```bash
curl https://api.cloudach.com/v1/usage \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  | jq '.by_model'
```

### 2. Reduce token waste

Every token you send or receive is billed. Common sources of token waste:

**Trim your system prompt**
```python
# Before: 800-token system prompt with boilerplate
system = """You are a helpful assistant. You are friendly, professional, and knowledgeable.
Always respond in a clear and concise manner. If you don't know something, say so.
... (500 more tokens of boilerplate) ..."""

# After: 50-token system prompt
system = "You are a classification assistant. Reply with JSON only."
```

**Set `max_tokens` appropriately**
```python
# Don't leave max_tokens uncapped for short tasks
response = client.chat.completions.create(
    model="llama3-1-8b",
    messages=[{"role": "user", "content": "Classify this as positive/negative: ..."}],
    max_tokens=10,  # "positive" or "negative" — don't need 2048
)
```

**Use structured outputs to reduce verbosity**
```python
# Unstructured: model may pad with explanation (100+ tokens)
# "The sentiment of this text is positive because..."

# Structured: forces concise output
response_format={"type": "json_object"}
# → {"sentiment": "positive"}
```

### 3. Cache repeated prompts

If you send the same system prompt or few-shot examples with every request, you're paying for those tokens repeatedly. Use Cloudach's prompt caching:

```python
# Mark the static prefix as cacheable
messages = [
    {
        "role": "system",
        "content": [
            {
                "type": "text",
                "text": your_long_system_prompt,
                "cache_control": {"type": "ephemeral"}  # cache for 5 minutes
            }
        ]
    },
    {"role": "user", "content": user_message}
]
```

Cached tokens are billed at **10% of the standard input rate**. For workloads with a 500-token system prompt and 10 requests/minute, caching saves ~$0.02/1M output tokens — significant at scale.

---

## Intermediate Strategies

### 4. Use Batch Inference for offline workloads

If your users aren't waiting for a real-time response, batch inference is 50% cheaper:

| Use case | Real-time rate | Batch rate | Savings |
|----------|---------------|------------|---------|
| Llama 3.1 8B | $0.20/1M | $0.10/1M | 50% |
| Llama 3.1 70B | $0.60/1M | $0.30/1M | 50% |
| Mistral 7B | $0.16/1M | $0.08/1M | 50% |

**When to use batch:** document processing, dataset annotation, report generation, embedding at scale — anything that can wait hours rather than milliseconds.

```python
import cloudach

client = cloudach.Client()

# Submit batch job
job = client.batch.create(
    model="llama3-1-8b",
    requests=[
        {"custom_id": f"doc-{i}", "messages": [{"role": "user", "content": doc}]}
        for i, doc in enumerate(documents)
    ],
    completion_window="24h",
)

# Check status and download results when ready
results = client.batch.wait_and_download(job.id)
```

See the full [Batch Inference API docs](./batch-inference-pricing.md) for the file-based API for large volumes.

### 5. Upgrade to Pro for high-volume usage

The Pro tier ($49/month) reduces token rates by 25% across all models:

| Model | Free rate | Pro rate | Savings |
|-------|-----------|----------|---------|
| Llama 3.1 8B | $0.20/1M | $0.15/1M | 25% |
| Llama 3.1 70B | $0.60/1M | $0.45/1M | 25% |
| Mistral 7B | $0.16/1M | $0.12/1M | 25% |

**Break-even point:** At Llama 3.1 8B usage, Pro saves you $49/month when you exceed **980M tokens/month** ($0.05/1M savings × 980M = $49). Below that threshold, Free tier + batch is likely cheaper.

### 6. Implement request deduplication

For applications that may send duplicate requests (e.g., retry storms, duplicate form submissions), deduplication prevents paying for the same tokens twice:

```python
import hashlib
import redis

r = redis.Redis()

def deduplicated_complete(messages, model="llama3-1-8b", ttl=3600):
    key = hashlib.sha256(str(messages).encode()).hexdigest()
    cached = r.get(key)
    if cached:
        return json.loads(cached)

    response = client.chat.completions.create(model=model, messages=messages)
    r.setex(key, ttl, json.dumps(response.dict()))
    return response
```

---

## Advanced Strategies

### 7. Use streaming to reduce perceived latency without extra cost

Streaming (`stream=True`) doesn't change token costs but makes your application feel faster — users see output start appearing in ~200ms instead of waiting for the full response. This means users are less likely to retry (which would cost double).

```python
with client.chat.completions.stream(
    model="llama3-1-8b",
    messages=messages,
) as stream:
    for chunk in stream:
        print(chunk.choices[0].delta.content or "", end="", flush=True)
```

### 8. Implement semantic caching for common queries

For applications where users ask similar questions (support chatbots, FAQ assistants), semantic caching returns cached responses for semantically equivalent queries:

```python
# Pseudo-code: semantic cache using embeddings
def semantic_cache_lookup(query, threshold=0.95):
    query_embedding = embed(query)  # using a cheap embedding model
    cached_response = vector_db.search(query_embedding, min_similarity=threshold)
    return cached_response  # None if no match above threshold

def cached_complete(query, context):
    cached = semantic_cache_lookup(query)
    if cached:
        return cached  # free!

    response = client.chat.completions.create(
        model="llama3-1-8b",
        messages=[{"role": "system", "content": context},
                  {"role": "user", "content": query}]
    )
    cache_response(query, response)
    return response
```

For support chatbots, 30–60% of queries are semantically similar to previously-answered questions. Semantic caching can eliminate half your token spend.

### 9. Use quantized models for throughput-sensitive workloads

On the Enterprise tier, request INT8 or INT4 quantized variants of models. Quantization reduces memory footprint, enabling higher batch sizes and throughput on the same hardware — which translates to lower cost per token:

| Precision | Throughput (tokens/sec) | Cost/1M tokens | Quality delta |
|-----------|------------------------|----------------|---------------|
| BF16 (default) | ~1,200 tok/s | $0.20 | Baseline |
| INT8 | ~1,800 tok/s | ~$0.14 | -1–2% on benchmarks |
| INT4 | ~2,800 tok/s | ~$0.09 | -3–5% on benchmarks |

Contact support to enable quantized model variants on your account.

### 10. Monitor and alert on cost anomalies

Unexpected cost spikes usually come from a few sources: a bug sending very long prompts, a retry loop, or a new feature launched without token limits. Set up cost alerts:

**Via the API:**
```bash
# Set a monthly budget alert at 80% of your expected spend
curl -X POST https://api.cloudach.com/v1/alerts \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "budget",
    "threshold_usd": 400,
    "period": "monthly",
    "notify_email": "alerts@yourcompany.com"
  }'
```

**Monitor token usage by endpoint:**
```bash
curl https://api.cloudach.com/v1/usage?group_by=endpoint \
  -H "Authorization: Bearer $CLOUDACH_API_KEY"
```

---

## Cost Estimation Worksheet

Use this to estimate your monthly bill before committing to a plan:

```
Monthly token estimate:
  Avg tokens per request    : _____ tokens  (input + output combined)
  Requests per day          : _____
  Active days per month     : _____ (typically 30)
  
  Monthly tokens            = _____ × _____ × _____ = _________

Pricing:
  Model                     : _____________
  Rate (Free/Pro/Batch)     : $_____/1M tokens
  
  Token cost                = _______ tokens ÷ 1,000,000 × $______
                            = $_______/month
  
  Pro subscription (if applicable): + $49/month
  
  TOTAL ESTIMATED           = $_______/month
```

### Example: Support chatbot with 1,000 daily users

```
  Avg tokens/request        = 800 (200 in + 600 out)
  Requests/day              = 3,000 (3 per user)
  Days/month                = 30
  Monthly tokens            = 800 × 3,000 × 30 = 72M tokens

  Free tier (Llama 3.1 8B): 72M × $0.20/1M = $14.40/month
  Pro tier:                  72M × $0.15/1M + $49 = $59.80/month  ← more expensive
  Free + Batch (50% batch):  36M × $0.20 + 36M × $0.10 = $10.80/month  ← cheapest
```

---

## Summary: Cost Reduction by Strategy

| Strategy | Typical Savings | Effort |
|----------|----------------|--------|
| Right-size model | 30–70% | Low |
| Trim prompts | 10–30% | Low |
| Set `max_tokens` | 5–20% | Low |
| Prompt caching | 5–40% | Medium |
| Batch inference | 50% | Medium |
| Pro tier (high volume) | 25% | Low |
| Request deduplication | 5–15% | Medium |
| Semantic caching | 20–50% | High |
| Quantized models | 30–55% | Low (Enterprise) |

Most teams can reduce costs by **40–60%** by combining right-sizing, prompt trimming, and batch inference for applicable workloads.

---

## Getting Help

- **Cost dashboard:** Available in your account at cloudach.com/dashboard
- **Usage API:** `GET /v1/usage` — token counts, cost breakdowns, and trend data
- **Slack community:** #cost-optimization channel
- **Enterprise cost review:** Contact your solutions engineer for a quarterly infrastructure review
- **Cost calculator:** Run `python scripts/cost-calculator.py` (requires platform access) for detailed scenario modeling
