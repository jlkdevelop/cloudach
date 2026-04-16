import Link from 'next/link';
import { useTranslation } from '../lib/translations';
import DeployAnimation from './DeployAnimation';

export default function Hero() {
  const { t } = useTranslation()

  return (
    <div className="hero-outer">
      <div className="hero-glow-1" />
      <div className="hero-glow-2" />
      <div className="hero-glow-3" />

      <div className="hero-wrap">
        {/* Animated centerpiece — above headline */}
        <DeployAnimation />

        <div className="hero">
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

      </div>
    </div>
  )
}
