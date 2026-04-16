import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function CustomerSupportBotTutorial() {
  const [lang, setLang] = useState('python');

  return (
    <>
      <Head>
        <title>Build a Customer Support Bot with Cloudach and Llama 3 — Cloudach Tutorials</title>
        <meta name="description" content="Step-by-step tutorial: build a streaming customer support bot with Cloudach and Llama 3 70B. Covers context management, streaming responses, and production deployment." />
        <meta property="og:title" content="Build a Customer Support Bot with Cloudach and Llama 3" />
        <meta property="og:description" content="Step-by-step tutorial: build a streaming customer support bot with Cloudach and Llama 3 70B." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/tutorials/customer-support-bot" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0D0F1A' }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid #E5E7EB', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 32, height: 60 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'rgba(255,255,255,0.72)' }}>Cloudach</span>
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
                ['#overview', 'Overview'],
                ['#prerequisites', 'Prerequisites'],
                ['#system-prompt', '1. System prompt'],
                ['#context-management', '2. Context management'],
                ['#streaming', '3. Streaming responses'],
                ['#full-example', '4. Full example'],
                ['#production', '5. Production tips'],
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
              <span>Customer support bot</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Intermediate</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>~20 min</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12 }}>Build a customer support bot with Cloudach and Llama 3</h1>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 0 }}>
                In this tutorial you'll build a production-ready customer support chatbot that streams responses in real-time,
                maintains conversation context across turns, and handles errors gracefully.
                We'll use Llama 3 70B for high-quality responses and the Cloudach streaming API.
              </p>
            </div>

            {/* Language tabs */}
            <LangTabs lang={lang} onLang={setLang} />

            {/* Overview */}
            <Section id="overview" title="Overview">
              <p style={p}>What you'll build:</p>
              <ul style={ul}>
                <li>A chatbot that answers questions about your product using a custom system prompt</li>
                <li>Streaming responses so users see text as it's generated (no waiting for the full reply)</li>
                <li>A conversation history that keeps context across multiple turns</li>
                <li>Graceful error handling and retry logic</li>
              </ul>

              <Callout>
                You'll need a Cloudach API key. <a href="/signup" style={linkStyle}>Sign up free</a> — no credit card required.
              </Callout>
            </Section>

            {/* Prerequisites */}
            <Section id="prerequisites" title="Prerequisites">
              <ul style={ul}>
                <li>A Cloudach API key (from your <a href="/dashboard/api-keys" style={linkStyle}>dashboard</a>)</li>
                {lang === 'python' && <li>Python 3.9+ with <Code>openai</Code> SDK: <Code>pip install openai</Code></li>}
                {lang === 'node' && <li>Node.js 18+ with <Code>openai</Code> SDK: <Code>npm install openai</Code></li>}
                {lang === 'curl' && <li>curl (pre-installed on macOS/Linux; use Git Bash or WSL on Windows)</li>}
              </ul>
            </Section>

            {/* System prompt */}
            <Section id="system-prompt" title="Step 1 — Write the system prompt">
              <p style={p}>
                The system prompt defines who the bot is and what it knows. Keep it concise and factual.
                Llama 3 follows instructions well — you don't need to over-engineer it.
              </p>

              {lang === 'python' && (
                <CodeBlock>{`SYSTEM_PROMPT = """You are Aria, a helpful customer support assistant for Cloudach.

Cloudach is an OpenAI-compatible LLM API that hosts Llama 3, Mistral, and Mixtral models.
You help developers with API questions, billing, rate limits, and debugging.

Rules:
- Be concise and direct. Developers prefer short answers.
- Always include a code example when explaining an API concept.
- If you don't know something, say so and link to docs.cloudach.com.
- Never make up pricing or SLA numbers — refer users to the pricing page.
"""`}</CodeBlock>
              )}
              {lang === 'node' && (
                <CodeBlock>{`const SYSTEM_PROMPT = \`You are Aria, a helpful customer support assistant for Cloudach.

Cloudach is an OpenAI-compatible LLM API that hosts Llama 3, Mistral, and Mixtral models.
You help developers with API questions, billing, rate limits, and debugging.

Rules:
- Be concise and direct. Developers prefer short answers.
- Always include a code example when explaining an API concept.
- If you don't know something, say so and link to docs.cloudach.com.
- Never make up pricing or SLA numbers — refer users to the pricing page.
\`;`}</CodeBlock>
              )}
              {lang === 'curl' && (
                <CodeBlock>{`# System prompt is sent as the first message in the messages array.
# We'll show a full curl example in Step 4.`}</CodeBlock>
              )}
            </Section>

            {/* Context management */}
            <Section id="context-management" title="Step 2 — Manage conversation context">
              <p style={p}>
                LLMs are stateless — every request is independent. To maintain a conversation,
                you pass the full message history on each call. Keep the last N turns to stay within the context window.
              </p>

              {lang === 'python' && (
                <CodeBlock>{`from openai import OpenAI
from collections import deque

client = OpenAI(
    api_key="sk-cloudach-YOUR_KEY",
    base_url="https://api.cloudach.com/v1",
)

MAX_HISTORY = 10  # number of user+assistant turn pairs to keep

history = deque(maxlen=MAX_HISTORY * 2)  # *2 because each turn = user + assistant

def chat(user_message: str) -> str:
    history.append({"role": "user", "content": user_message})

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + list(history)

    response = client.chat.completions.create(
        model="llama3-70b",
        messages=messages,
        stream=False,
    )

    reply = response.choices[0].message.content
    history.append({"role": "assistant", "content": reply})
    return reply`}</CodeBlock>
              )}
              {lang === 'node' && (
                <CodeBlock>{`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-cloudach-YOUR_KEY",
  baseURL: "https://api.cloudach.com/v1",
});

const MAX_HISTORY = 10;
const history = [];

async function chat(userMessage) {
  history.push({ role: "user", content: userMessage });

  // Keep only the last MAX_HISTORY turn pairs
  const trimmed = history.slice(-MAX_HISTORY * 2);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...trimmed,
  ];

  const response = await client.chat.completions.create({
    model: "llama3-70b",
    messages,
  });

  const reply = response.choices[0].message.content;
  history.push({ role: "assistant", content: reply });
  return reply;
}`}</CodeBlock>
              )}
              {lang === 'curl' && (
                <CodeBlock>{`# With curl you manage context yourself by building the messages array.
# Each request must include the full conversation history.

curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-cloudach-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama3-70b",
    "messages": [
      {"role": "system",    "content": "You are Aria, a Cloudach support bot..."},
      {"role": "user",      "content": "What is the rate limit?"},
      {"role": "assistant", "content": "The rate limit is 60 RPM and 1M tokens/day per key."},
      {"role": "user",      "content": "How do I increase it?"}
    ]
  }'`}</CodeBlock>
              )}
            </Section>

            {/* Streaming */}
            <Section id="streaming" title="Step 3 — Stream the response">
              <p style={p}>
                Streaming makes your bot feel instant. Instead of waiting for the full reply,
                you print each token as it arrives. This is especially important for long answers.
              </p>

              {lang === 'python' && (
                <CodeBlock>{`def chat_stream(user_message: str):
    """Stream tokens to stdout as they arrive."""
    history.append({"role": "user", "content": user_message})

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + list(history)

    stream = client.chat.completions.create(
        model="llama3-70b",
        messages=messages,
        stream=True,
    )

    full_reply = ""
    for chunk in stream:
        token = chunk.choices[0].delta.content or ""
        print(token, end="", flush=True)
        full_reply += token

    print()  # newline after stream ends
    history.append({"role": "assistant", "content": full_reply})`}</CodeBlock>
              )}
              {lang === 'node' && (
                <CodeBlock>{`async function chatStream(userMessage) {
  history.push({ role: "user", content: userMessage });
  const trimmed = history.slice(-MAX_HISTORY * 2);

  const stream = await client.chat.completions.create({
    model: "llama3-70b",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
    stream: true,
  });

  let fullReply = "";
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? "";
    process.stdout.write(token);
    fullReply += token;
  }
  process.stdout.write("\\n");

  history.push({ role: "assistant", content: fullReply });
}`}</CodeBlock>
              )}
              {lang === 'curl' && (
                <CodeBlock>{`# Add "stream": true to get Server-Sent Events.
# Each line is "data: {...}" or "data: [DONE]".

curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-cloudach-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  --no-buffer \\
  -d '{
    "model": "llama3-70b",
    "messages": [
      {"role": "system", "content": "You are Aria, a Cloudach support bot."},
      {"role": "user",   "content": "Explain streaming in one sentence."}
    ],
    "stream": true
  }'

# Output:
# data: {"id":"chatcmpl-abc","choices":[{"delta":{"role":"assistant","content":""},"index":0}]}
# data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"Streaming "},"index":0}]}
# data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"sends tokens"},"index":0}]}
# ...
# data: [DONE]`}</CodeBlock>
              )}
            </Section>

            {/* Full example */}
            <Section id="full-example" title="Step 4 — Full working example">
              <p style={p}>Put it all together into a terminal chatbot you can run right now.</p>

              {lang === 'python' && (
                <CodeBlock>{`#!/usr/bin/env python3
"""Cloudach customer support bot — terminal demo."""
from openai import OpenAI
from collections import deque

SYSTEM_PROMPT = """You are Aria, a helpful customer support assistant for Cloudach.
Be concise. Include code examples when explaining API concepts."""

client = OpenAI(
    api_key="sk-cloudach-YOUR_KEY",
    base_url="https://api.cloudach.com/v1",
)
history = deque(maxlen=20)

def chat_stream(user_message: str):
    history.append({"role": "user", "content": user_message})
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + list(history)

    stream = client.chat.completions.create(
        model="llama3-70b",
        messages=messages,
        stream=True,
    )

    full_reply = ""
    print("\\nAria: ", end="", flush=True)
    for chunk in stream:
        token = chunk.choices[0].delta.content or ""
        print(token, end="", flush=True)
        full_reply += token
    print()

    history.append({"role": "assistant", "content": full_reply})

def main():
    print("Cloudach Support Bot (Llama 3 70B) — type 'quit' to exit\\n")
    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not user_input or user_input.lower() in ("quit", "exit"):
            break
        chat_stream(user_input)

if __name__ == "__main__":
    main()`}</CodeBlock>
              )}
              {lang === 'node' && (
                <CodeBlock>{`#!/usr/bin/env node
// Cloudach customer support bot — terminal demo
import OpenAI from "openai";
import * as readline from "readline";

const SYSTEM_PROMPT =
  "You are Aria, a helpful customer support assistant for Cloudach. Be concise. Include code examples when explaining API concepts.";

const client = new OpenAI({
  apiKey: "sk-cloudach-YOUR_KEY",
  baseURL: "https://api.cloudach.com/v1",
});

const MAX_HISTORY = 10;
const history = [];

async function chatStream(userMessage) {
  history.push({ role: "user", content: userMessage });
  const trimmed = history.slice(-MAX_HISTORY * 2);

  const stream = await client.chat.completions.create({
    model: "llama3-70b",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
    stream: true,
  });

  let fullReply = "";
  process.stdout.write("\\nAria: ");
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? "";
    process.stdout.write(token);
    fullReply += token;
  }
  process.stdout.write("\\n");
  history.push({ role: "assistant", content: fullReply });
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log("Cloudach Support Bot (Llama 3 70B) — type 'quit' to exit\\n");

function prompt() {
  rl.question("You: ", async (input) => {
    const msg = input.trim();
    if (!msg || msg === "quit" || msg === "exit") {
      rl.close();
      return;
    }
    await chatStream(msg);
    prompt();
  });
}

prompt();`}</CodeBlock>
              )}
              {lang === 'curl' && (
                <CodeBlock>{`#!/bin/bash
# Cloudach support bot — single-turn curl example with streaming
# For multi-turn, build the messages array manually between calls.

SYSTEM="You are Aria, a Cloudach support bot. Be concise. Include code examples."
USER_MESSAGE="How do I switch from OpenAI to Cloudach in Python?"

curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-cloudach-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  --no-buffer \\
  -d "{
    \\"model\\": \\"llama3-70b\\",
    \\"messages\\": [
      {\\"role\\": \\"system\\", \\"content\\": \\"$SYSTEM\\"},
      {\\"role\\": \\"user\\",   \\"content\\": \\"$USER_MESSAGE\\"}
    ],
    \\"stream\\": true
  }" | while IFS= read -r line; do
    # Strip "data: " prefix
    data=\${line#data: }
    [[ "$data" == "[DONE]" ]] && break
    [[ -z "$data" ]] && continue
    # Extract content token with Python
    token=$(echo "$data" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(d['choices'][0].get('delta',{}).get('content',''),end='')
" 2>/dev/null)
    printf '%s' "$token"
  done
echo`}</CodeBlock>
              )}
            </Section>

            {/* Production tips */}
            <Section id="production" title="Step 5 — Production tips">
              <h3 style={h3}>Handle rate limit errors</h3>
              {lang === 'python' && (
                <CodeBlock>{`import time
from openai import RateLimitError

def chat_with_retry(user_message: str, retries: int = 3):
    for attempt in range(retries):
        try:
            return chat_stream(user_message)
        except RateLimitError as e:
            if attempt == retries - 1:
                raise
            wait = 2 ** attempt  # exponential backoff: 1s, 2s, 4s
            print(f"Rate limited. Retrying in {wait}s...")
            time.sleep(wait)`}</CodeBlock>
              )}
              {lang === 'node' && (
                <CodeBlock>{`async function chatWithRetry(userMessage, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await chatStream(userMessage);
    } catch (err) {
      if (err?.status === 429 && attempt < retries - 1) {
        const wait = 2 ** attempt * 1000; // 1s, 2s, 4s
        console.error(\`Rate limited. Retrying in \${wait / 1000}s...\`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}`}</CodeBlock>
              )}
              {lang === 'curl' && (
                <CodeBlock>{`# Check for 429 and retry with backoff
for i in 1 2 3; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \\
    -H "Authorization: Bearer sk-cloudach-YOUR_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{"model":"llama3-70b","messages":[...]}' \\
    https://api.cloudach.com/v1/chat/completions)
  if [[ "$STATUS" != "429" ]]; then break; fi
  echo "Rate limited. Retrying in ${i}s..."
  sleep $i
done`}</CodeBlock>
              )}

              <h3 style={h3}>Keep the system prompt lean</h3>
              <p style={p}>
                Every token in your system prompt costs tokens on every request. 200–400 tokens is usually enough.
                If you need to include large knowledge bases (product docs, FAQs), use retrieval-augmented generation (RAG)
                and inject only the relevant context per request.
              </p>

              <h3 style={h3}>Model selection</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 16 }}>
                <thead>
                  <tr>
                    {['Use case', 'Recommended model', 'Why'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #E5E7EB', fontWeight: 600, color: '#374151' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['High-volume FAQ bot', 'llama3-8b', 'Fastest, cheapest, great for structured replies'],
                    ['Complex support queries', 'llama3-70b', 'Better reasoning, handles edge cases'],
                    ['Long conversation history', 'mistral-7b', '32K context window'],
                    ['Highest accuracy', 'mixtral-8x7b', 'MoE model, best for nuanced tasks'],
                  ].map(([uc, model, why], i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontSize: 13 }}>{uc}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}>
                        <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>{model}</code>
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280', fontSize: 13 }}>{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Callout>
                Need higher rate limits or a dedicated GPU? <a href="mailto:sales@cloudach.com" style={linkStyle}>Contact sales</a> for enterprise plans.
              </Callout>
            </Section>

            {/* Next steps */}
            <div style={{ marginTop: 48, padding: '24px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>What's next</h3>
              <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.9, fontSize: 14, color: '#374151' }}>
                <li>Read the <Link href="/docs#streaming" style={linkStyle}>Streaming docs</Link> for details on parsing SSE chunks</li>
                <li>Check the <Link href="/docs#rate-limits" style={linkStyle}>Rate Limits</Link> section to plan your retry logic</li>
                <li>See the <Link href="/changelog" style={linkStyle}>Changelog</Link> for new models and features</li>
                <li>Join <a href="mailto:support@cloudach.com" style={linkStyle}>support@cloudach.com</a> for help</li>
              </ul>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
              <Link href="/docs" style={{ color: '#9CA3AF', textDecoration: 'none' }}>API Docs</Link>
              <Link href="/changelog" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Changelog</Link>
              <a href="mailto:support@cloudach.com" style={{ color: '#9CA3AF', textDecoration: 'none' }}>support@cloudach.com</a>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #E5E7EB' }}>{title}</h2>
      {children}
    </section>
  );
}

function LangTabs({ lang, onLang }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 32, borderBottom: '2px solid #E5E7EB', paddingBottom: 0 }}>
      {[['python', 'Python'], ['node', 'Node.js'], ['curl', 'cURL']].map(([key, label]) => (
        <button
          key={key}
          onClick={() => onLang(key)}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            borderBottom: lang === key ? '2px solid rgba(255,255,255,0.55)' : '2px solid transparent',
            background: 'transparent',
            color: lang === key ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.38)',
            cursor: 'pointer',
            marginBottom: -2,
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
    <div style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid rgba(255,255,255,0.25)', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 14, color: 'rgba(255,255,255,0.80)', marginBottom: 16 }}>
      {children}
    </div>
  );
}

const p = { fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 16 };
const h3 = { fontSize: 17, fontWeight: 600, marginTop: 24, marginBottom: 12, color: '#0D0F1A' };
const ul = { paddingLeft: 20, marginBottom: 16, lineHeight: 1.8, color: '#374151', fontSize: 15 };
const linkStyle = { color: 'rgba(255,255,255,0.72)', textDecoration: 'none' };
