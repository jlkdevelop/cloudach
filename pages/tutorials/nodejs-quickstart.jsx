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
  NextStepCards,
  TutorialFooterLinks,
} from '../../components/tutorial/Parts';

const TOC = [
  ['#install', '1. Install'],
  ['#configure', '2. Configure'],
  ['#first-call', '3. First call'],
  ['#system-prompt', '4. System prompt'],
  ['#parameters', '5. Parameters'],
  ['#streaming', '6. Streaming'],
  ['#typescript', 'TypeScript'],
  ['#next-steps', 'Next steps'],
];

export default function NodejsQuickstart() {
  return (
    <TutorialLayout
      title="Node.js SDK Quickstart — Cloudach"
      description="Get started with Cloudach in Node.js in under 5 minutes. Install the OpenAI SDK, configure your client, and make your first chat completion."
      ogUrl="https://cloudach.com/tutorials/nodejs-quickstart"
      toc={TOC}
    >
      <Breadcrumb
        trail={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs#tutorials', label: 'Tutorials' },
          { label: 'Node.js quickstart' },
        ]}
      />

      <TutorialHeader
        level="Beginner"
        duration="~5 min"
        tags={['Node.js', 'TypeScript']}
        title="Node.js SDK Quickstart"
        lede={
          <>
            Cloudach is OpenAI-compatible. You use the official <InlineCode>openai</InlineCode> npm
            package — just point it at Cloudach's base URL. No new SDK to learn. Works with ESM,
            CommonJS, and TypeScript.
          </>
        }
      />

      <Section id="install" title="1. Install">
        <P>Install the OpenAI SDK (v4 or later):</P>
        <CodeBlock language="bash">{`npm install openai`}</CodeBlock>
        <P>Or with yarn / pnpm:</P>
        <CodeBlock language="bash">{`yarn add openai
# or
pnpm add openai`}</CodeBlock>
      </Section>

      <Section id="configure" title="2. Configure">
        <P>
          Create the client with your Cloudach API key and base URL. Store your key in an
          environment variable — never commit it to source control.
        </P>
        <CodeBlock language="javascript">{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});`}</CodeBlock>
        <Callout>
          Your key looks like <InlineCode>sk-cloudach-...</InlineCode>. Get one from the{' '}
          <A href="/dashboard/api-keys">Dashboard → API Keys</A> page. For local development, put
          it in a <InlineCode>.env</InlineCode> file and load it with <InlineCode>dotenv</InlineCode>.
        </Callout>
      </Section>

      <Section id="first-call" title="3. First call">
        <P>Make your first chat completion — 5 lines of logic:</P>
        <CodeBlock language="javascript">{`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});

const response = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "What is the capital of France?" }],
});

console.log(response.choices[0].message.content);
// → "The capital of France is Paris."
console.log(\`Tokens used: \${response.usage.total_tokens}\`);`}</CodeBlock>
        <P>Run it (Node.js 18+ with ESM or top-level await):</P>
        <CodeBlock language="bash">{`CLOUDACH_API_KEY=sk-cloudach-... node --input-type=module < your_script.js`}</CodeBlock>
        <P>
          Or with a <InlineCode>package.json</InlineCode> that has{' '}
          <InlineCode>"type": "module"</InlineCode>:
        </P>
        <CodeBlock language="bash">{`CLOUDACH_API_KEY=sk-cloudach-... node your_script.js`}</CodeBlock>
      </Section>

      <Section id="system-prompt" title="4. Add a system prompt">
        <P>
          Use the <InlineCode>system</InlineCode> role to give the model a persona or instructions.
          It always comes first in the messages array.
        </P>
        <CodeBlock language="javascript">{`const response = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [
    { role: "system", content: "You are a concise technical assistant. Reply in plain text only." },
    { role: "user",   content: "Explain what a REST API is in one sentence." },
  ],
});

console.log(response.choices[0].message.content);`}</CodeBlock>
      </Section>

      <Section id="parameters" title="5. Key parameters">
        <P>
          The most useful parameters for <InlineCode>chat.completions.create</InlineCode>:
        </P>
        <table className="tutorial-table">
          <thead>
            <tr>
              {['Parameter', 'Type', 'Default', 'Description'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['model', 'string', '—', 'Required. Model ID, e.g. "llama3-8b", "mixtral-8x7b"'],
              ['messages', 'array', '—', 'Required. Array of {role, content} objects'],
              ['temperature', 'number', '1.0', 'Randomness: 0.0 = deterministic, 2.0 = very random'],
              ['max_tokens', 'number', 'model max', 'Hard cap on response length in tokens'],
              ['stream', 'boolean', 'false', 'Set true to receive tokens as they are generated'],
              ['top_p', 'number', '1.0', 'Nucleus sampling threshold (alternative to temperature)'],
            ].map(([param, type, def_, desc]) => (
              <tr key={param}>
                <td><InlineCode>{param}</InlineCode></td>
                <td>{type}</td>
                <td>{def_}</td>
                <td>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <CodeBlock language="javascript">{`const response = await client.chat.completions.create({
  model: "llama3-70b",
  messages: [{ role: "user", content: "Write a haiku about distributed systems." }],
  temperature: 0.8,
  max_tokens: 100,
});`}</CodeBlock>
      </Section>

      <Section id="streaming" title="6. Streaming">
        <P>
          Set <InlineCode>stream: true</InlineCode> to receive tokens as they are generated. Use{' '}
          <InlineCode>for await...of</InlineCode> to iterate over the stream.
        </P>
        <CodeBlock language="javascript">{`const stream = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Count from 1 to 5 slowly." }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}

process.stdout.write("\\n");`}</CodeBlock>
        <Callout>
          Streaming dramatically improves perceived latency — users see the first token in ~1s
          instead of waiting for the full response. Essential for any chat UI.
        </Callout>
      </Section>

      <Section id="typescript" title="TypeScript">
        <P>
          The <InlineCode>openai</InlineCode> package ships its own TypeScript types. No{' '}
          <InlineCode>@types/openai</InlineCode> needed.
        </P>
        <CodeBlock language="typescript">{`import OpenAI from "openai";
import type { ChatCompletion, ChatCompletionChunk } from "openai/resources";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY!,
});

// Non-streaming — strongly typed response
const response: ChatCompletion = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Hello!" }],
});

// Streaming — each chunk is ChatCompletionChunk
const stream = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Hello!" }],
  stream: true,
});

for await (const chunk of stream) {
  const delta: string | null = chunk.choices[0]?.delta?.content ?? null;
  if (delta) process.stdout.write(delta);
}`}</CodeBlock>
      </Section>

      <Section id="next-steps" title="Next steps">
        <NextStepCards
          items={[
            { href: '/tutorials/streaming', label: 'Streaming guide', desc: 'Deep dive: async streaming, error handling, and backpressure' },
            { href: '/tutorials/migrate-from-openai', label: 'Migrate from OpenAI', desc: 'Exact diff to switch an existing OpenAI app to Cloudach' },
            { href: '/tutorials/langchain', label: 'LangChain integration', desc: 'Use Cloudach as the LLM backend in LangChain' },
            { href: '/docs#sdks', label: 'SDK reference', desc: 'All methods, parameters, and return types' },
          ]}
        />
      </Section>

      <TutorialFooterLinks />
    </TutorialLayout>
  );
}
