import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '../components/Logo';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    // Redirect to dashboard with welcome flag to show quickstart guide
    router.replace('/dashboard?welcome=1');
  }

  return (
    <>
      <Head>
        <title>Create account — Cloudach</title>
        <meta name="description" content="Create your free Cloudach account and deploy your first LLM in minutes." />
        <meta property="og:title" content="Create account — Cloudach" />
        <meta property="og:description" content="Create your free Cloudach account and deploy your first LLM in minutes." />
        <meta property="og:url" content="https://cloudach.com/signup" />
        <meta name="twitter:title" content="Create account — Cloudach" />
        <meta name="twitter:description" content="Create your free Cloudach account and deploy your first LLM in minutes." />
      </Head>
      <div className="db-login-shell">
        <div className="db-login-card">
          <div className="db-login-logo">
            <Logo size={26} />
            <span className="db-login-brand">cloud<span>ach</span></span>
          </div>

          <h1 className="db-login-title">Create your account</h1>
          <p className="db-login-sub">
            Get started free. No credit card required.
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
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              className="db-login-full-btn"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="db-login-switch">
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
          </div>

          <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 16 }}>
            By creating an account you agree to our{' '}
            <a href="/terms" style={{ color: '#6B7280', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: '#6B7280', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </>
  );
}
