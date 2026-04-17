import { useState } from 'react';
import TutorialLayout from '../../components/TutorialLayout';
import {
  Breadcrumb,
  TutorialHeader,
  Section,
  P,
  InlineCode,
  Callout,
  CodeBlock,
  LangTabs,
  NextStepCards,
  TutorialFooterLinks,
} from '../../components/tutorial/Parts';

const TOC = [
  ['#how-it-works', 'How it works'],
  ['#basic', 'Basic streaming'],
  ['#collect', 'Collecting chunks'],
  ['#error-handling', 'Error handling'],
  ['#async-python', 'Async Python'],
  ['#nodejs-streams', 'Node.js patterns'],
  ['#curl', 'Raw cURL / SSE'],
  ['#ui-patterns', 'UI patterns'],
  ['#next-steps', 'Next steps'],
];

const LANG_OPTIONS = [
  ['python', 'Python'],
  ['node', 'Node.js'],
];

export default function StreamingGuide() {
  const [lang, setLang] = useState('python');

  return (
    <TutorialLayout
      title="Streaming Guide — Cloudach"
      description="How to handle streamed responses from the Cloudach API in Python and Node.js. Covers async streaming, error handling, backpressure, and UI patterns."
      ogUrl="https://cloudach.com/tutorials/streaming"
      toc={TOC}
    >
      <Breadcrumb
        trail={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs#tutorials', label: 'Tutorials' },
          { label: 'Streaming guide' },
        ]}
      />

      <TutorialHeader
        level="Intermediate"
        duration="~15 min"
        tags={['Python', 'Node.js']}
        title="Streaming guide"
        lede="Streaming lets you receive tokens as they are generated instead of waiting for the full response. This guide covers how streaming works, how to handle it in Python and Node.js, and patterns for production use."
      />

      <Section id="how-it-works" title="How it works">
        <P>
          When you set <InlineCode>stream: true</InlineCode> (or <InlineCode>stream=True</InlineCode>),
          the API switches from a single JSON response to a stream of{' '}
          <strong>Server-Sent Events (SSE)</strong>. Each event contains one or more tokens as they
          come off the GPU.
        </P>
        <P>The wire format looks like this:</P>
        <CodeBlock>{`HTTP/1.1 200 OK
Content-Type: text/event-stream

data: {"id":"chatcmpl-abc","choices":[{"delta":{"role":"assistant","content":""},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"!"},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":" How"},"index":0}],"usage":{"prompt_tokens":10,"completion_tokens":3,"total_tokens":13}}

data: [DONE]`}</CodeBlock>
        <P>
          The OpenAI SDK abstracts SSE parsing for you — you iterate over chunks and extract{' '}
          <InlineCode>choices[0].delta.content</InlineCode> from each one.{' '}
          <InlineCode>data: [DONE]</InlineCode> signals the end of the stream.
        </P>
      </Section>

      <Section id="basic" title="Basic streaming">
        <LangTabs value={lang} onChange={setLang} options={LANG_OPTIONS} />
        {lang === 'python' && (
          <CodeBlock language="python">{`import os
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
          <CodeBlock language="javascript">{`import OpenAI from "openai";

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

      <Section id="collect" title="Collecting the full response">
        <P>Often you want to both stream tokens to the UI and capture the complete text when done.</P>
        <LangTabs value={lang} onChange={setLang} options={LANG_OPTIONS} />
        {lang === 'python' && (
          <CodeBlock language="python">{`chunks = []

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
          <CodeBlock language="javascript">{`const chunks = [];

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

      <Section id="error-handling" title="Error handling">
        <P>Streaming errors fall into two categories:</P>
        <ul
          style={{
            fontSize: 14,
            color: 'var(--color-ink-muted)',
            lineHeight: 1.8,
            paddingLeft: 20,
            marginBottom: 12,
          }}
        >
          <li>
            <strong>Pre-stream</strong> — request rejected before any data is sent (e.g. 401, 429).
            You get a normal HTTP error response.
          </li>
          <li>
            <strong>Mid-stream</strong> — backend fails after the stream starts. The SDK surfaces this
            as an exception during iteration.
          </li>
        </ul>
        <LangTabs value={lang} onChange={setLang} options={LANG_OPTIONS} />
        {lang === 'python' && (
          <CodeBlock language="python">{`import time
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
          <CodeBlock language="javascript">{`import OpenAI from "openai";

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

      <Section id="async-python" title="Async Python (asyncio)">
        <P>
          Use <InlineCode>AsyncOpenAI</InlineCode> for async frameworks like FastAPI, aiohttp, or
          raw asyncio:
        </P>
        <CodeBlock language="python">{`import asyncio
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

      <Section id="nodejs-streams" title="Node.js — streaming to an HTTP response">
        <P>
          To stream tokens directly to an HTTP client (e.g. in Next.js API routes or Express):
        </P>
        <CodeBlock language="typescript">{`// Next.js App Router — route.ts
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

      <Section id="curl" title="Raw cURL / SSE">
        <P>You can consume the raw SSE stream with curl:</P>
        <CodeBlock language="bash">{`curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama3-8b",
    "messages": [{"role": "user", "content": "Count from 1 to 5 slowly."}],
    "stream": true
  }'`}</CodeBlock>
        <P>Output (raw SSE):</P>
        <CodeBlock>{`data: {"id":"chatcmpl-abc","choices":[{"delta":{"role":"assistant","content":""},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"1"},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":", 2"},"index":0}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":", 3, 4, 5."},"index":0}]}

data: [DONE]`}</CodeBlock>
      </Section>

      <Section id="ui-patterns" title="UI patterns">
        <P>Common patterns for chat UIs:</P>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 10,
            marginTop: 20,
            color: 'var(--color-ink)',
          }}
        >
          Append tokens to state (React)
        </h3>
        <CodeBlock language="javascript">{`// React hook for streaming chat
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
          Always stream through a server-side API route — never expose your Cloudach API key to the
          browser.
        </Callout>
      </Section>

      <Section id="next-steps" title="Next steps">
        <NextStepCards
          items={[
            { href: '/tutorials/python-quickstart', label: 'Python quickstart', desc: 'Full setup from install to first call' },
            { href: '/tutorials/nodejs-quickstart', label: 'Node.js quickstart', desc: 'ESM, CommonJS, and TypeScript setup' },
            { href: '/tutorials/migrate-from-openai', label: 'Migrate from OpenAI', desc: 'Two-line migration guide' },
            { href: '/tutorials/customer-support-bot', label: 'Customer support bot', desc: 'Streaming, context management, and production deployment' },
          ]}
        />
      </Section>

      <TutorialFooterLinks />
    </TutorialLayout>
  );
}
