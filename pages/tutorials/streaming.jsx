import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function StreamingGuide() {
  const [lang, setLang] = useState('python');

  return (
    <>
      <Head>
        <title>Streaming Guide — Cloudach</title>
        <meta name="description" content="How to handle streamed responses from the Cloudach API in Python and Node.js. Covers async streaming, error handling, backpressure, and UI patterns." />
        <meta property="og:title" content="Streaming Guide — Cloudach" />
        <meta property="og:description" content="Server-Sent Events, streaming error handling, and production patterns for Python and Node.js." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/tutorials/streaming" />
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
                ['#how-it-works', 'How it works'],
                ['#basic', 'Basic streaming'],
                ['#collect', 'Collecting chunks'],
                ['#error-handling', 'Error handling'],
                ['#async-python', 'Async Python'],
                ['#nodejs-streams', 'Node.js patterns'],
                ['#curl', 'Raw cURL / SSE'],
                ['#ui-patterns', 'UI patterns'],
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
              <span>Streaming guide</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FFFBEB', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Intermediate</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>~15 min</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Python</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4F6EF7', background: '#EEF1FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Node.js</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12 }}>Streaming guide</h1>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 0 }}>
                Streaming lets you receive tokens as they are generated instead of waiting for the full response.
                This guide covers how streaming works, how to handle it in Python and Node.js, and patterns for production use.
              </p>
            </div>

            {/* How it works */}
            <Section id="how-it-works" title="How it works">
              <p style={p}>
                When you set <code style={inlineCode}>stream: true</code> (or <code style={inlineCode}>stream=True</code>),
                the API switches from a single JSON response to a stream of <strong>Server-Sent Events (SSE)</strong>.
                Each event contains one or more tokens as they come off the GPU.
              </p>
              <p style={p}>The wire format looks like this:</p>
              <CodeBlock>{`HTTP/1.1 200 OK
Content-Type: text/event-stream

data: {"id":"chatcmpl-abc","choices":[{"delta":{"role":"assistant","content":""},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"!"},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":" How"},"index":0}],"usage":{"prompt_tokens":10,"completion_tokens":3,"total_tokens":13}}

data: [DONE]`}</CodeBlock>
              <p style={p}>
                The OpenAI SDK abstracts SSE parsing for you — you iterate over chunks and extract{' '}
                <code style={inlineCode}>choices[0].delta.content</code> from each one.
                <code style={inlineCode}>data: [DONE]</code> signals the end of the stream.
              </p>
            </Section>

            {/* Basic streaming */}
            <Section id="basic" title="Basic streaming">
              <LangTabs lang={lang} onLang={setLang} />
              {lang === 'python' && (
                <CodeBlock>{`import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)

stream = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "Write a poem about the ocean."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)

print()  # newline after stream ends`}</CodeBlock>
              )}
              {lang === 'node' && (
                <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});

const stream = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Write a poem about the ocean." }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}

process.stdout.write("\\n");`}</CodeBlock>
              )}
            </Section>

            {/* Collecting chunks */}
            <Section id="collect" title="Collecting the full response">
              <p style={p}>
                Often you want to both stream tokens to the UI and capture the complete text when done.
              </p>
              <LangTabs lang={lang} onLang={setLang} />
              {lang === 'python' && (
                <CodeBlock>{`chunks = []

stream = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "Explain recursion briefly."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content or ""
    chunks.append(delta)
    print(delta, end="", flush=True)

full_text = "".join(chunks)
print(f"\\n\\nTotal characters: {len(full_text)}")`}</CodeBlock>
              )}
              {lang === 'node' && (
                <CodeBlock>{`const chunks = [];

const stream = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Explain recursion briefly." }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content ?? "";
  chunks.push(delta);
  process.stdout.write(delta);
}

const fullText = chunks.join("");
console.log(\`\\n\\nTotal characters: \${fullText.length}\`);`}</CodeBlock>
              )}
            </Section>

            {/* Error handling */}
            <Section id="error-handling" title="Error handling">
              <p style={p}>
                Streaming errors fall into two categories:
              </p>
              <ul style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, paddingLeft: 20, marginBottom: 12 }}>
                <li><strong>Pre-stream</strong> — request rejected before any data is sent (e.g. 401, 429). You get a normal HTTP error response.</li>
                <li><strong>Mid-stream</strong> — backend fails after the stream starts. The SDK surfaces this as an exception during iteration.</li>
              </ul>
              <LangTabs lang={lang} onLang={setLang} />
              {lang === 'python' && (
                <CodeBlock>{`import time
from openai import OpenAI, APIStatusError, APIConnectionError

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)

RETRYABLE = {429, 500, 502, 503}

def stream_with_retry(messages, model="llama3-8b", max_retries=3):
    for attempt in range(max_retries):
        try:
            stream = client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
            )
            collected = []
            for chunk in stream:
                delta = chunk.choices[0].delta.content or ""
                collected.append(delta)
                print(delta, end="", flush=True)
            print()
            return "".join(collected)

        except APIStatusError as e:
            if e.status_code not in RETRYABLE or attempt == max_retries - 1:
                raise
            retry_after = e.response.headers.get("Retry-After")
            wait = float(retry_after) if retry_after else 2 ** attempt
            print(f"\\nRetrying in {wait}s (attempt {attempt + 1})...")
            time.sleep(wait)

        except APIConnectionError:
            # TCP reset or proxy timeout — retry immediately
            if attempt == max_retries - 1:
                raise
            print(f"\\nConnection error, retrying...")

result = stream_with_retry([{"role": "user", "content": "Hello!"}])`}</CodeBlock>
              )}
              {lang === 'node' && (
                <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});

