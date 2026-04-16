import Link from 'next/link'
import Logo from './Logo'
import { useState, useEffect } from 'react'
import SearchModal from './SearchModal'

export default function Nav() {
  const [searchOpen, setSearchOpen] = useState(false)

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
            <Logo size={26} />
            <span className="logo-text">cloud<span>ach</span></span>
          </Link>

          <button
            className="nav-search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Search models, docs...</span>
          </button>
        </div>

        {/* Center: nav links */}
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#models">Models</a>
          <Link href="/pricing">Pricing</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/enterprise">Enterprise</Link>
          <Link href="/company">Company</Link>
        </div>

        {/* Right: auth */}
        <div className="nav-right">
          <Link href="/login">
            <button className="btn-ghost">Sign in</button>
          </Link>
          <Link href="/signup">
            <button className="btn-solid">Get started</button>
          </Link>
        </div>

      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
