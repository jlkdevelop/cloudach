import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function LangChainTutorial() {
  const [step, setStep] = useState('basic');

  return (
    <>
      <Head>
        <title>LangChain Integration Guide — Cloudach</title>
        <meta name="description" content="Use Cloudach as a ChatModel provider in LangChain. Drop-in setup with ChatOpenAI, LCEL chains, and streaming — complete Python examples included." />
        <meta property="og:title" content="LangChain Integration — Cloudach" />
        <meta property="og:description" content="Use Cloudach (Llama 3, Mistral, Mixtral) as the LLM backend in LangChain with ChatOpenAI. Full code examples." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/tutorials/langchain" />
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
          <Link href="/docs#integrations" style={{ fontSize: 14, fontWeight: 500, color: '#4F6EF7', textDecoration: 'none' }}>Integrations</Link>
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
                ['#overview', 'Overview'],
                ['#install', 'Install'],
                ['#basic-usage', '1. Basic usage'],
                ['#streaming', '2. Streaming'],
                ['#lcel', '3. LCEL chains'],
                ['#full-example', '4. Full example'],
                ['#models', 'Models'],
              ].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', padding: '5px 0', fontSize: 13, color: '#6B7280', textDecoration: 'none', lineHeight: 1.4 }}>
                  {label}
                </a>
              ))}
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Also see</div>
                <Link href="/tutorials/llamaindex" style={{ display: 'block', padding: '5px 0', fontSize: 13, color: '#4F6EF7', textDecoration: 'none' }}>LlamaIndex guide</Link>
                <Link href="/docs" style={{ display: 'block', padding: '5px 0', fontSize: 13, color: '#4F6EF7', textDecoration: 'none' }}>API reference</Link>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>
              <Link href="/docs" style={{ color: '#4F6EF7', textDecoration: 'none' }}>Docs</Link>
              <span>/</span>
              <Link href="/docs#integrations" style={{ color: '#4F6EF7', textDecoration: 'none' }}>Integrations</Link>
              <span>/</span>
              <span>LangChain</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Beginner</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>~10 min</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Python</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12 }}>
                LangChain integration
              </h1>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 0 }}>
                Use Cloudach as a <Code>ChatOpenAI</Code> provider in LangChain.
                Because Cloudach is fully OpenAI-compatible, you only need to change two config values.
                This guide covers basic chat, streaming, and building LCEL chains.
              </p>
            </div>

            {/* Overview */}
            <Section id="overview" title="Overview">
              <p style={p}>What you'll learn:</p>
              <ul style={ul}>
                <li>Configure <Code>ChatOpenAI</Code> to use Cloudach models (Llama 3, Mistral, Mixtral)</li>
                <li>Stream tokens as they're generated</li>
                <li>Build a prompt → model → parser chain with LangChain Expression Language (LCEL)</li>
                <li>Run a complete multi-question demo script</li>
              </ul>
              <Callout>
                You need a Cloudach API key.{' '}
                <a href="/signup" style={linkStyle}>Sign up free</a> — no credit card required.
              </Callout>
            </Section>

            {/* Install */}
            <Section id="install" title="Install">
              <CodeBlock>{`pip install langchain langchain-openai`}</CodeBlock>
              <p style={p}>Set your API key in the environment (recommended) or pass it directly in code:</p>
              <CodeBlock>{`export CLOUDACH_API_KEY="sk-cloudach-YOUR_KEY"`}</CodeBlock>
            </Section>

            {/* Basic usage */}
            <Section id="basic-usage" title="Step 1 — Basic usage">
              <p style={p}>
                Instantiate <Code>ChatOpenAI</Code> with <Code>openai_api_base</Code> pointing at Cloudach and your Cloudach API key.
                Everything else — <Code>invoke</Code>, <Code>batch</Code>, tool calling — works identically to the OpenAI version.
              </p>
              <CodeBlock>{`import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatOpenAI(
    model="llama3-70b",
    openai_api_key=os.environ["CLOUDACH_API_KEY"],
    openai_api_base="https://api.cloudach.com/v1",
    temperature=0.7,
)

messages = [
    SystemMessage(content="You are a concise technical assistant."),
    HumanMessage(content="What is the difference between a process and a thread?"),
]

response = llm.invoke(messages)
print(response.content)`}</CodeBlock>

              <Callout>
                <strong>Model choice:</strong> Use <Code>llama3-8b</Code> for fast, high-volume pipelines and <Code>llama3-70b</Code> or <Code>mixtral-8x7b</Code> for complex reasoning.
              </Callout>
            </Section>

            {/* Streaming */}
            <Section id="streaming" title="Step 2 — Streaming">
              <p style={p}>
                Pass <Code>streaming=True</Code> to the constructor, then call <Code>.stream()</Code> on your chain or LLM.
                Each chunk is a <Code>BaseMessageChunk</Code> with a <Code>.content</Code> string.
              </p>
              <CodeBlock>{`from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(
    model="llama3-70b",
    openai_api_key=os.environ["CLOUDACH_API_KEY"],
    openai_api_base="https://api.cloudach.com/v1",
    streaming=True,
)

for chunk in llm.stream([HumanMessage(content="Write a haiku about open source software.")]):
    print(chunk.content, end="", flush=True)
print()`}</CodeBlock>
            </Section>

            {/* LCEL */}
            <Section id="lcel" title="Step 3 — LCEL chains">
              <p style={p}>
                LangChain Expression Language (LCEL) lets you compose prompts, models, and parsers with the <Code>|</Code> pipe operator.
                The chain is lazy and composable — the same chain can be invoked, streamed, or batched.
              </p>

              <h3 style={h3}>Basic chain</h3>
              <CodeBlock>{`from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(
    model="llama3-70b",
    openai_api_key=os.environ["CLOUDACH_API_KEY"],
    openai_api_base="https://api.cloudach.com/v1",
)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a concise technical writer. Answer in 2–3 sentences."),
    ("human", "{question}"),
])

chain = prompt | llm | StrOutputParser()

# Invoke (returns a string)
answer = chain.invoke({"question": "What is retrieval-augmented generation?"})
print(answer)`}</CodeBlock>

              <h3 style={h3}>Stream a chain</h3>
              <CodeBlock>{`for token in chain.stream({"question": "Explain LLM temperature in plain English."}):
    print(token, end="", flush=True)
print()`}</CodeBlock>

              <h3 style={h3}>Batch multiple inputs</h3>
              <CodeBlock>{`questions = [
    {"question": "What is a vector database?"},
    {"question": "What is a transformer?"},
    {"question": "What is fine-tuning?"},
]

answers = chain.batch(questions)
for q, a in zip(questions, answers):
    print(f"Q: {q['question']}")
    print(f"A: {a}\\n")`}</CodeBlock>
            </Section>

            {/* Full example */}
            <Section id="full-example" title="Step 4 — Complete working script">
              <p style={p}>
                Save as <Code>cloudach_langchain.py</Code> and run with:
              </p>
              <CodeBlock>{`CLOUDACH_API_KEY=sk-cloudach-YOUR_KEY python cloudach_langchain.py`}</CodeBlock>

              <CodeBlock>{`#!/usr/bin/env python3
"""Cloudach + LangChain integration demo.

Install:
    pip install langchain langchain-openai

Run:
    CLOUDACH_API_KEY=sk-cloudach-YOUR_KEY python cloudach_langchain.py
"""
import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# ── Configure ───────────────────────────────────────────────────────────────
llm = ChatOpenAI(
    model="llama3-70b",
    openai_api_key=os.environ["CLOUDACH_API_KEY"],
    openai_api_base="https://api.cloudach.com/v1",
    temperature=0.7,
    streaming=True,
)

# ── Build a chain ───────────────────────────────────────────────────────────
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Be concise and direct."),
    ("human", "{question}"),
])

chain = prompt | llm | StrOutputParser()

# ── Run it ───────────────────────────────────────────────────────────────────
questions = [
    "What makes Llama 3 different from GPT-4?",
    "Give me a Python one-liner to flatten a list of lists.",
    "Explain tokens in 30 words.",
]

for q in questions:
    print(f"\\nQ: {q}\\nA: ", end="", flush=True)
    for token in chain.stream({"question": q}):
        print(token, end="", flush=True)
    print()
`}</CodeBlock>
            </Section>

            {/* Models */}
            <Section id="models" title="Available models">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 16 }}>
                <thead>
                  <tr>
                    {['Model ID', 'Context', 'Best for'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #E5E7EB', fontWeight: 600, color: '#374151' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['llama3-8b',    '8K',  'Fast responses, high-volume pipelines'],
                    ['llama3-70b',   '8K',  'Complex reasoning, nuanced answers'],
                    ['mistral-7b',   '32K', 'Long documents, code generation'],
                    ['mixtral-8x7b', '32K', 'Highest accuracy, complex tasks'],
                  ].map(([id, ctx, best], i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6' }}>
                        <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>{id}</code>
                      </td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{ctx}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* Next steps */}
            <div style={{ marginTop: 48, padding: '24px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>What&apos;s next</h3>
              <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 1.9, fontSize: 14, color: '#374151' }}>
                <li><Link href="/tutorials/llamaindex" style={linkStyle}>LlamaIndex integration</Link> — use Cloudach in RAG pipelines and query engines</li>
                <li><Link href="/docs#rate-limits" style={linkStyle}>Rate limits</Link> — plan your retry logic</li>
                <li><Link href="/docs#sdks" style={linkStyle}>SDK compatibility</Link> — other frameworks that work with Cloudach</li>
                <li><a href="mailto:support@cloudach.com" style={linkStyle}>support@cloudach.com</a> — questions or feedback</li>
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

const p = { fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 16 };
const h3 = { fontSize: 17, fontWeight: 600, marginTop: 24, marginBottom: 12, color: '#0D0F1A' };
const ul = { paddingLeft: 20, marginBottom: 16, lineHeight: 1.8, color: '#374151', fontSize: 15 };
const linkStyle = { color: '#4F6EF7', textDecoration: 'none' };
