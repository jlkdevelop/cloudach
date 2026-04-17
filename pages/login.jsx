import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '../components/Logo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminHint, setAdminHint] = useState(null);
  const lastHintEmailRef = useRef('');

  useEffect(() => {
    if (mode !== 'login') { setAdminHint(null); return; }
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) { setAdminHint(null); return; }
    if (trimmed === lastHintEmailRef.current) return;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      lastHintEmailRef.current = trimmed;
      try {
        const res = await fetch('/api/auth/admin-hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed }),
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setAdminHint(data.hint === 'admin' ? 'admin' : null);
      } catch (_) {
        // Network errors or aborts are silent — it's a cosmetic hint.
      }
    }, 500);
    return () => { clearTimeout(t); controller.abort(); };
  }, [email, mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }

    router.replace(mode === 'register' ? '/dashboard?welcome=1' : '/dashboard');
  }

  function switchMode(next) {
    setMode(next);
    setError('');
    setShowPassword(false);
  }

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Sign in' : 'Create account'} — Cloudach</title>
        <meta name="description" content="Sign in to your Cloudach account to manage your LLM infrastructure." />
        <meta property="og:title" content="Sign in — Cloudach" />
        <meta property="og:url" content="https://cloudach.com/login" />
      </Head>

      <div className="db-login-shell">
        <div className="db-login-card">

          {/* Logo */}
          <Link href="/" className="db-login-logo">
            <Logo size={36} />
          </Link>

          {/* Heading */}
          <h1 className="db-login-title">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="db-login-sub">
            {mode === 'login'
              ? 'Sign in to manage your LLM infrastructure.'
              : 'Get started free — no credit card required.'}
          </p>

          {/* Error */}
          {error && (
            <div className="db-login-error">
              <IconAlert />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="db-login-form">
            <div className="db-field">
              <div className="db-label-row">
                <label className="db-label">Email address</label>
                {adminHint === 'admin' && (
                  <span className="db-login-admin-badge" aria-label="Admin account detected">
                    <span className="db-login-admin-badge-dot" aria-hidden="true" />
                    Admin
                  </span>
                )}
              </div>
              <input
                type="email"
                className="db-input"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="db-field">
              <div className="db-label-row">
                <label className="db-label">Password</label>
                {mode === 'login' && (
                  <Link href="/forgot-password" className="db-label-link">Forgot password?</Link>
                )}
              </div>
              <div className="db-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="db-input db-input--pw"
                  placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="db-pw-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="db-login-full-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="db-login-btn-inner">
                  <span className="db-login-spinner" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                <span className="db-login-btn-inner">
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                  <IconArrowRight />
                </span>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="db-login-switch">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <a onClick={() => switchMode('register')}>Sign up free</a>
              </>
            ) : (
              <>Already have an account?{' '}
                <a onClick={() => switchMode('login')}>Sign in</a>
              </>
            )}
          </div>

          {mode === 'register' && (
            <p className="db-login-terms">
              By creating an account you agree to our{' '}
              <Link href="/terms">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function IconEye() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0110 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M4.2 4.3C2.6 5.4 1 8 1 8s2.5 5 7 5c1.4 0 2.7-.4 3.8-1M6.9 3.1C7.3 3 7.6 3 8 3c4.5 0 7 5 7 5s-.6 1.2-1.7 2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, opacity: 0.85, transition: 'transform 0.15s' }}>
      <path d="M3 8h9.5M9 4.5L12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" stroke="rgba(252,165,165,0.80)" strokeWidth="1.5"/>
      <path d="M8 5v3.5M8 11h.01" stroke="rgba(252,165,165,0.80)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
