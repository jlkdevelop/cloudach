import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import Link from 'next/link'

const posts = [
  {
    date: 'Apr 14, 2026',
    tag: 'Product',
    title: 'New models on Cloudach: Llama 3.1, Command R+, and DBRX',
    desc: 'Four new models are now available — Llama 3.1 8B and 70B with 128K context, Cohere Command R+ for RAG and agents, and Databricks DBRX for coding and reasoning.',
    slug: '/blog/new-models-llama31-command-r-plus-dbrx',
  },
  {
    date: 'Apr 14, 2026',
    tag: 'ML',
    title: 'Fine-tune Llama 3 on your own data with Cloudach',
    desc: 'A practical guide to fine-tuning Llama 3 with LoRA on Cloudach. Why fine-tuning beats prompting for domain tasks, how LoRA works under the hood, and how to get from raw data to a deployed model.',
    slug: '/blog/fine-tune-llama3-cloudach',
  },
  {
    date: 'Apr 14, 2026',
    tag: 'ML',
    title: 'How to choose the right open-source LLM',
    desc: 'A practical decision framework for picking the right open-source LLM. Decision tree, use case matrix, benchmark comparisons, and cost tradeoffs for Mistral, Llama 3, Mixtral, and more.',
    slug: '/blog/how-to-choose-open-source-llm',
  },
  {
    date: 'Apr 10, 2026',
    tag: 'Engineering',
    title: 'How we achieve sub-100ms TTFT on Llama 3 with vLLM',
    desc: 'A deep dive into our inference stack — continuous batching, flash attention, and tensor parallelism tuning.',
    slug: '/blog/sub-100ms-ttft-llama3-vllm',
  },
  {
    date: 'Apr 5, 2026',
    tag: 'Product',
    title: 'Cloudach is now in public beta',
    desc: 'We\'re opening up the platform to all developers. Deploy your first model free — no credit card required.',
    slug: '/blog/public-beta',
  },
  {
    date: 'Mar 28, 2026',
    tag: 'Engineering',
    title: 'Building an OpenAI-compatible API gateway from scratch',
    desc: 'How we designed our API layer to be a drop-in replacement for the OpenAI SDK with any open-source model.',
    slug: '/blog/openai-compatible-api-gateway',
  },
]

export default function Blog() {
  return (
    <>
      <Head>
        <title>Blog — Cloudach</title>
        <meta name="description" content="Engineering deep dives, product updates, and LLM infrastructure insights from the Cloudach team." />
        <meta property="og:title" content="Blog — Cloudach" />
        <meta property="og:description" content="Engineering deep dives, product updates, and LLM infrastructure insights from the Cloudach team." />
        <meta property="og:url" content="https://cloudach.com/blog" />
        <meta name="twitter:title" content="Blog — Cloudach" />
        <meta name="twitter:description" content="Engineering deep dives, product updates, and LLM infrastructure insights from the Cloudach team." />
      </Head>
      <Nav />
      <main style={{ background: '#07080f', minHeight: '100vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '88px 48px' }}>
        <div className="sec-tag">Blog</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.12, color: 'var(--text-1)', margin: '16px 0 52px' }}>
          From the team
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {posts.map(p => (
            <Link href={p.slug} key={p.title} style={{ background: 'var(--bg-1)', padding: '28px 32px', display: 'block', textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--bg-1)'}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'rgba(255,255,255,0.07)', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em', border: '1px solid rgba(255,255,255,0.12)' }}>{p.tag}</span>
                <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{p.date}</span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: -0.3, marginBottom: 8 }}>{p.title}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65 }}>{p.desc}</p>
            </Link>
          ))}
        </div>
      </div>
      </main>
      <Footer />
    </>
  )
}
