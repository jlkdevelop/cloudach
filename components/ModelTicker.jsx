const ROW1 = [
  { name: 'Llama 3.1 70B',    tag: 'LLM',        metric: '360 tok/s',   org: 'Meta' },
  { name: 'Mistral 7B',       tag: 'LLM',        metric: '1,560 tok/s', org: 'Mistral AI' },
  { name: 'Mixtral 8×7B',     tag: 'MoE',        metric: '820 tok/s',   org: 'Mistral AI' },
  { name: 'DeepSeek R1 7B',   tag: 'Reasoning',  metric: '1,290 tok/s', org: 'DeepSeek' },
  { name: 'Llama 3.1 8B',     tag: 'LLM',        metric: '1,380 tok/s', org: 'Meta' },
  { name: 'Command R+',       tag: 'RAG',        metric: '480 tok/s',   org: 'Cohere' },
  { name: 'DBRX Instruct',    tag: 'MoE',        metric: '610 tok/s',   org: 'Databricks' },
  { name: 'Gemma 2 9B',       tag: 'LLM',        metric: '990 tok/s',   org: 'Google' },
]

const ROW2 = [
  { name: 'Qwen 2.5 72B',     tag: 'Multilingual', metric: '355 tok/s',   org: 'Alibaba' },
  { name: 'CodeLlama 34B',    tag: 'Code',         metric: '1,050 tok/s', org: 'Meta' },
  { name: 'Phi-3 Mini',       tag: 'Compact',      metric: '2,450 tok/s', org: 'Microsoft' },
  { name: 'Llama 3.1 405B',   tag: 'Frontier',     metric: '110 tok/s',   org: 'Meta' },
  { name: 'Falcon 40B',       tag: 'LLM',          metric: '420 tok/s',   org: 'TII' },
  { name: 'Yi 34B',           tag: 'Bilingual',    metric: '380 tok/s',   org: '01.AI' },
  { name: 'Vicuna 13B',       tag: 'Fine-tuned',   metric: '950 tok/s',   org: 'LMSYS' },
  { name: 'OpenHermes 2.5',   tag: 'Fine-tuned',   metric: '1,100 tok/s', org: 'Teknium' },
]

const TAG_COLORS = {
  LLM:        { bg: 'rgba(255,255,255,0.08)',  text: 'rgba(255,255,255,0.60)' },
  MoE:        { bg: 'rgba(251,146,60,0.15)',  text: '#fb923c' },
  Reasoning:  { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
  Code:       { bg: 'rgba(34,211,238,0.15)',  text: '#22d3ee' },
  RAG:        { bg: 'rgba(52,211,153,0.15)',  text: '#34d399' },
  Multilingual:{ bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
  Compact:    { bg: 'rgba(244,114,182,0.15)', text: '#f472b6' },
  Frontier:   { bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
  Bilingual:  { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80' },
  'Fine-tuned':{ bg: 'rgba(148,163,184,0.15)',text: '#94a3b8' },
}

function TickerCard({ name, tag, metric, org }) {
  const tc = TAG_COLORS[tag] || TAG_COLORS.LLM
  return (
    <div className="ticker-card">
      <div className="ticker-card-name">{name}</div>
      <div className="ticker-card-meta">
        <span className="ticker-tag" style={{ background: tc.bg, color: tc.text }}>{tag}</span>
        <span className="ticker-org">{org}</span>
        {metric && <span className="ticker-metric">⚡ {metric}</span>}
      </div>
    </div>
  )
}

function TickerRow({ items, reverse }) {
  const doubled = [...items, ...items]
  return (
    <div className="ticker-row">
      <div className={`ticker-track ${reverse ? 'ticker-reverse' : ''}`}>
        {doubled.map((item, i) => (
          <TickerCard key={i} {...item} />
        ))}
      </div>
    </div>
  )
}

export default function ModelTicker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-fade-left" />
      <div className="ticker-fade-right" />
      <TickerRow items={ROW1} reverse={false} />
      <TickerRow items={ROW2} reverse={true} />
    </div>
  )
}
