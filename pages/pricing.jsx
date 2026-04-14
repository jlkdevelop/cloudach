import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2.5 7.5l3.5 3.5 6.5-6.5" stroke="#4F6EF7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const plans = [
  {
    name: 'Free',
    desc: 'For developers exploring and building side projects.',
    price: '$0',
    unit: 'then $0.20 / million tokens',
    features: [
      '1 active deployment',
      'Shared GPU infrastructure',
      'OpenAI-compatible API',
      'Community support',
      '1 GB model storage',
      'Up to 128K context',
    ],
    cta: 'Get started free',
    href: '/signup',
    featured: false,
    freeNote: 'No credit card required',
    rateKey: 0.20,
    planLabel: 'Free',
  },
  {
    name: 'Pro',
    desc: 'For production apps and growing teams that need more.',
    price: '$49',
    unit: 'per month · $0.15 / million tokens',
    features: [
      '10 active deployments',
      'Dedicated GPU instances',
      'Autoscaling + fine-tuning',
      'Usage dashboard + logs',
      '50 GB model storage',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/signup',
    featured: true,
    freeNote: '14-day free trial — no card required',
    rateKey: 0.15,
    planLabel: 'Pro',
  },
  {
    name: 'Enterprise',
    desc: 'For regulated industries and large-scale production.',
    price: 'Custom',
    unit: 'Volume discounts · dedicated team',
    features: [
      'Unlimited deployments',
      'Private VPC + air-gap',
      '99.9% uptime SLA',
      'HIPAA · SOC 2 · GDPR',
      'Dedicated solutions engineer',
      'Custom model storage',
    ],
    cta: 'Contact sales',
    href: '/contact',
    featured: false,
    freeNote: null,
    rateKey: null,
    planLabel: 'Enterprise',
  },
]

const modelPricing = [
  { name: 'Llama 3.1 8B', provider: 'Meta', freeRate: 0.20, proRate: 0.15, context: '128K', tier: 'Free+' },
  { name: 'Mistral 7B', provider: 'Mistral AI', freeRate: 0.16, proRate: 0.12, context: '32K', tier: 'Free+' },
  { name: 'Phi-3 Mini', provider: 'Microsoft', freeRate: 0.12, proRate: 0.09, context: '4K', tier: 'Free+' },
  { name: 'CodeLlama 13B', provider: 'Meta', freeRate: 0.24, proRate: 0.18, context: '16K', tier: 'Free+' },
  { name: 'Llama 3.1 70B', provider: 'Meta', freeRate: 0.60, proRate: 0.45, context: '128K', tier: 'Pro+' },
  { name: 'Mixtral 8×7B', provider: 'Mistral AI', freeRate: 0.48, proRate: 0.36, context: '32K', tier: 'Pro+' },
  { name: 'DeepSeek R1 7B', provider: 'DeepSeek', freeRate: 0.24, proRate: 0.18, context: '64K', tier: 'Pro+' },
  { name: 'Qwen 2.5 72B', provider: 'Alibaba', freeRate: 0.56, proRate: 0.42, context: '128K', tier: 'Pro+' },
]

const faqs = [
  {
    q: 'What counts as a token?',
    a: 'A token is roughly 4 characters of text. A typical paragraph is ~100 tokens. Both input and output tokens count toward your usage.',
  },
  {
    q: 'Is there a free tier forever?',
    a: 'Yes. The Free plan has no time limit. You pay only for tokens used at the standard rate of $0.20 / million tokens. No subscription required.',
  },
  {
    q: 'Can I upgrade or downgrade at any time?',
    a: 'Yes. You can switch plans at any time from your dashboard. Upgrades take effect immediately; downgrades take effect at the end of your billing cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards via Stripe. Enterprise customers can also pay by invoice.',
  },
  {
    q: 'Do unused tokens roll over?',
    a: 'Token usage is billed monthly and does not roll over. Unused tokens in a billing period are not carried forward.',
  },
  {
    q: 'What is the difference between shared and dedicated GPU?',
    a: 'Shared GPU instances run multiple tenants on the same hardware — great for development and low-volume production. Dedicated instances reserve a GPU exclusively for your workload, giving you predictable latency and throughput for high-volume apps.',
  },
  {
    q: 'How do I bring my own model?',
    a: 'You can import from any public or private HuggingFace repo, or upload weights directly (GGUF, safetensors, .bin). Custom models are available on all plans.',
  },
  {
    q: 'What SLA do you offer?',
    a: 'Pro plans include best-effort availability. Enterprise plans include a contractual 99.9% monthly uptime SLA backed by redundant infrastructure.',
  },
]

