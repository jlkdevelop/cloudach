import Link from 'next/link'
import Logo from './Logo'
import { useState, useEffect } from 'react'
import SearchModal from './SearchModal'
import LanguageSwitcher from './LanguageSwitcher'

export default function Nav() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [])

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(s => !s)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <nav className="nav">

        {/* Left: logo + search */}
        <div className="nav-left">
          <Link href="/" className="logo">
            <Logo size={32} />
            <span className="logo-text">cloud<span>ach</span></span>
          </Link>

          <button
            className="nav-search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Search models, docs...</span>
          </button>
        </div>

        {/* Center: nav links — absolutely centered in the nav bar */}
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#models">Models</a>
          <Link href="/pricing">Pricing</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/enterprise">Enterprise</Link>
          <Link href="/company">Company</Link>
        </div>

        {/* Right: language + auth */}
        <div className="nav-right">
          <LanguageSwitcher />
          <div className="nav-divider" />
          <Link href="/login">
            <button className="btn-ghost">Sign in</button>
          </Link>
          <Link href="/signup">
            <button className="btn-solid">Get started</button>
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

      </nav>

      {menuOpen && (
        <div className="nav-mobile-drawer">
          <div className="nav-mobile-links">
            <a href="/#platform" onClick={() => setMenuOpen(false)}>Platform</a>
            <a href="/#models" onClick={() => setMenuOpen(false)}>Models</a>
            <Link href="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link href="/docs" onClick={() => setMenuOpen(false)}>Docs</Link>
            <Link href="/enterprise" onClick={() => setMenuOpen(false)}>Enterprise</Link>
            <Link href="/company" onClick={() => setMenuOpen(false)}>Company</Link>
          </div>
          <div className="nav-mobile-auth">
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <button className="nav-mobile-signin">Sign in</button>
            </Link>
            <Link href="/signup" onClick={() => setMenuOpen(false)}>
              <button className="btn-solid" style={{ width: '100%', padding: '10px' }}>Get started free</button>
            </Link>
          </div>
        </div>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
