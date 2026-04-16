import { useEffect, useState } from 'react'

// Deployment sequence phases:
// 0 = blank/cursor  1 = command typed  2 = config appears
// 3 = pulling weights (progress bar animates 0→100%)
// 4 = provisioning stages appear  5 = live endpoint glows  6 = pause then reset

const PHASES = [
  { duration: 600 },   // phase 0: blank with cursor
  { duration: 900 },   // phase 1: command types in
  { duration: 700 },   // phase 2: config lines appear
  { duration: 1800 },  // phase 3: progress bar fills
  { duration: 1200 },  // phase 4: ✓ stages appear
  { duration: 2800 },  // phase 5: live state — glowing endpoint
  { duration: 600 },   // phase 6: fade before reset
]

export default function DeployAnimation() {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let timer
    function advance(p) {
      const next = (p + 1) % PHASES.length
      timer = setTimeout(() => {
        if (next === 0) setProgress(0)
        setPhase(next)
        advance(next)
      }, PHASES[p].duration)
    }
    advance(phase)
    return () => clearTimeout(timer)
  }, [])

  // Animate progress bar during phase 3
  useEffect(() => {
    if (phase !== 3) return
    setProgress(0)
    const steps = 18
    let i = 0
    const iv = setInterval(() => {
      i++
      setProgress(Math.min(100, Math.round((i / steps) * 100)))
      if (i >= steps) clearInterval(iv)
    }, 1800 / steps)
    return () => clearInterval(iv)
  }, [phase])

  const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10))
  const isLive = phase >= 5

  return (
    <div className="da-wrap">
      {/* Floating stat cards */}
      <div className="da-stat da-stat-1">
        <div className="da-stat-val">10ms</div>
        <div className="da-stat-lbl">Avg. first token</div>
      </div>
      <div className="da-stat da-stat-2">
        <div className="da-stat-val">99.9%</div>
        <div className="da-stat-lbl">Uptime SLA</div>
      </div>
      <div className="da-stat da-stat-3">
        <div className="da-stat-val">50+</div>
        <div className="da-stat-lbl">Models available</div>
      </div>

      {/* Main terminal */}
      <div className={`code-window da-terminal${isLive ? ' da-live' : ''}`}>
        <div className="code-topbar">
          <div className="cdot" style={{ background: '#FF5F57' }} />
          <div className="cdot" style={{ background: '#FEBC2E' }} />
          <div className="cdot" style={{ background: '#28C840' }} />
          <span className="code-tab">cloudach — <span>deploy</span></span>
        </div>

        <div className="code-inner da-inner">
          {/* Phase 0: cursor only */}
          {phase === 0 && (
            <span className="ci da-cursor"><span className="cd">$ </span><span className="da-blink">▍</span></span>
          )}

          {/* Phase 1+: command */}
          {phase >= 1 && (
            <span className="ci"><span className="cd">$ </span><span style={{ color: '#c9d1d9' }}>cloudach deploy</span></span>
          )}

          {/* Phase 2+: config */}
          {phase >= 2 && (
            <>
              <span className="ci" style={{ marginTop: 8 }}>
                <span className="ck">model</span><span className="cd">:</span>{'   '}
                <span className="cv">meta-llama/Llama-3-8B-Instruct</span>
              </span>
              <span className="ci"><span className="ck">region</span><span className="cd">:</span>{'  '}<span className="cs">us-east-1</span></span>
              <span className="ci"><span className="ck">gpu</span><span className="cd">:</span>{'     '}<span className="cs">A100 × 1</span></span>
              <span className="ci"><span className="ck">scale</span><span className="cd">:</span>{'   '}<span className="cn">auto</span></span>
            </>
          )}

          {/* Phase 3+: progress */}
          {phase >= 3 && (
            <span className="ci" style={{ marginTop: 14 }}>
              <span className="cd">↳ Pulling weights{'        '}</span>
              <span className="co">{bar}</span>
              <span className="cd"> {progress}%</span>
            </span>
          )}

          {/* Phase 4+: stages */}
          {phase >= 4 && (
            <>
              <span className="ci"><span className="cd">↳ Provisioning GPU{'       '}</span><span className="cok">✓ done</span></span>
              <span className="ci"><span className="cd">↳ Configuring vLLM{'       '}</span><span className="cok">✓ done</span></span>
              <span className="ci"><span className="cd">↳ Health check{'           '}</span><span className="cok">✓ passed</span></span>
            </>
          )}

          {/* Phase 5+: live endpoint */}
          {phase >= 5 && (
            <span className="ci live" style={{ marginTop: 14 }}>
              ✦{'  '}Live → api.cloudach.com/llama-3-8b
            </span>
          )}
        </div>

        <div className="code-footer">
          <div className={`status-dot${isLive ? '' : ' status-dot--idle'}`} />
          <span className="status-txt">
            {isLive ? 'Deployed in 43s — A100 · us-east-1' : 'Deploying…'}
          </span>
          <span className="code-footer-time">{isLive ? 'just now' : '…'}</span>
        </div>
      </div>
    </div>
  )
}
