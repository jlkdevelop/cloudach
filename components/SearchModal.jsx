import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const ITEMS = [
  { type: 'Model',  label: 'Llama 3.1 70B',    sub: 'Meta · 128K ctx',             href: '/docs#models' },
  { type: 'Model',  label: 'Llama 3.1 8B',     sub: 'Meta · Fast · 128K ctx',      href: '/docs#models' },
  { type: 'Model',  label: 'Mistral 7B',        sub: 'Mistral AI · 32K ctx',        href: '/docs#models' },
  { type: 'Model',  label: 'Mixtral 8×7B',      sub: 'Mistral AI · MoE · 32K ctx',  href: '/docs#models' },
  { type: 'Model',  label: 'DeepSeek R1 7B',    sub: 'DeepSeek · Reasoning',         href: '/docs#models' },
  { type: 'Model',  label: 'Qwen 2.5 72B',      sub: 'Alibaba · Multilingual',       href: '/docs#models' },
  { type: 'Model',  label: 'CodeLlama 34B',     sub: 'Meta · Code generation',       href: '/docs#models' },
  { type: 'Model',  label: 'Phi-3 Mini',        sub: 'Microsoft · Compact · 4K ctx', href: '/docs#models' },
  { type: 'Doc',    label: 'Quickstart guide',  sub: 'Get your first API call running', href: '/docs#quickstart' },
  { type: 'Doc',    label: 'Authentication',    sub: 'API keys and bearer tokens',   href: '/docs#authentication' },
  { type: 'Doc',    label: 'Chat completions',  sub: 'OpenAI-compatible endpoint',   href: '/docs#chat-completions' },
  { type: 'Doc',    label: 'Fine-tuning',       sub: 'LoRA and QLoRA on your data',  href: '/docs#fine-tuning' },
  { type: 'Doc',    label: 'SDK reference',     sub: 'Python · Node.js · cURL',      href: '/docs#sdks' },
  { type: 'Doc',    label: 'Rate limits',       sub: 'Token quotas and limits',      href: '/docs#rate-limits' },
  { type: 'Page',   label: 'Pricing',           sub: 'Starter · Pro · Enterprise',   href: '/pricing' },
  { type: 'Page',   label: 'Enterprise',        sub: 'Private VPC · SOC 2 · HIPAA',  href: '/enterprise' },
  { type: 'Page',   label: 'System status',     sub: 'Live uptime and incidents',    href: '/status' },
]

const TYPE_COLORS = {
  Model: { bg: 'rgba(79,110,247,0.12)', text: '#818cf8' },
  Doc:   { bg: 'rgba(34,197,94,0.10)',  text: '#4ade80' },
  Page:  { bg: 'rgba(251,191,36,0.10)', text: '#fbbf24' },
}

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery]     = useState('')
  const [active, setActive]   = useState(0)
  const inputRef              = useRef(null)
  const router                = useRouter()

  const filtered = query.trim()
    ? ITEMS.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.sub.toLowerCase().includes(query.toLowerCase())
      )
    : ITEMS

  useEffect(() => { setActive(0) }, [query])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60)
      document.body.style.overflow = 'hidden'
    } else {
      setQuery('')
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function handleKey(e) {
    if (e.key === 'Escape')     { onClose(); return }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === 'Enter' && filtered[active]) {
      router.push(filtered[active].href)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="sm-overlay" onMouseDown={onClose}>
      <div
        className="sm-box"
        onMouseDown={e => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        {/* Input row */}
        <div className="sm-input-row">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="sm-icon">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            className="sm-input"
            placeholder="Search models, docs, pages..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="sm-clear" onClick={() => { setQuery(''); inputRef.current?.focus() }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          <kbd className="sm-esc" onClick={onClose}>esc</kbd>
        </div>

        {/* Divider */}
        <div className="sm-divider" />

        {/* Section label */}
        <div className="sm-section-label">
          {query ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'Browse'}
        </div>

        {/* Results */}
        <div className="sm-results">
          {filtered.length === 0 ? (
            <div className="sm-empty">No results for &ldquo;{query}&rdquo;</div>
          ) : (
            filtered.map((item, i) => {
              const tc = TYPE_COLORS[item.type] || TYPE_COLORS.Page
              return (
                <Link
                  key={i}
                  href={item.href}
                  className={`sm-item${i === active ? ' sm-item-active' : ''}`}
                  onClick={onClose}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="sm-type" style={{ background: tc.bg, color: tc.text }}>
                    {item.type}
                  </span>
                  <span className="sm-label">{item.label}</span>
                  <span className="sm-sub">{item.sub}</span>
                  <svg className="sm-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="sm-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
