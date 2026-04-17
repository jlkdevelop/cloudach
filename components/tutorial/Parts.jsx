import Link from 'next/link';
import { useState } from 'react';

/* ── Layout helpers ─────────────────────────────────────────────────────── */

export function Breadcrumb({ trail }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        fontSize: 13,
        color: 'var(--color-ink-whisper)',
        marginBottom: 24,
        flexWrap: 'wrap',
      }}
    >
      {trail.map((item, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {item.href && !isLast ? (
              <Link href={item.href} className="tutorial-breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span style={{ color: 'var(--color-ink-muted)' }}>{item.label}</span>
            )}
            {!isLast && <span aria-hidden="true">/</span>}
          </span>
        );
      })}
    </div>
  );
}

export function TutorialHeader({ level, duration, tags = [], title, lede }) {
  return (
    <header style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {level && <span className={`tutorial-chip tutorial-chip-${level.toLowerCase()}`}>{level}</span>}
        {duration && <span className="tutorial-chip tutorial-chip-duration">{duration}</span>}
        {tags.map((tag) => (
          <span key={tag} className="tutorial-chip tutorial-chip-lang">{tag}</span>
        ))}
      </div>
      <h1
        style={{
          fontSize: 'var(--font-display-lg)',
          fontWeight: 700,
          letterSpacing: 'var(--letter-display)',
          marginBottom: 12,
          color: 'var(--color-ink)',
        }}
      >
        {title}
      </h1>
      {lede && (
        <p
          style={{
            fontSize: 'var(--font-body-lg)',
            color: 'var(--color-ink-muted)',
            lineHeight: 'var(--line-body-airy)',
            marginBottom: 0,
          }}
        >
          {lede}
        </p>
      )}
    </header>
  );
}

export function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 52 }}>
      <h2 className="tutorial-section-title">{title}</h2>
      {children}
    </section>
  );
}

export function SubHeading({ children }) {
  return (
    <h3
      style={{
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 10,
        marginTop: 24,
        color: 'var(--color-ink)',
      }}
    >
      {children}
    </h3>
  );
}

export function P({ children, style }) {
  return (
    <p
      style={{
        fontSize: 14,
        color: 'var(--color-ink-muted)',
        lineHeight: 1.7,
        marginBottom: 12,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function A({ href, children }) {
  const external = typeof href === 'string' && /^https?:\/\//.test(href);
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} style={{ color: 'var(--color-brand-accent)', textDecoration: 'none' }}>
      {children}
    </Link>
  );
}

export function InlineCode({ children }) {
  return <code className="tutorial-inline-code">{children}</code>;
}

export function Callout({ children, tone = 'info' }) {
  return <div className={`tutorial-callout tutorial-callout-${tone}`}>{children}</div>;
}

/* ── Code block (deliberately dark; industry convention) ────────────────── */

export function CodeBlock({ children, language }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const text = typeof children === 'string' ? children : String(children);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="tutorial-code-wrap">
      {language && <div className="tutorial-code-lang">{language}</div>}
      <pre className="tutorial-code-pre">{children}</pre>
      <button
        type="button"
        onClick={copy}
        className={`tutorial-code-copy${copied ? ' tutorial-code-copy-ok' : ''}`}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

/* ── Lang tabs ──────────────────────────────────────────────────────────── */

export function LangTabs({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`tutorial-lang-tab${value === key ? ' tutorial-lang-tab-active' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ── Next-steps cards ──────────────────────────────────────────────────── */

export function NextStepCards({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="tutorial-card">
          <div className="tutorial-card-title">{item.label}</div>
          <div className="tutorial-card-desc">{item.desc}</div>
        </Link>
      ))}
    </div>
  );
}

/* ── Page footer (after next-steps) ─────────────────────────────────────── */

export function TutorialFooterLinks() {
  return (
    <div
      style={{
        marginTop: 64,
        paddingTop: 24,
        borderTop: '1px solid var(--color-rule)',
        display: 'flex',
        gap: 24,
        fontSize: 13,
        color: 'var(--color-ink-whisper)',
        flexWrap: 'wrap',
      }}
    >
      <a href="mailto:support@cloudach.com" className="tutorial-breadcrumb-link">
        support@cloudach.com
      </a>
      <Link href="/docs" className="tutorial-breadcrumb-link">
        API Docs
      </Link>
      <Link href="/dashboard" className="tutorial-breadcrumb-link">
        Dashboard
      </Link>
    </div>
  );
}
