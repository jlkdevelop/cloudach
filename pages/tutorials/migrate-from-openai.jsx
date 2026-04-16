import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function MigrateFromOpenAI() {
  const [lang, setLang] = useState('python');

  return (
    <>
      <Head>
        <title>Migrate from OpenAI to Cloudach in 2 Minutes — Cloudach</title>
        <meta name="description" content="Switch from OpenAI to Cloudach with two code changes: update your base URL and API key. No other changes needed — full OpenAI SDK compatibility." />
        <meta property="og:title" content="Migrate from OpenAI to Cloudach in 2 Minutes" />
        <meta property="og:description" content="Cloudach is OpenAI-compatible. Change base_url and api_key — that's the entire migration." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/tutorials/migrate-from-openai" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0D0F1A' }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid #E5E7EB', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 32, height: 60 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#0D0F1A', letterSpacing: '-0.5px' }}>Cloudach<span style={{ color: 'rgba(255,255,255,0.72)' }}>.</span></span>
          </Link>
          <Link href="/docs" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Docs</Link>
          <Link href="/docs#tutorials" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>Tutorials</Link>
          <Link href="/dashboard" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Dashboard</Link>
          <div style={{ flex: 1 }} />
          <Link href="/signup">
            <button style={{ background: '#ffffff', color: '#0d0e17', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
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
                ['#tldr', 'TL;DR — 2 changes'],
                ['#python', 'Python'],
                ['#nodejs', 'Node.js'],
                ['#env-vars', 'Environment variables'],
                ['#model-mapping', 'Model mapping'],
                ['#what-works', 'What works'],
                ['#what-differs', 'What differs'],
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
              <Link href="/docs" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>Docs</Link>
              <span>/</span>
              <Link href="/docs#tutorials" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>Tutorials</Link>
              <span>/</span>
              <span>Migrate from OpenAI</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Beginner</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>~2 min</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12 }}>Migrate from OpenAI to Cloudach in 2 minutes</h1>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 0 }}>
                Cloudach implements the OpenAI REST API. You keep the same SDK, the same request shapes, and the same
                response shapes. The only changes are your <strong>base URL</strong> and <strong>API key</strong>.
              </p>
            </div>

            {/* TL;DR */}
            <Section id="tldr" title="TL;DR — 2 changes">
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '20px 24px', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#15803D', marginBottom: 12 }}>The entire migration</div>
                <LangTabs lang={lang} onLang={setLang} />
                {lang === 'python' && (
                  <div style={{ marginTop: 0 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Before (OpenAI)</div>
                        <pre style={{ background: '#1E1E1E', color: '#FCA5A5', padding: '14px', borderRadius: 6, fontSize: 12, margin: 0, overflowX: 'auto' }}>{`from openai import OpenAI

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
)`}</pre>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>After (Cloudach)</div>
                        <pre style={{ background: '#1E1E1E', color: '#86EFAC', padding: '14px', borderRadius: 6, fontSize: 12, margin: 0, overflowX: 'auto' }}>{`from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)`}</pre>
                      </div>
                    </div>
                  </div>
                )}
                {lang === 'node' && (
                  <div style={{ marginTop: 0 }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Before (OpenAI)</div>
                        <pre style={{ background: '#1E1E1E', color: '#FCA5A5', padding: '14px', borderRadius: 6, fontSize: 12, margin: 0, overflowX: 'auto' }}>{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});`}</pre>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>After (Cloudach)</div>
                        <pre style={{ background: '#1E1E1E', color: '#86EFAC', padding: '14px', borderRadius: 6, fontSize: 12, margin: 0, overflowX: 'auto' }}>{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});`}</pre>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 13, color: '#15803D', marginTop: 14 }}>
                  Everything else — request bodies, response shapes, streaming, error types — stays identical.
                </div>
              </div>
            </Section>

            {/* Python */}
            <Section id="python" title="Python — full before/after">
              <p style={p}>A complete example showing the only two lines that change:</p>
              <CodeBlock>{`# BEFORE — OpenAI
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],   # ← remove
)

response = client.chat.completions.create(
    model="gpt-4o-mini",                    # ← update model name (see mapping below)
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)`}</CodeBlock>

              <CodeBlock>{`# AFTER — Cloudach (2 changes: base_url + api_key env var name, model name)
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",  # ← add this
    api_key=os.environ["CLOUDACH_API_KEY"],  # ← update env var name
)

response = client.chat.completions.create(
    model="llama3-70b",                      # ← use a Cloudach model ID
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)  # identical output format`}</CodeBlock>
            </Section>

            {/* Node.js */}
            <Section id="nodejs" title="Node.js — full before/after">
              <CodeBlock>{`// BEFORE — OpenAI
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,   // ← remove
});

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",                // ← update model name
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);`}</CodeBlock>

              <CodeBlock>{`// AFTER — Cloudach (2 changes: baseURL + apiKey env var name, model name)
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",  // ← add this
  apiKey: process.env.CLOUDACH_API_KEY,    // ← update env var name
});

const response = await client.chat.completions.create({
  model: "llama3-70b",                     // ← use a Cloudach model ID
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);  // identical output format`}</CodeBlock>
            </Section>

            {/* Env vars */}
            <Section id="env-vars" title="Environment variables">
              <p style={p}>Update your <code style={inlineCode}>.env</code> file:</p>
              <CodeBlock>{`# BEFORE
OPENAI_API_KEY=sk-...

# AFTER
CLOUDACH_API_KEY=sk-cloudach-...`}</CodeBlock>
              <p style={p}>And wherever you set environment variables in production (Vercel, Railway, Fly.io, AWS Secrets Manager, etc.).</p>
              <Callout>
                Get your Cloudach API key from the <a href="/dashboard/api-keys" style={link}>Dashboard → API Keys</a> page.
                It will look like <code style={inlineCode}>sk-cloudach-xxxxxxxxxxxxxxxx...</code>.
              </Callout>
            </Section>

            {/* Model mapping */}
            <Section id="model-mapping" title="Model mapping">
              <p style={p}>Replace OpenAI model IDs with the closest Cloudach equivalent:</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
                <thead>
                  <tr>
                    {['OpenAI model', 'Cloudach equivalent', 'Notes'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #E5E7EB', color: '#374151', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['gpt-4o', 'llama3-70b', 'High quality, complex reasoning'],
                    ['gpt-4o-mini', 'llama3-8b', 'Fast, cost-efficient, everyday tasks'],
                    ['gpt-3.5-turbo', 'llama3-8b', 'Drop-in for basic chat and completions'],
                    ['gpt-4-turbo', 'mixtral-8x7b', 'Best accuracy with mixture-of-experts'],
                    ['gpt-4', 'llama3-70b', 'High-quality reasoning tasks'],
                  ].map(([openai, cloudach, notes]) => (
                    <tr key={openai}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}><code style={inlineCode}>{openai}</code></td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}><code style={{ ...inlineCode, background: '#ECFDF5', color: '#059669' }}>{cloudach}</code></td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={p}>
                See the full <a href="/docs#models-list" style={link}>model list</a> for all available models and their context window sizes.
              </p>
            </Section>

            {/* What works */}
            <Section id="what-works" title="What works identically">
              <p style={p}>These features work with zero code changes beyond base URL and API key:</p>
              <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.9, paddingLeft: 20 }}>
                {[
                  'chat.completions.create — all parameters (temperature, max_tokens, top_p, stream, etc.)',
                  'Streaming via Server-Sent Events — same chunk format and delta structure',
                  'System, user, and assistant message roles',
                  'Multi-turn conversation history',
                  'completions.create (legacy text completions)',
                  'models.list and models.retrieve',
                  'Error response shape — same JSON schema, same HTTP status codes',
                  'OpenAI SDK error classes (APIStatusError, APIConnectionError, etc.)',
                  'Retry-After header on 429 responses',
                  'LangChain ChatOpenAI, LlamaIndex OpenAILike, LiteLLM — all work unchanged',
                ].map(item => (
                  <li key={item} style={{ marginBottom: 2 }}>
                    <span style={{ color: '#059669', marginRight: 8 }}>✓</span>{item}
                  </li>
                ))}
              </ul>
            </Section>

            {/* What differs */}
            <Section id="what-differs" title="What differs">
              <p style={p}>A small number of OpenAI features are not available on Cloudach:</p>
              <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.9, paddingLeft: 20 }}>
                {[
                  ['Function calling / tool use', 'Not yet supported — on the roadmap'],
                  ['vision / image inputs', 'Text-only models for now'],
                  ['Embeddings API (/v1/embeddings)', 'Not available — use a dedicated embedding service'],
                  ['Audio / TTS / Whisper', 'Not available'],
                  ['Assistants API, Files API', 'Not available'],
                  ['Fine-tuning API', 'Not available — contact sales for custom model hosting'],
                ].map(([feature, note]) => (
                  <li key={feature} style={{ marginBottom: 4 }}>
                    <span style={{ color: '#DC2626', marginRight: 8 }}>✗</span>
                    <strong>{feature}</strong> — {note}
                  </li>
                ))}
              </ul>
              <Callout>
                Need a feature that's missing? <a href="mailto:support@cloudach.com" style={link}>Email support</a> or watch the <a href="/changelog" style={link}>changelog</a> for updates.
              </Callout>
            </Section>

            {/* Next steps */}
            <Section id="next-steps" title="Next steps">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/tutorials/python-quickstart', label: 'Python quickstart', desc: 'Install, configure, and start calling the API' },
                  { href: '/tutorials/nodejs-quickstart', label: 'Node.js quickstart', desc: 'ESM, CommonJS, and TypeScript setup' },
                  { href: '/tutorials/streaming', label: 'Streaming guide', desc: 'Async streaming, error handling, and backpressure' },
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

function LangTabs({ lang, onLang }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
      {[['python', 'Python'], ['node', 'Node.js']].map(([key, label]) => (
        <button
          key={key}
          onClick={() => onLang(key)}
          style={{
            padding: '5px 14px', fontSize: 12, fontWeight: 500,
            borderRadius: '5px 5px 0 0', border: '1px solid #D1FAE5',
            background: lang === key ? '#059669' : '#F0FDF4',
            color: lang === key ? '#fff' : '#059669',
            cursor: 'pointer',
          }}
        >
          {label}
        </button>
      ))}
    </div>
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
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
      padding: '12px 16px', fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 16,
    }}>
      {children}
    </div>
  );
}

const p = { fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 12 };
const link = { color: 'rgba(255,255,255,0.72)', textDecoration: 'none' };
const inlineCode = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85em', background: '#F3F4F6', padding: '1px 5px', borderRadius: 4, color: '#374151',
};
