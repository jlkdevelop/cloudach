import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function FineTuningTutorial() {
  const [copied, setCopied] = useState(null);

  function copy(key, text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <>
      <Head>
        <title>Fine-tune Llama 3 on your own data — Cloudach Tutorials</title>
        <meta name="description" content="Step-by-step tutorial: fine-tune Llama 3 8B on a custom dataset with Cloudach. Covers data prep, LoRA training, deployment, and inference." />
        <meta property="og:title" content="Fine-tune Llama 3 on your own data — Cloudach" />
        <meta property="og:description" content="Prepare a dataset, launch a LoRA fine-tune job, and run inference on your custom model in under 30 minutes." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/tutorials/fine-tuning-llama3" />
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
                ['#step-1', '1. Prepare dataset'],
                ['#step-2', '2. Upload dataset'],
                ['#step-3', '3. Launch job'],
                ['#step-4', '4. Monitor training'],
                ['#step-5', '5. Run inference'],
                ['#step-6', '6. Evaluate results'],
                ['#next-steps', 'Next steps'],
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
              <span>Fine-tuning Llama 3</span>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>Beginner</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>~30 min</span>
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5, marginBottom: 12 }}>
                Fine-tune Llama 3 on your own data
              </h1>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginBottom: 0 }}>
                In this tutorial you&apos;ll fine-tune Llama 3 8B on a customer support dataset using LoRA.
                By the end you&apos;ll have a custom model that replies in your brand&apos;s voice, deployed and ready
                for inference on Cloudach&apos;s API.
              </p>
            </div>

            {/* Overview */}
            <Section id="overview" title="Overview">
              <p style={p}>What you&apos;ll do:</p>
              <ol style={ol}>
                <li>Prepare a JSONL training dataset with chat-format examples</li>
                <li>Upload the dataset to Cloudach</li>
                <li>Launch a LoRA fine-tuning job on Llama 3 8B</li>
                <li>Monitor training loss in real time</li>
                <li>Run inference on your deployed custom model</li>
                <li>Evaluate the results against the base model</li>
              </ol>

              <Callout>
                You&apos;ll need a Cloudach API key.{' '}
                <Link href="/signup" style={linkStyle}>Sign up free</Link> — no credit card required.
              </Callout>

              <p style={p}>
                Fine-tuning with LoRA trains only a small set of adapter weights (≈ 0.1–1% of model parameters)
                rather than the full model. This is faster, cheaper, and often achieves equal or better results
                for domain adaptation tasks. Cloudach serves the adapter on top of the base model using vLLM,
                so you get the same sub-100ms latency as the base model.
              </p>
            </Section>

            {/* Prerequisites */}
            <Section id="prerequisites" title="Prerequisites">
              <ul style={ul}>
                <li>A Cloudach account and API key (<Link href="/signup" style={linkStyle}>sign up</Link>)</li>
                <li>Python 3.9+ or a terminal with <code style={inlineCode}>curl</code></li>
                <li>At least 100 training examples in JSONL format (we provide a sample below)</li>
              </ul>
            </Section>

            {/* Step 1 */}
            <Section id="step-1" title="Step 1 — Prepare your dataset">
              <p style={p}>
                Training data must be a <strong>.jsonl</strong> file where each line is a JSON object with a{' '}
                <code style={inlineCode}>messages</code> array. The format is identical to the OpenAI fine-tuning format.
              </p>

              <h3 style={h3}>Example line</h3>
              <CodeBlock onCopy={() => copy('ex', SAMPLES.example)}>
                {SAMPLES.example}
              </CodeBlock>

              <h3 style={h3}>Download our sample dataset</h3>
              <p style={p}>
                We provide a 50-example customer support dataset to use as a starting point or to test the workflow
                end-to-end before using your own data.
              </p>
              <CodeBlock onCopy={() => copy('dl', SAMPLES.downloadDataset)}>
                {SAMPLES.downloadDataset}
              </CodeBlock>

              <h3 style={h3}>Validate your file</h3>
              <p style={p}>Run this quick check before uploading to catch format errors:</p>
              <CodeBlock onCopy={() => copy('validate', SAMPLES.validateScript)}>
                {SAMPLES.validateScript}
              </CodeBlock>

              <Callout>
                Aim for at least 200–500 examples for meaningful domain adaptation. See the{' '}
                <a href="/docs#fine-tuning-quickstart" style={linkStyle}>Data Preparation Guide</a> for collection
                and cleaning tips.
              </Callout>
            </Section>

            {/* Step 2 */}
            <Section id="step-2" title="Step 2 — Upload your dataset">
              <p style={p}>Upload the JSONL file to get a dataset ID to reference in the fine-tuning job.</p>
              <CodeBlock onCopy={() => copy('upload', SAMPLES.upload)}>
                {SAMPLES.upload}
              </CodeBlock>

              <p style={p}>The response looks like:</p>
              <CodeBlock onCopy={() => copy('uploadResp', SAMPLES.uploadResponse)}>
                {SAMPLES.uploadResponse}
              </CodeBlock>

              <p style={p}>
                Save the <code style={inlineCode}>id</code> field (e.g. <code style={inlineCode}>ds-8f3a2b1c</code>) —
                you&apos;ll need it in the next step.
              </p>
            </Section>

            {/* Step 3 */}
            <Section id="step-3" title="Step 3 — Launch the fine-tuning job">
              <p style={p}>
                Create a LoRA fine-tuning job targeting <code style={inlineCode}>llama3-8b</code>.
                Replace <code style={inlineCode}>ds-8f3a2b1c</code> with your dataset ID.
              </p>
              <CodeBlock onCopy={() => copy('job', SAMPLES.createJob)}>
                {SAMPLES.createJob}
              </CodeBlock>

              <p style={p}>Response:</p>
              <CodeBlock onCopy={() => copy('jobResp', SAMPLES.createJobResponse)}>
                {SAMPLES.createJobResponse}
              </CodeBlock>

              <p style={p}>
                Save the job <code style={inlineCode}>id</code> (e.g. <code style={inlineCode}>ftjob-a1b2c3</code>).
                The job enters the <code style={inlineCode}>queued</code> state and starts within a few minutes.
              </p>

              <h3 style={h3}>Key parameters explained</h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    {['Parameter', 'Our value', 'What it does'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['lora.rank', '16', 'Controls adapter capacity. Higher = more expressive, higher cost. 16 is a good default.'],
                    ['lora.alpha', '32', 'Scaling factor (typically 2× rank).'],
                    ['n_epochs', '3', 'Training passes over the dataset. Start with 3; increase if loss is still falling.'],
                    ['batch_size', '16', 'Examples per gradient update. Larger = faster but uses more GPU memory.'],
                    ['suffix', 'support-bot', 'Appended to the deployed model ID so you can identify it.'],
                  ].map(([p2, v, desc]) => (
                    <tr key={p2}>
                      <td style={tdStyle}><code style={inlineCode}>{p2}</code></td>
                      <td style={tdStyle}><code style={inlineCode}>{v}</code></td>
                      <td style={tdStyle}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* Step 4 */}
            <Section id="step-4" title="Step 4 — Monitor training">
              <p style={p}>
                Poll the job endpoint to see status, training loss, and estimated finish time.
                Training a 50-example dataset typically takes 3–5 minutes; larger datasets scale linearly.
              </p>
              <CodeBlock onCopy={() => copy('poll', SAMPLES.pollJob)}>
                {SAMPLES.pollJob}
              </CodeBlock>

              <CodeBlock onCopy={() => copy('pollResp', SAMPLES.pollResponse)}>
                {SAMPLES.pollResponse}
              </CodeBlock>

              <p style={p}>When <code style={inlineCode}>status</code> changes to <code style={inlineCode}>succeeded</code>, the <code style={inlineCode}>fine_tuned_model</code> field will contain your deployed model ID.</p>

              <h3 style={h3}>Stream live events</h3>
              <p style={p}>For a real-time loss curve, stream events instead of polling:</p>
              <CodeBlock onCopy={() => copy('stream', SAMPLES.streamEvents)}>
                {SAMPLES.streamEvents}
              </CodeBlock>

              <Callout>
                A healthy training run shows <code style={inlineCode}>train_loss</code> falling from ~2.0–2.5 in step 0
                down to 0.5–1.2 by the final step. If it plateaus above 1.5, try more epochs or a higher LoRA rank.
                If it drops below 0.2, you may be overfitting — add more diverse examples.
              </Callout>
            </Section>

            {/* Step 5 */}
            <Section id="step-5" title="Step 5 — Run inference on your model">
              <p style={p}>
                Once status is <code style={inlineCode}>succeeded</code>, use the{' '}
                <code style={inlineCode}>fine_tuned_model</code> ID exactly like any other model.
                No code changes needed beyond swapping the model ID.
              </p>
              <CodeBlock onCopy={() => copy('infer', SAMPLES.inference)}>
                {SAMPLES.inference}
              </CodeBlock>

              <p style={p}>The response is identical to a standard chat completion:</p>
              <CodeBlock onCopy={() => copy('inferResp', SAMPLES.inferenceResponse)}>
                {SAMPLES.inferenceResponse}
              </CodeBlock>
            </Section>

            {/* Step 6 */}
            <Section id="step-6" title="Step 6 — Evaluate results">
              <p style={p}>Compare your fine-tuned model against the base model on a held-out test set:</p>
              <CodeBlock onCopy={() => copy('eval', SAMPLES.evaluate)}>
                {SAMPLES.evaluate}
              </CodeBlock>

              <p style={p}>Things to look for:</p>
              <ul style={ul}>
                <li><strong>Tone:</strong> Does the model respond in your brand&apos;s voice?</li>
                <li><strong>Factual accuracy:</strong> Does it cite correct product details?</li>
                <li><strong>Format:</strong> Does it follow your preferred response structure?</li>
                <li><strong>Hallucination rate:</strong> Does it make up information less than the base model?</li>
                <li><strong>Refusal rate:</strong> Does it handle out-of-scope questions gracefully?</li>
              </ul>

              <p style={p}>
                If results are not satisfactory, the most effective improvements are:
                (1) adding more diverse training examples, (2) increasing <code style={inlineCode}>n_epochs</code> to 5,
                (3) increasing <code style={inlineCode}>lora.rank</code> to 32 or 64 for more complex tasks.
              </p>
            </Section>

            {/* Next steps */}
            <Section id="next-steps" title="Next steps">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    href: '/docs#fine-tuning',
                    title: 'Fine-Tuning API Reference',
                    desc: 'Full documentation for all fine-tuning endpoints, parameters, and error codes.',
                    badge: 'Reference',
                  },
                  {
                    href: '/docs#fine-tuning-quickstart',
                    title: 'Data Preparation Guide',
                    desc: 'Best practices for collecting, cleaning, and formatting training data.',
                    badge: 'Guide',
                  },
                  {
                    href: '/blog/fine-tune-llama3-cloudach',
                    title: 'Blog: Fine-tune Llama 3 on your own data',
                    desc: 'In-depth discussion of LoRA, base model selection, and real-world fine-tuning results.',
                    badge: 'Blog',
                  },
                ].map(t => (
                  <Link key={t.href} href={t.href} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#0D0F1A' }}>{t.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.72)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 5, letterSpacing: '0.04em' }}>{t.badge}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>{t.desc}</p>
                  </Link>
                ))}
              </div>
            </Section>

            {/* Footer */}
            <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, fontSize: 13, color: '#9CA3AF' }}>
              <a href="mailto:support@cloudach.com" style={{ color: '#9CA3AF', textDecoration: 'none' }}>support@cloudach.com</a>
              <Link href="/docs" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Docs</Link>
              <Link href="/dashboard" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Dashboard</Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const p = { fontSize: 15, lineHeight: 1.7, color: '#374151', marginBottom: 16 };
