import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useToast } from '../../components/dashboard/useToast';

export default function ApiKeysPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newRateLimitRpm, setNewRateLimitRpm] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newRawKey, setNewRawKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [revokeConfirmId, setRevokeConfirmId] = useState(null);
  const [toastEl, showToast] = useToast();

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.replace('/login'); return; }
      setUser((await meRes.json()).user);
      await loadKeys();
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadKeys() {
    const res = await fetch('/api/dashboard/api-keys');
    if (res.ok) setKeys((await res.json()).keys);
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
    showToast('API key created. Copy it now — it won\'t be shown again.');
    await loadKeys();
  }

  async function revokeKey(keyId) {
    const res = await fetch(`/api/dashboard/api-keys/${keyId}/revoke`, { method: 'POST' });
    setRevokeConfirmId(null);
    if (res.ok) {
      showToast('API key revoked.');
    } else {
      showToast('Failed to revoke key. Please try again.', 'error');
    }
    await loadKeys();
  }

  function copyKey() {
    navigator.clipboard.writeText(newRawKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
    </div>
  );

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

        {/* New key reveal */}
        {newRawKey && (
          <div className="db-key-reveal">
            <p><strong>Key created.</strong> Copy it now — it won&apos;t be shown again.</p>
            <div className="db-key-value">
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{newRawKey}</span>
              <button className="db-copy-btn" onClick={copyKey}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
          </div>
        )}

        {/* Keys table */}
        <div className="db-card">
          {loading ? (
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</p>
          ) : keys.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">🔑</div>
              <div className="db-empty-title">No API keys yet</div>
              <div className="db-empty-desc">Create a key to start making requests.</div>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Last used</th>
                    <th>Rate limit</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id}>
                      <td><strong>{k.name}</strong></td>
                      <td>{fmtDate(k.created_at)}</td>
                      <td>{k.last_used_at ? fmtDate(k.last_used_at) : <span style={{ color: '#9CA3AF' }}>Never</span>}</td>
                      <td>
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
                          revokeConfirmId === k.id ? (
                            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              <span style={{ fontSize: 12, color: '#6B7280' }}>Revoke?</span>
                              <button className="db-btn db-btn--danger db-btn--sm" onClick={() => revokeKey(k.id)}>Yes</button>
                              <button className="db-btn db-btn--ghost db-btn--sm" onClick={() => setRevokeConfirmId(null)}>No</button>
                            </span>
                          ) : (
                            <button className="db-btn db-btn--danger db-btn--sm" onClick={() => setRevokeConfirmId(k.id)}>
                              Revoke
                            </button>
                          )
                        )}
                      </td>
                    </tr>
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

        {toastEl}

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
