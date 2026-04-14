# Cloudach Case Studies

---

## Case Study 1: How Luma Research Cut LLM Costs by 63% Without Touching Their Codebase

**Company:** Luma Research  
**Size:** 18-person AI startup  
**Use case:** Research summarization and hypothesis generation pipeline  
**Time to migrate:** 47 minutes  
**Result:** $4,200/month → $1,560/month in LLM spend

---

### Background

Luma Research builds AI-assisted literature review tools for pharmaceutical R&D teams. Their platform ingests scientific papers, generates structured summaries, extracts key findings, and surfaces research gaps — all powered by LLMs.

By mid-2024, their product was processing roughly 140,000 summarization requests per week, each averaging ~2,800 tokens. They were running entirely on GPT-4o via the OpenAI API.

"At small scale, the OpenAI pricing is invisible," says their co-founder and CTO. "Then you hit a real customer, the volume triples overnight, and suddenly your LLM bill is bigger than your AWS spend."

Their monthly OpenAI bill had climbed to $4,200. Margins were being compressed. The team had tried switching to GPT-3.5 to cut costs, but the summarization quality dropped enough that customers noticed.

---

### The Problem: Open-Source Models Were an Option — But Self-Hosting Wasn't

The team knew Llama 3 70B was capable of matching GPT-4o quality on their structured summarization workloads. The benchmark numbers were there. But every time they investigated self-hosting, the scope ballooned:

- vLLM installation and CUDA configuration on GPU instances
- Auto-scaling logic to handle burst traffic from enterprise customers
- Weight management across regions
- Monitoring, alerting, and on-call burden
- Compliance review for a new infrastructure layer

As a team of 18, they had one engineer who could have owned it. That engineer was also their sole infrastructure hire, already stretched across their core product stack.

"We estimated about three weeks of engineering time to get open-source models into production at the reliability level our customers needed," the CTO recalls. "And that's before ongoing maintenance. The math didn't work for us at that stage."

---

### The Migration

A colleague mentioned Cloudach at a founder dinner. The CTO signed up that night, deployed Llama 3 70B in under a minute, and ran their first batch of test summarizations against their eval set.

Quality matched GPT-4o on 94% of their test cases. The 6% gap was concentrated in very long documents (>50,000 tokens) with dense citation structures — a narrow edge case they could route to GPT-4o selectively.

The migration took 47 minutes total:

1. Updated `base_url` and `api_key` in their Python OpenAI SDK configuration — 5 minutes
2. Ran their full eval suite against Cloudach's Llama 3 70B endpoint — 30 minutes
3. Deployed to production and enabled gradual traffic rollout — 12 minutes

No infrastructure changes. No new dependencies. No redeployment of their application layer.

---

### Results

| Metric | Before (OpenAI GPT-4o) | After (Cloudach Llama 3 70B) |
|--------|------------------------|-------------------------------|
| Monthly LLM cost | $4,200 | $1,560 |
| Cost per 1M tokens | ~$22 blended | ~$0.80 |
| p50 response time | 890ms | 310ms |
| Summarization quality score | 97.2% | 95.8% |
| Engineering time to maintain | ~4 hrs/month | 0 hrs/month |

They kept GPT-4o for their edge case long-document handling (roughly 3% of traffic), which they now call directly from OpenAI. The rest routes through Cloudach.

Total monthly LLM spend dropped from $4,200 to $1,560 — a 63% reduction. At their current growth trajectory, they estimate the savings will reach $8,000/month by end of year.

"We thought moving off OpenAI would cost us weeks of engineering time. It cost us less than an hour. That's not a normal kind of easy." — CTO, Luma Research

---

---

## Case Study 2: How Depot AI Scaled to 2M Daily LLM Calls While Staying Under Budget

**Company:** Depot AI  
**Size:** 47-person B2B SaaS company  
**Use case:** AI-powered customer support automation and ticket routing  
**Scale:** 2.1M LLM API calls/day at peak  
**Challenge:** Cost control at scale + latency requirements for real-time chat  
**Result:** Stayed within $12,000/month budget while 4x-ing volume; p50 latency improved from 1.2s to 180ms