const h3 = { fontSize: 17, fontWeight: 600, marginTop: 24, marginBottom: 12 };
const ul = { paddingLeft: 20, marginBottom: 16, lineHeight: 1.8, color: '#374151', fontSize: 15 };
const ol = { paddingLeft: 20, marginBottom: 16, lineHeight: 1.8, color: '#374151', fontSize: 15 };
const inlineCode = { background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em', fontFamily: 'monospace' };
const linkStyle = { color: 'rgba(255,255,255,0.72)', textDecoration: 'none' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 16 };
const thStyle = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #E5E7EB', color: '#374151', fontWeight: 600 };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#374151', verticalAlign: 'top' };

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 56 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #E5E7EB' }}>{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ children, onCopy }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <pre style={{ background: '#1E1E1E', color: '#D4D4D4', padding: '16px 20px', borderRadius: 8, fontSize: 13, lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre', margin: 0 }}>
        {children}
      </pre>
      <button
        onClick={onCopy || handleCopy}
        style={{ position: 'absolute', top: 10, right: 10, padding: '3px 10px', fontSize: 11, background: copied ? '#22C55E' : '#374151', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function Callout({ children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid rgba(255,255,255,0.25)', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: 14, color: 'rgba(255,255,255,0.80)', marginBottom: 16 }}>
      {children}
    </div>
  );
}

// ── Code samples ───────────────────────────────────────────────────────────────

const SAMPLES = {
  example: `{"messages": [
  {"role": "system", "content": "You are a helpful support agent for Acme Corp."},
  {"role": "user",   "content": "How do I reset my password?"},
  {"role": "assistant", "content": "Go to Settings → Security → Reset Password. You'll receive a reset link by email within 2 minutes."}
]}`,

  downloadDataset: `# Download the Cloudach sample dataset (50 customer-support examples)
curl -L https://raw.githubusercontent.com/cloudach/examples/main/fine-tuning/sample_dataset.jsonl \\
  -o training_data.jsonl`,

  validateScript: `python3 - <<'EOF'
import json, sys
errors = 0
with open("training_data.jsonl") as f:
    for i, line in enumerate(f, 1):
        try:
            obj = json.loads(line)
            assert "messages" in obj
            roles = [m["role"] for m in obj["messages"]]
            assert "user" in roles and "assistant" in roles
        except Exception as e:
            print(f"Line {i}: {e}")
            errors += 1
print(f"Done. {errors} error(s).")
EOF`,

  upload: `curl https://api.cloudach.com/v1/fine-tuning/datasets \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -F "file=@training_data.jsonl" \\
  -F "purpose=fine-tune"`,

  uploadResponse: `{
  "id": "ds-8f3a2b1c",
  "object": "dataset",
  "filename": "training_data.jsonl",
  "bytes": 142891,
  "line_count": 50,
  "status": "processed"
}`,

  createJob: `curl https://api.cloudach.com/v1/fine-tuning/jobs \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama3-8b",
    "training_file": "ds-8f3a2b1c",
    "method": {
      "type": "lora",
      "lora": { "rank": 16, "alpha": 32, "dropout": 0.05 }
    },
    "hyperparameters": {
      "n_epochs": 3,
      "batch_size": 16
    },
    "suffix": "support-bot"
  }'`,

  createJobResponse: `{
  "id": "ftjob-a1b2c3",
  "object": "fine_tuning.job",
  "model": "llama3-8b",
  "status": "queued",
  "created_at": 1712001200,
  "estimated_finish": null,
  "fine_tuned_model": null
}`,

  pollJob: `# Poll every 30 seconds
curl https://api.cloudach.com/v1/fine-tuning/jobs/ftjob-a1b2c3 \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY"`,

  pollResponse: `{
  "id": "ftjob-a1b2c3",
  "status": "running",
  "trained_tokens": 48200,
  "estimated_finish": 1712003600,
  "fine_tuned_model": null,
  "events": [
    { "step": 0,   "train_loss": 2.38, "train_mean_token_accuracy": 0.44 },
    { "step": 50,  "train_loss": 1.62, "train_mean_token_accuracy": 0.63 },
    { "step": 100, "train_loss": 1.14, "train_mean_token_accuracy": 0.74 }
  ]
}`,

  streamEvents: `curl "https://api.cloudach.com/v1/fine-tuning/jobs/ftjob-a1b2c3/events?stream=true" \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY"`,

  inference: `# Replace with your fine_tuned_model value
curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama3-8b:ft:support-bot:ftjob-a1b2c3",
    "messages": [
      {"role": "system", "content": "You are a helpful support agent for Acme Corp."},
      {"role": "user", "content": "What is your return policy?"}
    ]
  }'`,

  inferenceResponse: `{
  "id": "chatcmpl-xyz",
  "object": "chat.completion",
  "model": "llama3-8b:ft:support-bot:ftjob-a1b2c3",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "We accept returns within 30 days of purchase. Items must be unopened and in original packaging. To start a return, email support@acme.com with your order number."
    },
    "finish_reason": "stop"
  }],
  "usage": { "prompt_tokens": 42, "completion_tokens": 38, "total_tokens": 80 }
}`,

  evaluate: `import openai, json

client = openai.OpenAI(
    api_key="YOUR_CLOUDACH_API_KEY",
    base_url="https://api.cloudach.com/v1"
)

test_questions = [
    "How do I cancel my subscription?",
    "I was charged twice, what do I do?",
    "Do you have a free trial?",
]

for q in test_questions:
    base = client.chat.completions.create(
        model="llama3-8b",
        messages=[{"role": "user", "content": q}]
    )
    finetuned = client.chat.completions.create(
        model="llama3-8b:ft:support-bot:ftjob-a1b2c3",
        messages=[
            {"role": "system", "content": "You are a helpful support agent for Acme Corp."},
            {"role": "user", "content": q}
        ]
    )
    print(f"Q: {q}")
    print(f"Base:       {base.choices[0].message.content[:120]}")
    print(f"Fine-tuned: {finetuned.choices[0].message.content[:120]}")
    print()`,
};
