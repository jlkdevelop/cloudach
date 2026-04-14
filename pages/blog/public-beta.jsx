import Head from 'next/head'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function BlogPost2() {
  return (
    <>
      <Head>
        <title>Cloudach is now in public beta — Cloudach</title>
        <meta name="description" content="We're opening up the platform to all developers. Deploy your first model free — no credit card required." />
        <meta property="og:title" content="Cloudach is now in public beta" />
        <meta property="og:description" content="We're opening up the platform to all developers. Deploy your first model free — no credit card required." />
        <meta property="og:url" content="https://cloudach.com/blog/public-beta" />
        <meta name="twitter:title" content="Cloudach is now in public beta" />
        <meta name="twitter:description" content="We're opening up the platform to all developers. Deploy your first model free — no credit card required." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <Link href="/blog" style={{ fontSize: 13, color: '#4F6EF7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back to blog
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Product</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Apr 5, 2026</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15, color: '#0D0F1A', margin: '0 0 24px' }}>
          Cloudach is now in public beta
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 40 }}>
          Today we&apos;re opening Cloudach to everyone. Any developer can sign up, deploy a model, and hit an OpenAI-compatible API endpoint in under 60 seconds — no waitlist, no credit card, no GPU setup.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>Why we built this</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          Every developer we talked to during private beta had the same frustration: running open-source LLMs in production is unreasonably hard. You either pay a managed API tax to a closed-model provider, or you spend days wrangling CUDA drivers, vLLM configs, and auto-scaling logic before you can ship anything.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          Cloudach is the third path. You get the economics and privacy of self-hosted open-source models with the operational simplicity of a managed API. No GPU ops. No infrastructure overhead. Just a deploy command and an endpoint.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>What&apos;s in the beta</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 12 }}>
          Everything you need to run LLMs in production:
        </p>
        <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20, paddingLeft: 24 }}>
          <li style={{ marginBottom: 10 }}><strong>40+ models available</strong> — Llama 3 (8B, 70B), Mistral 7B, Mixtral 8×7B, Qwen 2, Phi-3, Code Llama, and more</li>
          <li style={{ marginBottom: 10 }}><strong>OpenAI-compatible API</strong> — drop-in replacement for the OpenAI SDK. Change one line of code</li>
          <li style={{ marginBottom: 10 }}><strong>Sub-100ms TTFT</strong> on our A100 fleet for 8B-class models</li>
          <li style={{ marginBottom: 10 }}><strong>Auto-scaling</strong> — scale to zero when idle, scale up instantly on traffic</li>
          <li style={{ marginBottom: 10 }}><strong>Usage dashboard</strong> — token counts, latency histograms, cost breakdown per model</li>
          <li style={{ marginBottom: 10 }}><strong>Free tier</strong> — 1M tokens/month free, no credit card required</li>
        </ul>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>How it works</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 16 }}>
          The deploy flow takes about 45 seconds:
        </p>
        <div style={{ background: '#0D0F1A', borderRadius: 12, padding: '20px 24px', marginBottom: 24, fontFamily: 'monospace', fontSize: 13 }}>
          <div style={{ color: '#9CA3AF', marginBottom: 8 }}># 1. Install the CLI</div>
          <div style={{ color: '#E2E8F0', marginBottom: 16 }}>npm install -g cloudach</div>
          <div style={{ color: '#9CA3AF', marginBottom: 8 }}># 2. Deploy any model</div>
          <div style={{ color: '#E2E8F0', marginBottom: 16 }}>cloudach deploy --model meta-llama/Llama-3-8B-Instruct</div>
          <div style={{ color: '#9CA3AF', marginBottom: 8 }}># 3. Call it like OpenAI</div>
          <div style={{ color: '#6EE7B7' }}>✓ Live → api.cloudach.com/your-endpoint</div>
        </div>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          If you already use the OpenAI SDK, you just change the base URL and your API key. Everything else — streaming, function calling, embeddings — works identically.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>Private beta learnings</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          Over 500 developers used Cloudach in private beta. A few things we learned:
        </p>
        <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20, paddingLeft: 24 }}>
          <li style={{ marginBottom: 10 }}>The most-deployed model is Llama 3 8B — it hits the right balance of quality and cost for most chat and completion workloads</li>
          <li style={{ marginBottom: 10 }}>60% of users switched from the OpenAI API specifically for cost reasons. Average savings reported: ~70%</li>
          <li style={{ marginBottom: 10 }}>The second biggest reason was data privacy — many teams can&apos;t send customer data to third-party APIs. Cloudach processes nothing and stores nothing</li>
          <li style={{ marginBottom: 10 }}>Most common feedback: &quot;I expected this to be harder.&quot; That&apos;s the goal</li>
        </ul>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>What&apos;s coming next</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          We&apos;re working on fine-tuning support (bring your own LoRA adapter), embeddings endpoints for RAG pipelines, and a private VPC deployment option for enterprise teams. If any of those are blockers for you, <Link href="/contact" style={{ color: '#4F6EF7' }}>reach out</Link> — we prioritize based on what the community is building.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 40 }}>
          <Link href="/signup" style={{ color: '#4F6EF7', fontWeight: 600 }}>Sign up free →</Link> and deploy your first model in 60 seconds.
        </p>
      </main>
      <Footer />
    </>
  )
}
