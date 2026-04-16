import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Logo from '../../../components/Logo';

export default function JoinTeamPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('loading'); // loading | joining | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;

    async function checkAuth() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        // Not logged in — redirect to login with return URL
        router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
        return;
      }
      setStatus('ready');
    }
    checkAuth();
  }, [token, router]);

  async function handleJoin() {
    setStatus('joining');
    try {
      const res = await fetch(`/api/team/join/${token}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to join team.');
        setStatus('error');
        return;
      }
      setStatus('success');
      setTimeout(() => router.push('/dashboard/team'), 2000);
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <>
      <Head><title>Join Team — Cloudach</title></Head>
      <div style={{
        minHeight: '100vh', background: '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '40px 48px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.08)', maxWidth: 420, width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <Logo size={32} />
          </div>

          {status === 'loading' && (
            <p style={{ color: '#6B7280', fontSize: 14 }}>Verifying invite…</p>
          )}

          {status === 'ready' && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                You&apos;ve been invited
              </h1>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
                Accept this invite to join your team on Cloudach. You&apos;ll share access to API keys and usage dashboards with your teammates.
              </p>
              <button
                onClick={handleJoin}
                style={{
                  width: '100%', padding: '12px 24px', background: '#ffffff',
                  color: '#0d0e17', border: 'none', borderRadius: 10, fontSize: 15,
                  fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.2px',
                }}
              >
                Accept invite
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  width: '100%', marginTop: 10, padding: '12px 24px', background: 'transparent',
                  color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Decline
              </button>
            </>
          )}

          {status === 'joining' && (
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>Joining team…</p>
          )}

          {status === 'success' && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                Welcome to the team!
              </h2>
              <p style={{ color: '#6B7280', fontSize: 14 }}>Redirecting to your team dashboard…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10,
                padding: '14px 18px', marginBottom: 20, color: '#991B1B', fontSize: 13.5,
              }}>
                {errorMsg}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '10px 24px', background: '#ffffff', color: '#0d0e17',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Go to dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
