import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '../components/Logo';

function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'rgba(239,68,68,0.75)', 'rgba(234,179,8,0.75)', 'rgba(132,204,22,0.70)', 'rgba(34,197,94,0.80)'];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/register', {
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

    router.replace('/dashboard?welcome=1');
  }

  return (
    <>
      <Head>
        <title>Create account — Cloudach</title>
        <meta name="description" content="Create your free Cloudach account and start managing LLM infrastructure in minutes." />
        <meta property="og:title" content="Create account — Cloudach" />
        <meta property="og:url" content="https://cloudach.com/signup" />
      </Head>

      <div className="db-login-shell">
        <div className="db-login-card">

          {/* Logo */}
          <Link href="/" className="db-login-logo">
            <Logo size={36} />
          </Link>

          <h1 className="db-login-title">Create your account</h1>
          <p className="db-login-sub">Free forever — no credit card required.</p>

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
              <label className="db-label">Email address</label>
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
              <label className="db-label">Password</label>
              <div className="db-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="db-input db-input--pw"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
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

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="db-strength">
                  <div className="db-strength-bars">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="db-strength-bar"
                        style={{
                          background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(13,14,23,0.10)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="db-strength-label" style={{ color: STRENGTH_COLORS[strength] }}>
                    {STRENGTH_LABELS[strength]}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="db-login-full-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="db-login-btn-inner">
                  <span className="db-login-spinner" />
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="db-login-switch">
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
          </div>

          <p className="db-login-terms">
            By creating an account you agree to our{' '}
            <Link href="/terms">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
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

function IconAlert() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" stroke="rgba(252,165,165,0.80)" strokeWidth="1.5"/>
      <path d="M8 5v3.5M8 11h.01" stroke="rgba(252,165,165,0.80)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
