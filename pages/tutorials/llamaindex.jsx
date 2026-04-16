import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function LlamaIndexTutorial() {
  return (
    <>
      <Head>
        <title>LlamaIndex Integration Guide — Cloudach</title>
        <meta name="description" content="Use Cloudach as an LLM backend in LlamaIndex. Configure the OpenAI LLM class to use Llama 3, Mistral, or Mixtral via Cloudach — complete Python examples included." />
        <meta property="og:title" content="LlamaIndex Integration — Cloudach" />
        <meta property="og:description" content="Use Cloudach (Llama 3, Mistral, Mixtral) as the LLM backend in LlamaIndex. Full code examples for completions, chat, streaming, and RAG." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/tutorials/llamaindex" />
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
          <Link href="/docs#integrations" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>Integrations</Link>
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
                ['#install', 'Install'],
                ['#basic-usage', '1. Basic usage'],
                ['#chat', '2. Chat messages'],
                ['#streaming', '3. Streaming'],
                ['#global-settings', '4. Global settings'],
                ['#rag', '5. RAG pipeline'],
                ['#full-example', '6. Full example'],
                ['#models', 'Models'],
              ].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', padding: '5px 0', fontSize: 13, color: '#6B7280', textDecoration: 'none', lineHeight: 1.4 }}>
                  {label}
                </a>
              ))}
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Also see</div>
                <Link href="/tutorials/langchain" style={{ display: 'block', padding: '5px 0', fontSize: 13, color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>LangChain guide</Link>
                <Link href="/docs" style={{ display: 'block', padding: '5px 0', fontSize: 13, color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>API reference</Link>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>
              <Link href="/docs" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>Docs</Link>
              <span>/</span>
              <Link href="/docs#integrations" style={{ color: 'rgba(255,255,255,0.72)', textDecoration: 'none' }}>Integrations</Link>
              <span>/</span>
              <span>LlamaIndex</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Beginner</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>~10 min</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>Python</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12 }}>
                LlamaIndex integration
              </h1>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 0 }}>
                Use Cloudach as the LLM backend in LlamaIndex. Cloudach is OpenAI-compatible, so the
                built-in <Code>OpenAI</Code> LLM class works with two configuration changes: set
                <Code>api_base</Code> and <Code>api_key</Code> to your Cloudach values.
                This guide covers completions, chat, streaming, global settings, and a simple RAG pipeline.
              </p>
            </div>

            {/* Overview */}
            <Section id="overview" title="Overview">
              <p style={p}>What you&apos;ll learn:</p>
              <ul style={ul}>
                <li>Configure the LlamaIndex <Code>OpenAI</Code> class to use Cloudach models</li>
                <li>Send chat messages and stream completions</li>
                <li>Set Cloudach as the global default LLM with <Code>Settings.llm</Code></li>
                <li>Build a minimal RAG query engine backed by Cloudach</li>
              </ul>
              <Callout>
                You need a Cloudach API key.{' '}
                <a href="/signup" style={linkStyle}>Sign up free</a> — no credit card required.
              </Callout>
            </Section>

            {/* Install */}
            <Section id="install" title="Install">
              <CodeBlock>{`pip install llama-index llama-index-llms-openai`}</CodeBlock>
              <p style={p}>Set your API key in the environment:</p>
              <CodeBlock>{`export CLOUDACH_API_KEY="sk-cloudach-YOUR_KEY"`}</CodeBlock>
            </Section>

            {/* Basic usage */}
            <Section id="basic-usage" title="Step 1 — Basic completion">
              <p style={p}>
                Pass <Code>api_base</Code> and <Code>api_key</Code> to the <Code>OpenAI</Code> constructor.
                Then call <Code>.complete()</Code> with a prompt string.
              </p>
              <CodeBlock>{`import os
from llama_index.llms.openai import OpenAI

llm = OpenAI(
    model="llama3-70b",
    api_key=os.environ["CLOUDACH_API_KEY"],
    api_base="https://api.cloudach.com/v1",
    temperature=0.7,
)

response = llm.complete("The three laws of robotics are")
print(response.text)`}</CodeBlock>
            </Section>

            {/* Chat */}
            <Section id="chat" title="Step 2 — Chat messages">
              <p style={p}>
                Use <Code>ChatMessage</Code> objects to send system and user turns.
                The response is a <Code>ChatResponse</Code> with a <Code>.message.content</Code> string.
              </p>
              <CodeBlock>{`from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage, MessageRole

llm = OpenAI(
    model="llama3-70b",
    api_key=os.environ["CLOUDACH_API_KEY"],
    api_base="https://api.cloudach.com/v1",
)

messages = [
    ChatMessage(role=MessageRole.SYSTEM, content="You are a concise technical assistant."),
    ChatMessage(role=MessageRole.USER, content="What is retrieval-augmented generation?"),
]

response = llm.chat(messages)
print(response.message.content)`}</CodeBlock>
            </Section>

            {/* Streaming */}
            <Section id="streaming" title="Step 3 — Streaming">
              <p style={p}>
                <Code>stream_complete</Code> and <Code>stream_chat</Code> return generators.
                Each item has a <Code>.delta</Code> attribute containing the new token(s).
              </p>
              <CodeBlock>{`from llama_index.llms.openai import OpenAI

llm = OpenAI(
    model="llama3-70b",
    api_key=os.environ["CLOUDACH_API_KEY"],
    api_base="https://api.cloudach.com/v1",
)

# Stream a completion
stream = llm.stream_complete("Explain vector databases in plain English:")
for chunk in stream:
    print(chunk.delta, end="", flush=True)
print()

# Stream a chat
from llama_index.core.llms import ChatMessage, MessageRole
messages = [
    ChatMessage(role=MessageRole.USER, content="Summarize what a transformer is in 2 sentences."),
]
for chunk in llm.stream_chat(messages):
    print(chunk.delta, end="", flush=True)
print()`}</CodeBlock>
            </Section>

            {/* Global settings */}
            <Section id="global-settings" title="Step 4 — Global LLM settings">
              <p style={p}>
                Set Cloudach as the default LLM for all LlamaIndex operations in your session.
                Any index or query engine you build after this will use it automatically.
              </p>
              <CodeBlock>{`from llama_index.core import Settings
from llama_index.llms.openai import OpenAI

Settings.llm = OpenAI(
    model="llama3-70b",
    api_key=os.environ["CLOUDACH_API_KEY"],
    api_base="https://api.cloudach.com/v1",
    temperature=0.1,  # lower = more deterministic for RAG
)`}</CodeBlock>
            </Section>

            {/* RAG */}
            <Section id="rag" title="Step 5 — Simple RAG pipeline">
              <p style={p}>
                Build a vector index from local documents and query it with Cloudach.
                For embeddings, use a local HuggingFace model (no extra API key needed).
              </p>
              <CodeBlock>{`from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

# pip install llama-index-embeddings-huggingface sentence-transformers

# Configure LLM and embedder
Settings.llm = OpenAI(
    model="llama3-70b",
    api_key=os.environ["CLOUDACH_API_KEY"],
    api_base="https://api.cloudach.com/v1",
    temperature=0.1,
)
Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Load documents from ./data (plain text, PDF, HTML, etc.)
documents = SimpleDirectoryReader("./data").load_data()

# Build the index (embeds and stores vectors in memory)
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine()
response = query_engine.query("What are the main topics covered in these documents?")
print(response)`}</CodeBlock>
              <Callout>
                <strong>Tip:</strong> For production, replace the in-memory vector store with a persistent one like
                Chroma, Pinecone, or pgvector. LlamaIndex has first-class support for all three.
              </Callout>
            </Section>

            {/* Full example */}
            <Section id="full-example" title="Step 6 — Complete working script">
              <p style={p}>
                Save as <Code>cloudach_llamaindex.py</Code> and run with:
              </p>
              <CodeBlock>{`CLOUDACH_API_KEY=sk-cloudach-YOUR_KEY python cloudach_llamaindex.py`}</CodeBlock>

              <CodeBlock>{`#!/usr/bin/env python3
"""Cloudach + LlamaIndex integration demo.

Install:
    pip install llama-index llama-index-llms-openai

Run:
    CLOUDACH_API_KEY=sk-cloudach-YOUR_KEY python cloudach_llamaindex.py
"""
import os
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage, MessageRole

# ── Configure ───────────────────────────────────────────────────────────────
llm = OpenAI(
    model="llama3-70b",
    api_key=os.environ["CLOUDACH_API_KEY"],
    api_base="https://api.cloudach.com/v1",
    temperature=0.7,
)
Settings.llm = llm

# ── Completion ───────────────────────────────────────────────────────────────
print("=== Completion ===")
response = llm.complete("List three benefits of open-source LLMs:")
print(response.text)

# ── Chat ─────────────────────────────────────────────────────────────────────
print("\\n=== Chat ===")
messages = [
    ChatMessage(role=MessageRole.SYSTEM, content="You are a concise technical assistant."),
    ChatMessage(role=MessageRole.USER, content="What is the difference between RAG and fine-tuning?"),
]
chat_response = llm.chat(messages)
print(chat_response.message.content)

# ── Streaming completion ──────────────────────────────────────────────────────
print("\\n=== Streaming ===")
stream = llm.stream_complete("Explain embeddings in 2 sentences:")
for chunk in stream:
    print(chunk.delta, end="", flush=True)
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
                    ['llama3-70b',   '8K',  'Complex reasoning, RAG synthesis'],
                    ['mistral-7b',   '32K', 'Long documents, large context windows'],
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
                <li><Link href="/tutorials/langchain" style={linkStyle}>LangChain integration</Link> — build LCEL chains and agents with Cloudach</li>
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
    <div style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid rgba(255,255,255,0.25)', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 14, color: 'rgba(255,255,255,0.80)', marginBottom: 16 }}>
      {children}
    </div>
  );
}

const p = { fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 16 };
const ul = { paddingLeft: 20, marginBottom: 16, lineHeight: 1.8, color: '#374151', fontSize: 15 };
const linkStyle = { color: 'rgba(255,255,255,0.72)', textDecoration: 'none' };
