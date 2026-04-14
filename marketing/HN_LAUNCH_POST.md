# Hacker News Launch Post Draft

## Title
Show HN: Cloudach – Deploy any open-source LLM in 60 seconds

---

## Body

Hi HN,

I'm one of the builders behind Cloudach (https://cloudach.com) — a platform that lets you deploy any open-source language model to production in under 60 seconds.

**The problem we're solving:**

Running open-source LLMs in production is unreasonably hard. You either pay the managed API tax to a closed provider, or you spend days wrangling CUDA drivers, vLLM configs, auto-scaling logic, and load balancer setup before you can ship anything. Neither option is great for developers who want the economics and data privacy of open-source models with the operational simplicity of a managed API.

**How it works:**

```bash
cloudach deploy --model meta-llama/Llama-3-8B-Instruct
# ↳ Live → api.cloudach.com/your-endpoint  (43 seconds)
```

The endpoint is OpenAI-compatible. Change your base URL and API key — everything else in your existing OpenAI SDK code works identically. We've tested compatibility against LangChain, LlamaIndex, and the Vercel AI SDK.

**What's available:**

- 40+ models: Llama 3 (8B, 70B), Mistral 7B, Mixtral 8×7B, Qwen 2, Phi-3, Code Llama, and more
- Sub-100ms time-to-first-token on our A100 fleet (p50 = 42ms for Llama 3 8B)
- Auto-scaling — scales to zero when idle, scales up instantly on traffic
- Free tier: 1M tokens/month, no credit card required

**Some things we're proud of:**

We wrote a blog post about how we hit sub-100ms TTFT: https://cloudach.com/blog/sub-100ms-ttft-llama3-vllm. The short version: FlashAttention-2, continuous batching with tight scheduler tuning, and tensor parallelism for 70B. The surprising find was that scheduler tuning had more impact on TTFT consistency (collapsing the p99) than FA2 alone.

We also built our OpenAI-compatible gateway in Go (not Node.js) specifically for long-lived SSE connection handling — Go handles 50k concurrent idle streaming connections in ~200MB RSS.

**Why open-source models are underrated:**

Llama 3 70B is genuinely competitive with GPT-4-class models on most coding and reasoning benchmarks. At ~$0.50/M tokens on Cloudach vs ~$30/M for GPT-4o, the economics are hard to ignore once you're at any real scale. And you own your data — nothing is logged or retained.

**The ask:**

We'd love feedback from people running LLMs in production. What's broken? What's missing? We're especially interested in hearing from teams who've tried self-hosting and hit operational walls.

Happy to answer anything about the inference stack, the API gateway, or the roadmap (fine-tuning, embeddings, and private VPC are next).

— The Cloudach team

---

## Anticipated Comments / Responses

**"How do you handle cold starts?"**
> Models stay warm on our fleet for active deployments. For scale-to-zero endpoints, the cold start is typically 8–15 seconds for 8B models (pulling from our regional weight cache, not HuggingFace). We're working on predictive pre-warming.

**"What's the pricing model?"**
> Token-based, same as the OpenAI API. Free tier: 1M tokens/month. Paid plans start at $20/month with pay-as-you-go overages. No per-seat or deployment fees.

**"How are you different from Together AI / Replicate / Modal?"**
> Together AI and Replicate charge per-token but don't give you a persistent endpoint — you're making API calls to their shared fleet. Modal requires you to write Python deployment code. Cloudach gives you a dedicated endpoint behind your API key that you deploy once and call forever, with no infrastructure code.

**"Is the inference stack open source?"**
> The inference backends run vLLM (Apache 2.0). The API gateway and scheduling layer are proprietary. We're considering open-sourcing the gateway — let us know if that's useful.

**"What about fine-tuning?"**
> LoRA adapter support is coming in the next 4–6 weeks. You'll be able to push a LoRA checkpoint and it'll be merged onto the base model at inference time. We're not doing full fine-tuning-as-a-service yet.
