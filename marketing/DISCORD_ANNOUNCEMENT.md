# Discord / Community Launch Announcements

Templates for different server types. Adjust tone to match each community.

---

## 1. General Launch Announcement (Hugging Face, LlamaIndex, LangChain servers)

**Channel:** #tools-and-resources / #show-and-tell / relevant channel

---

👋 Hey everyone — wanted to share something we just launched that might be useful here.

**Cloudach** — deploy any open-source LLM in 60 seconds, OpenAI-compatible API.

The short version: Llama 3, Mistral, Mixtral, Qwen, Phi-3, and 40+ other models available as managed API endpoints. Same interface as the OpenAI API — change one line of code (`base_url`) and your existing SDK calls, LangChain pipelines, LlamaIndex integrations, everything just works.

**Pricing:**
- Llama 3 8B: $0.10/M tokens
- Llama 3 70B: $0.40/M tokens
- Free tier: 1M tokens/month, no credit card

**Latency:**
- p50 TTFT: 42ms (8B), 180ms (70B) on A100s

**Why this exists:** Self-hosting vLLM is harder than it looks — CUDA config, auto-scaling, weight management, on-call burden. Cloudach is that infrastructure without the maintenance overhead.

Free tier at https://cloudach.com — happy to answer questions about the stack or integration!

---

## 2. Technical Communities (Eleuther AI, vLLM, ML practitioners)

**Channel:** #tools / #infrastructure / #show-and-tell

---

Hey all — sharing a project we just launched: **Cloudach**, a managed inference API for open-source LLMs.

Technical details for this crowd:

**Inference stack:**
- vLLM backend on A100s, FlashAttention-2, continuous batching with tuned scheduler
- p50 TTFT: 42ms (Llama 3 8B), 180ms (Llama 3 70B)
- API gateway in Go — handles 50k concurrent idle SSE connections in ~200MB RSS (the reason we didn't use Node for long-lived streaming)
- Full write-up on how we hit sub-100ms TTFT: https://cloudach.com/blog/sub-100ms-ttft-llama3-vllm

**What's live:**
- 40+ models: Llama 3 (8B, 70B), Mistral 7B, Mixtral 8×7B, Qwen 2, Phi-3, Code Llama, Gemma 2
- OpenAI-compatible `/v1/chat/completions` and `/v1/embeddings`
- Streaming, function calling, system prompts, auto-scaling
- Free tier: 1M tokens/month

The pitch to this community specifically: if you've been maintaining a vLLM self-hosted setup and hitting operational walls — weight management, CUDA versioning, cold start handling, etc. — Cloudach is that layer managed for you at $0.10–0.40/M tokens.

Happy to go deep on the inference architecture with anyone interested. And if anyone spots issues with our benchmarks or methodology, I want to know.

https://cloudach.com

---

## 3. Developer Generalist Communities (Vercel AI SDK, webdev, indie hackers)

**Channel:** #resources / #tools / #show-and-tell

---

Hey 👋 — launched something today that might be useful for people building LLM-powered apps here.

**Cloudach** — OpenAI-compatible API for open-source LLMs. Llama 3, Mistral, Mixtral, and 40+ others.

Why it's relevant if you're using Vercel AI SDK / Next.js / anything OpenAI-compatible:

```javascript
// Before
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// After (Cloudach — same code, open-source models, 75x cheaper)
const openai = new OpenAI({
  apiKey: process.env.CLOUDACH_API_KEY,
  baseURL: 'https://api.cloudach.com/v1',
});
```

That's literally the only change. All your `streamText`, `generateText`, `generateObject` calls work identically.

**Pricing:**
- Llama 3 8B: $0.10/M tokens (OpenAI GPT-4o: $30/M)
- Free tier: 1M tokens/month, no CC

Free to try: https://cloudach.com

---

## 4. MLOps / Production ML Communities (MLOps Community Slack, Latent Space)

**Channel:** #tools-and-resources

---

Hi everyone — sharing Cloudach, which we launched today.

**The problem it solves:** Open-source LLMs (Llama 3, Mistral) have caught up to GPT-4 on most production workloads. But the operational cost of self-hosting — vLLM setup, CUDA management, auto-scaling, monitoring, on-call — often exceeds the API cost savings, especially for teams without dedicated ML Ops capacity.

**What Cloudach is:** A managed inference API that handles the infrastructure layer. You get:
- OpenAI-compatible endpoints (`/v1/chat/completions`, `/v1/embeddings`)
- Dedicated endpoints per account (no shared fleet, no rate limit surprises)
- Sub-100ms TTFT on A100s (p50 = 42ms for Llama 3 8B)
- Auto-scaling, scale-to-zero, usage dashboard
- $0.10/M tokens (8B) / $0.40/M tokens (70B)

**Who it's for:** Teams currently paying the managed API tax (OpenAI/Anthropic) for tasks where open-source quality is sufficient, or teams that have tried self-hosting and found the operational overhead untenable.

Free tier to evaluate: https://cloudach.com

Happy to share TTFT benchmarks, discuss migration patterns, or talk through use cases where open-source still falls short vs. frontier models.

---

## 5. Short Version (for communities with strict promo rules)

*Use when channel rules require brief, non-promotional posts*

---

Launched Cloudach today — managed API for open-source LLMs (Llama 3, Mistral, Mixtral). OpenAI-compatible, 42ms TTFT, $0.10/M tokens, free tier. Happy to answer questions about the inference stack if anyone's curious. https://cloudach.com

---

## Community Engagement Guidelines

**Do:**
- Post in the most relevant channel only (don't cross-post in same server)
- Respond to every question or comment within 24 hours on launch day
- Lead with value to the community, not the product pitch
- Acknowledge the community's expertise level when in technical servers
- Share the technical blog post proactively in technical communities

**Don't:**
- Post in multiple channels in the same server
- Repeat the same announcement in the same channel
- Ignore comments or questions
- Make claims you can't back up with data (latency numbers, quality claims)
- Be defensive if community members critique or question the approach

**Timing:**
- Post all announcements within the same 2-hour window as HN and Product Hunt for cross-channel amplification
- Be available to respond to comments for at least 4 hours after posting
- Follow up with a "one week later" post in 1–2 communities with real usage data
