import Head from 'next/head'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function Post1() {
  return (
    <>
      <Head>
        <title>How we achieve sub-100ms TTFT on Llama 3 with vLLM — Cloudach Blog</title>
        <meta name="description" content="A deep dive into our inference stack — continuous batching, flash attention, and tensor parallelism tuning to hit sub-100ms time-to-first-token on Llama 3." />
        <meta property="og:title" content="How we achieve sub-100ms TTFT on Llama 3 with vLLM — Cloudach Blog" />
        <meta property="og:description" content="A deep dive into our inference stack — continuous batching, flash attention, and tensor parallelism tuning." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/blog/sub-100ms-ttft-llama3-vllm" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How we achieve sub-100ms TTFT on Llama 3 with vLLM" />
        <meta name="twitter:description" content="Continuous batching, flash attention, and tensor parallelism tuning on A100 GPUs." />
        <meta name="twitter:image" content="https://cloudach.com/og-image.png" />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <Link href="/blog" style={{ fontSize: 13, color: '#4F6EF7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back to blog
        </Link>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Engineering</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Apr 10, 2026</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>· 8 min read</span>
        </div>

        <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15, color: '#0D0F1A', marginBottom: 20 }}>
          How we achieve sub-100ms TTFT on Llama 3 with vLLM
        </h1>

        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 40, borderBottom: '1px solid #E5E7EB', paddingBottom: 40 }}>
          Time-to-first-token (TTFT) is the latency metric that matters most for interactive LLM applications. In this post, we walk through every layer of our inference stack — from hardware selection to vLLM configuration — that gets us to a p50 TTFT under 80ms on Llama 3 8B and under 100ms on Llama 3 70B.
        </p>

        <div style={{ fontSize: 16, color: '#374151', lineHeight: 1.85 }}>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>Why TTFT matters more than throughput</h2>
          <p style={{ marginBottom: 20 }}>
            Throughput — tokens per second across all concurrent requests — is the right metric when you're running batch jobs. But for chat applications, RAG pipelines, and any use case where a human (or another model) is waiting for a response, TTFT is what determines whether the experience feels snappy or sluggish. A 500ms TTFT reads as a freeze. An 80ms TTFT feels instant.
          </p>
          <p style={{ marginBottom: 20 }}>
            Most hosted inference providers optimize for throughput because it's cheaper — pack more users onto the same GPU and charge by the token. We made a different bet: optimize for interactive latency at our standard tier, and let customers who need pure throughput opt into a batch endpoint.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>Hardware: A100 80GB SXM5</h2>
          <p style={{ marginBottom: 20 }}>
            The NVIDIA A100 80GB SXM5 variant has 2TB/s of HBM2e memory bandwidth — about 2× the PCIe variant. For LLM inference, memory bandwidth is the primary bottleneck during autoregressive decoding. Every token generated requires loading the full KV cache and model weights from HBM into the SM registers. More bandwidth = faster token generation.
          </p>
          <p style={{ marginBottom: 20 }}>
            For Llama 3 8B (16GB in FP16), a single A100 80GB runs the model with ample room for KV cache. For Llama 3 70B (~140GB in FP16), we use 2× A100 80GB with NVLink for tensor parallelism. The NVLink interconnect gives us 600 GB/s between cards, which is fast enough that tensor parallelism overhead is minimal.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>vLLM configuration</h2>
          <p style={{ marginBottom: 20 }}>
            We run vLLM 0.4.x with the following key settings:
          </p>

          <div style={{ background: '#0D0F1A', borderRadius: 10, padding: '20px 24px', marginBottom: 24, fontFamily: 'monospace', fontSize: 13, color: '#E2E8F0', lineHeight: 1.7 }}>
            <div style={{ color: '#9CA3AF', marginBottom: 8 }}># vllm serve config for Llama-3-8B</div>
            <div><span style={{ color: '#60A5FA' }}>--model</span> meta-llama/Meta-Llama-3-8B-Instruct \</div>
            <div><span style={{ color: '#60A5FA' }}>--tensor-parallel-size</span> 1 \</div>
            <div><span style={{ color: '#60A5FA' }}>--gpu-memory-utilization</span> 0.90 \</div>
            <div><span style={{ color: '#60A5FA' }}>--max-model-len</span> 8192 \</div>
            <div><span style={{ color: '#60A5FA' }}>--enable-chunked-prefill</span> \</div>
            <div><span style={{ color: '#60A5FA' }}>--max-num-batched-tokens</span> 4096 \</div>
            <div><span style={{ color: '#60A5FA' }}>--enforce-eager</span> false</div>
          </div>

          <p style={{ marginBottom: 20 }}>
            The two settings that have the largest impact on TTFT are <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: 14 }}>--enable-chunked-prefill</code> and <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: 14 }}>--max-num-batched-tokens</code>.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>Chunked prefill: the biggest win</h2>
          <p style={{ marginBottom: 20 }}>
            Standard vLLM prefill processes the entire prompt in a single forward pass before starting generation. For a 2,000-token prompt, that's a long prefill step that blocks all decode requests on the same GPU. If you have 10 concurrent users, 9 of them are waiting for one user's prefill to complete.
          </p>
          <p style={{ marginBottom: 20 }}>
            Chunked prefill splits the prompt into fixed-size chunks (we use 512 tokens) and interleaves prefill chunks with decode steps. This means decode requests are never blocked for more than one chunk's worth of compute. The result: p99 TTFT drops by ~40% under concurrent load, with negligible impact on throughput.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>Flash Attention 2 and CUDA graph capture</h2>
          <p style={{ marginBottom: 20 }}>
            vLLM uses FlashAttention 2 by default for supported hardware. For A100s with CUDA 12+, this gives roughly 3× attention throughput compared to standard attention, with O(n) rather than O(n²) memory complexity. For an 8K context window, this is a meaningful saving.
          </p>
          <p style={{ marginBottom: 20 }}>
            CUDA graph capture (<code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: 14 }}>--enforce-eager false</code>) pre-captures the decode step as a CUDA graph during warmup. This eliminates Python overhead and CUDA kernel launch latency during actual inference. It reduces per-token decode latency by ~15% on A100. The tradeoff is ~2GB of additional GPU memory for the captured graphs — worth it at our utilization targets.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>Results</h2>
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '20px 24px', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: '#0D0F1A', fontWeight: 700 }}>Model</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: '#0D0F1A', fontWeight: 700 }}>p50 TTFT</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: '#0D0F1A', fontWeight: 700 }}>p95 TTFT</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: '#0D0F1A', fontWeight: 700 }}>Throughput</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>Llama 3 8B</td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>78ms</td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>142ms</td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>3,200 tok/s</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>Llama 3 70B (2× A100)</td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>94ms</td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>198ms</td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>1,100 tok/s</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', color: '#374151' }}>Mistral 7B</td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>72ms</td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>128ms</td>
                  <td style={{ padding: '10px 12px', color: '#374151', textAlign: 'right' }}>3,600 tok/s</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginBottom: 20 }}>
            Measured under 20 concurrent users with 512-token prompts and 256-token outputs. All requests served from a single A100 node (or 2× for 70B).
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>What's next</h2>
          <p style={{ marginBottom: 20 }}>
            We're currently evaluating speculative decoding with a small draft model (Llama 3 1B → Llama 3 8B) and expect it to cut p50 TTFT to under 50ms on common prompts. We're also exploring H100 SXM5 nodes — the 3.35 TB/s HBM3 bandwidth should halve decode latency on the 70B model.
          </p>
          <p style={{ marginBottom: 20 }}>
            If you're building something latency-sensitive on top of open-source LLMs, <Link href="/signup" style={{ color: '#4F6EF7', textDecoration: 'none', fontWeight: 600 }}>try Cloudach free</Link> — no credit card required.
          </p>
        </div>

        <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 64, paddingTop: 32, display: 'flex', gap: 12 }}>
          <Link href="/signup"><button className="btn-cta">Deploy your first model free</button></Link>
          <Link href="/blog"><button className="btn-cta-ghost">More posts</button></Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
