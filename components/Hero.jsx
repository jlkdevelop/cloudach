import Link from 'next/link';
import { useTranslation } from '../lib/translations';
import DeployAnimation from './DeployAnimation';

export default function Hero() {
  const { t } = useTranslation()

  return (
    <div className="hero-outer">
      {/* Background video — light-grid on black, very low opacity */}
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      >
        <source src="/video/hero-bg.webm" type="video/webm" />
        <source src="/video/hero-bg.mp4" type="video/mp4" />
      </video>
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

        </div>

      </div>
    </div>
  )
}
