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
  ['#next-steps', 'Next steps'],
];

export default function PythonQuickstart() {
  return (
    <TutorialLayout
      title="Python SDK Quickstart — Cloudach"
      description="Get started with Cloudach in Python in under 5 minutes. Install the OpenAI SDK, configure your client, and make your first chat completion."
      ogUrl="https://cloudach.com/tutorials/python-quickstart"
      toc={TOC}
    >
      <Breadcrumb
        trail={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs#tutorials', label: 'Tutorials' },
          { label: 'Python quickstart' },
        ]}
      />

      <TutorialHeader
        level="Beginner"
        duration="~5 min"
        tags={['Python']}
        title="Python SDK Quickstart"
        lede={
          <>
            Cloudach is OpenAI-compatible. You use the standard <InlineCode>openai</InlineCode> Python
            package — just point it at Cloudach's base URL. No new SDK to learn.
          </>
        }
      />

      <Section id="install" title="1. Install">
        <P>Install the OpenAI Python SDK (v1.0 or later):</P>
        <CodeBlock language="bash">{`pip install openai`}</CodeBlock>
        <P>If you're using a virtual environment or conda, activate it first.</P>
      </Section>

      <Section id="configure" title="2. Configure">
        <P>
          Create the client with your Cloudach API key and base URL. Store your key in an
          environment variable — never hard-code it in source files.
        </P>
        <CodeBlock language="python">{`import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)`}</CodeBlock>
        <Callout>
          Your key looks like <InlineCode>sk-cloudach-...</InlineCode>. Get one from the{' '}
          <A href="/dashboard/api-keys">Dashboard → API Keys</A> page.
        </Callout>
      </Section>

      <Section id="first-call" title="3. First call">
        <P>Make your first chat completion — 5 lines of logic:</P>
        <CodeBlock language="python">{`import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)

response = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
)

print(response.choices[0].message.content)
# → "The capital of France is Paris."
print(f"Tokens used: {response.usage.total_tokens}")`}</CodeBlock>
        <P>Run it:</P>
        <CodeBlock language="bash">{`CLOUDACH_API_KEY=sk-cloudach-... python your_script.py`}</CodeBlock>
      </Section>

      <Section id="system-prompt" title="4. Add a system prompt">
        <P>
          Use the <InlineCode>system</InlineCode> role to give the model a persona or set of
          instructions. It always comes first in the messages array.
        </P>
        <CodeBlock language="python">{`response = client.chat.completions.create(
    model="llama3-8b",
    messages=[
        {"role": "system", "content": "You are a concise technical assistant. Reply in plain text only."},
        {"role": "user",   "content": "Explain what a REST API is in one sentence."},
    ],
)

print(response.choices[0].message.content)`}</CodeBlock>
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
              ['model', 'str', '—', 'Required. Model ID, e.g. "llama3-8b", "mixtral-8x7b"'],
              ['messages', 'list', '—', 'Required. List of {"role", "content"} dicts'],
              ['temperature', 'float', '1.0', 'Randomness: 0.0 = deterministic, 2.0 = very random'],
              ['max_tokens', 'int', 'model max', 'Hard cap on response length in tokens'],
              ['stream', 'bool', 'False', 'Set True to receive tokens as they are generated'],
              ['top_p', 'float', '1.0', 'Nucleus sampling threshold (alternative to temperature)'],
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
        <CodeBlock language="python">{`# Example with optional parameters
response = client.chat.completions.create(
    model="llama3-70b",
    messages=[{"role": "user", "content": "Write a haiku about distributed systems."}],
    temperature=0.8,
    max_tokens=100,
)`}</CodeBlock>
      </Section>

      <Section id="streaming" title="6. Streaming">
        <P>
          Set <InlineCode>stream=True</InlineCode> to receive tokens as they are generated. The
          response becomes an iterator of chunks instead of a single object.
        </P>
        <CodeBlock language="python">{`stream = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "Count from 1 to 5 slowly."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)

print()  # newline after stream ends`}</CodeBlock>
        <Callout>
          Streaming dramatically improves perceived latency — users see the first token in ~1s
          instead of waiting for the full response. Use it in any interactive UI.
        </Callout>
      </Section>

      <Section id="next-steps" title="Next steps">
        <NextStepCards
          items={[
            { href: '/tutorials/streaming', label: 'Streaming guide', desc: 'Deep dive: async streaming, error handling, and backpressure' },
            { href: '/tutorials/migrate-from-openai', label: 'Migrate from OpenAI', desc: 'Exact diff to switch an existing OpenAI app to Cloudach' },
            { href: '/tutorials/langchain', label: 'LangChain integration', desc: 'Use Cloudach as a ChatOpenAI drop-in within LangChain' },
            { href: '/docs#sdks', label: 'SDK reference', desc: 'All methods, parameters, and return types' },
          ]}
        />
      </Section>

      <TutorialFooterLinks />
    </TutorialLayout>
  );
}
