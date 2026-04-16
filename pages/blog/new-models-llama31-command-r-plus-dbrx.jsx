import Head from 'next/head'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function NewModelsBlogPost() {
  return (
    <>
      <Head>
        <title>New models on Cloudach: Llama 3.1, Command R+, and DBRX — Cloudach</title>
        <meta name="description" content="We're adding Llama 3.1 (8B and 70B), Cohere Command R+, and Databricks DBRX to the Cloudach model catalog — all with OpenAI-compatible endpoints." />
        <meta property="og:title" content="New models on Cloudach: Llama 3.1, Command R+, and DBRX" />
        <meta property="og:description" content="We're adding Llama 3.1 (8B and 70B), Cohere Command R+, and Databricks DBRX to the Cloudach model catalog — all with OpenAI-compatible endpoints." />
        <meta property="og:url" content="https://cloudach.com/blog/new-models-llama31-command-r-plus-dbrx" />
        <meta name="twitter:title" content="New models on Cloudach: Llama 3.1, Command R+, and DBRX" />
        <meta name="twitter:description" content="We're adding Llama 3.1 (8B and 70B), Cohere Command R+, and Databricks DBRX to the Cloudach model catalog — all with OpenAI-compatible endpoints." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <Link href="/blog" style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back to blog
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-subtle)', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Product</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Apr 14, 2026</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15, color: '#0D0F1A', margin: '0 0 24px' }}>
          New models on Cloudach: Llama 3.1, Command R+, and DBRX
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 40 }}>
          We're expanding the Cloudach model catalog with four new additions today. All models are available immediately via our OpenAI-compatible API — no SDK changes required.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '40px 0' }} />

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '40px 0 16px' }}>
          Llama 3.1 — 8B and 70B
        </h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
          Meta's Llama 3.1 release is a significant upgrade over Llama 3. The headline change is the context window: both the 8B and 70B variants now support <strong>128K tokens</strong>, making them practical for long-document summarisation, multi-turn agents, and large codebases.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
          Beyond context, Meta improved multilingual performance and released updated instruction-tuning. The 70B model in particular is competitive with proprietary frontier models on several reasoning and coding benchmarks.
        </p>
        <ModelCard
          id="llama31-8b"
          name="Llama 3.1 8B Instruct"
          params="8B"
          ctx="128K"
          tags={['chat', 'code', 'fast', 'long-context']}
          price="$0.10 / $0.12 per 1M tokens (in/out)"
        />
        <ModelCard
          id="llama31-70b"
          name="Llama 3.1 70B Instruct"
          params="70B"
          ctx="128K"
          tags={['chat', 'code', 'powerful', 'long-context']}
          price="$0.75 / $0.95 per 1M tokens (in/out)"
        />

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>
          Command R+
        </h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
          Cohere's Command R+ is a 104-billion-parameter model purpose-built for retrieval-augmented generation (RAG), tool use, and multi-step agentic workflows. Its 128K context window lets you pass large document sets directly into the prompt without chunking, and its native tool-calling support maps cleanly to OpenAI's function-calling format.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
          If you're building a knowledge base assistant, a customer-support bot backed by live data, or an orchestration layer for multi-tool agents, Command R+ is worth evaluating.
        </p>
        <ModelCard
          id="command-r-plus"
          name="Command R+"
          params="104B"
          ctx="128K"
          tags={['chat', 'rag', 'agents', 'long-context']}
          price="$1.20 / $1.50 per 1M tokens (in/out)"
        />

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>
          DBRX
        </h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
          Databricks' DBRX is a 132-billion-parameter mixture-of-experts (MoE) model that activates only 36B parameters per forward pass, keeping inference cost and latency close to dense 40B models while delivering quality that matches or exceeds LLaMA 2 70B and Mistral across coding, reasoning, and general knowledge benchmarks.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
          DBRX is particularly strong on code generation and SQL tasks — a natural fit for data-engineering and analytics use cases.
        </p>
        <ModelCard
          id="dbrx"
          name="DBRX Instruct"
          params="132B (36B active)"
          ctx="32K"
          tags={['chat', 'code', 'powerful']}
          price="$1.10 / $1.40 per 1M tokens (in/out)"
        />

        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '48px 0' }} />

        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '0 0 16px' }}>
          Getting started
        </h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
          All four models are available now in your{' '}
          <Link href="/dashboard/models" style={{ color: 'var(--brand)', textDecoration: 'none' }}>model catalog</Link>.
          Deploy any of them and you'll get an OpenAI-compatible endpoint instantly — swap in the model ID and your Cloudach API key and you're done:
        </p>
        <pre style={{ background: '#1E1E1E', color: '#D4D4D4', padding: '20px 24px', borderRadius: 10, fontSize: 13, lineHeight: 1.7, overflowX: 'auto', marginBottom: 24 }}>{`from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key="YOUR_API_KEY",
)

response = client.chat.completions.create(
    model="llama31-70b",   # or command-r-plus, dbrx, llama31-8b
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)`}</pre>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
          Questions? Reach us at{' '}
          <a href="mailto:support@cloudach.com" style={{ color: 'var(--brand)', textDecoration: 'none' }}>support@cloudach.com</a>.
        </p>
      </main>
      <Footer />
    </>
  )
}

function ModelCard({ id, name, params, ctx, tags, price }) {
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px', marginBottom: 16, background: '#FAFAFA' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0D0F1A', marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>
            {params} params · {ctx} context
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map(t => (
              <span key={t} style={{ fontSize: 11, fontWeight: 600, color: 'var(--brand)', background: 'var(--brand-subtle)', padding: '2px 8px', borderRadius: 4 }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <code style={{ fontSize: 12, color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: 4 }}>{id}</code>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>{price}</div>
        </div>
      </div>
    </div>
  )
}
