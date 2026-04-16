import Link from 'next/link'
import Logo from './Logo'
import { useState, useEffect } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '../lib/translations'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setMenuOpen(false)
  }, [])

  return (
    <>
      <nav className="nav">
        <div className="nav-pill">

          {/* Left: logo */}
          <div className="nav-left">
            <Link href="/" className="logo">
              <Logo size={28} monochrome />
              <span className="logo-text">cloud<span>ach</span></span>
            </Link>
          </div>

          {/* Center: nav links — absolutely centered in pill */}
          <div className="nav-links">
            <a href="#platform">{t('nav.platform')}</a>
            <a href="#models">{t('nav.models')}</a>
            <Link href="/pricing">{t('nav.pricing')}</Link>
            <Link href="/docs">{t('nav.docs')}</Link>
            <Link href="/enterprise">{t('nav.enterprise')}</Link>
            <Link href="/company">{t('nav.company')}</Link>
          </div>

          {/* Right: language + auth */}
          <div className="nav-right">
            <LanguageSwitcher />
            <div className="nav-divider" />
            <Link href="/login">
              <button className="btn-ghost">{t('nav.signin')}</button>
            </Link>
            <Link href="/signup">
              <button className="btn-solid">{t('nav.getstarted')}</button>
            </Link>
          </div>

          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            )}
          </button>

        </div>
      </nav>

      {menuOpen && (
        <div className="nav-mobile-drawer">
          <div className="nav-mobile-links">
            <a href="/#platform" onClick={() => setMenuOpen(false)}>{t('nav.platform')}</a>
            <a href="/#models" onClick={() => setMenuOpen(false)}>{t('nav.models')}</a>
            <Link href="/pricing" onClick={() => setMenuOpen(false)}>{t('nav.pricing')}</Link>
            <Link href="/docs" onClick={() => setMenuOpen(false)}>{t('nav.docs')}</Link>
            <Link href="/enterprise" onClick={() => setMenuOpen(false)}>{t('nav.enterprise')}</Link>
            <Link href="/company" onClick={() => setMenuOpen(false)}>{t('nav.company')}</Link>
          </div>
          <div className="nav-mobile-auth">
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <button className="nav-mobile-signin">{t('nav.signin')}</button>
            </Link>
            <Link href="/signup" onClick={() => setMenuOpen(false)}>
              <button className="btn-solid" style={{ width: '100%', padding: '10px' }}>{t('nav.getstartedfree')}</button>
            </Link>
          </div>
        </div>
      )}

    </>
  )
}
