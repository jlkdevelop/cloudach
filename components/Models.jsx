const models = [
  {
    badge: 'mb-os',
    label: 'Open source',
    name: 'Llama 3.1 8B',
    sub: 'Meta · 128K ctx',
    ttft: '68 ms',
    tps: '1,380 tok/s',
  },
  {
    badge: 'mb-os',
    label: 'Open source',
    name: 'Llama 3.1 70B',
    sub: 'Meta · 128K ctx',
    ttft: '210 ms',
    tps: '360 tok/s',
  },
  {
    badge: 'mb-os',
    label: 'Open source',
    name: 'Mistral 7B',
    sub: 'Mistral AI · 32K ctx',
    ttft: '55 ms',
    tps: '1,560 tok/s',
  },
  {
    badge: 'mb-os',
    label: 'Open source',
    name: 'Mixtral 8×7B',
    sub: 'Mistral AI · MoE · 32K ctx',
    ttft: '145 ms',
    tps: '820 tok/s',
  },
  {
    badge: 'mb-os',
    label: 'Open source',
    name: 'DeepSeek R1 7B',
    sub: 'DeepSeek · Reasoning · 64K ctx',
    ttft: '72 ms',
    tps: '1,290 tok/s',
  },
  {
    badge: 'mb-os',
    label: 'Open source',
    name: 'Qwen 2.5 72B',
    sub: 'Alibaba · Multilingual · 128K ctx',
    ttft: '205 ms',
    tps: '355 tok/s',
  },
  {
    badge: 'mb-os',
    label: 'Open source',
    name: 'Phi-3 Mini',
    sub: 'Microsoft · Compact · 4K ctx',
    ttft: '28 ms',
    tps: '2,450 tok/s',
  },
  {
    badge: 'mb-os',
    label: 'Open source',
    name: 'CodeLlama 13B',
    sub: 'Meta · Code · 16K ctx',
    ttft: '88 ms',
    tps: '1,050 tok/s',
  },
  {
    badge: 'mb-cu',
    label: 'Custom',
    name: 'HuggingFace import',
    sub: 'Any public or private repo',
    ttft: null,
    tps: null,
  },
  {
    badge: 'mb-cu',
    label: 'Custom',
    name: 'Upload your weights',
    sub: 'GGUF · safetensors · bin',
    ttft: null,
    tps: null,
  },
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
              {m.ttft && (
                <div className="mbench">
                  <span title="Time to First Token p50">⚡ {m.ttft} TTFT</span>
                  <span title="Throughput tokens/sec">🚀 {m.tps}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
