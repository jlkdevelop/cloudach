import Head from 'next/head'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function BlogPost3() {
  return (
    <>
      <Head>
        <title>Building an OpenAI-compatible API gateway from scratch — Cloudach</title>
        <meta name="description" content="How we designed our API layer to be a drop-in replacement for the OpenAI SDK with any open-source model." />
        <meta property="og:title" content="Building an OpenAI-compatible API gateway from scratch — Cloudach" />
        <meta property="og:description" content="How we designed our API layer to be a drop-in replacement for the OpenAI SDK with any open-source model." />
        <meta property="og:url" content="https://cloudach.com/blog/openai-compatible-api-gateway" />
        <meta name="twitter:title" content="Building an OpenAI-compatible API gateway from scratch — Cloudach" />
        <meta name="twitter:description" content="How we designed our API layer to be a drop-in replacement for the OpenAI SDK with any open-source model." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <Link href="/blog" style={{ fontSize: 13, color: '#4F6EF7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back to blog
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Engineering</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Mar 28, 2026</span>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15, color: '#0D0F1A', margin: '0 0 24px' }}>
          Building an OpenAI-compatible API gateway from scratch
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 40 }}>
          The OpenAI API has become the de facto interface for LLM applications. Developers have built entire toolchains — LangChain, LlamaIndex, Vercel AI SDK, countless internal frameworks — that speak OpenAI. Making Cloudach a drop-in replacement meant we had to implement the spec precisely. Here&apos;s what that took.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>Why compatibility is harder than it looks</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          The OpenAI API spec is partially documented. The parts that matter most to developers — streaming behavior, error codes, token counting, finish reasons — have subtle behaviors that aren&apos;t fully specified in the docs but are relied on in production code everywhere.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          We found this out early when we passed the basic &quot;change base URL&quot; test but broke LangChain streaming because we were emitting <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>data: [DONE]</code> after a final delta chunk with a non-empty <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>content</code> field. OpenAI always sends a final chunk with an empty content string and <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>finish_reason: stop</code> before the <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>DONE</code> sentinel. We didn&apos;t. LangChain&apos;s streaming parser silently dropped the last token.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>The gateway architecture</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          Our API gateway sits between the client and the vLLM inference backends. It handles:
        </p>
        <ul style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20, paddingLeft: 24 }}>
          <li style={{ marginBottom: 10 }}><strong>Auth</strong>: API key validation, rate limit enforcement, usage tracking</li>
          <li style={{ marginBottom: 10 }}><strong>Request translation</strong>: OpenAI chat completions format → vLLM sampling params</li>
          <li style={{ marginBottom: 10 }}><strong>Model routing</strong>: map <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>model</code> field to the right backend instance</li>
          <li style={{ marginBottom: 10 }}><strong>Response translation</strong>: vLLM token stream → OpenAI SSE format</li>
          <li style={{ marginBottom: 10 }}><strong>Token counting</strong>: tiktoken for OpenAI-compatible usage metadata (even though vLLM uses sentencepiece internally)</li>
        </ul>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          We built it in Go. Node.js was tempting for the streaming ergonomics, but Go&apos;s goroutine-per-request model handles the long-lived SSE connections much more efficiently. At scale, idle connections are memory, not CPU — Go handles 50k concurrent idle SSE connections in ~200MB RSS. Node would struggle past 10k.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>The tricky parts</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 12 }}>
          <strong>Streaming with correct token deltas.</strong> vLLM streams complete tokens, not subword pieces. OpenAI sometimes streams sub-token deltas. Most SDKs don&apos;t care — they concatenate everything — but some do byte-level streaming for progressive rendering. We emit token-by-token and document this limitation.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 12 }}>
          <strong>Function calling.</strong> vLLM supports tool use via constrained decoding on supported models. Translating OpenAI&apos;s <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>tools</code> format to vLLM&apos;s guided JSON schema required writing a recursive schema translator — OpenAI allows <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>anyOf</code> / <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>$ref</code> in tool parameter schemas that vLLM&apos;s constrained decoder doesn&apos;t support natively.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 12 }}>
          <strong>System prompt handling.</strong> Llama 3 uses a <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>[INST]</code> / <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>&lt;&lt;SYS&gt;&gt;</code> chat template. Mistral uses a different template. Qwen uses another. We maintain a template registry keyed on model family and apply the right one when constructing the raw prompt — so <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>messages</code> format works identically across all models.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          <strong>Error codes.</strong> We map vLLM errors (context length exceeded, CUDA OOM, model not loaded) to the correct OpenAI error types: <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>context_length_exceeded</code>, <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>server_error</code>, <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>model_not_found</code>. This is important because many SDKs do structured error handling based on the error type string.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>Testing compatibility</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          We have a compatibility test suite that runs every deployment against the real OpenAI API and diffs the response shape. It covers: streaming completions, function calling, embeddings, error shapes, usage metadata fields, and finish reason values. Any divergence fails the deploy.
        </p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 }}>
          We also run integration tests against LangChain, LlamaIndex, and the Vercel AI SDK on every commit. These are the most valuable tests in our suite — they catch the undocumented behavioral dependencies that pure API spec tests miss.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' }}>The result</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 40 }}>
          Most applications genuinely require only one change to migrate: swap the base URL and API key. If you&apos;re building on the OpenAI SDK and want to cut costs while keeping data in-house, <Link href="/signup" style={{ color: '#4F6EF7' }}>try Cloudach</Link>. Migration takes 5 minutes.
        </p>
      </main>
      <Footer />
    </>
  )
}
