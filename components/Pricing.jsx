import Link from 'next/link';

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2.5 7.5l3.5 3.5 6.5-6.5" stroke="#4F6EF7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const plans = [
  {
    name: 'Starter',
    desc: 'For developers and side projects.',
    price: '$0',
    unit: '+ $0.20 / million tokens',
    features: ['1 active deployment', 'Shared GPU infrastructure', 'OpenAI-compatible API', 'Community support'],
    cta: 'Get started free',
    href: '/signup',
    featured: false,
  },
  {
    name: 'Pro',
    desc: 'For production apps and growing teams.',
    price: '$49',
    unit: 'per month + $0.15 / million tokens',
    features: ['10 active deployments', 'Dedicated GPU instances', 'Autoscaling + fine-tuning', 'Usage dashboard + logs', 'Priority support'],
    cta: 'Start free trial',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Enterprise',
    desc: 'For regulated industries and large-scale teams.',
    price: 'Custom',
    unit: 'Volume discounts · dedicated team',
    features: ['Unlimited deployments', 'Private VPC + air-gap', '99.9% SLA guarantee', 'HIPAA · SOC 2 · GDPR', 'Dedicated solutions engineer'],
    cta: 'Contact sales',
    href: null,
    featured: false,
  },
]

export default function Pricing() {
  return (
    <>
      <section className="section-wrap">
        <div className="sec-tag">How it works</div>
        <h2 className="sec-title">Model to API in three steps</h2>
        <div className="steps">
          <div className="step">
            <div className="step-n">Step 01 &mdash; ~10 seconds</div>
            <div className="step-line" />
            <h3>Pick your model</h3>
            <p>Choose from 40+ curated open-source models or paste any HuggingFace URL. GGUF, safetensors, and direct upload all supported.</p>
          </div>
          <div className="step">
            <div className="step-n">Step 02 &mdash; ~20 seconds</div>
            <div className="step-line" />
            <h3>Configure and preview cost</h3>
            <p>Select GPU tier, region, and autoscaling policy. See your estimated cost per million tokens before committing — no surprises.</p>
          </div>
          <div className="step">
            <div className="step-n">Step 03 &mdash; ~30 seconds</div>
            <div className="step-line" />
            <h3>Get your live endpoint</h3>
            <p>Receive an OpenAI-compatible REST URL. Swap your base URL and go — same SDK, same interface, your model.</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="stripe-bg">
        <div className="section-wrap">
          <div className="sec-header">
            <div>
              <div className="sec-tag">Pricing</div>
              <h2 className="sec-title">Usage-based.<br />No surprises.</h2>
            </div>
            <p className="sec-sub">Start free, scale with confidence. Every plan runs on the same infrastructure — you only pay for what you use.</p>
          </div>
          <p className="price-trust-note">No contracts. Cancel anytime. Prices in USD.</p>
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
                {plan.name === 'Enterprise' ? (
                  <button className="pbtn pbtn-outline">{plan.cta}</button>
                ) : plan.href ? (
                  <Link href={plan.href}><button className={`pbtn${plan.featured ? ' pblu' : ''}`}>{plan.cta}</button></Link>
                ) : (
                  <button className={`pbtn${plan.featured ? ' pblu' : ''}`}>{plan.cta}</button>
                )}
                {plan.name === 'Starter' && (
                  <p className="plan-free-note">No credit card required</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
