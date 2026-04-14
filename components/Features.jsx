const features = [
  { num: '01', title: 'One-click deployment', desc: 'Point to any HuggingFace repo or upload your weights. We containerize, provision, and serve automatically.' },
  { num: '02', title: 'Autoscaling inference', desc: 'Scale from zero to thousands of RPS in seconds. Pay only for tokens processed — no idle GPU billing.' },
  { num: '03', title: 'OpenAI-compatible API', desc: 'Swap your base URL and go. Same SDK, same interface — your open-source model, your infrastructure.' },
  { num: '04', title: 'Private VPC isolation', desc: 'Your model, your network. No shared compute. Enterprise deployments support full air-gap mode.' },
  { num: '05', title: 'Sub-100ms TTFT', desc: 'vLLM continuous batching, flash attention, and tensor parallelism — tuned for low latency at high load.' },
  { num: '06', title: 'Fine-tuning jobs', desc: 'Run LoRA and QLoRA fine-tunes on your data directly on the platform. No external training infra needed.' },
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
          <div className="feat" key={f.num}>
            <div className="feat-num">{f.num}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
