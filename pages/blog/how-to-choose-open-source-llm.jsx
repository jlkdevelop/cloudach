import Head from 'next/head'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function HowToChooseOpenSourceLLM() {
  return (
    <>
      <Head>
        <title>How to choose the right open-source LLM — Cloudach Blog</title>
        <meta name="description" content="A practical decision framework for picking the right open-source LLM. Decision tree, use case matrix, benchmark comparisons, and cost tradeoffs for Mistral, Llama 3, Mixtral, and more." />
        <meta property="og:title" content="How to choose the right open-source LLM" />
        <meta property="og:description" content="Decision tree, use case matrix, benchmark comparisons, and cost tradeoffs to help you pick the right model for your application." />
        <meta property="og:url" content="https://cloudach.com/blog/how-to-choose-open-source-llm" />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to choose the right open-source LLM" />
        <meta name="twitter:description" content="Decision tree, use case matrix, benchmark comparisons, and cost tradeoffs for open-source LLMs." />
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
          How to choose the right open-source LLM
        </h1>

        <p style={lead}>
          There are now dozens of capable open-source models. Mistral 7B, Llama 3 8B, Llama 3 70B,
          Mixtral 8×7B, Code Llama — and that list grows every month. The good news: most
          production use cases map cleanly to one model family. This guide gives you a decision
          framework so you stop A/B testing models indefinitely and ship.
        </p>

        <h2 style={h2}>Start with the constraint, not the benchmark</h2>
        <p style={p}>
          Most developers open a leaderboard, sort by MMLU, and pick the top result. That is the
          wrong starting point. Benchmark rankings measure a model&apos;s maximum capability across all
          tasks — they say nothing about whether the model fits your latency budget, token budget,
          or the specific task you are actually building.
        </p>
        <p style={p}>
          Instead, start by answering three questions:
        </p>
        <ol style={ol}>
          <li><strong>What is my latency requirement?</strong> Is there a human waiting for the response? If yes, anything over 150 ms TTFT feels slow. 70B models clock in at 142–156 ms TTFT p50 on our cluster — already at the edge.</li>
          <li><strong>What is my context window requirement?</strong> RAG and chat apps that stay under 8 K tokens have 6 models to choose from. Long-document tasks need Mistral 7B (32 K) or Llama 3.1 (128 K).</li>
          <li><strong>Can I fine-tune?</strong> A fine-tuned 8B model routinely beats a prompted 70B model on domain tasks. If you have even 500 labeled examples, fine-tuning usually wins over model-switching.</li>
        </ol>
        <p style={p}>
          Only after you have eliminated models that can&apos;t satisfy these constraints should you look
          at quality benchmarks to pick between what&apos;s left.
        </p>

        <h2 style={h2}>The decision tree</h2>
        <p style={p}>
          Walk through this tree top-to-bottom. Stop at the first branch that matches your situation.
        </p>
        <div style={codeBlock}>
{`What is your primary requirement?
│
├─ Lowest latency / highest throughput?
│   └─ → mistral-7b  (35 ms TTFT p50, 1,560 tok/s)
│
├─ Best quality for general English tasks?
│   ├─ Budget: low → llama3-8b
│   └─ Budget: flexible → llama3-70b or mixtral-8x7b
│
├─ Code generation or debugging?
│   └─ → codellama-13b
│
├─ Long context window (>8 K tokens)?
│   ├─ Up to 32 K → mistral-7b or mixtral-8x7b
│   └─ Up to 128 K → llama31-8b or llama31-70b
│
├─ Best quality regardless of cost?
│   └─ → llama3-70b or llama31-70b
│
└─ Mixed workload (quality + reasonable speed)?
    └─ → mixtral-8x7b`}
        </div>

        <h2 style={h2}>Use case matrix</h2>
        <p style={p}>
          Here is how common production use cases map to model choices, based on our benchmarks
          and customer deployments.
        </p>
        <div style={{ overflowX: 'auto', marginBottom: 28 }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Use case</th>
                <th style={thStyle}>Recommended</th>
                <th style={thStyle}>Why</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Customer support chatbot', 'llama3-8b', 'Fast, low cost, handles common Q&A well'],
                ['Code generation / review', 'codellama-13b', 'Purpose-trained on code, strong fill-in-middle'],
                ['Document summarisation', 'llama3-8b', 'Short-context summaries stay within 8 K limit'],
                ['Long-doc summarisation (>8 K)', 'llama31-8b', '128 K context, comparable speed to llama3-8b'],
                ['Translation', 'gemma-7b', 'Trained with multilingual data, compact footprint'],
                ['RAG pipeline', 'mistral-7b', 'Low latency for fast retrieval → response cycles'],
                ['Agents / function calling', 'mixtral-8x7b', 'Strong instruction-following, longer context'],
                ['High-throughput batch jobs', 'mistral-7b', 'Highest tok/s at concurrency 8 (4,820 tok/s)'],
                ['Max quality, zero-shot', 'llama3-70b', 'Best MMLU (79.5) and MT-Bench (9.0) scores'],
              ].map(([uc, model, why]) => (
                <tr key={uc}>
                  <td style={tdStyle}>{uc}</td>
                  <td style={{ ...tdStyle }}><code style={inlineCode}>{model}</code></td>
                  <td style={tdStyle}>{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={h2}>Benchmark numbers you can trust</h2>
        <p style={p}>
          We ran every model in the Cloudach catalog on our production GKE cluster using vLLM v0.4.2.
          Here are the numbers that matter for shipping:
        </p>

        <h3 style={h3}>Time to first token — concurrency 1</h3>
        <div style={{ overflowX: 'auto', marginBottom: 28 }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Model</th>
                <th style={thStyle}>p50 (ms)</th>
                <th style={thStyle}>p99 (ms)</th>
                <th style={thStyle}>Context</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['mistral-7b', '35', '79', '32 K'],
                ['llama3-8b', '38', '88', '8 K'],
                ['llama31-8b', '41', '94', '128 K'],
                ['mixtral-8x7b', '74', '163', '32 K'],
                ['llama3-70b', '142', '287', '8 K'],
                ['llama31-70b', '156', '304', '128 K'],
              ].map(([model, p50, p99, ctx]) => (
                <tr key={model}>
                  <td style={tdStyle}><code style={inlineCode}>{model}</code></td>
                  <td style={tdStyle}>{p50}</td>
                  <td style={tdStyle}>{p99}</td>
                  <td style={tdStyle}>{ctx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={h3}>Quality benchmarks</h3>
        <div style={{ overflowX: 'auto', marginBottom: 28 }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Model</th>
                <th style={thStyle}>MMLU</th>
                <th style={thStyle}>HumanEval</th>
                <th style={thStyle}>MT-Bench</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['mistral-7b', '62.5', '30.5', '6.84'],
                ['llama3-8b', '66.6', '33.0', '7.10'],
                ['codellama-13b', '35.1', '62.0', '6.01'],
                ['mixtral-8x7b', '70.6', '40.2', '8.30'],
                ['llama3-70b', '79.5', '50.4', '9.00'],
              ].map(([model, mmlu, he, mt]) => (
                <tr key={model}>
                  <td style={tdStyle}><code style={inlineCode}>{model}</code></td>
                  <td style={tdStyle}>{mmlu}</td>
                  <td style={tdStyle}>{he}</td>
                  <td style={tdStyle}>{mt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...p, fontSize: 13, color: '#9CA3AF' }}>
          MMLU = 5-shot accuracy. HumanEval = pass@1 (Python). MT-Bench = GPT-4-as-judge, 1–10 scale.
          Full methodology in the{' '}
          <Link href="/docs" style={linkStyle}>April 2026 benchmark report</Link>.
        </p>

        <h2 style={h2}>The 7B vs 70B question</h2>
        <p style={p}>
          This is the most common question we get from new users. The answer is almost always:
          start with a 7B/8B model.
        </p>
        <p style={p}>
          Here&apos;s why. A 70B model costs 5× more per token than an 8B model on Cloudach.
          It is also ~4× slower. In most production workloads, you will process far more tokens
          than you expect — 10 M tokens/month is typical for a small-to-medium SaaS product.
          At those volumes, the cost difference is not a rounding error; it is the difference
          between a product that is economically viable and one that is not.
        </p>
        <p style={p}>
          The cases where 70B genuinely wins:
        </p>
        <ul style={ul}>
          <li><strong>Multi-step reasoning:</strong> complex math, multi-hop question answering, code that requires understanding entire codebases</li>
          <li><strong>Zero-shot performance:</strong> you have no training data and cannot fine-tune</li>
          <li><strong>High-stakes accuracy:</strong> medical, legal, or financial text where a small factual error has real consequences</li>
          <li><strong>Complex agent loops:</strong> planning tasks that require the model to self-correct over many steps</li>
        </ul>
        <p style={p}>
          If none of those apply, start with <code style={inlineCode}>llama3-8b</code> and benchmark
          your actual task. A fine-tuned 8B model will likely beat a prompted 70B model, and
          it will do so at one-fifth the per-token cost.
        </p>

        <h2 style={h2}>The fine-tuning multiplier</h2>
        <p style={p}>
          One thing that benchmark tables consistently understate: fine-tuning has a larger effect
          on real-task quality than moving from 8B to 70B. We have seen this repeatedly in
          customer deployments:
        </p>
        <ul style={ul}>
          <li>A support chatbot fine-tuned on 1,000 examples of ideal responses outperforms a prompted 70B model on domain-specific Q&A in 9 out of 10 customer evaluations.</li>
          <li>A fine-tuned Mistral 7B for SQL generation reliably outperforms a prompted GPT-4-class model when the schema has unusual naming conventions.</li>
          <li>Translation quality on low-resource languages improves dramatically with 500–2,000 parallel examples, regardless of base model size.</li>
        </ul>
        <p style={p}>
          The practical recommendation: if you are choosing between &ldquo;upgrade from 8B to 70B&rdquo;
          or &ldquo;collect 500 examples and fine-tune your 8B model,&rdquo; choose fine-tuning first.
          The quality ceiling of a fine-tuned 8B model at task-specific work is higher than most
          developers expect.
        </p>
        <p style={p}>
          Cloudach supports full fine-tuning and LoRA for all major model families.
          See the <Link href="/docs#fine-tuning" style={linkStyle}>Fine-Tuning Guide</Link> for
          a walkthrough from dataset to deployed adapter in under 30 minutes.
        </p>

        <h2 style={h2}>Practical patterns for common architectures</h2>

        <h3 style={h3}>RAG pipelines: use two models</h3>
        <p style={p}>
          A common mistake in RAG is using the same large model for both retrieval-side reranking
          and synthesis. A better pattern:
        </p>
        <ul style={ul}>
          <li><strong>Retrieval + reranking:</strong> <code style={inlineCode}>mistral-7b</code> — fast, low latency, good enough for relevance scoring</li>
          <li><strong>Final synthesis:</strong> <code style={inlineCode}>llama3-8b</code> or <code style={inlineCode}>mixtral-8x7b</code> — only called once per user query, worth spending a bit more on quality</li>
        </ul>
        <p style={p}>
          This hybrid pattern cuts overall cost by 60–70% compared to using a 70B model for both
          steps, with minimal quality loss on the answer.
        </p>

        <h3 style={h3}>Agents: bigger context, better instruction-following</h3>
        <p style={p}>
          Agents live or die by instruction-following quality. You need a model that reliably formats
          tool calls correctly, respects chain-of-thought instructions, and does not hallucinate
          tool names. Our recommendation is <code style={inlineCode}>mixtral-8x7b</code> for most
          agent workloads — it has strong MT-Bench scores (8.30) and a 32 K context window that
          fits most tool schemas + conversation history without truncation.
        </p>
        <p style={p}>
          For agents that require deeper planning or long codebases in context, use{' '}
          <code style={inlineCode}>llama3-70b</code>. The quality gap at complex planning is
          measurable.
        </p>

        <h3 style={h3}>Real-time user-facing UX: every millisecond counts</h3>
        <p style={p}>
          If a human is watching a cursor blink, streaming is non-negotiable. Enable{' '}
          <code style={inlineCode}>stream: true</code> on every user-facing call — it moves the
          perceived response start from TTFT to &ldquo;within 35–40 ms.&rdquo; Use{' '}
          <code style={inlineCode}>mistral-7b</code> or <code style={inlineCode}>llama3-8b</code>{' '}
          for these paths; they both clear the 100 ms p99 TTFT bar that users perceive as instant.
        </p>

        <h2 style={h2}>Checklist: picking your model</h2>
        <ul style={ul}>
          <li>Latency requirement &lt; 100 ms p99 TTFT → only 7B/8B models qualify</li>
          <li>Context &gt; 8 K tokens → Mistral 7B (32 K), Mixtral 8×7B (32 K), or Llama 3.1 (128 K)</li>
          <li>Primary task is code → start with Code Llama 13B</li>
          <li>Multilingual → Gemma 7B or Mixtral 8×7B</li>
          <li>Have training data → fine-tune first before upgrading model size</li>
          <li>Cost-sensitive + high volume → 7B/8B models at 5× lower cost than 70B</li>
          <li>Complex reasoning / zero-shot / high-stakes → 70B models worth the premium</li>
        </ul>

        <h2 style={h2}>Start with llama3-8b and escalate intentionally</h2>
        <p style={p}>
          The default recommendation for new Cloudach projects is <code style={inlineCode}>llama3-8b</code>.
          It is fast enough for real-time UX, cheap enough to scale, and capable enough for the
          majority of production use cases. Build your evaluation suite on 8B, measure the failure
          modes, and only escalate to a larger model if the data says you should.
        </p>
        <p style={p}>
          Model selection is not a one-time decision. As your product matures and your dataset grows,
          fine-tuning your chosen base model is almost always a better investment than switching
          to a larger one.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '56px 0 40px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', marginBottom: 4 }}>Related</p>
          {[
            { href: '/docs/model-selection-guide', title: 'Model Selection Guide (full reference)', badge: 'Docs' },
            { href: '/docs/models', title: 'Models reference — catalog, API examples, context windows', badge: 'Docs' },
            { href: '/blog/sub-100ms-ttft-llama3-vllm', title: 'How we hit sub-100ms TTFT with Llama 3 and vLLM', badge: 'ML' },
            { href: '/blog/fine-tune-llama3-cloudach', title: 'Fine-tune Llama 3 on your own data with Cloudach', badge: 'ML' },
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
const h3 = { fontSize: 18, fontWeight: 700, color: '#0D0F1A', margin: '32px 0 12px' };
const inlineCode = { fontFamily: 'monospace', background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: '0.9em' };
const linkStyle = { color: 'var(--brand)', textDecoration: 'none' };
const codeBlock = { background: '#1E1E1E', color: '#D4D4D4', padding: '16px 20px', borderRadius: 8, fontSize: 13, lineHeight: 1.6, overflowX: 'auto', marginBottom: 28, whiteSpace: 'pre', fontFamily: 'monospace' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 8 };
const thStyle = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #E5E7EB', color: '#374151', fontWeight: 600 };
const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #F3F4F6', color: '#374151', verticalAlign: 'top' };
