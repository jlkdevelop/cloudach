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
    featured: false,
  },
  {
    name: 'Pro',
    desc: 'For production apps and growing teams.',
    price: '$49',
    unit: 'per month + $0.15 / million tokens',
    features: ['10 active deployments', 'Dedicated GPU instances', 'Autoscaling + fine-tuning', 'Usage dashboard + logs', 'Priority support'],
    cta: 'Start free trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    desc: 'For regulated industries and large-scale teams.',
    price: 'Custom',
    unit: 'Volume discounts · dedicated team',
    features: ['Unlimited deployments', 'Private VPC + air-gap', '99.9% SLA guarantee', 'HIPAA · SOC 2 · GDPR', 'Dedicated solutions engineer'],
    cta: 'Contact sales',
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
            <div className="step-n">Step 01</div>
            <div className="step-line" />
            <h3>Choose your model</h3>
            <p>Pick from our library or provide your own weights via HuggingFace URL, direct upload, or our CLI.</p>
          </div>
          <div className="step">
            <div className="step-n">Step 02</div>
            <div className="step-line" />
            <h3>Configure your deployment</h3>
            <p>Select GPU tier, region, and scaling policy. Preview estimated cost before you commit.</p>
          </div>
          <div className="step">
            <div className="step-n">Step 03</div>
            <div className="step-line" />
            <h3>Call your endpoint</h3>
            <p>Receive a live OpenAI-compatible REST URL. Integrate with any SDK, framework, or app immediately.</p>
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
                <button className={`pbtn${plan.featured ? ' pblu' : ''}`}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
