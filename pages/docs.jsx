import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const MODELS = [
  { id: 'llama3-8b',    name: 'Llama 3 8B',      ctx: '8K',  best: 'Fast chat, Q&A, summarization' },
  { id: 'llama3-70b',   name: 'Llama 3 70B',     ctx: '8K',  best: 'Complex reasoning, analysis' },
  { id: 'mistral-7b',   name: 'Mistral 7B',      ctx: '32K', best: 'Long context, code, EU-hosted' },
  { id: 'mixtral-8x7b', name: 'Mixtral 8×7B',   ctx: '32K', best: 'Best accuracy, complex tasks' },
];

export default function DocsPage() {
  const [lang, setLang] = useState('curl');

  return (
    <>
      <Head>
        <title>API Documentation — Cloudach</title>
        <meta name="description" content="Cloudach API documentation — OpenAI-compatible LLM API. Quickstart, authentication, endpoints, and code examples." />
      </Head>

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0D0F1A' }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid #E5E7EB', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 32, height: 60 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#6366F1' }}>Cloudach</span>
          </Link>
          <Link href="/docs" style={{ fontSize: 14, fontWeight: 500, color: '#6366F1', textDecoration: 'none' }}>Docs</Link>
          <Link href="/dashboard" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Dashboard</Link>
          <div style={{ flex: 1 }} />
          <Link href="/signup">
            <button style={{ background: '#6366F1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Get started free
            </button>
          </Link>
        </nav>

        <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '40px 24px', gap: 48 }}>
          {/* Sidebar */}
          <aside style={{ width: 200, flexShrink: 0 }}>
            <nav style={{ position: 'sticky', top: 24 }}>
              {[
                ['#quickstart', 'Quickstart'],
                ['#authentication', 'Authentication'],
                ['#endpoints', 'Endpoints'],
                ['#chat-completions', '↳ Chat Completions'],
                ['#text-completions', '↳ Text Completions'],
                ['#models-list', '↳ Models List'],
                ['#rate-limits', 'Rate Limits'],
                ['#errors', 'Error Codes'],
                ['#sdks', 'SDK Compatibility'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  style={{
                    display: 'block',
                    padding: '6px 0',
                    fontSize: 13,
                    color: label.startsWith('↳') ? '#9CA3AF' : '#374151',
                    textDecoration: 'none',
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>API Documentation</h1>
            <p style={{ color: '#6B7280', fontSize: 16, marginBottom: 40 }}>
              Cloudach is an OpenAI-compatible LLM API. Drop in your API key and base URL — no code changes needed.
            </p>

            {/* ── Quickstart ── */}
            <Section id="quickstart" title="Quickstart">
              <p style={p}>Get from zero to your first API call in under 5 minutes.</p>

              <h3 style={h3}>Step 1 — Sign up</h3>
              <ol style={ol}>
                <li>Go to <a href="/signup" style={link}>app.cloudach.com/signup</a></li>
                <li>Enter your email and create a password</li>
                <li>You are now logged in and ready</li>
              </ol>

              <h3 style={h3}>Step 2 — Create an API key</h3>
              <ol style={ol}>
                <li>Open the <a href="/dashboard/api-keys" style={link}>API Keys</a> page in your dashboard</li>
                <li>Click <strong>Create new key</strong> and give it a name (e.g. <Code>my-first-key</Code>)</li>
                <li>Copy and store the key — it is shown only once. Format: <Code>sk-cloudach-...</Code></li>
              </ol>

              <h3 style={h3}>Step 3 — Make your first call</h3>

              <LangTabs lang={lang} onLang={setLang} />

              {lang === 'curl' && (
                <CodeBlock>{`curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-cloudach-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama3-8b",
    "messages": [{"role": "user", "content": "Hello from Cloudach!"}]
  }'`}</CodeBlock>
              )}
              {lang === 'python' && (
                <CodeBlock>{`from openai import OpenAI

client = OpenAI(
    api_key="sk-cloudach-YOUR_KEY",
    base_url="https://api.cloudach.com/v1"
)

response = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "Hello from Cloudach!"}]
)
print(response.choices[0].message.content)`}</CodeBlock>
              )}
              {lang === 'node' && (
                <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-cloudach-YOUR_KEY",
  baseURL: "https://api.cloudach.com/v1",
});

const resp = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Hello from Cloudach!" }],
});
console.log(resp.choices[0].message.content);`}</CodeBlock>
              )}

              <Callout>Time to first token: ~1 second once your key is in hand.</Callout>
            </Section>

            {/* ── Authentication ── */}
            <Section id="authentication" title="Authentication">
              <p style={p}>
                All requests require an <Code>Authorization</Code> header with your API key as a Bearer token.
              </p>
              <CodeBlock>{`Authorization: Bearer sk-cloudach-YOUR_KEY`}</CodeBlock>

              <h3 style={h3}>API key properties</h3>
              <ul style={ul}>
                <li>Prefix: <Code>sk-cloudach-</Code></li>
                <li>Stored as a SHA-256 hash server-side — the raw key is never recoverable after creation</li>
                <li>Can be revoked instantly from the <a href="/dashboard/api-keys" style={link}>dashboard</a></li>
                <li>Multiple keys per account are supported (one per integration recommended)</li>
                <li>Auth cache TTL: 60 seconds — revocation propagates within 60s</li>
              </ul>

              <h3 style={h3}>Auth errors</h3>
              <CodeBlock>{`// 401 — missing Authorization header
{"error": {"message": "Missing credentials. Include 'Authorization: Bearer <api-key>'.", "type": "invalid_request_error"}}

// 401 — invalid or revoked key
{"error": {"message": "Invalid or revoked API key.", "type": "authentication_error"}}`}</CodeBlock>
            </Section>

            {/* ── Endpoints ── */}
            <Section id="endpoints" title="Endpoints">
              <p style={p}>Base URL: <Code>https://api.cloudach.com/v1</Code></p>
              <Table
                headers={['Endpoint', 'Method', 'Description', 'Auth']}
                rows={[
                  ['/v1/chat/completions', 'POST', 'Chat messages (streaming supported)', 'Required'],
                  ['/v1/completions', 'POST', 'Text completions (legacy format)', 'Required'],
                  ['/v1/models', 'GET', 'List available models', 'Required'],
                  ['/v1/models/{model_id}', 'GET', 'Get a specific model', 'Required'],
                  ['/health', 'GET', 'Health check', 'None'],
                ]}
              />

              {/* Chat Completions */}
              <h3 style={{ ...h3, marginTop: 32 }} id="chat-completions">POST /v1/chat/completions</h3>
              <p style={p}>OpenAI-compatible chat endpoint. Supports streaming via Server-Sent Events.</p>

              <h4 style={h4}>Request body</h4>
              <CodeBlock>{`{
  "model": "llama3-8b",           // required — see /v1/models for available models
  "messages": [                   // required — non-empty array
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user",   "content": "What is 2 + 2?"}
  ],
  "stream": false,                // optional — true for SSE streaming
  "temperature": 0.7,             // optional — 0.0–2.0 (default 1.0)
  "max_tokens": 512               // optional — max completion tokens
}`}</CodeBlock>

              <h4 style={h4}>Non-streaming response</h4>
              <CodeBlock>{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1712345678,
  "model": "llama3-8b",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "The answer is 4."},
    "finish_reason": "stop"
  }],
  "usage": {"prompt_tokens": 22, "completion_tokens": 8, "total_tokens": 30}
}`}</CodeBlock>

              <h4 style={h4}>Streaming (SSE)</h4>
              <p style={p}>Set <Code>{'"stream": true'}</Code>. Response is a stream of <Code>data: ...</Code> lines, ending with <Code>data: [DONE]</Code>.</p>
              <CodeBlock>{`data: {"id":"chatcmpl-abc","choices":[{"delta":{"role":"assistant","content":""},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"The "},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"answer is 4."},"index":0}],"usage":{"prompt_tokens":22,"completion_tokens":8,"total_tokens":30}}

data: [DONE]`}</CodeBlock>

              {/* Text Completions */}
              <h3 style={{ ...h3, marginTop: 32 }} id="text-completions">POST /v1/completions</h3>
              <p style={p}>Legacy text completion endpoint (OpenAI format). Use chat completions for new integrations.</p>
              <CodeBlock>{`// Request
{
  "model": "llama3-8b",
  "prompt": "The capital of France is",
  "max_tokens": 20
}

// Response
{
  "id": "cmpl-abc123",
  "object": "text_completion",
  "model": "llama3-8b",
  "choices": [{"text": " Paris.", "index": 0, "finish_reason": "stop"}],
  "usage": {"prompt_tokens": 7, "completion_tokens": 3, "total_tokens": 10}
}`}</CodeBlock>

              {/* Models */}
              <h3 style={{ ...h3, marginTop: 32 }} id="models-list">GET /v1/models</h3>
              <CodeBlock>{`// Response
{
  "object": "list",
  "data": [
    {"id": "llama3-8b",  "object": "model", "owned_by": "cloudach"},
    {"id": "mistral-7b", "object": "model", "owned_by": "cloudach"}
  ]
}`}</CodeBlock>

              <h3 style={h3}>Available models</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Model ID', 'Context', 'Best for'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #E5E7EB', color: '#374151', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODELS.map(m => (
                    <tr key={m.id}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}><Code>{m.id}</Code></td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{m.ctx}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{m.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* ── Rate Limits ── */}
            <Section id="rate-limits" title="Rate Limits">
              <Table
                headers={['Limit', 'Value', 'Scope', 'Reset']}
                rows={[
                  ['Requests per minute (RPM)', '60', 'Per API key', 'Rolling 60s window'],
                  ['Tokens per day (TPD)', '1,000,000', 'Per API key', 'Midnight UTC'],
                ]}
              />
              <h3 style={h3}>Rate limit error (429)</h3>
              <CodeBlock>{`{"error": {"message": "Rate limit exceeded: 60 requests per minute.", "type": "requests", "code": "rate_limit_exceeded"}}`}</CodeBlock>
              <p style={p}>
                The response includes a <Code>Retry-After: 60</Code> header.
                Implement exponential backoff starting at 1 second.
                Contact <a href="mailto:sales@cloudach.com" style={link}>sales@cloudach.com</a> for enterprise rate limit increases.
              </p>
            </Section>

            {/* ── Errors ── */}
            <Section id="errors" title="Error Codes">
              <p style={p}>All errors follow the OpenAI error schema: <Code>{`{"error": {"message": "...", "type": "...", "code": "...", "param": "..."}}`}</Code></p>
              <Table
                headers={['HTTP', 'type', 'Cause', 'Fix']}
                rows={[
                  ['400', 'invalid_request_error', 'Bad request body', 'Check model, messages fields'],
                  ['401', 'authentication_error', 'Invalid or revoked key', 'Check key in dashboard'],
                  ['401', 'invalid_request_error', 'Missing Authorization header', 'Add Bearer token'],
                  ['404', 'invalid_request_error', 'Unknown model or route', 'Check /v1/models'],
                  ['429', 'requests', 'Rate limit exceeded', 'Backoff + retry'],
                  ['502', 'api_error', 'Model backend unavailable', 'Retry with backoff'],
                  ['500', 'api_error', 'Internal server error', 'Retry; contact support if persistent'],
                ]}
              />
            </Section>

            {/* ── SDK Compatibility ── */}
            <Section id="sdks" title="SDK Compatibility">
              <p style={p}>
                Cloudach is drop-in compatible with any OpenAI SDK. Change two values: <Code>base_url</Code> and <Code>api_key</Code>.
              </p>
              <Table
                headers={['SDK', 'base_url / baseURL', 'api_key / apiKey']}
                rows={[
                  ['Python openai ≥ 1.0', 'https://api.cloudach.com/v1', 'sk-cloudach-...'],
                  ['Node.js openai ≥ 4.0', 'https://api.cloudach.com/v1', 'sk-cloudach-...'],
                  ['LangChain (Python)', 'openai_api_base env var', 'sk-cloudach-...'],
                  ['LiteLLM', 'api_base config', 'sk-cloudach-...'],
                  ['Direct HTTP', 'Authorization: Bearer header', '—'],
                ]}
              />

              <h3 style={h3}>Python example (with streaming)</h3>
              <CodeBlock>{`from openai import OpenAI

client = OpenAI(api_key="sk-cloudach-YOUR_KEY", base_url="https://api.cloudach.com/v1")

stream = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "Tell me a story."}],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)`}</CodeBlock>

              <h3 style={h3}>Node.js example (with streaming)</h3>
              <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({ apiKey: "sk-cloudach-YOUR_KEY", baseURL: "https://api.cloudach.com/v1" });

const stream = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Tell me a story." }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}`}</CodeBlock>
            </Section>

            {/* Footer */}
            <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
              <a href="mailto:support@cloudach.com" style={{ color: '#9CA3AF', textDecoration: 'none' }}>support@cloudach.com</a>
              <a href="mailto:sales@cloudach.com" style={{ color: '#9CA3AF', textDecoration: 'none' }}>sales@cloudach.com</a>
              <Link href="/dashboard" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Dashboard</Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 56 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #E5E7EB' }}>{title}</h2>
      {children}
    </section>
  );
}

function LangTabs({ lang, onLang }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 0, marginTop: 16 }}>
      {[['curl', 'cURL'], ['python', 'Python'], ['node', 'Node.js']].map(([key, label]) => (
        <button
          key={key}
          onClick={() => onLang(key)}
          style={{
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: '6px 6px 0 0',
            border: '1px solid #E5E7EB',
            borderBottom: lang === key ? '1px solid #1E1E1E' : '1px solid #E5E7EB',
            background: lang === key ? '#1E1E1E' : '#F9FAFB',
            color: lang === key ? '#fff' : '#6B7280',
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
        background: '#1E1E1E',
        color: '#D4D4D4',
        padding: '16px 20px',
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.6,
        overflowX: 'auto',
        whiteSpace: 'pre',
        margin: 0,
      }}>
        {children}
      </pre>
      <button
        onClick={copy}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '3px 10px',
          fontSize: 11,
          background: copied ? '#22C55E' : '#374151',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function Code({ children }) {
  return (
    <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em', fontFamily: 'monospace' }}>
      {children}
    </code>
  );
}

function Callout({ children }) {
  return (
    <div style={{ background: '#EEF2FF', borderLeft: '3px solid #6366F1', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 14, color: '#3730A3', marginBottom: 16 }}>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #E5E7EB', color: '#374151', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#374151', verticalAlign: 'top' }}>
                  {j === 0 ? <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>{cell}</code> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const p = { fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 16 };
const h3 = { fontSize: 17, fontWeight: 600, marginTop: 24, marginBottom: 12 };
const h4 = { fontSize: 14, fontWeight: 600, marginTop: 16, marginBottom: 8, color: '#374151' };
const ul = { paddingLeft: 20, marginBottom: 16, lineHeight: 1.8, color: '#374151', fontSize: 15 };
const ol = { paddingLeft: 20, marginBottom: 16, lineHeight: 1.8, color: '#374151', fontSize: 15 };
const link = { color: '#6366F1', textDecoration: 'none' };
