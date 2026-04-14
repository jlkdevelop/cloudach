export default function Hero() {
  return (
    <div className="hero-wrap">
      <div className="hero">
        <div className="eyebrow">
          <div className="eyebrow-dot" />
          LLM cloud infrastructure
        </div>
        <h1>Deploy any<br />LLM.<br /><em>Ship faster.</em></h1>
        <p className="hero-sub">
          The developer platform for hosting, scaling, and fine-tuning open-source language
          models. One API. Any model. Production-ready in minutes.
        </p>
        <div className="hero-btns">
          <button className="btn-cta">Start deploying free</button>
          <button className="btn-cta-ghost">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View docs
          </button>
        </div>
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
            <div className="stat-val">40+</div>
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
          <span className="ci"><span className="cd">$</span> <span style={{ color: '#E2E8F0' }}>cloudach deploy</span></span>
          <span className="ci" style={{ marginTop: 4 }}><span className="ck">model</span><span className="cd">:</span>   <span className="cv">meta-llama/Llama-3-8B-Instruct</span></span>
          <span className="ci"><span className="ck">region</span><span className="cd">:</span>  <span className="cs">us-east-1</span></span>
          <span className="ci"><span className="ck">gpu</span><span className="cd">:</span>     <span className="cs">A100 × 1</span></span>
          <span className="ci"><span className="ck">scale</span><span className="cd">:</span>   <span className="cn">auto</span></span>
          <span className="ci" style={{ marginTop: 12 }}><span className="cd">↳ Pulling weights        </span><span className="co">████████░░</span><span className="cd"> 82%</span></span>
          <span className="ci"><span className="cd">↳ Provisioning GPU       </span><span className="cok">✓ done</span></span>
          <span className="ci"><span className="cd">↳ Configuring vLLM       </span><span className="cok">✓ done</span></span>
          <span className="ci"><span className="cd">↳ Health check           </span><span className="cok">✓ passed</span></span>
          <span className="ci" style={{ marginTop: 12 }} className="live">✦  Live → api.cloudach.com/llama-3-8b</span>
        </div>
        <div className="code-footer">
          <div className="status-dot" />
          <span className="status-txt">Deployed in 43s — A100 · us-east-1</span>
        </div>
      </div>
    </div>
  )
}
