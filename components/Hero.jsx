import Link from 'next/link';

export default function Hero() {
  return (
    <div style={{ background: 'radial-gradient(ellipse 90% 60% at 60% -10%, rgba(79,110,247,0.07) 0%, transparent 65%), #0a0a0a' }}>
      <div className="hero-wrap">
        <div className="hero">
          <div className="eyebrow">
            <div className="eyebrow-dot" />
            LLM cloud infrastructure
          </div>
          <h1>Run any open-source<br />LLM in production.<br /><em>In 60 seconds.</em></h1>
          <p className="hero-sub">
            Deploy Llama 3, Mistral, Qwen, and 50+ models with a single API call —
            at a fraction of proprietary API costs. OpenAI-compatible. Zero GPU ops.
          </p>
          <div className="hero-btns">
            <Link href="/signup">
              <button className="btn-cta">Start deploying free</button>
            </Link>
            <Link href="/docs">
              <button className="btn-cta-ghost">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                View docs
              </button>
            </Link>
          </div>
          <p className="hero-free-note">No credit card required · Free up to 1M tokens/month</p>
          <div className="hero-stats">
            <div>
              <div className="stat-val">10ms</div>
              <div className="stat-label">Avg. time to first token</div>
            </div>
            <div>
              <div className="stat-val">99.9%</div>
              <div className="stat-label">Uptime SLA</div>
            </div>
            <div>
              <div className="stat-val">50+</div>
              <div className="stat-label">Models available</div>
            </div>
          </div>
        </div>

        <div className="code-window">
          <div className="code-topbar">
            <div className="cdot" style={{ background: '#FF5F57' }} />
            <div className="cdot" style={{ background: '#FEBC2E' }} />
            <div className="cdot" style={{ background: '#28C840' }} />
            <span className="code-tab">cloudach <span>deploy.yaml</span></span>
          </div>
          <div className="code-inner">
            <span className="ci"><span className="cd">$</span> <span style={{ color: '#c9d1d9' }}>cloudach deploy</span></span>
            <span className="ci" style={{ marginTop: 6 }}><span className="ck">model</span><span className="cd">:</span>   <span className="cv">meta-llama/Llama-3-8B-Instruct</span></span>
            <span className="ci"><span className="ck">region</span><span className="cd">:</span>  <span className="cs">us-east-1</span></span>
            <span className="ci"><span className="ck">gpu</span><span className="cd">:</span>     <span className="cs">A100 × 1</span></span>
            <span className="ci"><span className="ck">scale</span><span className="cd">:</span>   <span className="cn">auto</span></span>
            <span className="ci" style={{ marginTop: 14 }}><span className="cd">↳ Pulling weights        </span><span className="co">████████░░</span><span className="cd"> 82%</span></span>
            <span className="ci"><span className="cd">↳ Provisioning GPU       </span><span className="cok">✓ done</span></span>
            <span className="ci"><span className="cd">↳ Configuring vLLM       </span><span className="cok">✓ done</span></span>
            <span className="ci"><span className="cd">↳ Health check           </span><span className="cok">✓ passed</span></span>
            <span className="ci live" style={{ marginTop: 14 }}>✦  Live → api.cloudach.com/llama-3-8b</span>
          </div>
          <div className="code-footer">
            <div className="status-dot" />
            <span className="status-txt">Deployed in 43s — A100 · us-east-1</span>
          </div>
        </div>
      </div>
    </div>
  )
}
