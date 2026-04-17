import { useState } from 'react';
import Link from 'next/link';
import TutorialLayout from '../../components/TutorialLayout';
import {
  Breadcrumb,
  TutorialHeader,
  Section,
  SubHeading,
  P,
  A,
  InlineCode,
  Callout,
  CodeBlock,
  LangTabs,
  TutorialFooterLinks,
} from '../../components/tutorial/Parts';

const TOC = [
  ['#overview', 'Overview'],
  ['#prerequisites', 'Prerequisites'],
  ['#system-prompt', '1. System prompt'],
  ['#context-management', '2. Context management'],
  ['#streaming', '3. Streaming responses'],
  ['#full-example', '4. Full example'],
  ['#production', '5. Production tips'],
];

const LANG_OPTIONS = [
  ['python', 'Python'],
  ['node', 'Node.js'],
  ['curl', 'cURL'],
];

export default function CustomerSupportBotTutorial() {
  const [lang, setLang] = useState('python');

  return (
    <TutorialLayout
      title="Build a Customer Support Bot with Cloudach and Llama 3 — Cloudach Tutorials"
      description="Step-by-step tutorial: build a streaming customer support bot with Cloudach and Llama 3 70B. Covers context management, streaming responses, and production deployment."
      ogUrl="https://cloudach.com/tutorials/customer-support-bot"
      toc={TOC}
    >
      <Breadcrumb
        trail={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs#tutorials', label: 'Tutorials' },
          { label: 'Customer support bot' },
        ]}
      />

      <TutorialHeader
        level="Intermediate"
        duration="~20 min"
        title="Build a customer support bot with Cloudach and Llama 3"
        lede="In this tutorial you'll build a production-ready customer support chatbot that streams responses in real-time, maintains conversation context across turns, and handles errors gracefully. We'll use Llama 3 70B for high-quality responses and the Cloudach streaming API."
      />

      <div style={{ marginBottom: 24 }}>
        <LangTabs value={lang} onChange={setLang} options={LANG_OPTIONS} />
      </div>

      <Section id="overview" title="Overview">
        <P>What you'll build:</P>
        <ul style={ulStyle}>
          <li>A chatbot that answers questions about your product using a custom system prompt</li>
          <li>Streaming responses so users see text as it's generated (no waiting for the full reply)</li>
          <li>A conversation history that keeps context across multiple turns</li>
          <li>Graceful error handling and retry logic</li>
        </ul>

        <Callout>
          You'll need a Cloudach API key. <A href="/signup">Sign up free</A> — no credit card
          required.
        </Callout>
      </Section>

      <Section id="prerequisites" title="Prerequisites">
        <ul style={ulStyle}>
          <li>
            A Cloudach API key (from your <A href="/dashboard/api-keys">dashboard</A>)
          </li>
          {lang === 'python' && (
            <li>
              Python 3.9+ with <InlineCode>openai</InlineCode> SDK:{' '}
              <InlineCode>pip install openai</InlineCode>
            </li>
          )}
          {lang === 'node' && (
            <li>
              Node.js 18+ with <InlineCode>openai</InlineCode> SDK:{' '}
              <InlineCode>npm install openai</InlineCode>
            </li>
          )}
          {lang === 'curl' && (
            <li>curl (pre-installed on macOS/Linux; use Git Bash or WSL on Windows)</li>
          )}
        </ul>
      </Section>

      <Section id="system-prompt" title="Step 1 — Write the system prompt">
        <P>
          The system prompt defines who the bot is and what it knows. Keep it concise and factual.
          Llama 3 follows instructions well — you don't need to over-engineer it.
        </P>

        {lang === 'python' && (
          <CodeBlock language="python">{`SYSTEM_PROMPT = """You are Aria, a helpful customer support assistant for Cloudach.

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
          <CodeBlock language="javascript">{`const SYSTEM_PROMPT = \`You are Aria, a helpful customer support assistant for Cloudach.

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

      <Section id="context-management" title="Step 2 — Manage conversation context">
        <P>
          LLMs are stateless — every request is independent. To maintain a conversation, you pass
          the full message history on each call. Keep the last N turns to stay within the context
          window.
        </P>

        {lang === 'python' && (
          <CodeBlock language="python">{`from openai import OpenAI
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
          <CodeBlock language="javascript">{`import OpenAI from "openai";

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
          <CodeBlock language="bash">{`# With curl you manage context yourself by building the messages array.
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

      <Section id="streaming" title="Step 3 — Stream the response">
        <P>
          Streaming makes your bot feel instant. Instead of waiting for the full reply, you print
          each token as it arrives. This is especially important for long answers.
        </P>

        {lang === 'python' && (
          <CodeBlock language="python">{`def chat_stream(user_message: str):
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
          <CodeBlock language="javascript">{`async function chatStream(userMessage) {
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
          <CodeBlock language="bash">{`# Add "stream": true to get Server-Sent Events.
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

      <Section id="full-example" title="Step 4 — Full working example">
        <P>Put it all together into a terminal chatbot you can run right now.</P>

        {lang === 'python' && (
          <CodeBlock language="python">{`#!/usr/bin/env python3
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
          <CodeBlock language="javascript">{`#!/usr/bin/env node
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
          <CodeBlock language="bash">{`#!/bin/bash
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

      <Section id="production" title="Step 5 — Production tips">
        <SubHeading>Handle rate limit errors</SubHeading>
        {lang === 'python' && (
          <CodeBlock language="python">{`import time
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
          <CodeBlock language="javascript">{`async function chatWithRetry(userMessage, retries = 3) {
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
          <CodeBlock language="bash">{`# Check for 429 and retry with backoff
for i in 1 2 3; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \\
    -H "Authorization: Bearer sk-cloudach-YOUR_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{"model":"llama3-70b","messages":[...]}' \\
    https://api.cloudach.com/v1/chat/completions)
  if [[ "$STATUS" != "429" ]]; then break; fi
  echo "Rate limited. Retrying in \${i}s..."
  sleep $i
done`}</CodeBlock>
        )}

        <SubHeading>Keep the system prompt lean</SubHeading>
        <P>
          Every token in your system prompt costs tokens on every request. 200–400 tokens is
          usually enough. If you need to include large knowledge bases (product docs, FAQs), use
          retrieval-augmented generation (RAG) and inject only the relevant context per request.
        </P>

        <SubHeading>Model selection</SubHeading>
        <table className="tutorial-table">
          <thead>
            <tr>
              {['Use case', 'Recommended model', 'Why'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['High-volume FAQ bot', 'llama3-8b', 'Fastest, cheapest, great for structured replies'],
              ['Complex support queries', 'llama3-70b', 'Better reasoning, handles edge cases'],
              ['Long conversation history', 'mistral-7b', '32K context window'],
              ['Highest accuracy', 'mixtral-8x7b', 'MoE model, best for nuanced tasks'],
            ].map(([uc, model, why]) => (
              <tr key={uc}>
                <td>{uc}</td>
                <td><InlineCode>{model}</InlineCode></td>
                <td>{why}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Callout>
          Need higher rate limits or a dedicated GPU?{' '}
          <A href="mailto:sales@cloudach.com">Contact sales</A> for enterprise plans.
        </Callout>
      </Section>

      <div
        style={{
          marginTop: 48,
          padding: 24,
          background: 'var(--color-surface-alt)',
          borderRadius: 12,
          border: '1px solid var(--color-rule)',
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 12,
            color: 'var(--color-ink)',
          }}
        >
          What's next
        </h3>
        <ul
          style={{
            paddingLeft: 20,
            margin: 0,
            lineHeight: 1.9,
            fontSize: 14,
            color: 'var(--color-ink-muted)',
          }}
        >
          <li>
            Read the{' '}
            <Link
              href="/docs#streaming"
              style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
            >
              Streaming docs
            </Link>{' '}
            for details on parsing SSE chunks
          </li>
          <li>
            Check the{' '}
            <Link
              href="/docs#rate-limits"
              style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
            >
              Rate Limits
            </Link>{' '}
            section to plan your retry logic
          </li>
          <li>
            See the{' '}
            <Link
              href="/changelog"
              style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
            >
              Changelog
            </Link>{' '}
            for new models and features
          </li>
          <li>
            Join{' '}
            <a
              href="mailto:support@cloudach.com"
              style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
            >
              support@cloudach.com
            </a>{' '}
            for help
          </li>
        </ul>
      </div>

      <TutorialFooterLinks />
    </TutorialLayout>
  );
}

const ulStyle = {
  paddingLeft: 20,
  marginBottom: 16,
  lineHeight: 1.8,
  color: 'var(--color-ink-muted)',
  fontSize: 15,
};
