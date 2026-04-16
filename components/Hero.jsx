import Link from 'next/link';
import { useTranslation } from '../lib/translations';

export default function Hero() {
  const { t } = useTranslation()

  return (
    <div className="hero-outer">
      {/* Ambient glow orbs */}
      <div className="hero-glow-1" />
      <div className="hero-glow-2" />
      <div className="hero-glow-3" />

      <div className="hero-wrap">
        {/* Left column */}
        <div className="hero">
          <div className="eyebrow hero-anim-1">
            <div className="eyebrow-dot" />
            {t('hero.eyebrow')}
          </div>

          <h1 className="hero-anim-2">
            {t('hero.headline1')}<br />
            {t('hero.headline2') ? <>{t('hero.headline2')}<br /></> : null}
            <em>{t('hero.headline3')}</em>
          </h1>

          <p className="hero-sub hero-anim-3">
            {t('hero.sub')}
          </p>

          <div className="hero-btns hero-anim-4">
            <Link href="/signup">
              <button className="btn-cta">
                {t('hero.cta_primary')}
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 6 }}>
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </Link>
            <Link href="/docs">
              <button className="btn-cta-ghost">{t('hero.cta_secondary')}</button>
            </Link>
          </div>

          <p className="hero-free-note hero-anim-4" style={{ animationDelay: '0.45s' }}>
            {t('hero.free_note')}
          </p>

          <div className="hero-stats hero-anim-5">
            <div className="hero-stat">
              <div className="stat-val">{t('hero.stat1_val')}</div>
              <div className="stat-label">{t('hero.stat1_label')}</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="stat-val">{t('hero.stat2_val')}</div>
              <div className="stat-label">{t('hero.stat2_label')}</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="stat-val">{t('hero.stat3_val')}</div>
              <div className="stat-label">{t('hero.stat3_label')}</div>
            </div>
          </div>
        </div>

        {/* Right column — animated code window */}
        <div className="code-window hero-anim-code">
          <div className="code-topbar">
            <div className="cdot" style={{ background: '#FF5F57' }} />
            <div className="cdot" style={{ background: '#FEBC2E' }} />
            <div className="cdot" style={{ background: '#28C840' }} />
            <span className="code-tab">cloudach — <span>deploy</span></span>
          </div>

          <div className="code-inner">
            <span className="ci"><span className="cd">$</span> <span style={{ color: '#c9d1d9' }}>cloudach deploy</span></span>
            <span className="ci" style={{ marginTop: 8 }}>
              <span className="ck">model</span><span className="cd">:</span>{'   '}
              <span className="cv">meta-llama/Llama-3-8B-Instruct</span>
            </span>
            <span className="ci"><span className="ck">region</span><span className="cd">:</span>{'  '}<span className="cs">us-east-1</span></span>
            <span className="ci"><span className="ck">gpu</span><span className="cd">:</span>{'     '}<span className="cs">A100 × 1</span></span>
            <span className="ci"><span className="ck">scale</span><span className="cd">:</span>{'   '}<span className="cn">auto</span></span>
            <span className="ci" style={{ marginTop: 14 }}>
              <span className="cd">↳ Pulling weights{'        '}</span><span className="co">████████░░</span><span className="cd"> 82%</span>
            </span>
            <span className="ci"><span className="cd">↳ Provisioning GPU{'       '}</span><span className="cok">✓ done</span></span>
            <span className="ci"><span className="cd">↳ Configuring vLLM{'       '}</span><span className="cok">✓ done</span></span>
            <span className="ci"><span className="cd">↳ Health check{'           '}</span><span className="cok">✓ passed</span></span>
            <span className="ci live" style={{ marginTop: 14 }}>
              ✦{'  '}Live → api.cloudach.com/llama-3-8b
            </span>
          </div>

          <div className="code-footer">
            <div className="status-dot" />
            <span className="status-txt">Deployed in 43s — A100 · us-east-1</span>
            <span className="code-footer-time">just now</span>
          </div>
        </div>
      </div>
    </div>
  )
}
