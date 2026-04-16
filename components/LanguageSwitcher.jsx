import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'

const LANGUAGES = [
  { code: 'en', native: 'English',    label: 'EN' },
  { code: 'ar', native: 'العربية',    label: 'AR' },
  { code: 'fr', native: 'Français',   label: 'FR' },
  { code: 'de', native: 'Deutsch',    label: 'DE' },
  { code: 'es', native: 'Español',    label: 'ES' },
  { code: 'pt', native: 'Português',  label: 'PT' },
  { code: 'zh', native: '中文',        label: 'ZH' },
  { code: 'ja', native: '日本語',      label: 'JA' },
]

export default function LanguageSwitcher({ compact = false }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = LANGUAGES.find(l => l.code === router.locale) || LANGUAGES[0]

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handler(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  function switchLocale(code) {
    setOpen(false)
    router.push(router.asPath, undefined, { locale: code, scroll: false })
  }

  return (
    <div className="lang-wrap" ref={ref}>
      <button
        className={`lang-trigger${compact ? ' lang-trigger--compact' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Switch language"
        aria-expanded={open}
      >
        {/* Globe icon */}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8S8 14.5 8 14.5M1.5 8h13M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span className="lang-label">{current.label}</span>
        <svg className={`lang-chevron${open ? ' lang-chevron--open' : ''}`} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="lang-dropdown">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`lang-option${lang.code === current.code ? ' lang-option--active' : ''}`}
              onClick={() => switchLocale(lang.code)}
            >
              <span className="lang-option-code">{lang.label}</span>
              <span className="lang-option-native">{lang.native}</span>
              {lang.code === current.code && (
                <svg className="lang-option-check" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
