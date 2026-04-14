import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function NodejsQuickstart() {
  return (
    <>
      <Head>
        <title>Node.js SDK Quickstart — Cloudach</title>
        <meta name="description" content="Get started with Cloudach in Node.js in under 5 minutes. Install the OpenAI SDK, configure your client, and make your first chat completion." />
        <meta property="og:title" content="Node.js SDK Quickstart — Cloudach" />
        <meta property="og:description" content="Zero to first API call in Node.js. Uses the official OpenAI SDK — no new library needed." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/tutorials/nodejs-quickstart" />
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
                ['#typescript', 'TypeScript'],
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
              <span>Node.js quickstart</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Beginner</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>~5 min</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Node.js</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>TypeScript</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12 }}>Node.js SDK Quickstart</h1>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 0 }}>
                Cloudach is OpenAI-compatible. You use the official <code style={inlineCode}>openai</code> npm package —
                just point it at Cloudach's base URL. No new SDK to learn. Works with ESM, CommonJS, and TypeScript.
              </p>
            </div>

            {/* Step 1 */}
            <Section id="install" title="1. Install">
              <p style={p}>Install the OpenAI SDK (v4 or later):</p>
              <CodeBlock>{`npm install openai`}</CodeBlock>
              <p style={p}>Or with yarn / pnpm:</p>
              <CodeBlock>{`yarn add openai
# or
pnpm add openai`}</CodeBlock>
            </Section>

            {/* Step 2 */}
            <Section id="configure" title="2. Configure">
              <p style={p}>
                Create the client with your Cloudach API key and base URL. Store your key in an environment variable —
                never commit it to source control.
              </p>
              <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});`}</CodeBlock>
              <Callout>
                Your key looks like <code style={inlineCode}>sk-cloudach-...</code>. Get one from the{' '}
                <a href="/dashboard/api-keys" style={link}>Dashboard → API Keys</a> page.
                For local development, put it in a <code style={inlineCode}>.env</code> file and load it with{' '}
                <code style={inlineCode}>dotenv</code>.
              </Callout>
            </Section>

            {/* Step 3 */}
            <Section id="first-call" title="3. First call">
              <p style={p}>Make your first chat completion — 5 lines of logic:</p>
              <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});

const response = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "What is the capital of France?" }],
});

console.log(response.choices[0].message.content);
// → "The capital of France is Paris."
console.log(\`Tokens used: \${response.usage.total_tokens}\`);`}</CodeBlock>
              <p style={p}>Run it (Node.js 18+ with ESM or top-level await):</p>
              <CodeBlock>{`CLOUDACH_API_KEY=sk-cloudach-... node --input-type=module < your_script.js`}</CodeBlock>
              <p style={p}>Or with a <code style={inlineCode}>package.json</code> that has <code style={inlineCode}>"type": "module"</code>:</p>
              <CodeBlock>{`CLOUDACH_API_KEY=sk-cloudach-... node your_script.js`}</CodeBlock>
            </Section>

            {/* Step 4 */}
            <Section id="system-prompt" title="4. Add a system prompt">
              <p style={p}>
                Use the <code style={inlineCode}>system</code> role to give the model a persona or instructions.
                It always comes first in the messages array.
              </p>
              <CodeBlock>{`const response = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [
    { role: "system", content: "You are a concise technical assistant. Reply in plain text only." },
    { role: "user",   content: "Explain what a REST API is in one sentence." },
  ],
});

console.log(response.choices[0].message.content);`}</CodeBlock>
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
                    ['model', 'string', '—', 'Required. Model ID, e.g. "llama3-8b", "mixtral-8x7b"'],
                    ['messages', 'array', '—', 'Required. Array of {role, content} objects'],
                    ['temperature', 'number', '1.0', 'Randomness: 0.0 = deterministic, 2.0 = very random'],
                    ['max_tokens', 'number', 'model max', 'Hard cap on response length in tokens'],
                    ['stream', 'boolean', 'false', 'Set true to receive tokens as they are generated'],
                    ['top_p', 'number', '1.0', 'Nucleus sampling threshold (alternative to temperature)'],
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
              <CodeBlock>{`const response = await client.chat.completions.create({
  model: "llama3-70b",
  messages: [{ role: "user", content: "Write a haiku about distributed systems." }],
  temperature: 0.8,
  max_tokens: 100,
});`}</CodeBlock>
            </Section>

            {/* Step 6 */}
            <Section id="streaming" title="6. Streaming">
              <p style={p}>
                Set <code style={inlineCode}>stream: true</code> to receive tokens as they are generated.
                Use <code style={inlineCode}>for await...of</code> to iterate over the stream.
              </p>
              <CodeBlock>{`const stream = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Count from 1 to 5 slowly." }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}

process.stdout.write("\\n");`}</CodeBlock>
              <Callout>
                Streaming dramatically improves perceived latency — users see the first token in ~1s instead of
                waiting for the full response. Essential for any chat UI.
              </Callout>
            </Section>

            {/* TypeScript */}
            <Section id="typescript" title="TypeScript">
              <p style={p}>
                The <code style={inlineCode}>openai</code> package ships its own TypeScript types.
                No <code style={inlineCode}>@types/openai</code> needed.
              </p>
              <CodeBlock>{`import OpenAI from "openai";
import type { ChatCompletion, ChatCompletionChunk } from "openai/resources";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY!,
});

// Non-streaming — strongly typed response
const response: ChatCompletion = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Hello!" }],
});

// Streaming — each chunk is ChatCompletionChunk
const stream = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Hello!" }],
  stream: true,
});

for await (const chunk of stream) {
  const delta: string | null = chunk.choices[0]?.delta?.content ?? null;
  if (delta) process.stdout.write(delta);
}`}</CodeBlock>
            </Section>

            {/* Next steps */}
            <Section id="next-steps" title="Next steps">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/tutorials/streaming', label: 'Streaming guide', desc: 'Deep dive: async streaming, error handling, and backpressure' },
                  { href: '/tutorials/migrate-from-openai', label: 'Migrate from OpenAI', desc: 'Exact diff to switch an existing OpenAI app to Cloudach' },
                  { href: '/tutorials/langchain', label: 'LangChain integration', desc: 'Use Cloudach as the LLM backend in LangChain' },
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
