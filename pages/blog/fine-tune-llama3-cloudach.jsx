import Head from 'next/head'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function FineTuneLlama3Blog() {
  return (
    <>
      <Head>
        <title>Fine-tune Llama 3 on your own data with Cloudach — Cloudach Blog</title>
        <meta name="description" content="A practical guide to fine-tuning Llama 3 with LoRA on Cloudach. Learn why fine-tuning beats prompting for domain tasks, how LoRA works under the hood, and how to get from raw data to a deployed model." />
        <meta property="og:title" content="Fine-tune Llama 3 on your own data with Cloudach" />
        <meta property="og:description" content="Why fine-tuning beats prompting for domain tasks, how LoRA works under the hood, and a step-by-step walkthrough." />
        <meta property="og:url" content="https://cloudach.com/blog/fine-tune-llama3-cloudach" />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fine-tune Llama 3 on your own data with Cloudach" />
        <meta name="twitter:description" content="Why fine-tuning beats prompting for domain tasks, how LoRA works under the hood, and a step-by-step walkthrough." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <Link href="/blog" style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back to blog
        </Link>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-subtle)', padding: '3px 9px', borderRadius: 5, letterSpacing: '0.04em' }}>ML</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Apr 14, 2026</span>
        </div>

        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.15, color: '#0D0F1A', margin: '0 0 24px' }}>
          Fine-tune Llama 3 on your own data with Cloudach
        </h1>

        <p style={lead}>
          The most impactful thing you can do to improve LLM output quality for a specific domain
          is fine-tuning — not writing longer prompts, not switching models, not RAG alone.
          Fine-tuning rewires the model to match your data distribution at the weight level.
          Here is why it matters and how to do it on Cloudach in under 30 minutes.
        </p>

        <h2 style={h2}>Why fine-tuning, not just prompting?</h2>
        <p style={p}>
          Prompting is fast and flexible. But it has a hard ceiling. A general-purpose Llama 3 8B
          prompted with a system message like &ldquo;You are a friendly Acme Corp support agent&rdquo; will
          still default to generic phrasing, make up product details it was never told, and
          occasionally refuse or over-hedge in ways that frustrate users.
        </p>
        <p style={p}>
          Fine-tuning solves these problems structurally. When you train on 500 examples of
          your ideal responses, the model internalises:
        </p>
        <ul style={ul}>
          <li><strong>Your tone:</strong> concise and direct, or warm and verbose — the model learns by example, not instruction</li>
          <li><strong>Your facts:</strong> product names, prices, policies — baked into weights, not retrieved at runtime</li>
          <li><strong>Your format:</strong> whether to use bullet points, how to handle unanswerable questions, when to escalate</li>
          <li><strong>Your refusal boundaries:</strong> what&apos;s in-scope and out-of-scope for your use case</li>
        </ul>
        <p style={p}>
          In our internal benchmarks, a fine-tuned Llama 3 8B consistently outperforms a prompted
          Llama 3 70B on domain-specific tasks — at one-eighth the inference cost.
        </p>

        <h2 style={h2}>LoRA: fine-tuning without training the whole model</h2>
        <p style={p}>
          Full fine-tuning — updating all 8 billion parameters — is expensive and often unnecessary.
          LoRA (Low-Rank Adaptation) is a parameter-efficient method that achieves comparable results
          by training only a tiny fraction of new weights.
        </p>
        <p style={p}>
          The core idea: instead of updating a full weight matrix <em>W</em> (shape <em>d × k</em>),
          LoRA adds a pair of low-rank matrices <em>A</em> (shape <em>d × r</em>) and <em>B</em>
          (shape <em>r × k</em>), where the rank <em>r</em> is much smaller than <em>d</em> or <em>k</em>.
          During training, only <em>A</em> and <em>B</em> are updated. The forward pass becomes:
        </p>
        <pre style={code}>{`output = x @ (W + A @ B * scale)`}</pre>
        <p style={p}>
          For Llama 3 8B with rank 16, the LoRA adapter has roughly 10 million trainable parameters
          — less than 0.15% of the 8 billion total. Training takes minutes rather than hours,
          costs a fraction of a full fine-tune, and the adapter is tiny enough (≈ 40 MB) that
          it can be swapped per-request at inference time.
        </p>

        <h2 style={h2}>How Cloudach serves LoRA adapters</h2>
        <p style={p}>
          Cloudach uses vLLM&apos;s native LoRA multi-adapter support. When your fine-tuning job completes:
        </p>
        <ol style={ol}>
          <li>The adapter weights (<code style={inlineCode}>adapter_config.json</code> + <code style={inlineCode}>adapter_model.safetensors</code>) are stored in our object store.</li>
          <li>On first request, vLLM loads the base model once and registers your adapter. Adapter loading takes &lt; 50 ms — warm thereafter.</li>
          <li>Multiple adapters for the same base model share a single base model replica. You pay for base model GPU hours plus a small hosting fee per adapter, not a separate GPU per fine-tune.</li>
          <li>vLLM&apos;s <code style={inlineCode}>lora_request</code> mechanism routes each request to the right adapter with zero extra latency compared to the base model.</li>
        </ol>
        <p style={p}>
          This architecture means you can maintain dozens of fine-tuned variants — one per customer,
          one per language, one per product line — all served from the same GPU cluster at the
          same sub-100ms TTFT we offer on base models.
        </p>

        <h2 style={h2}>Choosing base models for fine-tuning</h2>
        <p style={p}>
          Not every base model is equally good for fine-tuning. Here is our practical guidance:
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Model', 'Best for', 'LoRA rank recommendation'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['llama3-8b', 'Most tasks — best cost/quality ratio for fine-tuning', '16 (start here)'],
              ['llama3-70b', 'Complex reasoning, nuanced tone, multilingual', '16–32'],
              ['llama31-8b', 'Long-context tasks (RAG, document Q&A)', '16'],
              ['mistral-7b', 'Fast inference, European data residency required', '16–32'],
              ['mixtral-8x7b', 'High accuracy, mixture-of-experts efficiency', '16 (LoRA only)'],
            ].map(([m, b, r]) => (
              <tr key={m}>
                <td style={tdStyle}><code style={inlineCode}>{m}</code></td>
                <td style={tdStyle}>{b}</td>
                <td style={tdStyle}>{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={p}>
          Our recommendation for most teams: start with <code style={inlineCode}>llama3-8b</code> and rank 16.
          Only move to a larger model if the 8B fine-tune doesn&apos;t meet your quality bar — the size difference
          has a 5–8× cost impact on training and inference.
        </p>

        <h2 style={h2}>What makes a good training dataset</h2>
        <p style={p}>
          Data quality is the biggest lever. We have seen teams get excellent results from 200 carefully
          curated examples and poor results from 5,000 noisy ones. A few principles that matter most:
        </p>
        <p style={{ ...p, fontWeight: 600 }}>Write assistant turns in your exact production voice</p>
        <p style={p}>
          The model learns by example. If 10% of your training examples use bullet points and 90% use prose,
          the model will be inconsistent. Decide on your format before you start, and apply it uniformly.
        </p>
        <p style={{ ...p, fontWeight: 600 }}>Cover your long tail</p>
        <p style={p}>
          Happy path examples are easy. The real value comes from edge cases: unanswerable questions,
          out-of-scope requests, ambiguous inputs, and situations where the right answer is to escalate
          rather than guess. Include at least 15–20% edge case examples.
        </p>
        <p style={{ ...p, fontWeight: 600 }}>Use the same system prompt in training and inference</p>
        <p style={p}>
          Include your production system prompt in every training example. The model will learn to
          condition on it. If you train without a system prompt and then add one at inference, you
          will get inconsistent results.
        </p>
        <p style={{ ...p, fontWeight: 600 }}>Balance your categories</p>
        <p style={p}>
          If billing questions make up 40% of your examples but only 5% of real traffic, the model
          will over-index on billing phrasing. Aim for class balance that reflects real usage distribution.
        </p>

        <h2 style={h2}>Step-by-step: from data to deployed model</h2>
        <p style={p}>
          Here is the complete workflow with curl. See the{' '}
          <Link href="/tutorials/fine-tuning-llama3" style={linkStyle}>Fine-tuning Tutorial</Link> for
          Python and a guided walkthrough.
        </p>

        <p style={{ ...p, fontWeight: 600, marginBottom: 8 }}>1. Prepare your dataset</p>
        <pre style={code}>{`# Each line: {"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}
# Minimum 100 examples, JSONL format`}</pre>

        <p style={{ ...p, fontWeight: 600, marginBottom: 8 }}>2. Upload</p>
        <pre style={code}>{`curl https://api.cloudach.com/v1/fine-tuning/datasets \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -F "file=@training_data.jsonl" \\
  -F "purpose=fine-tune"
# → {"id": "ds-8f3a2b1c", ...}`}</pre>

        <p style={{ ...p, fontWeight: 600, marginBottom: 8 }}>3. Create job</p>
        <pre style={code}>{`curl https://api.cloudach.com/v1/fine-tuning/jobs \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama3-8b",
    "training_file": "ds-8f3a2b1c",
    "method": {"type": "lora", "lora": {"rank": 16, "alpha": 32}},
    "hyperparameters": {"n_epochs": 3},
    "suffix": "my-model"
  }'
# → {"id": "ftjob-a1b2c3", "status": "queued"}`}</pre>

        <p style={{ ...p, fontWeight: 600, marginBottom: 8 }}>4. Monitor + infer</p>
        <pre style={code}>{`# Poll until status = "succeeded"
curl https://api.cloudach.com/v1/fine-tuning/jobs/ftjob-a1b2c3 \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY"

# Run inference
curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "llama3-8b:ft:my-model:ftjob-a1b2c3", "messages": [...]}'`}</pre>

        <h2 style={h2}>What to expect: timings and cost</h2>
        <p style={p}>
          For a 500-example dataset, 3 epochs, rank 16 LoRA on Llama 3 8B:
        </p>
        <ul style={ul}>
          <li><strong>Training time:</strong> 8–12 minutes</li>
          <li><strong>Training cost:</strong> approximately $0.45 (at $0.003 / 1K training tokens)</li>
          <li><strong>Adapter hosting:</strong> $2/month</li>
          <li><strong>Inference:</strong> same as base model — $0.10 / 1M tokens</li>
        </ul>
        <p style={p}>
          A team running 10M inference tokens per month on a fine-tuned 8B model pays roughly
          $1 + $2 hosting = $3/month in fine-tuning costs, versus ~$1,000/month if they were
          trying to achieve similar quality by switching to a 70B model.
        </p>

        <h2 style={h2}>Get started</h2>
        <p style={p}>
          Fine-tuning is available to all Cloudach users on the Pro plan and above.
          The quickest path:
        </p>
        <ol style={ol}>
          <li><Link href="/signup" style={linkStyle}>Sign up</Link> or log in to Cloudach</li>
          <li>Download our <Link href="/tutorials/fine-tuning-llama3" style={linkStyle}>sample 50-example dataset</Link> and run through the tutorial end-to-end</li>
          <li>Replace the sample data with your own examples and re-run</li>
        </ol>
        <p style={p}>
          Have questions about your specific use case? Email{' '}
          <a href="mailto:ml@cloudach.com" style={linkStyle}>ml@cloudach.com</a> — our ML team
          reviews every inbound and responds within one business day.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '56px 0 40px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', marginBottom: 4 }}>Related</p>
          {[
            { href: '/tutorials/fine-tuning-llama3', title: 'Tutorial: Fine-tune Llama 3 step by step', badge: 'Tutorial' },
            { href: '/docs#fine-tuning', title: 'Fine-Tuning API Reference', badge: 'Docs' },
            { href: '/docs#fine-tuning-quickstart', title: 'Data Preparation Guide', badge: 'Guide' },
          ].map(t => (
            <Link key={t.href} href={t.href} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0D0F1A', flex: 1 }}>{t.title}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-subtle)', padding: '2px 8px', borderRadius: 5, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{t.badge}</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const lead = { fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 40 };
const p = { fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20 };
const ul = { fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20, paddingLeft: 24 };
const ol = { fontSize: 15, color: '#374151', lineHeight: 1.85, marginBottom: 20, paddingLeft: 24 };
const h2 = { fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#0D0F1A', margin: '48px 0 16px' };
const inlineCode = { fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em' };
const linkStyle = { color: 'var(--brand)', textDecoration: 'none' };
const code = { background: '#1E1E1E', color: '#D4D4D4', padding: '16px 20px', borderRadius: 8, fontSize: 13, lineHeight: 1.6, overflowX: 'auto', display: 'block', marginBottom: 20, whiteSpace: 'pre' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 20 };
const thStyle = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #E5E7EB', color: '#374151', fontWeight: 600 };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#374151', verticalAlign: 'top' };
