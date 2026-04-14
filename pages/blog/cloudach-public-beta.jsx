import Head from 'next/head'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function Post2() {
  return (
    <>
      <Head>
        <title>Cloudach is now in public beta — Cloudach Blog</title>
        <meta name="description" content="We're opening up the Cloudach platform to all developers. Deploy your first model free — no credit card required." />
        <meta property="og:title" content="Cloudach is now in public beta" />
        <meta property="og:description" content="We're opening up the Cloudach platform to all developers. Deploy your first model free — no credit card required." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/blog/cloudach-public-beta" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cloudach is now in public beta" />
        <meta name="twitter:description" content="Deploy Llama 3, Mistral, and Mixtral for free. OpenAI-compatible API, production-ready in 60 seconds." />
        <meta name="twitter:image" content="https://cloudach.com/og-image.png" />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <Link href="/blog" style={{ fontSize: 13, color: '#4F6EF7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back to blog
        </Link>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Product</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Apr 5, 2026</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>· 5 min read</span>
        </div>

        <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15, color: '#0D0F1A', marginBottom: 20 }}>
          Cloudach is now in public beta
        </h1>

        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 40, borderBottom: '1px solid #E5E7EB', paddingBottom: 40 }}>
          Starting today, any developer can sign up for Cloudach and deploy their first open-source LLM without a credit card. We're opening up the platform after four months of private beta with a small group of developers and teams who helped us squeeze every millisecond out of our inference stack.
        </p>

        <div style={{ fontSize: 16, color: '#374151', lineHeight: 1.85 }}>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>Why we built this</h2>
          <p style={{ marginBottom: 20 }}>
            In mid-2025, running a production LLM API meant one of three things: pay OpenAI or Anthropic per token, manage your own GPU infrastructure (expensive and brittle), or use a hosting service that charged $2,000/month minimum and still required you to configure half the stack yourself.
          </p>
          <p style={{ marginBottom: 20 }}>
            We thought there was a better option: a developer-first platform that abstracts away the infrastructure entirely — GPUs, vLLM configuration, autoscaling, health checks — so you can go from "I want to run Llama 3" to a live API endpoint in under 60 seconds.
          </p>
          <p style={{ marginBottom: 20 }}>
            That's what Cloudach is. And starting today, it's available to everyone.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>What you get on the free tier</h2>
          <ul style={{ paddingLeft: 24, marginBottom: 20 }}>
            <li style={{ marginBottom: 10 }}><strong>1M tokens/month</strong> across any model</li>
            <li style={{ marginBottom: 10 }}><strong>OpenAI-compatible API</strong> — change one line to switch from GPT-4 to Llama 3 70B</li>
            <li style={{ marginBottom: 10 }}><strong>4 models available:</strong> Llama 3 8B, Llama 3 70B, Mistral 7B, and Mixtral 8×7B</li>
            <li style={{ marginBottom: 10 }}><strong>Sub-100ms TTFT</strong> on shared GPU infrastructure</li>
            <li style={{ marginBottom: 10 }}><strong>Dashboard and API key management</strong></li>
          </ul>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>Getting started in 60 seconds</h2>
          <p style={{ marginBottom: 16 }}>If you already use the OpenAI SDK, getting started is a single line change:</p>

          <div style={{ background: '#0D0F1A', borderRadius: 10, padding: '20px 24px', marginBottom: 24, fontFamily: 'monospace', fontSize: 13, color: '#E2E8F0', lineHeight: 1.7 }}>
            <div style={{ color: '#9CA3AF', marginBottom: 8 }}># Before</div>
            <div><span style={{ color: '#60A5FA' }}>client</span> = OpenAI(api_key=<span style={{ color: '#34D399' }}>"sk-..."</span>)</div>
            <div style={{ marginTop: 16, color: '#9CA3AF', marginBottom: 8 }}># After — same SDK, any open-source model</div>
            <div><span style={{ color: '#60A5FA' }}>client</span> = OpenAI(</div>
            <div>  api_key=<span style={{ color: '#34D399' }}>"cla_..."</span>,</div>
            <div>  base_url=<span style={{ color: '#34D399' }}>"https://api.cloudach.com/v1"</span></div>
            <div>)</div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>What's coming next</h2>
          <p style={{ marginBottom: 20 }}>
            We're actively working on fine-tuning support (LoRA adapters on your own data), dedicated GPU endpoints with guaranteed capacity, and a streaming dashboard for real-time token usage and latency metrics. Enterprise customers can also request private VPC deployment and custom model hosting — reach out via our contact page.
          </p>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5, margin: '40px 0 16px' }}>Thanks to our private beta users</h2>
          <p style={{ marginBottom: 20 }}>
            Over 200 developers ran production traffic through Cloudach during private beta. Their feedback shaped everything from our chunked prefill tuning (see our TTFT deep dive) to the API key UX in the dashboard. Thank you — you made the product significantly better.
          </p>
          <p style={{ marginBottom: 20 }}>
            Now it's your turn. <Link href="/signup" style={{ color: '#4F6EF7', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link> and deploy your first model in 60 seconds.
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