function PricingCalculator() {
  const [tokens, setTokens] = useState(10)
  const [plan, setPlan] = useState('Free')

  const rate = plan === 'Pro' ? 0.15 : 0.20
  const sub = plan === 'Pro' ? 49 : 0
  const tokenCost = tokens * rate
  const total = sub + tokenCost

  const formatted = total.toFixed(2)
  const tokenFormatted = (tokens * 1_000_000).toLocaleString()

  return (
    <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 16, padding: '40px 40px', maxWidth: 680, margin: '0 auto' }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6, color: '#0D0F1A' }}>Estimate your monthly cost</h3>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32, lineHeight: 1.6 }}>Adjust the sliders to see a real-time cost estimate for your usage.</p>

      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 10 }}>
          Plan
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Free', 'Pro'].map(p => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: plan === p ? '2px solid #4F6EF7' : '1px solid #E5E7EB',
                background: plan === p ? '#EEF1FF' : '#fff',
                color: plan === p ? '#4F6EF7' : '#6B7280',
                fontWeight: plan === p ? 600 : 400,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span>Monthly token usage</span>
          <span style={{ color: '#4F6EF7' }}>{tokenFormatted} tokens</span>
        </label>
        <input
          type="range"
          min={1}
          max={500}
          value={tokens}
          onChange={e => setTokens(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#4F6EF7', height: 4, cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>
          <span>1M tokens</span>
          <span>500M tokens</span>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '24px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sub > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280' }}>
              <span>{plan} subscription</span>
              <span>${sub.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280' }}>
            <span>{tokens}M tokens × ${rate.toFixed(2)}/M</span>
            <span>${tokenCost.toFixed(2)}</span>
          </div>
          <div style={{ height: 1, background: '#F3F4F6', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#0D0F1A', letterSpacing: -0.5 }}>
            <span>Estimated monthly total</span>
            <span style={{ color: '#4F6EF7' }}>${formatted}</span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 14, textAlign: 'center' }}>
        Estimates are approximate. Actual billing is based on metered token usage.{' '}
        <Link href="/docs" style={{ color: '#4F6EF7' }}>See billing docs →</Link>
      </p>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        borderBottom: '1px solid #E5E7EB',
        padding: '20px 0',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#0D0F1A', letterSpacing: -0.2 }}>{q}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M3 6l5 5 5-5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, marginTop: 14, paddingRight: 32 }}>{a}</p>
      )}
    </div>
  )
}

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing — Cloudach</title>
        <meta name="description" content="Start free, scale with confidence. Cloudach pricing is usage-based with no hidden fees. Free tier, Pro at $49/month, and Enterprise custom pricing." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:title" content="Pricing — Cloudach" />
        <meta property="og:description" content="Start free, scale with confidence. Usage-based LLM hosting with no surprises." />
        <meta property="og:url" content="https://cloudach.com/pricing" />
        <meta name="twitter:title" content="Pricing — Cloudach" />
        <meta name="twitter:description" content="Start free, scale with confidence. Usage-based LLM hosting with no surprises." />
      </Head>

      <Nav />

      <main>
        {/* Hero */}
        <section style={{ textAlign: 'center', padding: '88px 24px 64px', maxWidth: 720, margin: '0 auto' }}>
          <div className="eyebrow" style={{ justifyContent: 'center', margin: '0 auto 24px' }}>
            <div className="eyebrow-dot" />
            Pricing
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.07, color: '#0D0F1A', marginBottom: 20 }}>
            Usage-based.<br />No surprises.
          </h1>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, maxWidth: 520, margin: '0 auto' }}>
            Start free and pay only for what you use. Every plan runs on the same production-grade infrastructure — pick the tier that fits your scale.
          </p>
        </section>

        {/* Plan Cards */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px 80px' }}>
          <div className="price-grid">
            {plans.map(plan => (
              <div className={`pcard${plan.featured ? ' featured' : ''}`} key={plan.name}>
                {plan.featured && <div className="ptag">Most popular</div>}
                <h3>{plan.name}</h3>
                <p className="pdesc">{plan.desc}</p>
                <div className="pamt" style={plan.price === 'Custom' ? { fontSize: 28, paddingTop: 6 } : {}}>{plan.price}</div>
                <div className="punit">{plan.unit}</div>
                <ul className="plist">
                  {plan.features.map(f => (
                    <li key={f}><CheckIcon />{f}</li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <button className={`pbtn${plan.featured ? ' pblu' : ''}`}>{plan.cta}</button>
                </Link>
                {plan.freeNote && (
                  <p className="plan-free-note">{plan.freeNote}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Per-model pricing */}
        <section style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 24px' }}>
            <div className="sec-tag" style={{ textAlign: 'center' }}>Model pricing</div>
            <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: 8 }}>Per-model token rates</h2>
            <p style={{ textAlign: 'center', fontSize: 15, color: '#6B7280', marginBottom: 48, lineHeight: 1.6 }}>
              Pro plan customers get 25% lower token rates across the board.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Model</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: '#6B7280', fontWeight: 600 }}>Provider</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: '#6B7280', fontWeight: 600 }}>Context</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Available on</th>
                    <th style={{ textAlign: 'right', padding: '10px 16px', color: '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Free ($/M tokens)</th>
                    <th style={{ textAlign: 'right', padding: '10px 16px', color: '#4F6EF7', fontWeight: 600, whiteSpace: 'nowrap' }}>Pro ($/M tokens)</th>
                  </tr>
                </thead>
                <tbody>
                  {modelPricing.map((m, i) => (
                    <tr key={m.name} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : 'transparent' }}>
                      <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0D0F1A' }}>{m.name}</td>
                      <td style={{ padding: '13px 16px', color: '#6B7280' }}>{m.provider}</td>
                      <td style={{ padding: '13px 16px', color: '#6B7280', fontFamily: 'monospace', fontSize: 12 }}>{m.context}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 5,
                          background: m.tier === 'Free+' ? '#D1FAE5' : '#EEF1FF',
                          color: m.tier === 'Free+' ? '#065F46' : '#3730A3',
                          letterSpacing: '0.03em',
                        }}>
                          {m.tier}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'right', color: '#374151', fontFamily: 'monospace', fontSize: 13 }}>
                        ${m.freeRate.toFixed(2)}
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'right', color: '#4F6EF7', fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>
                        ${m.proRate.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 16, textAlign: 'center' }}>
              Rates are per million tokens (combined input + output). Enterprise rates available on request.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 24px' }}>
          <div className="sec-tag" style={{ textAlign: 'center' }}>Calculator</div>
          <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: 8 }}>See what you'd pay</h2>
          <p style={{ textAlign: 'center', fontSize: 15, color: '#6B7280', marginBottom: 48, lineHeight: 1.6 }}>
            Drag the slider to estimate your monthly bill based on token volume.
          </p>
          <PricingCalculator />
        </section>

        {/* FAQ */}
        <section style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px' }}>
            <div className="sec-tag" style={{ textAlign: 'center' }}>FAQ</div>
            <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: 48 }}>Common questions</h2>
            <div>
              {faqs.map(faq => (
                <FaqItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="cta-band">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <h2>Start building in minutes.</h2>
            <p>No credit card required. Deploy your first model on the Free plan and upgrade when you're ready to scale.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup">
                <button className="btn-cta">Get started free</button>
              </Link>
              <Link href="/contact">
                <button className="btn-cta-ghost" style={{ color: '#9CA3AF', borderColor: '#2A2E45' }}>Talk to sales</button>
              </Link>
            </div>
            <p style={{ fontSize: 12, color: '#4B5563', marginTop: 16, marginBottom: 0 }}>
              5,000+ developers already on Cloudach · No lock-in · Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
