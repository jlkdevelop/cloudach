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
  TutorialFooterLinks,
} from '../../components/tutorial/Parts';

const TOC = [
  ['#overview', 'Overview'],
  ['#prerequisites', 'Prerequisites'],
  ['#step-1', '1. Prepare dataset'],
  ['#step-2', '2. Upload dataset'],
  ['#step-3', '3. Launch job'],
  ['#step-4', '4. Monitor training'],
  ['#step-5', '5. Run inference'],
  ['#step-6', '6. Evaluate results'],
  ['#next-steps', 'Next steps'],
];

export default function FineTuningTutorial() {
  return (
    <TutorialLayout
      title="Fine-tune Llama 3 on your own data — Cloudach Tutorials"
      description="Step-by-step tutorial: fine-tune Llama 3 8B on a custom dataset with Cloudach. Covers data prep, LoRA training, deployment, and inference."
      ogUrl="https://cloudach.com/tutorials/fine-tuning-llama3"
      toc={TOC}
    >
      <Breadcrumb
        trail={[
          { href: '/docs', label: 'Docs' },
          { href: '/docs#tutorials', label: 'Tutorials' },
          { label: 'Fine-tuning Llama 3' },
        ]}
      />

      <TutorialHeader
        level="Beginner"
        duration="~30 min"
        title="Fine-tune Llama 3 on your own data"
        lede="In this tutorial you'll fine-tune Llama 3 8B on a customer support dataset using LoRA. By the end you'll have a custom model that replies in your brand's voice, deployed and ready for inference on Cloudach's API."
      />

      <Section id="overview" title="Overview">
        <P>What you'll do:</P>
        <ol style={listStyle}>
          <li>Prepare a JSONL training dataset with chat-format examples</li>
          <li>Upload the dataset to Cloudach</li>
          <li>Launch a LoRA fine-tuning job on Llama 3 8B</li>
          <li>Monitor training loss in real time</li>
          <li>Run inference on your deployed custom model</li>
          <li>Evaluate the results against the base model</li>
        </ol>

        <Callout>
          You'll need a Cloudach API key. <A href="/signup">Sign up free</A> — no credit card
          required.
        </Callout>

        <P>
          Fine-tuning with LoRA trains only a small set of adapter weights (≈ 0.1–1% of model
          parameters) rather than the full model. This is faster, cheaper, and often achieves equal
          or better results for domain adaptation tasks. Cloudach serves the adapter on top of the
          base model using vLLM, so you get the same sub-100ms latency as the base model.
        </P>
      </Section>

      <Section id="prerequisites" title="Prerequisites">
        <ul style={listStyle}>
          <li>
            A Cloudach account and API key (<A href="/signup">sign up</A>)
          </li>
          <li>
            Python 3.9+ or a terminal with <InlineCode>curl</InlineCode>
          </li>
          <li>At least 100 training examples in JSONL format (we provide a sample below)</li>
        </ul>
      </Section>

      <Section id="step-1" title="Step 1 — Prepare your dataset">
        <P>
          Training data must be a <strong>.jsonl</strong> file where each line is a JSON object
          with a <InlineCode>messages</InlineCode> array. The format is identical to the OpenAI
          fine-tuning format.
        </P>

        <SubHeading>Example line</SubHeading>
        <CodeBlock language="json">{SAMPLES.example}</CodeBlock>

        <SubHeading>Download our sample dataset</SubHeading>
        <P>
          We provide a 50-example customer support dataset to use as a starting point or to test
          the workflow end-to-end before using your own data.
        </P>
        <CodeBlock language="bash">{SAMPLES.downloadDataset}</CodeBlock>

        <SubHeading>Validate your file</SubHeading>
        <P>Run this quick check before uploading to catch format errors:</P>
        <CodeBlock language="bash">{SAMPLES.validateScript}</CodeBlock>

        <Callout>
          Aim for at least 200–500 examples for meaningful domain adaptation. See the{' '}
          <A href="/docs#fine-tuning-quickstart">Data Preparation Guide</A> for collection and
          cleaning tips.
        </Callout>
      </Section>

      <Section id="step-2" title="Step 2 — Upload your dataset">
        <P>Upload the JSONL file to get a dataset ID to reference in the fine-tuning job.</P>
        <CodeBlock language="bash">{SAMPLES.upload}</CodeBlock>

        <P>The response looks like:</P>
        <CodeBlock language="json">{SAMPLES.uploadResponse}</CodeBlock>

        <P>
          Save the <InlineCode>id</InlineCode> field (e.g. <InlineCode>ds-8f3a2b1c</InlineCode>) —
          you'll need it in the next step.
        </P>
      </Section>

      <Section id="step-3" title="Step 3 — Launch the fine-tuning job">
        <P>
          Create a LoRA fine-tuning job targeting <InlineCode>llama3-8b</InlineCode>. Replace{' '}
          <InlineCode>ds-8f3a2b1c</InlineCode> with your dataset ID.
        </P>
        <CodeBlock language="bash">{SAMPLES.createJob}</CodeBlock>

        <P>Response:</P>
        <CodeBlock language="json">{SAMPLES.createJobResponse}</CodeBlock>

        <P>
          Save the job <InlineCode>id</InlineCode> (e.g. <InlineCode>ftjob-a1b2c3</InlineCode>).
          The job enters the <InlineCode>queued</InlineCode> state and starts within a few minutes.
        </P>

        <SubHeading>Key parameters explained</SubHeading>
        <table className="tutorial-table">
          <thead>
            <tr>
              {['Parameter', 'Our value', 'What it does'].map((h) => (
                <th key={h}>{h}</th>
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
            ].map(([name, v, desc]) => (
              <tr key={name}>
                <td><InlineCode>{name}</InlineCode></td>
                <td><InlineCode>{v}</InlineCode></td>
                <td>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section id="step-4" title="Step 4 — Monitor training">
        <P>
          Poll the job endpoint to see status, training loss, and estimated finish time. Training a
          50-example dataset typically takes 3–5 minutes; larger datasets scale linearly.
        </P>
        <CodeBlock language="bash">{SAMPLES.pollJob}</CodeBlock>

        <CodeBlock language="json">{SAMPLES.pollResponse}</CodeBlock>

        <P>
          When <InlineCode>status</InlineCode> changes to <InlineCode>succeeded</InlineCode>, the{' '}
          <InlineCode>fine_tuned_model</InlineCode> field will contain your deployed model ID.
        </P>

        <SubHeading>Stream live events</SubHeading>
        <P>For a real-time loss curve, stream events instead of polling:</P>
        <CodeBlock language="bash">{SAMPLES.streamEvents}</CodeBlock>

        <Callout>
          A healthy training run shows <InlineCode>train_loss</InlineCode> falling from ~2.0–2.5
          in step 0 down to 0.5–1.2 by the final step. If it plateaus above 1.5, try more epochs
          or a higher LoRA rank. If it drops below 0.2, you may be overfitting — add more diverse
          examples.
        </Callout>
      </Section>

      <Section id="step-5" title="Step 5 — Run inference on your model">
        <P>
          Once status is <InlineCode>succeeded</InlineCode>, use the{' '}
          <InlineCode>fine_tuned_model</InlineCode> ID exactly like any other model. No code
          changes needed beyond swapping the model ID.
        </P>
        <CodeBlock language="bash">{SAMPLES.inference}</CodeBlock>

        <P>The response is identical to a standard chat completion:</P>
        <CodeBlock language="json">{SAMPLES.inferenceResponse}</CodeBlock>
      </Section>

      <Section id="step-6" title="Step 6 — Evaluate results">
        <P>Compare your fine-tuned model against the base model on a held-out test set:</P>
        <CodeBlock language="python">{SAMPLES.evaluate}</CodeBlock>

        <P>Things to look for:</P>
        <ul style={listStyle}>
          <li><strong>Tone:</strong> Does the model respond in your brand's voice?</li>
          <li><strong>Factual accuracy:</strong> Does it cite correct product details?</li>
          <li><strong>Format:</strong> Does it follow your preferred response structure?</li>
          <li><strong>Hallucination rate:</strong> Does it make up information less than the base model?</li>
          <li><strong>Refusal rate:</strong> Does it handle out-of-scope questions gracefully?</li>
        </ul>

        <P>
          If results are not satisfactory, the most effective improvements are: (1) adding more
          diverse training examples, (2) increasing <InlineCode>n_epochs</InlineCode> to 5, (3)
          increasing <InlineCode>lora.rank</InlineCode> to 32 or 64 for more complex tasks.
        </P>
      </Section>

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
          ].map((t) => (
            <Link key={t.href} href={t.href} className="tutorial-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span className="tutorial-card-title" style={{ marginBottom: 0 }}>
                  {t.title}
                </span>
                <span className="tutorial-chip tutorial-chip-lang">{t.badge}</span>
              </div>
              <div className="tutorial-card-desc">{t.desc}</div>
            </Link>
          ))}
        </div>
      </Section>

      <TutorialFooterLinks />
    </TutorialLayout>
  );
}

const listStyle = {
  paddingLeft: 20,
  marginBottom: 16,
  lineHeight: 1.8,
  color: 'var(--color-ink-muted)',
  fontSize: 15,
};

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
