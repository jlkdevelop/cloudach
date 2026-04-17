import { useState } from 'react';
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
  LangTabs,
  NextStepCards,
  TutorialFooterLinks,
} from '../../components/tutorial/Parts';

const TOC = [
  ['#tldr', 'TL;DR — 2 changes'],
  ['#python', 'Python'],
  ['#nodejs', 'Node.js'],
  ['#env-vars', 'Environment variables'],
  ['#model-mapping', 'Model mapping'],
  ['#what-works', 'What works'],
  ['#what-differs', 'What differs'],
  ['#next-steps', 'Next steps'],
];

const LANG_OPTIONS = [
  ['python', 'Python'],
  ['node', 'Node.js'],
];

export default function MigrateFromOpenAI() {
  const [lang, setLang] = useState('python');

  return (
    <TutorialLayout
      title="Migrate from OpenAI to Cloudach in 2 Minutes — Cloudach"
      description="Switch from OpenAI to Cloudach with two code changes: update your base URL and API key. No other changes needed — full OpenAI SDK compatibility."
      ogUrl="https://cloudach.com/tutorials/migrate-from-openai"
      toc={TOC}
    >
      <Breadcrumb
        trail={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs#tutorials', label: 'Tutorials' },
          { label: 'Migrate from OpenAI' },
        ]}
      />

      <TutorialHeader
        level="Beginner"
        duration="~2 min"
        title="Migrate from OpenAI to Cloudach in 2 minutes"
        lede={
          <>
            Cloudach implements the OpenAI REST API. You keep the same SDK, the same request shapes,
            and the same response shapes. The only changes are your <strong>base URL</strong> and{' '}
            <strong>API key</strong>.
          </>
        }
      />

      <Section id="tldr" title="TL;DR — 2 changes">
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 10,
            padding: '20px 24px',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#15803D', marginBottom: 12 }}>
            The entire migration
          </div>
          <LangTabs value={lang} onChange={setLang} options={LANG_OPTIONS} />
          {lang === 'python' && (
            <DiffPair
              before={`from openai import OpenAI

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
)`}
              after={`from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)`}
            />
          )}
          {lang === 'node' && (
            <DiffPair
              before={`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});`}
              after={`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});`}
            />
          )}
          <div style={{ fontSize: 13, color: '#15803D', marginTop: 14 }}>
            Everything else — request bodies, response shapes, streaming, error types — stays
            identical.
          </div>
        </div>
      </Section>

      <Section id="python" title="Python — full before/after">
        <P>A complete example showing the only two lines that change:</P>
        <CodeBlock language="python">{`# BEFORE — OpenAI
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],   # ← remove
)

response = client.chat.completions.create(
    model="gpt-4o-mini",                    # ← update model name (see mapping below)
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)`}</CodeBlock>

        <CodeBlock language="python">{`# AFTER — Cloudach (2 changes: base_url + api_key env var name, model name)
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",  # ← add this
    api_key=os.environ["CLOUDACH_API_KEY"],  # ← update env var name
)

response = client.chat.completions.create(
    model="llama3-70b",                      # ← use a Cloudach model ID
    messages=[{"role": "user", "content": "Hello!"}],
)
print(response.choices[0].message.content)  # identical output format`}</CodeBlock>
      </Section>

      <Section id="nodejs" title="Node.js — full before/after">
        <CodeBlock language="javascript">{`// BEFORE — OpenAI
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,   // ← remove
});

const response = await client.chat.completions.create({
  model: "gpt-4o-mini",                // ← update model name
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);`}</CodeBlock>

        <CodeBlock language="javascript">{`// AFTER — Cloudach (2 changes: baseURL + apiKey env var name, model name)
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",  // ← add this
  apiKey: process.env.CLOUDACH_API_KEY,    // ← update env var name
});

const response = await client.chat.completions.create({
  model: "llama3-70b",                     // ← use a Cloudach model ID
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);  // identical output format`}</CodeBlock>
      </Section>

      <Section id="env-vars" title="Environment variables">
        <P>
          Update your <InlineCode>.env</InlineCode> file:
        </P>
        <CodeBlock language="bash">{`# BEFORE
OPENAI_API_KEY=sk-...

# AFTER
CLOUDACH_API_KEY=sk-cloudach-...`}</CodeBlock>
        <P>
          And wherever you set environment variables in production (Vercel, Railway, Fly.io, AWS
          Secrets Manager, etc.).
        </P>
        <Callout>
          Get your Cloudach API key from the <A href="/dashboard/api-keys">Dashboard → API Keys</A>{' '}
          page. It will look like <InlineCode>sk-cloudach-xxxxxxxxxxxxxxxx...</InlineCode>.
        </Callout>
      </Section>

      <Section id="model-mapping" title="Model mapping">
        <P>Replace OpenAI model IDs with the closest Cloudach equivalent:</P>
        <table className="tutorial-table">
          <thead>
            <tr>
              {['OpenAI model', 'Cloudach equivalent', 'Notes'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['gpt-4o', 'llama3-70b', 'High quality, complex reasoning'],
              ['gpt-4o-mini', 'llama3-8b', 'Fast, cost-efficient, everyday tasks'],
              ['gpt-3.5-turbo', 'llama3-8b', 'Drop-in for basic chat and completions'],
              ['gpt-4-turbo', 'mixtral-8x7b', 'Best accuracy with mixture-of-experts'],
              ['gpt-4', 'llama3-70b', 'High-quality reasoning tasks'],
            ].map(([openai, cloudach, notes]) => (
              <tr key={openai}>
                <td><InlineCode>{openai}</InlineCode></td>
                <td>
                  <code
                    className="tutorial-inline-code"
                    style={{
                      background: '#ECFDF5',
                      color: '#047857',
                      borderColor: 'rgba(4,120,87,0.18)',
                    }}
                  >
                    {cloudach}
                  </code>
                </td>
                <td>{notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <P>
          See the full <A href="/docs#models-list">model list</A> for all available models and their
          context window sizes.
        </P>
      </Section>

      <Section id="what-works" title="What works identically">
        <P>These features work with zero code changes beyond base URL and API key:</P>
        <ul
          style={{
            fontSize: 14,
            color: 'var(--color-ink-muted)',
            lineHeight: 1.9,
            paddingLeft: 20,
          }}
        >
          {[
            'chat.completions.create — all parameters (temperature, max_tokens, top_p, stream, etc.)',
            'Streaming via Server-Sent Events — same chunk format and delta structure',
            'System, user, and assistant message roles',
            'Multi-turn conversation history',
            'completions.create (legacy text completions)',
            'models.list and models.retrieve',
            'Error response shape — same JSON schema, same HTTP status codes',
            'OpenAI SDK error classes (APIStatusError, APIConnectionError, etc.)',
            'Retry-After header on 429 responses',
            'LangChain ChatOpenAI, LlamaIndex OpenAILike, LiteLLM — all work unchanged',
          ].map((item) => (
            <li key={item} style={{ marginBottom: 2 }}>
              <span style={{ color: 'var(--color-success)', marginRight: 8 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="what-differs" title="What differs">
        <P>A small number of OpenAI features are not available on Cloudach:</P>
        <ul
          style={{
            fontSize: 14,
            color: 'var(--color-ink-muted)',
            lineHeight: 1.9,
            paddingLeft: 20,
          }}
        >
          {[
            ['Function calling / tool use', 'Not yet supported — on the roadmap'],
            ['Vision / image inputs', 'Text-only models for now'],
            ['Embeddings API (/v1/embeddings)', 'Not available — use a dedicated embedding service'],
            ['Audio / TTS / Whisper', 'Not available'],
            ['Assistants API, Files API', 'Not available'],
            ['Fine-tuning API', 'Not available — contact sales for custom model hosting'],
          ].map(([feature, note]) => (
            <li key={feature} style={{ marginBottom: 4 }}>
              <span style={{ color: 'var(--color-danger)', marginRight: 8 }}>✗</span>
              <strong>{feature}</strong> — {note}
            </li>
          ))}
        </ul>
        <Callout>
          Need a feature that's missing? <A href="mailto:support@cloudach.com">Email support</A> or
          watch the <A href="/changelog">changelog</A> for updates.
        </Callout>
      </Section>

      <Section id="next-steps" title="Next steps">
        <NextStepCards
          items={[
            { href: '/tutorials/python-quickstart', label: 'Python quickstart', desc: 'Install, configure, and start calling the API' },
            { href: '/tutorials/nodejs-quickstart', label: 'Node.js quickstart', desc: 'ESM, CommonJS, and TypeScript setup' },
            { href: '/tutorials/streaming', label: 'Streaming guide', desc: 'Async streaming, error handling, and backpressure' },
            { href: '/docs#sdks', label: 'SDK reference', desc: 'All methods, parameters, and return types' },
          ]}
        />
      </Section>

      <TutorialFooterLinks />
    </TutorialLayout>
  );
}

function DiffPair({ before, after }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#B91C1C',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Before (OpenAI)
        </div>
        <pre
          style={{
            background: '#0D1117',
            color: '#FCA5A5',
            padding: 14,
            borderRadius: 6,
            fontSize: 12,
            lineHeight: 1.6,
            margin: 0,
            overflowX: 'auto',
            fontFamily:
              "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {before}
        </pre>
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#15803D',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          After (Cloudach)
        </div>
        <pre
          style={{
            background: '#0D1117',
            color: '#86EFAC',
            padding: 14,
            borderRadius: 6,
            fontSize: 12,
            lineHeight: 1.6,
            margin: 0,
            overflowX: 'auto',
            fontFamily:
              "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          {after}
        </pre>
      </div>
    </div>
  );
}
