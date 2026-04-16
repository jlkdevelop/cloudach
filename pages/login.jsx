import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '../components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Sign in' : 'Create account'} — Cloudach</title>
        <meta name="description" content="Sign in to your Cloudach account to manage your deployed LLMs." />
        <meta property="og:title" content="Sign in — Cloudach" />
        <meta property="og:description" content="Sign in to your Cloudach account to manage your deployed LLMs." />
        <meta property="og:url" content="https://cloudach.com/login" />
        <meta name="twitter:title" content="Sign in — Cloudach" />
        <meta name="twitter:description" content="Sign in to your Cloudach account to manage your deployed LLMs." />
      </Head>
      <div className="db-login-shell">
        <div className="db-login-card">
          <div className="db-login-logo">
            <Logo size={26} monochrome />
            <span className="db-login-brand">cloud<span>ach</span></span>
          </div>

          <h1 className="db-login-title">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h1>
          <p className="db-login-sub">
            {mode === 'login'
              ? 'Deploy LLMs and manage your endpoints.'
              : 'Get started with a free account. No credit card required.'}
          </p>

          {error && <div className="db-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="db-field">
              <label className="db-label">Email</label>
              <input
                type="email"
                className="db-input"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="db-field">
              <label className="db-label">Password</label>
              <input
                type="password"
                className="db-input"
                placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={mode === 'register' ? 8 : 1}
              />
            </div>
            <button
              type="submit"
              className="db-login-full-btn"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading
                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div className="db-login-switch">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <a onClick={() => { setMode('register'); setError(''); }}>Sign up</a>
              </>
            ) : (
              <>Already have an account?{' '}
                <a onClick={() => { setMode('login'); setError(''); }}>Sign in</a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