---

### Background

Depot AI builds customer support automation software for mid-market e-commerce companies. Their platform uses LLMs to classify incoming support tickets, draft responses, route complex issues to human agents, and summarize conversation history for agents who pick up escalations.

At 2.1 million LLM calls per day, they are one of the highest-volume users in their category. The challenge isn't just cost — it's latency. Their real-time chat component requires first-token responses in under 200ms or users perceive the product as slow.

When they first scaled to this volume on a major managed LLM provider, their monthly bill was approaching $34,000. Their CTO knew this couldn't continue as they expanded to new customers.

---

### The Challenge: Latency + Cost at Scale

The team's workloads split into two categories:

**Latency-sensitive (40% of calls):** Real-time chat assist, where agents see AI-drafted responses as they type. Hard cutoff at 200ms first-token or the UX degrades.

**Throughput-sensitive (60% of calls):** Background ticket classification, summary generation, and routing decisions. Latency matters less; cost matters more.

They needed a solution that could handle both — fast enough for real-time chat, cheap enough for background processing — without requiring them to maintain two separate infrastructure stacks.

---

### The Approach: Model Routing on a Single Platform

The Depot AI team deployed a two-tier model strategy on Cloudach:

- **Llama 3 8B** for background classification and routing tasks (high volume, cost-sensitive)
- **Llama 3 70B** for real-time chat assist (latency-sensitive, quality-sensitive)

Both endpoints were deployed on Cloudach under the same API key. Their routing logic was a simple conditional in their existing LLM client:

```python
def get_model_for_task(task_type: str) -> str:
    if task_type in ("chat_assist", "response_draft"):
        return "meta-llama/Llama-3-70B-Instruct"  # fast, high quality
    return "meta-llama/Llama-3-8B-Instruct"        # cheap, good enough
```

The OpenAI SDK compatibility meant this was a zero-change migration to their application code beyond the routing logic itself.

---

### Performance at Scale

Cloudach's A100 fleet delivered p50 first-token latency of 42ms for Llama 3 8B and 180ms for Llama 3 70B — both well within their 200ms threshold.

At peak load (2.1M calls/day), auto-scaling ensured zero queuing. The team had previously seen rate limiting and queuing delays on shared inference APIs during traffic spikes from large customers. With dedicated endpoints, capacity scaled with demand.

| Metric | Previous Provider | Cloudach |
|--------|-------------------|----------|
| Monthly spend | $34,000 | $11,800 |
| p50 TTFT (chat assist) | 1,200ms | 180ms |
| p50 TTFT (classification) | 820ms | 42ms |
| Rate limit incidents/month | 12 | 0 |
| Cost per 1M tokens (8B) | ~$4.50 | $0.10 |
| Cost per 1M tokens (70B) | ~$12 | $0.40 |

Monthly spend dropped from $34,000 to $11,800 — a 65% reduction. They stayed within their $12,000/month budget for the first time as they scaled through their 2M call/day milestone.

---

### What Surprised Them

The team expected a tradeoff between cost and performance. What they found was that Cloudach's latency was substantially better than what they'd been getting from a shared inference API — because they were no longer competing for capacity with other customers during traffic spikes.

"We assumed cheaper meant slower. It turned out cheaper meant faster, because we stopped sharing capacity with everyone else." — Head of Engineering, Depot AI

They also noted zero engineering overhead after initial setup. No infrastructure code, no YAML, no GPU ops. Their entire deployment configuration lives in two environment variables: the Cloudach API base URL and their API key.

---

### What's Next

Depot AI is evaluating Cloudach's upcoming private VPC deployment option for a Fortune 500 retail customer with strict data residency requirements. They're also piloting LoRA fine-tuning support to adapt Llama 3 to their domain-specific ticket taxonomy — a capability that would have been impractical to self-host at their scale.

---

*Want to see similar results? Start free at cloudach.com — 1M tokens/month, no credit card required.*
