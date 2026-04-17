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
  SubHeading,
  TutorialFooterLinks,
} from '../../components/tutorial/Parts';

const TOC = [
  ['#overview', 'Overview'],
  ['#install', 'Install'],
  ['#basic-usage', '1. Basic usage'],
  ['#streaming', '2. Streaming'],
  ['#lcel', '3. LCEL chains'],
  ['#full-example', '4. Full example'],
  ['#models', 'Models'],
];

export default function LangChainTutorial() {
  return (
    <TutorialLayout
      title="LangChain Integration Guide — Cloudach"
      description="Use Cloudach as a ChatModel provider in LangChain. Drop-in setup with ChatOpenAI, LCEL chains, and streaming — complete Python examples included."
      ogUrl="https://cloudach.com/tutorials/langchain"
      toc={TOC}
    >
      <Breadcrumb
        trail={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs#integrations', label: 'Integrations' },
          { label: 'LangChain' },
        ]}
      />

      <TutorialHeader
        level="Beginner"
        duration="~10 min"
        tags={['Python']}
        title="LangChain integration"
        lede={
          <>
            Use Cloudach as a <InlineCode>ChatOpenAI</InlineCode> provider in LangChain. Because
            Cloudach is fully OpenAI-compatible, you only need to change two config values. This
            guide covers basic chat, streaming, and building LCEL chains.
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
            Configure <InlineCode>ChatOpenAI</InlineCode> to use Cloudach models (Llama 3, Mistral,
            Mixtral)
          </li>
          <li>Stream tokens as they're generated</li>
          <li>Build a prompt → model → parser chain with LangChain Expression Language (LCEL)</li>
          <li>Run a complete multi-question demo script</li>
        </ul>
        <Callout>
          You need a Cloudach API key. <A href="/signup">Sign up free</A> — no credit card required.
        </Callout>
      </Section>

      <Section id="install" title="Install">
        <CodeBlock language="bash">{`pip install langchain langchain-openai`}</CodeBlock>
        <P>
          Set your API key in the environment (recommended) or pass it directly in code:
        </P>
        <CodeBlock language="bash">{`export CLOUDACH_API_KEY="sk-cloudach-YOUR_KEY"`}</CodeBlock>
      </Section>

      <Section id="basic-usage" title="Step 1 — Basic usage">
        <P>
          Instantiate <InlineCode>ChatOpenAI</InlineCode> with <InlineCode>openai_api_base</InlineCode>{' '}
          pointing at Cloudach and your Cloudach API key. Everything else — {' '}
          <InlineCode>invoke</InlineCode>, <InlineCode>batch</InlineCode>, tool calling — works
          identically to the OpenAI version.
        </P>
        <CodeBlock language="python">{`import os
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
          <strong>Model choice:</strong> Use <InlineCode>llama3-8b</InlineCode> for fast,
          high-volume pipelines and <InlineCode>llama3-70b</InlineCode> or{' '}
          <InlineCode>mixtral-8x7b</InlineCode> for complex reasoning.
        </Callout>
      </Section>

      <Section id="streaming" title="Step 2 — Streaming">
        <P>
          Pass <InlineCode>streaming=True</InlineCode> to the constructor, then call{' '}
          <InlineCode>.stream()</InlineCode> on your chain or LLM. Each chunk is a{' '}
          <InlineCode>BaseMessageChunk</InlineCode> with a <InlineCode>.content</InlineCode> string.
        </P>
        <CodeBlock language="python">{`from langchain_openai import ChatOpenAI
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

      <Section id="lcel" title="Step 3 — LCEL chains">
        <P>
          LangChain Expression Language (LCEL) lets you compose prompts, models, and parsers with
          the <InlineCode>|</InlineCode> pipe operator. The chain is lazy and composable — the same
          chain can be invoked, streamed, or batched.
        </P>

        <SubHeading>Basic chain</SubHeading>
        <CodeBlock language="python">{`from langchain_openai import ChatOpenAI
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

        <SubHeading>Stream a chain</SubHeading>
        <CodeBlock language="python">{`for token in chain.stream({"question": "Explain LLM temperature in plain English."}):
    print(token, end="", flush=True)
print()`}</CodeBlock>

        <SubHeading>Batch multiple inputs</SubHeading>
        <CodeBlock language="python">{`questions = [
    {"question": "What is a vector database?"},
    {"question": "What is a transformer?"},
    {"question": "What is fine-tuning?"},
]

answers = chain.batch(questions)
for q, a in zip(questions, answers):
    print(f"Q: {q['question']}")
    print(f"A: {a}\\n")`}</CodeBlock>
      </Section>

      <Section id="full-example" title="Step 4 — Complete working script">
        <P>
          Save as <InlineCode>cloudach_langchain.py</InlineCode> and run with:
        </P>
        <CodeBlock language="bash">{`CLOUDACH_API_KEY=sk-cloudach-YOUR_KEY python cloudach_langchain.py`}</CodeBlock>

        <CodeBlock language="python">{`#!/usr/bin/env python3
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
              ['llama3-70b', '8K', 'Complex reasoning, nuanced answers'],
              ['mistral-7b', '32K', 'Long documents, code generation'],
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
              href="/tutorials/llamaindex"
              style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
            >
              LlamaIndex integration
            </Link>{' '}
            — use Cloudach in RAG pipelines and query engines
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
