import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

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
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 17, color: '#0D0F1A', letterSpacing: '-0.5px' }}>Cloudach<span style={{ color: '#4F6EF7' }}>.</span></span>
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
                ['#sdks', 'SDK Reference'],
                ['#integrations', 'Integrations'],
                ['#tutorials', 'Tutorials'],
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
const link = { color: '#4F6EF7', textDecoration: 'none' };
