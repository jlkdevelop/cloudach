const models = [
  { badge: 'mb-os', label: 'Open source', name: 'Llama 3 8B / 70B', sub: 'Meta · General purpose' },
  { badge: 'mb-os', label: 'Open source', name: 'Mistral 7B', sub: 'Mistral AI · Efficient' },
  { badge: 'mb-os', label: 'Open source', name: 'Mixtral 8×7B', sub: 'Mistral AI · MoE' },
  { badge: 'mb-os', label: 'Open source', name: 'Qwen 2.5 72B', sub: 'Alibaba · Multilingual' },
  { badge: 'mb-os', label: 'Open source', name: 'Gemma 2B / 7B', sub: 'Google · Lightweight' },
  { badge: 'mb-os', label: 'Open source', name: 'Phi-3 Mini / Medium', sub: 'Microsoft · Compact' },
  { badge: 'mb-cu', label: 'Custom', name: 'HuggingFace import', sub: 'Any public or private repo' },
  { badge: 'mb-cu', label: 'Custom', name: 'Upload your weights', sub: 'GGUF · safetensors · bin' },
]

export default function Models() {
  return (
    <section id="models" className="stripe-bg">
      <div className="section-wrap">
        <div className="sec-header">
          <div>
            <div className="sec-tag">Models</div>
            <h2 className="sec-title">Any model.<br />Your model.</h2>
          </div>
          <p className="sec-sub">Deploy from our curated open-source library or bring your own fine-tuned weights. GGUF, safetensors, and HuggingFace all supported.</p>
        </div>
        <div className="model-grid">
          {models.map(m => (
            <div className="mcard" key={m.name}>
              <span className={`mbadge ${m.badge}`}>{m.label}</span>
              <h4>{m.name}</h4>
              <p>{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