const RETRYABLE = new Set([429, 500, 502, 503]);

async function streamWithRetry(messages, model = "llama3-8b", maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const stream = await client.chat.completions.create({
        model,
        messages,
        stream: true,
      });

      const chunks = [];
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        chunks.push(delta);
        process.stdout.write(delta);
      }
      process.stdout.write("\\n");
      return chunks.join("");

    } catch (err) {
      if (err instanceof OpenAI.APIError && RETRYABLE.has(err.status) && attempt < maxRetries - 1) {
        const retryAfter = err.headers?.["retry-after"];
        const wait = retryAfter ? parseFloat(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        console.error(\`\\nRetrying in \${wait}ms (attempt \${attempt + 1})...\`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}

await streamWithRetry([{ role: "user", content: "Hello!" }]);`}</CodeBlock>
              )}
            </Section>

            {/* Async Python */}
            <Section id="async-python" title="Async Python (asyncio)">
              <p style={p}>
                Use <code style={inlineCode}>AsyncOpenAI</code> for async frameworks like FastAPI, aiohttp, or raw asyncio:
              </p>
              <CodeBlock>{`import asyncio
import os
from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)

async def stream_response(prompt: str) -> str:
    stream = await client.chat.completions.create(
        model="llama3-8b",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )

    chunks = []
    async for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        chunks.append(delta)
        print(delta, end="", flush=True)

    print()
    return "".join(chunks)

# FastAPI example
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/chat")
async def chat(prompt: str):
    async def generate():
        stream = await client.chat.completions.create(
            model="llama3-8b",
            messages=[{"role": "user", "content": prompt}],
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content or ""
            if delta:
                yield delta

    return StreamingResponse(generate(), media_type="text/plain")`}</CodeBlock>
            </Section>

            {/* Node.js patterns */}
            <Section id="nodejs-streams" title="Node.js — streaming to an HTTP response">
              <p style={p}>
                To stream tokens directly to an HTTP client (e.g. in Next.js API routes or Express):
              </p>
              <CodeBlock>{`// Next.js App Router — route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const stream = await client.chat.completions.create({
    model: "llama3-8b",
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  // Pipe Cloudach SSE directly to the browser
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}`}</CodeBlock>
            </Section>

            {/* cURL */}
            <Section id="curl" title="Raw cURL / SSE">
              <p style={p}>You can consume the raw SSE stream with curl:</p>
              <CodeBlock>{`curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama3-8b",
    "messages": [{"role": "user", "content": "Count from 1 to 5 slowly."}],
    "stream": true
  }'`}</CodeBlock>
              <p style={p}>Output (raw SSE):</p>
              <CodeBlock>{`data: {"id":"chatcmpl-abc","choices":[{"delta":{"role":"assistant","content":""},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"1"},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":", 2"},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":", 3, 4, 5."},"index":0}]}

data: [DONE]`}</CodeBlock>
            </Section>

            {/* UI patterns */}
            <Section id="ui-patterns" title="UI patterns">
              <p style={p}>Common patterns for chat UIs:</p>

              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, marginTop: 20 }}>Append tokens to state (React)</h3>
              <CodeBlock>{`// React hook for streaming chat
import { useState } from "react";

export function useCloudachStream() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(prompt) {
    setLoading(true);
    setResponse("");

    // Stream via your own API route to keep the key server-side
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      setResponse((prev) => prev + decoder.decode(value));
    }

    setLoading(false);
  }

  return { response, loading, send };
}`}</CodeBlock>

              <Callout>
                Always stream through a server-side API route — never expose your Cloudach API key to the browser.
              </Callout>
            </Section>

            {/* Next steps */}
            <Section id="next-steps" title="Next steps">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { href: '/tutorials/python-quickstart', label: 'Python quickstart', desc: 'Full setup from install to first call' },
                  { href: '/tutorials/nodejs-quickstart', label: 'Node.js quickstart', desc: 'ESM, CommonJS, and TypeScript setup' },
                  { href: '/tutorials/migrate-from-openai', label: 'Migrate from OpenAI', desc: 'Two-line migration guide' },
                  { href: '/tutorials/customer-support-bot', label: 'Customer support bot', desc: 'Streaming, context management, and production deployment' },
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
    <div style={{ display: 'flex', gap: 4, marginBottom: 0, marginTop: 4 }}>
      {[['python', 'Python'], ['node', 'Node.js']].map(([key, label]) => (
        <button
          key={key}
          onClick={() => onLang(key)}
          style={{
            padding: '6px 14px', fontSize: 13, fontWeight: 500,
            borderRadius: '6px 6px 0 0', border: '1px solid #E5E7EB',
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
