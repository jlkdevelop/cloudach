import Head from 'next/head'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function BlogPost1() {
  return (
    <>
      <Head>
        <title>How we achieve sub-100ms TTFT on Llama 3 with vLLM — Cloudach</title>
        <meta name="description" content="A deep dive into our inference stack — continuous batching, flash attention, and tensor parallelism tuning for sub-100ms time to first token on Llama 3." />
        <meta property="og:title" content="How we achieve sub-100ms TTFT on Llama 3 with vLLM — Cloudach" />
        <meta property="og:description" content="A deep dive into our inference stack — continuous batching, flash attention, and tensor parallelism tuning." />
        <meta property="og:url" content="https://cloudach.com/blog/sub-100ms-ttft-llama3-vllm" />
        <meta name="twitter:title" content="How we achieve sub-100ms TTFT on Llama 3 with vLLM — Cloudach" />
        <meta name="twitter:description" content="A deep dive into our inference stack — continuous batching, flash attention, and tensor parallelism tuning." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <Link href="/blog" style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back to blog
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-subtle)', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Engineering</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Apr 10, 2026</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15, color: '#0D0F1A', margin: '0 0 24px' }}>
          How we achieve sub-100ms TTFT on Llama 3 with vLLM
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 40 }}>
          Time to first token (TTFT) is the single most important latency metric for interactive LLM applications. Users feel it immediately — anything above 300ms starts feeling sluggish. Our goal from day one was sub-100ms TTFT for Llama 3 8B, and we hit it. Here&apos;s how.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>The baseline problem</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          Out of the box, a naive vLLM deployment of Llama 3 8B on an A100 80GB gives you roughly 150–250ms TTFT depending on batch size and prompt length. That&apos;s acceptable for batch workloads, but it kills the feel of real-time applications like chatbots, copilots, and code assistants.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          The problem has three layers: model loading latency, KV cache misses, and scheduler overhead. We had to attack all three simultaneously.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>Layer 1: Flash Attention 2 + PagedAttention</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          We run vLLM with FlashAttention-2 enabled, which reduces the memory I/O bottleneck in the attention computation by roughly 2x. Combined with vLLM&apos;s PagedAttention — which manages KV cache like virtual memory pages — we eliminate the primary cause of TTFT spikes under concurrent load: cache fragmentation.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          The key insight is that KV cache eviction is the hidden latency killer at scale. When pages get evicted under memory pressure and need to be recomputed, TTFT can spike 3–5x. PagedAttention&apos;s paging strategy lets us serve 4–6x more concurrent requests on the same GPU before we hit that ceiling.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>Layer 2: Continuous batching with tight scheduler tuning</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          vLLM&apos;s continuous batching scheduler has several knobs that most deployments leave at defaults. We tuned three in particular:
        </p>
        <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20, paddingLeft: 24 }}>
          <li style={{ marginBottom: 12 }}><strong>max_num_batched_tokens</strong>: We cap this at 8192 for interactive workloads. Higher values improve throughput but increase TTFT variance as longer prefill passes block new requests from being scheduled.</li>
          <li style={{ marginBottom: 12 }}><strong>max_num_seqs</strong>: We run 128 concurrent sequences rather than the default 256. This reduces scheduler overhead and keeps TTFT consistent under load.</li>
          <li style={{ marginBottom: 12 }}><strong>preemption_mode</strong>: We use <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>recompute</code> instead of <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>swap</code> for our A100 instances. Swapping to CPU adds 30–80ms of latency on eviction — recompute is faster for short sequences.</li>
        </ul>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>Layer 3: Tensor parallelism across 2 A100s for 70B</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          For Llama 3 70B, a single A100 80GB isn&apos;t enough memory for the full model in FP16 (it&apos;s ~140GB). We use tensor parallelism across 2× A100s with <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>tensor_parallel_size=2</code>. The inter-GPU communication overhead is only ~3ms on NVLink, which is well within our budget.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          For 8B, we run on a single A100 with no tensor parallelism — splitting across GPUs for a model this size adds more communication latency than it saves.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>Results</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          After applying all three layers:
        </p>
        <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20, paddingLeft: 24 }}>
          <li style={{ marginBottom: 8 }}>Llama 3 8B: <strong>p50 TTFT = 42ms</strong>, p99 = 87ms at 50 concurrent requests</li>
          <li style={{ marginBottom: 8 }}>Llama 3 70B: <strong>p50 TTFT = 68ms</strong>, p99 = 114ms at 20 concurrent requests</li>
          <li style={{ marginBottom: 8 }}>Throughput increase: ~3.2x over baseline for the same TTFT budget</li>
        </ul>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          The most surprising find: scheduler tuning (layer 2) had more impact on TTFT consistency than FlashAttention-2 alone. FA2 reduces mean latency; scheduler tuning collapses the tail.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>What&apos;s next</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 40 }}>
          We&apos;re actively testing speculative decoding for the 70B model — early results suggest we can get p50 TTFT down to ~45ms without touching the accuracy profile. We&apos;ll share those results in a follow-up post.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 40 }}>
          If you&apos;re building latency-sensitive LLM applications, <Link href="/signup" style={{ color: 'var(--brand)' }}>try Cloudach free</Link>. You&apos;ll hit these numbers on your first deploy.
        </p>
      </main>
      <Footer />
    </>
  )
}
