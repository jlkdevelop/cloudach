import Link from 'next/link';
import TutorialLayout from '../../components/TutorialLayout';
import {
  Breadcrumb,
  TutorialHeader,
  Section,
  P,
  A,
  InlineCode,
  Callout,
  CodeBlock,
  TutorialFooterLinks,
} from '../../components/tutorial/Parts';

const TOC = [
  ['#overview', 'Overview'],
  ['#install', 'Install'],
  ['#basic-usage', '1. Basic usage'],
  ['#chat', '2. Chat messages'],
  ['#streaming', '3. Streaming'],
  ['#global-settings', '4. Global settings'],
  ['#rag', '5. RAG pipeline'],
  ['#full-example', '6. Full example'],
  ['#models', 'Models'],
];

export default function LlamaIndexTutorial() {
  return (
    <TutorialLayout
      title="LlamaIndex Integration Guide — Cloudach"
      description="Use Cloudach as an LLM backend in LlamaIndex. Configure the OpenAI LLM class to use Llama 3, Mistral, or Mixtral via Cloudach — complete Python examples included."
      ogUrl="https://cloudach.com/tutorials/llamaindex"
      toc={TOC}
    >
      <Breadcrumb
        trail={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs#integrations', label: 'Integrations' },
          { label: 'LlamaIndex' },
        ]}
      />

      <TutorialHeader
        level="Beginner"
        duration="~10 min"
        tags={['Python']}
        title="LlamaIndex integration"
        lede={
          <>
            Use Cloudach as the LLM backend in LlamaIndex. Cloudach is OpenAI-compatible, so the
            built-in <InlineCode>OpenAI</InlineCode> LLM class works with two configuration changes:
            set <InlineCode>api_base</InlineCode> and <InlineCode>api_key</InlineCode> to your
            Cloudach values. This guide covers completions, chat, streaming, global settings, and a
            simple RAG pipeline.
          </>
        }
      />

      <Section id="overview" title="Overview">
        <P>What you'll learn:</P>
        <ul
          style={{
            paddingLeft: 20,
            marginBottom: 16,
            lineHeight: 1.8,
            color: 'var(--color-ink-muted)',
            fontSize: 15,
          }}
        >
          <li>
            Configure the LlamaIndex <InlineCode>OpenAI</InlineCode> class to use Cloudach models
          </li>
          <li>Send chat messages and stream completions</li>
          <li>
            Set Cloudach as the global default LLM with <InlineCode>Settings.llm</InlineCode>
          </li>
          <li>Build a minimal RAG query engine backed by Cloudach</li>
        </ul>
        <Callout>
          You need a Cloudach API key. <A href="/signup">Sign up free</A> — no credit card required.
        </Callout>
      </Section>

      <Section id="install" title="Install">
        <CodeBlock language="bash">{`pip install llama-index llama-index-llms-openai`}</CodeBlock>
        <P>Set your API key in the environment:</P>
        <CodeBlock language="bash">{`export CLOUDACH_API_KEY="sk-cloudach-YOUR_KEY"`}</CodeBlock>
      </Section>

      <Section id="basic-usage" title="Step 1 — Basic completion">
        <P>
          Pass <InlineCode>api_base</InlineCode> and <InlineCode>api_key</InlineCode> to the{' '}
          <InlineCode>OpenAI</InlineCode> constructor. Then call <InlineCode>.complete()</InlineCode>{' '}
          with a prompt string.
        </P>
        <CodeBlock language="python">{`import os
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

      <Section id="chat" title="Step 2 — Chat messages">
        <P>
          Use <InlineCode>ChatMessage</InlineCode> objects to send system and user turns. The
          response is a <InlineCode>ChatResponse</InlineCode> with a{' '}
          <InlineCode>.message.content</InlineCode> string.
        </P>
        <CodeBlock language="python">{`from llama_index.llms.openai import OpenAI
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

      <Section id="streaming" title="Step 3 — Streaming">
        <P>
          <InlineCode>stream_complete</InlineCode> and <InlineCode>stream_chat</InlineCode> return
          generators. Each item has a <InlineCode>.delta</InlineCode> attribute containing the new
          token(s).
        </P>
        <CodeBlock language="python">{`from llama_index.llms.openai import OpenAI

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

      <Section id="global-settings" title="Step 4 — Global LLM settings">
        <P>
          Set Cloudach as the default LLM for all LlamaIndex operations in your session. Any index
          or query engine you build after this will use it automatically.
        </P>
        <CodeBlock language="python">{`from llama_index.core import Settings
from llama_index.llms.openai import OpenAI

Settings.llm = OpenAI(
    model="llama3-70b",
    api_key=os.environ["CLOUDACH_API_KEY"],
    api_base="https://api.cloudach.com/v1",
    temperature=0.1,  # lower = more deterministic for RAG
)`}</CodeBlock>
      </Section>

      <Section id="rag" title="Step 5 — Simple RAG pipeline">
        <P>
          Build a vector index from local documents and query it with Cloudach. For embeddings, use
          a local HuggingFace model (no extra API key needed).
        </P>
        <CodeBlock language="python">{`from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
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
          <strong>Tip:</strong> For production, replace the in-memory vector store with a persistent
          one like Chroma, Pinecone, or pgvector. LlamaIndex has first-class support for all three.
        </Callout>
      </Section>

      <Section id="full-example" title="Step 6 — Complete working script">
        <P>
          Save as <InlineCode>cloudach_llamaindex.py</InlineCode> and run with:
        </P>
        <CodeBlock language="bash">{`CLOUDACH_API_KEY=sk-cloudach-YOUR_KEY python cloudach_llamaindex.py`}</CodeBlock>

        <CodeBlock language="python">{`#!/usr/bin/env python3
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

      <Section id="models" title="Available models">
        <table className="tutorial-table">
          <thead>
            <tr>
              {['Model ID', 'Context', 'Best for'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['llama3-8b', '8K', 'Fast responses, high-volume pipelines'],
              ['llama3-70b', '8K', 'Complex reasoning, RAG synthesis'],
              ['mistral-7b', '32K', 'Long documents, large context windows'],
              ['mixtral-8x7b', '32K', 'Highest accuracy, complex tasks'],
            ].map(([id, ctx, best]) => (
              <tr key={id}>
                <td><InlineCode>{id}</InlineCode></td>
                <td>{ctx}</td>
                <td>{best}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <Link
              href="/tutorials/langchain"
              style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
            >
              LangChain integration
            </Link>{' '}
            — build LCEL chains and agents with Cloudach
          </li>
          <li>
            <Link
              href="/docs#rate-limits"
              style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
            >
              Rate limits
            </Link>{' '}
            — plan your retry logic
          </li>
          <li>
            <Link
              href="/docs#sdks"
              style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
            >
              SDK compatibility
            </Link>{' '}
            — other frameworks that work with Cloudach
          </li>
          <li>
            <a
              href="mailto:support@cloudach.com"
              style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
            >
              support@cloudach.com
            </a>{' '}
            — questions or feedback
          </li>
        </ul>
      </div>

      <TutorialFooterLinks />
    </TutorialLayout>
  );
}
