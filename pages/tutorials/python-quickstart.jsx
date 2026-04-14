import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function PythonQuickstart() {
  return (
    <>
      <Head>
        <title>Python SDK Quickstart — Cloudach</title>
        <meta name="description" content="Get started with Cloudach in Python in under 5 minutes. Install the OpenAI SDK, configure your client, and make your first chat completion." />
        <meta property="og:title" content="Python SDK Quickstart — Cloudach" />
        <meta property="og:description" content="Zero to first API call in Python. Uses the OpenAI SDK — no new library needed." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/tutorials/python-quickstart" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0D0F1A' }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid #E5E7EB', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 32, height: 60 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#0D0F1A', letterSpacing: '-0.5px' }}>Cloudach<span style={{ color: '#4F6EF7' }}>.</span></span>
          </Link>
          <Link href="/docs" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Docs</Link>
          <Link href="/docs#tutorials" style={{ fontSize: 14, fontWeight: 500, color: '#4F6EF7', textDecoration: 'none' }}>Tutorials</Link>
          <Link href="/dashboard" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Dashboard</Link>
          <div style={{ flex: 1 }} />
          <Link href="/signup">
            <button style={{ background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Get started free
            </button>
          </Link>
        </nav>

        <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '40px 24px', gap: 48 }}>
          {/* Sidebar */}
          <aside style={{ width: 200, flexShrink: 0 }}>
            <nav style={{ position: 'sticky', top: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>On this page</div>
              {[
                ['#install', '1. Install'],
                ['#configure', '2. Configure'],
                ['#first-call', '3. First call'],
                ['#system-prompt', '4. System prompt'],
                ['#parameters', '5. Parameters'],
                ['#streaming', '6. Streaming'],
                ['#next-steps', 'Next steps'],
              ].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', padding: '5px 0', fontSize: 13, color: '#6B7280', textDecoration: 'none', lineHeight: 1.4 }}>
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>
              <Link href="/docs" style={{ color: '#4F6EF7', textDecoration: 'none' }}>Docs</Link>
              <span>/</span>
              <Link href="/docs#tutorials" style={{ color: '#4F6EF7', textDecoration: 'none' }}>Tutorials</Link>
              <span>/</span>
              <span>Python quickstart</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Beginner</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>~5 min</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Python</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12 }}>Python SDK Quickstart</h1>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 0 }}>
                Cloudach is OpenAI-compatible. You use the standard <code style={inlineCode}>openai</code> Python package —
                just point it at Cloudach's base URL. No new SDK to learn.
              </p>
            </div>

            {/* Step 1 */}
            <Section id="install" title="1. Install">
              <p style={p}>Install the OpenAI Python SDK (v1.0 or later):</p>
              <CodeBlock>{`pip install openai`}</CodeBlock>
              <p style={p}>If you're using a virtual environment or conda, activate it first.</p>
            </Section>

            {/* Step 2 */}
            <Section id="configure" title="2. Configure">
              <p style={p}>
                Create the client with your Cloudach API key and base URL. Store your key in an environment variable —
                never hard-code it in source files.
              </p>
              <CodeBlock>{`import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)`}</CodeBlock>
              <Callout>
                Your key looks like <code style={inlineCode}>sk-cloudach-...</code>. Get one from the{' '}
                <a href="/dashboard/api-keys" style={link}>Dashboard → API Keys</a> page.
              </Callout>
            </Section>

            {/* Step 3 */}
            <Section id="first-call" title="3. First call">
              <p style={p}>Make your first chat completion — 5 lines of logic:</p>
              <CodeBlock>{`import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)

response = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
)

print(response.choices[0].message.content)
# → "The capital of France is Paris."
print(f"Tokens used: {response.usage.total_tokens}")`}</CodeBlock>
              <p style={p}>Run it:</p>
              <CodeBlock>{`CLOUDACH_API_KEY=sk-cloudach-... python your_script.py`}</CodeBlock>
            </Section>

            {/* Step 4 */}
            <Section id="system-prompt" title="4. Add a system prompt">
              <p style={p}>
                Use the <code style={inlineCode}>system</code> role to give the model a persona or set of instructions.
                It always comes first in the messages array.
              </p>
              <CodeBlock>{`response = client.chat.completions.create(
    model="llama3-8b",
    messages=[
        {"role": "system", "content": "You are a concise technical assistant. Reply in plain text only."},
        {"role": "user",   "content": "Explain what a REST API is in one sentence."},
    ],
)

print(response.choices[0].message.content)`}</CodeBlock>
            </Section>

            {/* Step 5 */}
            <Section id="parameters" title="5. Key parameters">
              <p style={p}>The most useful parameters for <code style={inlineCode}>chat.completions.create</code>:</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                <thead>
                  <tr>
                    {['Parameter', 'Type', 'Default', 'Description'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #E5E7EB', color: '#374151', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['model', 'str', '—', 'Required. Model ID, e.g. "llama3-8b", "mixtral-8x7b"'],
                    ['messages', 'list', '—', 'Required. List of {"role", "content"} dicts'],
                    ['temperature', 'float', '1.0', 'Randomness: 0.0 = deterministic, 2.0 = very random'],
                    ['max_tokens', 'int', 'model max', 'Hard cap on response length in tokens'],
                    ['stream', 'bool', 'False', 'Set True to receive tokens as they are generated'],
                    ['top_p', 'float', '1.0', 'Nucleus sampling threshold (alternative to temperature)'],
                  ].map(([param, type, def_, desc]) => (
                    <tr key={param}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}><code style={inlineCode}>{param}</code></td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{type}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{def_}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <CodeBlock>{`# Example with optional parameters
response = client.chat.completions.create(
    model="llama3-70b",
    messages=[{"role": "user", "content": "Write a haiku about distributed systems."}],
    temperature=0.8,
    max_tokens=100,
)`}</CodeBlock>
            </Section>

            {/* Step 6 */}
            <Section id="streaming" title="6. Streaming">
              <p style={p}>
                Set <code style={inlineCode}>stream=True</code> to receive tokens as they are generated.
                The response becomes an iterator of chunks instead of a single object.
              </p>
              <CodeBlock>{`stream = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "Count from 1 to 5 slowly."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)

print()  # newline after stream ends`}</CodeBlock>
              <Callout>
                Streaming dramatically improves perceived latency — users see the first token in ~1s instead of waiting
                for the full response. Use it in any interactive UI.
              </Callout>
            </Section>

            {/* Next steps */}
            <Section id="next-steps" title="Next steps">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/tutorials/streaming', label: 'Streaming guide', desc: 'Deep dive: async streaming, error handling, and backpressure' },
                  { href: '/tutorials/migrate-from-openai', label: 'Migrate from OpenAI', desc: 'Exact diff to switch an existing OpenAI app to Cloudach' },
                  { href: '/tutorials/langchain', label: 'LangChain integration', desc: 'Use Cloudach as a ChatOpenAI drop-in within LangChain' },
                  { href: '/docs#sdks', label: 'SDK reference', desc: 'All methods, parameters, and return types' },
                ].map(t => (
                  <a key={t.href} href={t.href} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px', textDecoration: 'none', display: 'block' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0D0F1A', marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>{t.desc}</div>
                  </a>
                ))}
              </div>
            </Section>

            {/* Footer */}
            <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
              <a href="mailto:support@cloudach.com" style={{ color: '#9CA3AF', textDecoration: 'none' }}>support@cloudach.com</a>
              <Link href="/docs" style={{ color: '#9CA3AF', textDecoration: 'none' }}>API Docs</Link>
              <Link href="/dashboard" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Dashboard</Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 52 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #E5E7EB' }}>{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <pre style={{
        background: '#1E1E1E', color: '#D4D4D4', padding: '16px 20px',
        borderRadius: 8, fontSize: 13, lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre', margin: 0,
      }}>
        {children}
      </pre>
      <button
        onClick={copy}
        style={{
          position: 'absolute', top: 10, right: 10,
          background: copied ? '#059669' : '#374151', color: '#fff', border: 'none',
          borderRadius: 5, padding: '4px 10px', fontSize: 11, cursor: 'pointer',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function Callout({ children }) {
  return (
    <div style={{
      background: '#EEF1FF', border: '1px solid #C7D2FE', borderRadius: 8,
      padding: '12px 16px', fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

const p = { fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 12 };
const link = { color: '#4F6EF7', textDecoration: 'none' };
const inlineCode = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85em', background: '#F3F4F6', padding: '1px 5px', borderRadius: 4, color: '#374151',
};
