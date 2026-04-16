import { useTranslation } from '../lib/translations'

const modelData = [
  {
    badge: 'mb-os',
    labelKey: 'label_opensource',
    name: 'Llama 3.1 8B',
    sub: 'Meta · 128K ctx',
    ttft: '68 ms',
    tps: '1,380 tok/s',
  },
  {
    badge: 'mb-os',
    labelKey: 'label_opensource',
    name: 'Llama 3.1 70B',
    sub: 'Meta · 128K ctx',
    ttft: '210 ms',
    tps: '360 tok/s',
  },
  {
    badge: 'mb-os',
    labelKey: 'label_opensource',
    name: 'Mistral 7B',
    sub: 'Mistral AI · 32K ctx',
    ttft: '55 ms',
    tps: '1,560 tok/s',
  },
  {
    badge: 'mb-os',
    labelKey: 'label_opensource',
    name: 'Mixtral 8×7B',
    sub: 'Mistral AI · MoE · 32K ctx',
    ttft: '145 ms',
    tps: '820 tok/s',
  },
  {
    badge: 'mb-os',
    labelKey: 'label_opensource',
    name: 'DeepSeek R1 7B',
    sub: 'DeepSeek · Reasoning · 64K ctx',
    ttft: '72 ms',
    tps: '1,290 tok/s',
  },
  {
    badge: 'mb-os',
    labelKey: 'label_opensource',
    name: 'Qwen 2.5 72B',
    sub: 'Alibaba · Multilingual · 128K ctx',
    ttft: '205 ms',
    tps: '355 tok/s',
  },
  {
    badge: 'mb-os',
    labelKey: 'label_opensource',
    name: 'Phi-3 Mini',
    sub: 'Microsoft · Compact · 4K ctx',
    ttft: '28 ms',
    tps: '2,450 tok/s',
  },
  {
    badge: 'mb-os',
    labelKey: 'label_opensource',
    name: 'CodeLlama 13B',
    sub: 'Meta · Code · 16K ctx',
    ttft: '88 ms',
    tps: '1,050 tok/s',
  },
  {
    badge: 'mb-cu',
    labelKey: 'label_custom',
    name: 'HuggingFace import',
    sub: 'Any public or private repo',
    ttft: null,
    tps: null,
  },
  {
    badge: 'mb-cu',
    labelKey: 'label_custom',
    name: 'Upload your weights',
    sub: 'GGUF · safetensors · bin',
    ttft: null,
    tps: null,
  },
]

export default function Models() {
  const { t } = useTranslation()

  return (
    <section id="models" className="stripe-bg">
      <div className="section-wrap">
        <div className="sec-header">
          <div>
            <div className="sec-tag">{t('models.tag')}</div>
            <h2 className="sec-title">{t('models.title1')}<br />{t('models.title2')}</h2>
          </div>
          <p className="sec-sub">{t('models.sub')}</p>
        </div>
        <div className="model-grid">
          {modelData.map(m => (
            <div className="mcard" key={m.name}>
              <span className={`mbadge ${m.badge}`}>{t(`models.${m.labelKey}`)}</span>
              <h4>{m.name}</h4>
              <p>{m.sub}</p>
              {m.ttft && (
                <div className="mbench">
                  <span title="Time to First Token p50"><span className="mbench-val">{m.ttft}</span><span className="mbench-lbl">{t('models.ttft_label')}</span></span>
                  <span title="Throughput tokens/sec"><span className="mbench-val">{m.tps}</span><span className="mbench-lbl">{t('models.tps_label')}</span></span>
                </div>
              )}
              <div className="mcard-deploy">{t('models.deploy')}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
