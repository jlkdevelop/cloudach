import Head from 'next/head';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Logo from '../components/Logo';

const MODELS = [
  { id: 'llama3-8b',      name: 'Llama 3 8B',      ctx: '8K',   best: 'Fast chat, Q&A, summarization' },
  { id: 'llama3-70b',     name: 'Llama 3 70B',     ctx: '8K',   best: 'Complex reasoning, analysis' },
  { id: 'llama31-8b',     name: 'Llama 3.1 8B',    ctx: '128K', best: 'Long-context chat, fast inference' },
  { id: 'llama31-70b',    name: 'Llama 3.1 70B',   ctx: '128K', best: 'State-of-the-art open model, long context' },
  { id: 'mistral-7b',     name: 'Mistral 7B',      ctx: '32K',  best: 'Long context, code, EU-hosted' },
  { id: 'mixtral-8x7b',  name: 'Mixtral 8\xd77B', ctx: '32K',  best: 'Best accuracy, complex tasks' },
  { id: 'command-r-plus', name: 'Command R+',       ctx: '128K', best: 'RAG, tool use, multi-step agents' },
  { id: 'dbrx',           name: 'DBRX',            ctx: '32K',  best: 'Coding, reasoning, MoE efficiency' },
];

export default function DocsPage() {
  const [lang, setLang] = useState('curl');

  return (
    <>
      <Head>
        <title>API Documentation — Cloudach</title>
        <meta name="description" content="Cloudach API documentation — OpenAI-compatible LLM API. Quickstart, authentication, endpoints, and code examples." />
        <meta property="og:title" content="API Documentation — Cloudach" />
        <meta property="og:description" content="OpenAI-compatible API for Llama 3, Mistral, and Mixtral. Drop-in replacement for the OpenAI SDK." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/docs" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="API Documentation — Cloudach" />
        <meta name="twitter:description" content="OpenAI-compatible API for Llama 3, Mistral, and Mixtral. Drop-in replacement for the OpenAI SDK." />
        <meta name="twitter:image" content="https://cloudach.com/og-image.png" />
      </Head>

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0D0F1A' }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid #E5E7EB', padding: '0 48px', display: 'flex', alignItems: 'center', gap: 32, height: 64 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Logo size={28} />
            <span style={{ fontWeight: 700, fontSize: 17, color: '#0D0F1A', letterSpacing: '-0.5px' }}>cloud<span style={{ color: '#4F6EF7' }}>ach</span></span>
          </Link>
          <Link href="/docs" style={{ fontSize: 14, fontWeight: 500, color: '#4F6EF7', textDecoration: 'none' }}>Docs</Link>
          <Link href="/dashboard" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Dashboard</Link>
          <div style={{ flex: 1 }} />
          <Link href="/signup">
            <button className="btn-solid">
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
                ['#streaming', '↳ Streaming'],
                ['#text-completions', '↳ Text Completions'],
                ['#models-list', '↳ Models List'],
                ['#rate-limits', 'Rate Limits'],
                ['#errors', 'Error Codes'],
                ['#webhooks', 'Webhooks'],
                ['#webhooks-events', '↳ Event Types'],
                ['#webhooks-signatures', '↳ Verifying Signatures'],
                ['#sdks', 'SDK Reference'],
                ['#integrations', 'Integrations'],
                ['#fine-tuning', 'Fine-Tuning'],
                ['#fine-tuning-quickstart', '↳ Quickstart'],
                ['#fine-tuning-lora', '↳ LoRA Adapters'],
                ['#fine-tuning-models', '↳ Supported Models'],
                ['#tutorials', 'Tutorials'],
                ['#playground', 'API Playground'],
                ['#faq', 'FAQ'],
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
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
                <Link href="/changelog" style={{ display: 'block', padding: '6px 0', fontSize: 13, color: '#374151', textDecoration: 'none', lineHeight: 1.4 }}>Changelog</Link>
              </div>
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

              <h4 style={h4} id="streaming">Streaming (SSE)</h4>
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
              <p style={p}>Rate limits apply per API key. All limits reset on a rolling window (RPM) or at midnight UTC (TPD).</p>

              <h3 style={h3}>Limits by plan</h3>
              <Table
                headers={['Plan', 'Requests / min (RPM)', 'Tokens / day (TPD)', 'Notes']}
                rows={[
                  ['Free', '60', '1,000,000', 'Default on sign-up'],
                  ['Pro', '600', '10,000,000', 'Available after plan upgrade'],
                  ['Enterprise', 'Custom', 'Custom', 'Contact sales@cloudach.com'],
                ]}
              />

              <h3 style={h3}>Per-key overrides</h3>
              <p style={p}>
                You can set a custom <Code>rate_limit_rpm</Code> on individual API keys from the{' '}
                <a href="/dashboard/api-keys" style={link}>dashboard</a>. Useful for restricting
                keys used in untrusted environments or increasing limits for high-throughput integrations.
              </p>

              <h3 style={h3}>Rate-limit response headers</h3>
              <p style={p}>Every API response includes these headers so you can track your usage proactively:</p>
              <Table
                headers={['Header', 'Example value', 'Meaning']}
                rows={[
                  ['X-RateLimit-Limit-Requests', '60', 'Your RPM ceiling'],
                  ['X-RateLimit-Remaining-Requests', '42', 'Requests left in this 60-second window'],
                  ['X-RateLimit-Reset-Requests', '2026-04-14T12:01:00Z', 'UTC timestamp when the window resets'],
                  ['X-RateLimit-Limit-Tokens', '1000000', 'Your daily token ceiling'],
                  ['X-RateLimit-Remaining-Tokens', '987432', 'Tokens left today'],
                  ['X-RateLimit-Reset-Tokens', '2026-04-15T00:00:00Z', 'UTC timestamp of next daily reset'],
                  ['Retry-After', '60', 'Seconds to wait before retrying (only on 429 responses)'],
                ]}
              />

              <h3 style={h3}>429 error responses</h3>
              <p style={p}>Use the <Code>type</Code> field to distinguish RPM from TPD errors:</p>
              <CodeBlock>{`// RPM exceeded — type: "requests"
{"error": {"message": "Rate limit exceeded: 60 requests per minute.", "type": "requests", "code": "rate_limit_exceeded"}}

// TPD exceeded — type: "tokens"
{"error": {"message": "You have exceeded your daily token limit of 1,000,000 tokens. Tokens reset at midnight UTC.", "type": "tokens", "code": "rate_limit_exceeded"}}`}</CodeBlock>

              <h3 style={h3}>Handling 429s — exponential backoff</h3>
              <p style={p}>
                Always respect the <Code>Retry-After</Code> header when present. Fall back to exponential backoff
                (1 s → 2 s → 4 s → 8 s) when the header is absent.
              </p>

              <h4 style={h4}>Python</h4>
              <CodeBlock>{`import time
from openai import OpenAI, APIStatusError

client = OpenAI(api_key="sk-cloudach-YOUR_KEY", base_url="https://api.cloudach.com/v1")

RETRYABLE = {429, 500, 502, 503}

def chat_with_backoff(messages, model="llama3-8b", max_retries=5):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(model=model, messages=messages)
        except APIStatusError as e:
            if e.status_code not in RETRYABLE or attempt == max_retries - 1:
                raise
            retry_after = e.response.headers.get("Retry-After")
            wait = float(retry_after) if retry_after else 2 ** attempt
            print(f"Attempt {attempt + 1} failed ({e.status_code}). Retrying in {wait}s...")
            time.sleep(wait)`}</CodeBlock>

              <h4 style={h4}>Node.js</h4>
              <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({ apiKey: "sk-cloudach-YOUR_KEY", baseURL: "https://api.cloudach.com/v1" });

const RETRYABLE = new Set([429, 500, 502, 503]);

async function chatWithBackoff(messages, model = "llama3-8b", maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.chat.completions.create({ model, messages });
    } catch (err) {
      if (!(err instanceof OpenAI.APIError) || !RETRYABLE.has(err.status) || attempt === maxRetries - 1) {
        throw err;
      }
      const retryAfter = err.headers?.["retry-after"];
      const wait = retryAfter ? parseFloat(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
      console.log(\`Attempt \${attempt + 1} failed (\${err.status}). Retrying in \${wait}ms...\`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}`}</CodeBlock>

              <p style={p}>
                Need higher limits?{' '}
                <a href="mailto:sales@cloudach.com" style={link}>Contact sales</a> to discuss enterprise quotas.
              </p>
            </Section>

            {/* ── Errors ── */}
            <Section id="errors" title="Error Codes">
              <p style={p}>
                All errors follow the OpenAI error schema:{' '}
                <Code>{`{"error": {"message": "...", "type": "...", "code": "...", "param": "..."}}`}</Code>.{' '}
                <Code>param</Code> is only included when the error is tied to a specific request field.
              </p>

              <h3 style={h3}>Error reference</h3>
              <Table
                headers={['HTTP', 'code', 'type', 'Cause', 'Fix']}
                rows={[
                  ['400', 'invalid_request', 'invalid_request_error', 'Malformed JSON body', 'Validate JSON; set Content-Type: application/json'],
                  ['400', 'missing_required_param', 'invalid_request_error', 'model or messages missing', 'Include both model and messages in every request'],
                  ['400', 'invalid_param_value', 'invalid_request_error', 'temperature out of [0,2], empty messages, etc.', 'Validate parameter values before sending'],
                  ['400', 'context_length_exceeded', 'invalid_request_error', 'Prompt + max_tokens exceeds model context', 'Trim history or switch to a larger-context model'],
                  ['401', 'missing_credentials', 'invalid_request_error', 'No Authorization header', "Add Authorization: Bearer <key>"],
                  ['401', 'invalid_api_key', 'authentication_error', 'Key is wrong, expired, or revoked', 'Check or rotate key in the dashboard'],
                  ['403', 'insufficient_quota', 'permission_error', 'Monthly token cap reached', 'Upgrade plan or wait for reset'],
                  ['404', 'model_not_found', 'invalid_request_error', 'Model ID not recognised', 'Call GET /v1/models for valid IDs'],
                  ['404', 'not_found', 'invalid_request_error', 'Route does not exist', 'Check base URL and path'],
                  ['413', 'request_too_large', 'invalid_request_error', 'Body > 1 MB', 'Chunk large payloads'],
                  ['429', 'rate_limit_exceeded', 'requests', 'RPM limit hit', 'Wait Retry-After seconds; use exponential backoff'],
                  ['429', 'rate_limit_exceeded', 'tokens', 'Daily token limit hit', 'Wait until midnight UTC for reset'],
                  ['500', 'internal_server_error', 'api_error', 'Unexpected server fault', 'Retry with backoff; contact support if persistent'],
                  ['502', 'model_backend_unavailable', 'api_error', 'Inference backend down or overloaded', 'Retry with exponential backoff'],
                  ['503', 'service_unavailable', 'api_error', 'Maintenance window', 'Check status.cloudach.com'],
                ]}
              />

              <h3 style={h3}>Example error responses</h3>

              <h4 style={h4}>400 — Context length exceeded</h4>
              <CodeBlock>{`{
  "error": {
    "message": "This model's maximum context length is 8192 tokens, but your request has 9500 tokens (8100 prompt + 1400 max_tokens). Shorten your messages or reduce max_tokens.",
    "type": "invalid_request_error",
    "code": "context_length_exceeded"
  }
}`}</CodeBlock>

              <h4 style={h4}>401 — Invalid key</h4>
              <CodeBlock>{`{
  "error": {
    "message": "Invalid or revoked API key.",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}`}</CodeBlock>

              <h4 style={h4}>404 — Model not found</h4>
              <CodeBlock>{`{
  "error": {
    "message": "The model 'gpt-4' does not exist or you do not have access to it.",
    "type": "invalid_request_error",
    "code": "model_not_found",
    "param": "model"
  }
}`}</CodeBlock>

              <h4 style={h4}>429 — Rate limited</h4>
              <CodeBlock>{`// RPM exceeded (type: "requests")
{"error": {"message": "Rate limit exceeded: 60 requests per minute.", "type": "requests", "code": "rate_limit_exceeded"}}

// Daily token cap (type: "tokens")
{"error": {"message": "You have exceeded your daily token limit of 1,000,000 tokens. Tokens reset at midnight UTC.", "type": "tokens", "code": "rate_limit_exceeded"}}`}</CodeBlock>

              <Callout>Do NOT retry 400, 401, 403, or 404 errors — they indicate a bug in the request, not a transient fault. Retry 429, 500, 502, and 503 with exponential backoff.</Callout>

              <h3 style={h3}>Streaming error handling</h3>
              <p style={p}>
                Errors in streaming responses fall into two categories:
              </p>
              <ul style={ul}>
                <li>
                  <strong>Pre-stream errors</strong> — the request fails before any <Code>data:</Code> events are sent.
                  You receive a normal HTTP error response (non-200 status, JSON body). Handle identically to non-streaming errors.
                </li>
                <li>
                  <strong>Mid-stream errors</strong> — the backend fails after the stream has started.
                  The <Code>data:</Code> sequence is cut short; the final event is an error object instead of <Code>data: [DONE]</Code>.
                </li>
              </ul>

              <h4 style={h4}>Mid-stream error event</h4>
              <CodeBlock>{`data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"The answer is"},"index":0}]}

data: {"error": {"message": "Stream interrupted by server.", "type": "api_error", "code": "stream_error"}}

// Connection closes — [DONE] is NOT sent`}</CodeBlock>

              <h4 style={h4}>Python — streaming with error handling</h4>
              <CodeBlock>{`from openai import OpenAI, APIStatusError

client = OpenAI(api_key="sk-cloudach-YOUR_KEY", base_url="https://api.cloudach.com/v1")

collected = []
try:
    stream = client.chat.completions.create(
        model="llama3-8b",
        messages=[{"role": "user", "content": "Tell me a story."}],
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        collected.append(delta)
        print(delta, end="", flush=True)
except APIStatusError as e:
    # Covers both pre-stream HTTP errors and mid-stream 5xx faults
    print(f"\\nStream error ({e.status_code}): {e.message}")
    # Retry the full request if e.status_code in {429, 500, 502, 503}`}</CodeBlock>

              <h4 style={h4}>Node.js — streaming with error handling</h4>
              <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({ apiKey: "sk-cloudach-YOUR_KEY", baseURL: "https://api.cloudach.com/v1" });

const collected = [];
try {
  const stream = await client.chat.completions.create({
    model: "llama3-8b",
    messages: [{ role: "user", content: "Tell me a story." }],
    stream: true,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    collected.push(delta);
    process.stdout.write(delta);
  }
} catch (err) {
  if (err instanceof OpenAI.APIError) {
    console.error(\`\\nStream error (\${err.status}): \${err.message}\`);
    // Retry if err.status is in [429, 500, 502, 503]
  } else {
    throw err; // Network-level error (TCP reset, proxy timeout)
  }
}`}</CodeBlock>

              <p style={p}>
                Network-level interruptions (TCP resets, proxy timeouts) surface as connection errors from the HTTP client,
                not as API error JSON. Always wrap stream consumption in a try/catch and implement a retry strategy for the full request.
              </p>
            </Section>

            {/* ── Webhooks ── */}
            <Section id="webhooks" title="Webhooks">
              <p style={p}>
                Webhooks let you receive real-time HTTP POST notifications when events happen in your Cloudach account.
                Register an endpoint URL in the{' '}
                <a href="/dashboard/webhooks" style={{ color: '#4F6EF7' }}>dashboard</a> and subscribe to the event types you care about.
              </p>

              <h3 style={h3} id="webhooks-events">Event types</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, marginBottom: 24 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: 12.5 }}>
                    <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', fontWeight: 500 }}>Event</th>
                    <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', fontWeight: 500 }}>When it fires</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['usage.threshold',  'Cumulative spend for the billing period crosses a threshold'],
                    ['api_key.created',  'A new API key is created'],
                    ['api_key.revoked',  'An API key is revoked'],
                    ['request.failed',   'An API request returns a 4xx or 5xx status code'],
                  ].map(([ev, desc]) => (
                    <tr key={ev} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '9px 12px 9px 0', verticalAlign: 'top' }}>
                        <Code>{ev}</Code>
                      </td>
                      <td style={{ padding: '9px 0', color: '#374151' }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 style={h3} id="webhooks-signatures">Verifying signatures</h3>
              <p style={p}>
                Every delivery includes an <Code>X-Cloudach-Signature</Code> header formatted as{' '}
                <Code>sha256=&lt;hex&gt;</Code>. Verify it by computing{' '}
                <Code>HMAC-SHA256(secret, rawBody)</Code> with your webhook signing secret and comparing the result.
                Reject requests where signatures do not match.
              </p>

              <CodeBlock>{`# Python
import hmac, hashlib

def verify(secret: str, body: bytes, header: str) -> bool:
    expected = "sha256=" + hmac.new(
        secret.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, header)`}</CodeBlock>

              <CodeBlock>{`// Node.js
const crypto = require('crypto');

function verify(secret, rawBody, header) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(header)
  );
}`}</CodeBlock>

              <h3 style={h3}>Payload structure</h3>
              <CodeBlock>{`{
  "id": "evt_01abc...",
  "event": "api_key.created",
  "created": 1713100800,
  "data": { ... }
}`}</CodeBlock>

              <h3 style={h3}>Retry policy</h3>
              <p style={p}>
                Non-2xx responses or timeouts (10 s) trigger up to <strong>3 retries</strong> with
                exponential back-off (0.5 s → 1 s → 2 s). View delivery history in the{' '}
                <a href="/dashboard/webhooks" style={{ color: '#4F6EF7' }}>Webhooks dashboard</a>.
              </p>
            </Section>

            {/* ── SDK Reference ── */}
            <Section id="sdks" title="SDK Reference">
              <p style={p}>
                Cloudach is drop-in compatible with any OpenAI SDK. Change two values: <Code>base_url</Code> and <Code>api_key</Code>.
                All request/response shapes are identical.
              </p>

              <h3 style={h3}>SDK quickstart guides</h3>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {[
                  { href: '/tutorials/python-quickstart', lang: 'Python', pkg: 'pip install openai', desc: 'Install, configure, first call in 5 lines' },
                  { href: '/tutorials/nodejs-quickstart', lang: 'Node.js', pkg: 'npm install openai', desc: 'ESM, CommonJS, and TypeScript setup' },
                ].map(t => (
                  <a key={t.href} href={t.href} style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px', textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0D0F1A' }}>{t.lang}</span>
                      <Code>{t.pkg}</Code>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{t.desc}</div>
                  </a>
                ))}
              </div>

              <Table
                headers={['SDK', 'Install', 'base_url / baseURL']}
                rows={[
                  ['Python openai ≥ 1.0', 'pip install openai', 'https://api.cloudach.com/v1'],
                  ['Node.js openai ≥ 4.0', 'npm install openai', 'https://api.cloudach.com/v1'],
                  ['LangChain (Python)', 'pip install langchain-openai', 'openai_api_base env var'],
                  ['LiteLLM', 'pip install litellm', 'api_base config'],
                  ['Direct HTTP / curl', '—', 'Authorization: Bearer header'],
                ]}
              />

              <h3 style={{ ...h3, marginTop: 28 }}>chat.completions.create — parameters</h3>
              <Table
                headers={['Parameter', 'Type', 'Required', 'Default', 'Description']}
                rows={[
                  ['model', 'string', 'Yes', '—', 'Model ID. See /v1/models for available IDs.'],
                  ['messages', 'array', 'Yes', '—', 'Non-empty array of {role, content} objects. Roles: system, user, assistant.'],
                  ['stream', 'boolean', 'No', 'false', 'If true, response is SSE stream of delta chunks ending with data: [DONE].'],
                  ['temperature', 'number', 'No', '1.0', 'Sampling temperature. 0.0 = deterministic, 2.0 = very random.'],
                  ['max_tokens', 'number', 'No', 'model max', 'Maximum tokens to generate. Caps completion length.'],
                  ['top_p', 'number', 'No', '1.0', 'Nucleus sampling. Alternative to temperature. Use one, not both.'],
                  ['n', 'number', 'No', '1', 'Number of completions to generate. Higher values multiply token cost.'],
                  ['stop', 'string | array', 'No', 'null', 'Stop sequence(s). Generation halts when one is produced.'],
                  ['presence_penalty', 'number', 'No', '0.0', '-2.0 to 2.0. Positive values penalise repeated topics.'],
                  ['frequency_penalty', 'number', 'No', '0.0', '-2.0 to 2.0. Positive values penalise repeated tokens.'],
                  ['user', 'string', 'No', '—', 'Stable end-user identifier for abuse monitoring.'],
                ]}
              />

              <h3 style={{ ...h3, marginTop: 28 }}>chat.completions.create — response (non-streaming)</h3>
              <CodeBlock>{`{
  "id": "chatcmpl-abc123",           // unique completion ID
  "object": "chat.completion",
  "created": 1712345678,             // Unix timestamp
  "model": "llama3-8b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help?"
      },
      "finish_reason": "stop"        // "stop" | "length" | "content_filter"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 7,
    "total_tokens": 25
  }
}`}</CodeBlock>

              <h3 style={{ ...h3, marginTop: 28 }}>chat.completions.create — streaming chunk</h3>
              <CodeBlock>{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion.chunk",
  "created": 1712345678,
  "model": "llama3-8b",
  "choices": [
    {
      "index": 0,
      "delta": {
        "role": "assistant",  // only in first chunk
        "content": "Hello"   // null in first and last chunks
      },
      "finish_reason": null   // "stop" | "length" in final chunk
    }
  ],
  // usage only in the last content chunk (before [DONE])
  "usage": { "prompt_tokens": 18, "completion_tokens": 1, "total_tokens": 19 }
}`}</CodeBlock>

              <h3 style={{ ...h3, marginTop: 28 }}>models.list — response</h3>
              <CodeBlock>{`// GET /v1/models
{
  "object": "list",
  "data": [
    {
      "id": "llama3-8b",
      "object": "model",
      "created": 1712000000,
      "owned_by": "cloudach"
    }
    // ... more models
  ]
}`}</CodeBlock>

              <h3 style={h3}>Python — full client reference</h3>
              <CodeBlock>{`from openai import OpenAI, AsyncOpenAI

# Sync client
client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key="sk-cloudach-YOUR_KEY",
    timeout=60.0,       # request timeout in seconds (default: 60)
    max_retries=2,      # automatic retries on 429/5xx (default: 2)
)

# Async client (asyncio / FastAPI)
async_client = AsyncOpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key="sk-cloudach-YOUR_KEY",
)

# Chat completion (sync)
response = client.chat.completions.create(model="llama3-8b", messages=[...])
text = response.choices[0].message.content
usage = response.usage  # .prompt_tokens, .completion_tokens, .total_tokens

# Chat completion (async)
response = await async_client.chat.completions.create(model="llama3-8b", messages=[...])

# List models
models = client.models.list()
for m in models.data:
    print(m.id)

# Retrieve a model
model = client.models.retrieve("llama3-8b")`}</CodeBlock>

              <h3 style={h3}>Node.js — full client reference</h3>
              <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: "sk-cloudach-YOUR_KEY",
  timeout: 60_000,    // ms (default: 60000)
  maxRetries: 2,      // automatic retries on 429/5xx (default: 2)
});

// Chat completion
const response = await client.chat.completions.create({ model: "llama3-8b", messages: [...] });
const text = response.choices[0].message.content;
const usage = response.usage; // .promptTokens, .completionTokens, .totalTokens

// Streaming
const stream = await client.chat.completions.create({
  model: "llama3-8b", messages: [...], stream: true,
});
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}

// List models
const models = await client.models.list();
for (const m of models.data) console.log(m.id);`}</CodeBlock>

              <p style={p}>
                Full guides: <a href="/tutorials/python-quickstart" style={link}>Python quickstart</a>{' '}·{' '}
                <a href="/tutorials/nodejs-quickstart" style={link}>Node.js quickstart</a>{' '}·{' '}
                <a href="/tutorials/streaming" style={link}>Streaming guide</a>{' '}·{' '}
                <a href="/tutorials/migrate-from-openai" style={link}>Migrate from OpenAI</a>
              </p>
            </Section>

            {/* ── Integrations ── */}
            <Section id="integrations" title="Integrations">
              <p style={p}>Use Cloudach with popular LLM frameworks. Drop-in compatible — change the base URL and API key, nothing else.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    href: '/tutorials/langchain',
                    title: 'LangChain',
                    desc: 'Use Cloudach as a ChatOpenAI provider. Covers basic chat, streaming, and LCEL chains.',
                    badge: 'Python',
                  },
                  {
                    href: '/tutorials/llamaindex',
                    title: 'LlamaIndex',
                    desc: 'Use Cloudach as the LLM backend in LlamaIndex. Covers completions, chat, streaming, and RAG pipelines.',
                    badge: 'Python',
                  },
                ].map(t => (
                  <a key={t.href} href={t.href} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', textDecoration: 'none', display: 'block', transition: 'border-color 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#0D0F1A' }}>{t.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '2px 8px', borderRadius: 5, letterSpacing: '0.04em' }}>{t.badge}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>{t.desc}</p>
                  </a>
                ))}
              </div>
            </Section>

            {/* ── Fine-Tuning ── */}
            <Section id="fine-tuning" title="Fine-Tuning">
              <p style={p}>
                Fine-tuning lets you adapt a base model to your domain, tone, or task using your own labelled examples.
                Cloudach exposes fine-tuning through a simple REST API and serves the resulting LoRA adapters on top of
                vLLM with the same sub-100ms latency as base models.
              </p>

              <h3 id="fine-tuning-quickstart" style={h3}>Quickstart</h3>
              <p style={p}>The workflow has four steps: prepare a JSONL dataset → upload → create job → infer.</p>
              <CodeBlock>{`# 1. Upload your dataset
curl https://api.cloudach.com/v1/fine-tuning/datasets \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -F "file=@training_data.jsonl" \\
  -F "purpose=fine-tune"
# → {"id": "ds-8f3a2b1c", ...}

# 2. Create a LoRA fine-tuning job
curl https://api.cloudach.com/v1/fine-tuning/jobs \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama3-8b",
    "training_file": "ds-8f3a2b1c",
    "method": {"type": "lora", "lora": {"rank": 16, "alpha": 32}},
    "hyperparameters": {"n_epochs": 3},
    "suffix": "my-model"
  }'
# → {"id": "ftjob-a1b2c3", "status": "queued"}

# 3. Poll until succeeded
curl https://api.cloudach.com/v1/fine-tuning/jobs/ftjob-a1b2c3 \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY"
# → {"status": "succeeded", "fine_tuned_model": "llama3-8b:ft:my-model:ftjob-a1b2c3"}

# 4. Infer — use fine_tuned_model as the model ID
curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "llama3-8b:ft:my-model:ftjob-a1b2c3", "messages": [...]}'`}</CodeBlock>

              <p style={p}>
                Dataset format: each line of your <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em', fontFamily: 'monospace' }}>.jsonl</code> file
                must be a JSON object with a <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em', fontFamily: 'monospace' }}>messages</code> array
                (identical to the OpenAI fine-tuning format). Minimum 100 examples.
              </p>
              <CodeBlock>{`{"messages": [
  {"role": "system", "content": "You are a helpful support agent for Acme Corp."},
  {"role": "user",   "content": "How do I reset my password?"},
  {"role": "assistant", "content": "Go to Settings → Security → Reset Password. You'll receive a link within 2 minutes."}
]}`}</CodeBlock>

              <h3 id="fine-tuning-lora" style={h3}>LoRA adapters</h3>
              <p style={p}>
                Cloudach uses <strong>vLLM with multi-adapter LoRA support</strong>. LoRA trains lightweight adapter
                weights (≈ 0.1–1% of model size) rather than updating the full model. Key properties:
              </p>
              <ul style={ul}>
                <li>Adapter loading adds &lt; 50 ms on first request; warm requests have zero overhead</li>
                <li>Multiple adapters for the same base model share one GPU replica — you pay base model rates, not a new GPU per fine-tune</li>
                <li>Adapters can be downloaded for self-hosted vLLM deployments</li>
              </ul>
              <Table
                headers={['Parameter', 'Default', 'Description']}
                rows={[
                  ['method.type', 'lora', 'Training method: lora or full (8B models only)'],
                  ['lora.rank', '16', 'Adapter capacity — 8/16/32/64. Higher = more expressive, higher cost'],
                  ['lora.alpha', '2 × rank', 'Scaling factor. Usually set to 2× rank'],
                  ['lora.target_modules', 'q_proj, v_proj', 'Weight matrices to train'],
                  ['n_epochs', '3', 'Training passes over the dataset'],
                  ['batch_size', '16', 'Examples per gradient step'],
                ]}
              />

              <h3 id="fine-tuning-models" style={h3}>Supported base models</h3>
              <Table
                headers={['Model', 'Method', 'LoRA rank options']}
                rows={[
                  ['llama3-8b', 'Full fine-tune + LoRA', '8, 16, 32, 64'],
                  ['llama3-70b', 'LoRA only', '8, 16, 32'],
                  ['llama31-8b', 'Full fine-tune + LoRA', '8, 16, 32, 64'],
                  ['llama31-70b', 'LoRA only', '8, 16, 32'],
                  ['mistral-7b', 'Full fine-tune + LoRA', '8, 16, 32, 64'],
                  ['mixtral-8x7b', 'LoRA only', '8, 16, 32'],
                ]}
              />

              <p style={p}>
                Full reference: <a href="/docs#fine-tuning" style={link}>Fine-Tuning API Reference</a> —
                all endpoints, parameters, error codes, and pricing.
                See also the <a href="/tutorials/fine-tuning-llama3" style={link}>step-by-step tutorial</a> and
                the <a href="/docs#fine-tuning-quickstart" style={link}>Data Preparation Guide</a>.
              </p>
            </Section>

            {/* ── Tutorials ── */}
            <Section id="tutorials" title="Tutorials">
              <p style={p}>Step-by-step guides for common use cases.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    href: '/tutorials/python-quickstart',
                    title: 'Python SDK quickstart',
                    desc: 'Install, configure, and make your first chat completion in Python. 5 minutes.',
                    badge: 'Beginner',
                    badgeColor: '#059669',
                    badgeBg: '#ECFDF5',
                    lang: 'Python',
                  },
                  {
                    href: '/tutorials/nodejs-quickstart',
                    title: 'Node.js SDK quickstart',
                    desc: 'ESM, CommonJS, and TypeScript setup. First call in under 5 minutes.',
                    badge: 'Beginner',
                    badgeColor: '#059669',
                    badgeBg: '#ECFDF5',
                    lang: 'Node.js',
                  },
                  {
                    href: '/tutorials/migrate-from-openai',
                    title: 'Migrate from OpenAI to Cloudach in 2 minutes',
                    desc: 'Change base_url and api_key. Keep your existing OpenAI SDK and code unchanged.',
                    badge: 'Beginner',
                    badgeColor: '#059669',
                    badgeBg: '#ECFDF5',
                    lang: null,
                  },
                  {
                    href: '/tutorials/streaming',
                    title: 'Streaming guide',
                    desc: 'How SSE works, collecting chunks, error handling, async Python, Next.js API routes, and React UI patterns.',
                    badge: 'Intermediate',
                    badgeColor: '#D97706',
                    badgeBg: '#FFFBEB',
                    lang: null,
                  },
                  {
                    href: '/tutorials/customer-support-bot',
                    title: 'Build a customer support bot with Llama 3',
                    desc: 'Stream responses, handle context across turns, and deploy to production.',
                    badge: 'Intermediate',
                    badgeColor: '#D97706',
                    badgeBg: '#FFFBEB',
                    lang: null,
                  },
                  {
                    href: '/tutorials/fine-tuning-llama3',
                    title: 'Fine-tune Llama 3 on your own data',
                    desc: 'Prepare a JSONL dataset, launch a LoRA job, monitor training, and run inference on your custom model. End-to-end in 30 minutes.',
                    badge: 'Beginner',
                    badgeColor: '#059669',
                    badgeBg: '#ECFDF5',
                    lang: null,
                  },
                ].map(t => (
                  <a key={t.href} href={t.href} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', textDecoration: 'none', display: 'block', transition: 'border-color 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#0D0F1A' }}>{t.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.badgeColor, background: t.badgeBg, padding: '2px 8px', borderRadius: 5, letterSpacing: '0.04em' }}>{t.badge}</span>
                      {t.lang && <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '2px 8px', borderRadius: 5, letterSpacing: '0.04em' }}>{t.lang}</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>{t.desc}</p>
                  </a>
                ))}
              </div>
            </Section>

            {/* ── API Playground ── */}
            <Section id="playground" title="API Playground">
              <ApiPlayground />
            </Section>

            {/* ── FAQ ── */}
            <Section id="faq" title="FAQ">
              {[
                {
                  q: 'Is Cloudach fully OpenAI-compatible?',
                  a: 'Yes. Cloudach implements the OpenAI REST API spec for chat completions, text completions, and model listing. Any SDK or tool that targets OpenAI works with Cloudach by changing the base URL and API key.',
                },
                {
                  q: 'Do I need to change my code to switch from OpenAI?',
                  a: 'No. Set base_url to https://api.cloudach.com/v1 and swap your API key. That\'s it. All request/response shapes are identical.',
                },
                {
                  q: 'What are the current rate limits?',
                  a: '60 requests per minute and 1,000,000 tokens per day per API key on the free tier. Contact sales@cloudach.com for enterprise limits.',
                },
                {
                  q: 'What happens when I exceed the token quota?',
                  a: 'Requests will return a 429 with code rate_limit_exceeded and a Retry-After header. Tokens reset at midnight UTC. You can upgrade or purchase additional token packs from the dashboard.',
                },
                {
                  q: 'Can I use Cloudach in production?',
                  a: 'Yes. Cloudach is production-ready with 99.9% uptime SLA on paid plans, sub-100ms median TTFT, and autoscaling infrastructure. See the Status page for live metrics.',
                },
                {
                  q: 'Is my data private?',
                  a: 'Cloudach does not log prompt or completion content. Request metadata (token counts, model, timestamp) is stored for billing. Your data is never used to train models.',
                },
                {
                  q: 'Which models are available?',
                  a: 'Llama 3 8B, Llama 3 70B, Mistral 7B, and Mixtral 8×7B are available today. New models are announced on the blog.',
                },
              ].map(({ q, a }) => (
                <details key={q} style={{ borderBottom: '1px solid #F3F4F6', padding: '14px 0', cursor: 'pointer' }}>
                  <summary style={{ fontWeight: 600, fontSize: 15, color: '#0D0F1A', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {q} <span style={{ fontSize: 18, color: '#9CA3AF' }}>+</span>
                  </summary>
                  <p style={{ marginTop: 10, fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{a}</p>
                </details>
              ))}
            </Section>

            {/* Footer */}
            <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: '#9CA3AF' }}>
              <a href="mailto:support@cloudach.com" style={{ color: '#9CA3AF', textDecoration: 'none' }}>support@cloudach.com</a>
              <a href="mailto:sales@cloudach.com" style={{ color: '#9CA3AF', textDecoration: 'none' }}>sales@cloudach.com</a>
              <Link href="/dashboard" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Dashboard</Link>
              <Link href="/changelog" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Changelog</Link>
              <a href="/api/changelog/rss" style={{ color: '#9CA3AF', textDecoration: 'none' }}>RSS</a>
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
    <div style={{ background: '#EEF1FF', borderLeft: '3px solid #4F6EF7', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 14, color: '#3730A3', marginBottom: 16 }}>
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

// ── API Playground ────────────────────────────────────────────────────────────

function ApiPlayground() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('llama3-8b');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [userMessage, setUserMessage] = useState('Hello! Tell me about yourself.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(256);
  const [codeLang, setCodeLang] = useState('curl');
  const [response, setResponse] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cloudach_api_key');
      if (stored) setApiKey(stored);
    } catch {}
  }, []);

  function buildMessages() {
    const msgs = [];
    if (systemPrompt.trim()) msgs.push({ role: 'system', content: systemPrompt });
    msgs.push({ role: 'user', content: userMessage || 'Hello!' });
    return msgs;
  }

  function generateCode(lang) {
    const key = apiKey || 'sk-cloudach-YOUR_KEY';
    const messages = buildMessages();
    if (lang === 'curl') {
      return `curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model}",
    "messages": ${JSON.stringify(messages, null, 4).replace(/\n/g, '\n    ')},
    "temperature": ${temperature},
    "max_tokens": ${maxTokens},
    "stream": true
  }'`;
    }
    if (lang === 'python') {
      const msgsStr = JSON.stringify(messages, null, 4);
      return `from openai import OpenAI

client = OpenAI(
    api_key="${key}",
    base_url="https://api.cloudach.com/v1"
)

stream = client.chat.completions.create(
    model="${model}",
    messages=${msgsStr},
    temperature=${temperature},
    max_tokens=${maxTokens},
    stream=True,
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="", flush=True)`;
    }
    if (lang === 'node') {
      const msgsStr = JSON.stringify(messages, null, 2);
      return `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "${key}",
  baseURL: "https://api.cloudach.com/v1",
});

const stream = await client.chat.completions.create({
  model: "${model}",
  messages: ${msgsStr},
  temperature: ${temperature},
  max_tokens: ${maxTokens},
  stream: true,
});
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}`;
    }
    return '';
  }

  async function run() {
    if (!apiKey.trim()) { setError('Enter an API key to run the request.'); return; }
    if (!userMessage.trim()) { setError('Enter a user message.'); return; }
    setError('');
    setResponse('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('https://api.cloudach.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: buildMessages(),
          temperature: parseFloat(temperature),
          max_tokens: parseInt(maxTokens, 10),
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err?.error?.message || `HTTP ${res.status} — check your API key and parameters.`);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) setResponse(r => r + delta);
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setStreaming(false);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  function copyResponse() {
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div>
      <p style={p}>
        Try the API directly from your browser — no terminal needed. Fill in the inputs, click <strong>Run</strong>, and watch the response stream in real time. The code panel stays in sync as you type.
      </p>

      {/* Responsive two-column grid: inputs left, generated code right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Left — Inputs */}
        <div>
          <label style={pgLabel}>API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-cloudach-..."
            style={pgInput}
            autoComplete="off"
          />
          <p style={pgHint}>
            {apiKey
              ? <span style={{ color: '#059669' }}>✓ Key loaded</span>
              : <><a href="/dashboard/api-keys" style={{ color: '#4F6EF7' }}>Create a key</a> in your dashboard — it is pre-filled if you are already signed in.</>}
          </p>

          <label style={pgLabel}>Model</label>
          <select value={model} onChange={e => setModel(e.target.value)} style={pgInput}>
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name} — {m.best}</option>
            ))}
          </select>

          <label style={pgLabel}>System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={3}
            style={{ ...pgInput, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
          />

          <label style={pgLabel}>User Message</label>
          <textarea
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            rows={3}
            style={{ ...pgInput, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
          />

          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <label style={pgLabel}>
                Temperature{' '}
                <span style={{ color: '#9CA3AF', fontWeight: 400 }}>{temperature}</span>
              </label>
              <input
                type="range"
                min={0} max={2} step={0.1}
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                style={{ width: '100%', marginTop: 4 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={pgLabel}>Max Tokens</label>
              <input
                type="number"
                min={1} max={4096}
                value={maxTokens}
                onChange={e => setMaxTokens(Math.max(1, parseInt(e.target.value, 10) || 256))}
                style={{ ...pgInput, marginTop: 0 }}
              />
            </div>
          </div>

          <button
            onClick={streaming ? stop : run}
            style={{
              marginTop: 16,
              padding: '10px 0',
              width: '100%',
              background: streaming ? '#EF4444' : '#4F6EF7',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.01em',
            }}
          >
            {streaming ? '■  Stop' : '▶  Run'}
          </button>

          {error && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, fontSize: 13, color: '#DC2626' }}>
              {error}
            </div>
          )}
        </div>

        {/* Right — Generated code */}
        <div>
          <p style={{ ...pgLabel, marginBottom: 4 }}>Generated Code</p>
          <p style={pgHint}>Updates live as you change inputs.</p>
          <LangTabs lang={codeLang} onLang={setCodeLang} />
          <CodeBlock>{generateCode(codeLang)}</CodeBlock>
        </div>
      </div>

      {/* Response panel */}
      {(response || streaming) && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Response{' '}
              {streaming && (
                <span style={{ color: '#4F6EF7', animation: 'none' }}>●</span>
              )}
            </span>
            {response && (
              <button
                onClick={copyResponse}
                style={{ fontSize: 12, padding: '3px 10px', background: copied ? '#22C55E' : '#374151', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <pre style={{
            background: '#0D1117',
            color: '#C9D1D9',
            padding: '16px 20px',
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: 80,
            margin: 0,
            overflowX: 'auto',
          }}>
            {response || (streaming ? '…' : '')}
          </pre>
        </div>
      )}
    </div>
  );
}

const pgLabel = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, marginTop: 14 };
const pgHint  = { fontSize: 12, color: '#9CA3AF', marginTop: 4, marginBottom: 0 };
const pgInput = {
  display: 'block',
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #E5E7EB',
  borderRadius: 6,
  fontSize: 14,
  color: '#0D0F1A',
  background: '#FAFAFA',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};
const link = { color: '#4F6EF7', textDecoration: 'none' };
