const features = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L10 6H15L11 9.5L12.5 15L8 12L3.5 15L5 9.5L1 6H6L8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'One-click deployment',
    desc: 'Point to any HuggingFace repo or upload your weights. We containerize, provision, and serve automatically.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="10" width="2.5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="5" y="7" width="2.5" height="8" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="4" width="2.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="13" y="1" width="2.5" height="14" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    title: 'Autoscaling inference',
    desc: 'Scale from zero to thousands of RPS in seconds. Pay only for tokens processed — no idle GPU billing.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="4" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="12" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M6.5 8H9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    title: 'OpenAI-compatible API',
    desc: 'Swap your base URL and go. Same SDK, same interface — your open-source model, your infrastructure.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L13 4V8C13 11 10.5 13.5 8 14.5C5.5 13.5 3 11 3 8V4L8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M6 8L7.5 9.5L10.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Private VPC isolation',
    desc: 'Your model, your network. No shared compute. Enterprise deployments support full air-gap mode.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M9 1L5 9H8L7 15L11 7H8L9 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Sub-100ms TTFT',
    desc: 'vLLM continuous batching, flash attention, and tensor parallelism — tuned for low latency at high load.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 5H14M2 8H10M2 11H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="13" cy="11" r="2" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    title: 'Fine-tuning jobs',
    desc: 'Run LoRA and QLoRA fine-tunes on your data directly on the platform. No external training infra needed.',
  },
]

export default function Features() {
  return (
    <section id="platform" className="section-wrap">
      <div className="sec-header">
        <div>
          <div className="sec-tag">Platform</div>
          <h2 className="sec-title">Infrastructure built for serious LLM workloads</h2>
        </div>
        <p className="sec-sub">From first deploy to enterprise scale — Cloudach handles GPUs, networking, and scaling so your team ships faster.</p>
      </div>
      <div className="feat-grid">
        {features.map(f => (
          <div className="feat" key={f.title}>
            <div className="feat-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
