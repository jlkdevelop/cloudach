import Link from 'next/link'
import Logo from './Logo'
import { useRef, useEffect } from 'react'

export default function Nav() {
  const searchRef = useRef(null)

  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link href="/" className="logo">
          <Logo size={26} />
          <span className="logo-text">cloud<span>ach</span></span>
        </Link>

        {/* Search box */}
        <div className="nav-search">
          <svg className="nav-search-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search models..."
            className="nav-search-input"
            onFocus={e => e.currentTarget.parentElement.classList.add('focused')}
            onBlur={e => e.currentTarget.parentElement.classList.remove('focused')}
          />
          <kbd className="nav-search-kbd">⌘K</kbd>
        </div>
      </div>

      <div className="nav-links">
        <a href="#platform">Platform</a>
        <a href="#models">Models</a>
        <Link href="/pricing">Pricing</Link>
        <Link href="/docs">Docs</Link>
        <Link href="/enterprise">Enterprise</Link>
      </div>

      <div className="nav-right">
        <Link href="/login">
          <button className="btn-ghost">Sign in</button>
        </Link>
        <Link href="/signup">
          <button className="btn-solid">Get started</button>
        </Link>
      </div>
    </nav>
  )
}
