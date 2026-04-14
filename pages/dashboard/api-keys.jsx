import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

export default function ApiKeysPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newRateLimitRpm, setNewRateLimitRpm] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newRawKey, setNewRawKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null); // keyId pending revoke
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        setUser((await meRes.json()).user);
        await loadKeys();
      } catch {
        setError('Network error. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function loadKeys() {
    const res = await fetch('/api/dashboard/api-keys');
    if (res.ok) setKeys((await res.json()).keys);
    else setError('Failed to load API keys.');
  }

  async function createKey(e) {
    e.preventDefault();
    if (!newKeyName.trim()) { setCreateError('Name is required.'); return; }
    setCreating(true);
    setCreateError('');

    const body = { name: newKeyName.trim() };
    if (newRateLimitRpm.trim()) {
      const rpm = parseInt(newRateLimitRpm, 10);
      if (isNaN(rpm) || rpm < 1) {
        setCreateError('Rate limit must be a positive number.');
        setCreating(false);
        return;
      }
      body.rate_limit_rpm = rpm;
    }

    const res = await fetch('/api/dashboard/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error || 'Failed to create key.'); setCreating(false); return; }
    setNewRawKey(data.rawKey);
    setShowCreate(false);
    setNewKeyName('');
    setNewRateLimitRpm('');
    setCreating(false);
    await loadKeys();
  }

  async function confirmRevoke(keyId) {
    setRevoking(keyId);
    const res = await fetch(`/api/dashboard/api-keys/${keyId}/revoke`, { method: 'POST' });
    if (!res.ok) setError('Failed to revoke key. Please try again.');
    setRevokeTarget(null);
    setRevoking(null);
    await loadKeys();
  }

  function copyKey() {
    navigator.clipboard.writeText(newRawKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (loading || !user) return <PageLoader />;

  return (
    <>
      <Head><title>API Keys — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="db-page-title">API Keys</h1>
            <p className="db-page-subtitle">Create keys to authenticate requests to Cloudach endpoints.</p>
          </div>
          <button className="db-btn db-btn--primary" onClick={() => { setShowCreate(true); setCreateError(''); setNewRawKey(null); }}>
            + New key
          </button>
        </div>

        {error && <ErrorBanner message={error} />}

        {/* New key reveal */}
        {newRawKey && (
          <div className="db-key-reveal">
            <p><strong>Key created.</strong> Copy it now — it won&apos;t be shown again.</p>
            <div className="db-key-value">
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{newRawKey}</span>
              <button className="db-copy-btn" onClick={copyKey}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <div className="db-key-reveal-next" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#065F46' }}>Next:</span>
              <Link href="/dashboard/models">
                <button className="db-btn db-btn--primary db-btn--sm">Deploy a model →</button>
              </Link>
            </div>
          </div>
        )}

        {/* Keys table */}
        <div className="db-card">
          {keys.length === 0 ? (
            <div className="db-empty">
              <IconKeyEmpty />
              <div className="db-empty-title">No API keys yet</div>
              <div className="db-empty-desc">Create a key to authenticate requests to the Cloudach API.</div>
              <button
                className="db-btn db-btn--primary db-btn--sm"
                style={{ marginTop: 16 }}
                onClick={() => { setShowCreate(true); setCreateError(''); setNewRawKey(null); }}
              >
                + Create your first key
              </button>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className="db-col-hide-mobile">Created</th>
                    <th className="db-col-hide-mobile">Last used</th>
                    <th className="db-col-hide-mobile">Rate limit</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <React.Fragment key={k.id}>
                      <tr>
                        <td><strong>{k.name}</strong></td>
                        <td className="db-col-hide-mobile">{fmtDate(k.created_at)}</td>
                        <td className="db-col-hide-mobile">{k.last_used_at ? fmtDate(k.last_used_at) : <span style={{ color: '#9CA3AF' }}>Never</span>}</td>
                        <td className="db-col-hide-mobile">
                          {k.rate_limit_rpm
                            ? <span style={{ fontSize: 12 }}>{k.rate_limit_rpm} rpm</span>
                            : <span style={{ color: '#9CA3AF', fontSize: 12 }}>Unlimited</span>}
                        </td>
                        <td>
                          {k.revoked_at
                            ? <span className="db-badge db-badge--revoked">Revoked</span>
                            : <span className="db-badge db-badge--active">Active</span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {!k.revoked_at && (
                            revokeTarget === k.id ? null : (
                              <button
                                className="db-btn db-btn--danger db-btn--sm"
                                onClick={() => setRevokeTarget(k.id)}
                              >
                                Revoke
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                      {revokeTarget === k.id && (
                        <tr>
                          <td colSpan={6} style={{ padding: '0 14px 12px' }}>
                            <div className="db-inline-confirm">
                              <span>Revoke <strong>{k.name}</strong>? This cannot be undone.</span>
                              <div className="db-inline-confirm-actions">
                                <button
                                  className="db-btn db-btn--ghost db-btn--sm"
                                  onClick={() => setRevokeTarget(null)}
                                  disabled={revoking === k.id}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="db-btn db-btn--danger db-btn--sm"
                                  onClick={() => confirmRevoke(k.id)}
                                  disabled={revoking === k.id}
                                >
                                  {revoking === k.id ? 'Revoking…' : 'Yes, revoke'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Auth docs hint */}
        <div className="db-card" style={{ background: '#F9FAFB' }}>
          <div className="db-card-title" style={{ marginBottom: 12 }}>Using your key</div>
          <pre style={{ fontSize: 12.5, color: '#374151', background: '#0D0F1A', padding: '14px 18px', borderRadius: 8, overflow: 'auto', lineHeight: 1.6 }}>
            <code>{`curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-cloudach-..." \\
  -H "Content-Type: application/json" \\
  -d '{"model":"llama3-8b","messages":[{"role":"user","content":"Hello!"}]}'`}</code>
          </pre>
        </div>

        {/* Create key modal */}
        {showCreate && (
          <div className="db-modal-backdrop" onClick={() => setShowCreate(false)}>
            <div className="db-modal" onClick={e => e.stopPropagation()}>
              <div className="db-modal-title">New API key</div>
              <div className="db-modal-sub">Give it a descriptive name. Optionally set a rate limit.</div>
              <form onSubmit={createKey}>
                {createError && <div className="db-error">{createError}</div>}
                <div className="db-field">
                  <label className="db-label">Key name</label>
                  <input
                    className="db-input"
                    placeholder="e.g. Production server"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="db-field">
                  <label className="db-label">Rate limit (requests/min) <span style={{ color: '#9CA3AF', fontWeight: 400 }}>— optional</span></label>
                  <input
                    className="db-input"
                    type="number"
                    min="1"
                    placeholder="e.g. 60  (leave blank for unlimited)"
                    value={newRateLimitRpm}
                    onChange={e => setNewRateLimitRpm(e.target.value)}
                  />
                </div>
                <div className="db-modal-actions">
                  <button type="button" className="db-btn db-btn--ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="db-btn db-btn--primary" disabled={creating}>
                    {creating ? 'Creating…' : 'Create key'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function IconKeyEmpty() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      style={{ margin: '0 auto 12px', display: 'block', color: '#D1D5DB' }}
    >
      <circle cx="16" cy="18" r="9" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <circle cx="16" cy="18" r="4" fill="currentColor" opacity="0.3" />
      <path d="M23 23l10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M29 28l3 -3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
