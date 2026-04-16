import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

const VALID_EVENTS = [
  { value: 'usage.threshold',  label: 'usage.threshold',  desc: 'Usage cost exceeds a threshold' },
  { value: 'api_key.created',  label: 'api_key.created',  desc: 'An API key is created' },
  { value: 'api_key.revoked',  label: 'api_key.revoked',  desc: 'An API key is revoked' },
  { value: 'request.failed',   label: 'request.failed',   desc: 'An API request returns 4xx/5xx' },
];

const STATUS_COLORS = {
  success: { bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
  failed:  { bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
  pending: { bg: '#FFF7ED', color: '#92400E', dot: '#F59E0B' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, color: c.color,
      borderRadius: 99, padding: '2px 9px', fontSize: 11.5, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {status}
    </span>
  );
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function WebhooksPage() {
  const router = useRouter();
  const [user, setUser]           = useState(null);
  const [webhooks, setWebhooks]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl]       = useState('');
  const [newEvents, setNewEvents] = useState([]);
  const [creating, setCreating]   = useState(false);
  const [createError, setCreateError] = useState('');
  const [newSecret, setNewSecret] = useState(null);
  const [secretCopied, setSecretCopied] = useState(false);

  // Expanded delivery logs panel: webhookId or null
  const [logsFor, setLogsFor]     = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Test state: { [webhookId]: 'idle'|'testing'|'ok'|'err' }
  const [testState, setTestState] = useState({});

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        setUser((await meRes.json()).user);
        await loadWebhooks();
      } catch {
        setError('Network error. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function loadWebhooks() {
    const res = await fetch('/api/dashboard/webhooks');
    if (res.ok) setWebhooks((await res.json()).webhooks);
    else setError('Failed to load webhooks.');
  }

  async function createWebhook(e) {
    e.preventDefault();
    setCreateError('');
    if (!newUrl.trim()) { setCreateError('URL is required.'); return; }
    if (!newEvents.length) { setCreateError('Select at least one event type.'); return; }
    try { new URL(newUrl); } catch { setCreateError('Enter a valid URL.'); return; }

    setCreating(true);
    const res = await fetch('/api/dashboard/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl.trim(), events: newEvents }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateError(data.error || 'Failed to create webhook.'); setCreating(false); return; }
    setNewSecret(data.secret);
    setShowCreate(false);
    setNewUrl('');
    setNewEvents([]);
    setCreating(false);
    await loadWebhooks();
  }

  function toggleEvent(ev) {
    setNewEvents((prev) => prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]);
  }

  async function deleteWebhook(id) {
    setDeleting(id);
    const res = await fetch(`/api/dashboard/webhooks/${id}`, { method: 'DELETE' });
    if (!res.ok) setError('Failed to delete webhook.');
    setDeleteTarget(null);
    setDeleting(null);
    if (logsFor === id) setLogsFor(null);
    await loadWebhooks();
  }

  async function toggleEnabled(hook) {
    await fetch(`/api/dashboard/webhooks/${hook.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_enabled: !hook.is_enabled }),
    });
    await loadWebhooks();
  }

  async function testWebhook(id) {
    setTestState((s) => ({ ...s, [id]: 'testing' }));
    const res = await fetch(`/api/dashboard/webhooks/${id}/test`, { method: 'POST' });
    const data = await res.json();
    setTestState((s) => ({ ...s, [id]: data.success ? 'ok' : 'err' }));
    setTimeout(() => setTestState((s) => ({ ...s, [id]: 'idle' })), 3000);
    if (logsFor === id) await loadDeliveries(id);
  }

  const loadDeliveries = useCallback(async (id) => {
    setLogsLoading(true);
    const res = await fetch(`/api/dashboard/webhooks/${id}/deliveries`);
    if (res.ok) setDeliveries((await res.json()).deliveries);
    setLogsLoading(false);
  }, []);

  async function openLogs(id) {
    if (logsFor === id) { setLogsFor(null); return; }
    setLogsFor(id);
    setDeliveries([]);
    await loadDeliveries(id);
  }

  function copySecret() {
    navigator.clipboard.writeText(newSecret).then(() => {
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 1500);
    });
  }

  if (loading || !user) return <PageLoader />;

  return (
    <>
      <Head><title>Webhooks — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 className="db-page-title">Webhooks</h1>
            <p className="db-page-subtitle">
              Receive real-time HTTP notifications for usage and API key events.
            </p>
          </div>
          {!showCreate && (
            <button className="btn-solid" onClick={() => { setShowCreate(true); setNewSecret(null); setCreateError(''); }}>
              Add webhook
            </button>
          )}
        </div>

        {error && <ErrorBanner message={error} />}

        {/* New webhook secret banner */}
        {newSecret && (
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10,
            padding: '16px 20px', marginBottom: 24,
          }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#14532D', marginBottom: 6 }}>
              Webhook created — save your signing secret now
            </div>
            <p style={{ fontSize: 13, color: '#166534', marginBottom: 12 }}>
              This secret is shown once. Use it to verify the <code>X-Cloudach-Signature</code> header on incoming requests.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <code style={{
                flex: 1, background: '#DCFCE7', padding: '8px 12px',
                borderRadius: 6, fontSize: 12.5, wordBreak: 'break-all', color: '#14532D',
              }}>
                {newSecret}
              </code>
              <button
                className="btn-outline"
                onClick={copySecret}
                style={{ flexShrink: 0 }}
              >
                {secretCopied ? 'Copied!' : 'Copy'}
              </button>
              <button
                className="btn-outline"
                onClick={() => setNewSecret(null)}
                style={{ flexShrink: 0 }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <div style={{
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
            padding: 24, marginBottom: 24,
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#0D0F1A' }}>
              New webhook
            </h2>
            {createError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: '#991B1B', fontSize: 13 }}>
                {createError}
              </div>
            )}
            <form onSubmit={createWebhook}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>
                  Endpoint URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/webhooks/cloudach"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px', borderRadius: 8,
                    border: '1px solid #D1D5DB', fontSize: 13.5, outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#374151' }}>
                  Events to subscribe
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {VALID_EVENTS.map((ev) => (
                    <label key={ev.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newEvents.includes(ev.value)}
                        onChange={() => toggleEvent(ev.value)}
                        style={{ width: 15, height: 15 }}
                      />
                      <span style={{ fontSize: 13 }}>
                        <code style={{ background: '#F3F4F6', padding: '1px 6px', borderRadius: 4, fontSize: 12.5 }}>
                          {ev.label}
                        </code>
                        <span style={{ color: '#6B7280', marginLeft: 8 }}>{ev.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-solid" disabled={creating}>
                  {creating ? 'Creating…' : 'Create webhook'}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => { setShowCreate(false); setCreateError(''); setNewUrl(''); setNewEvents([]); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Webhook list */}
        {webhooks.length === 0 && !showCreate ? (
          <div style={{
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12,
            padding: '48px 24px', textAlign: 'center', color: '#9CA3AF',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4zm0 28c-6.627 0-12-5.373-12-12S13.373 8 20 8s12 5.373 12 12-5.373 12-12 12z" fill="#E5E7EB"/>
                <path d="M20 12v8l5 3" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4, color: '#6B7280' }}>No webhooks yet</div>
            <div style={{ fontSize: 13 }}>Add a webhook to receive real-time event notifications.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {webhooks.map((hook) => (
              <div key={hook.id} style={{
                background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden',
              }}>
                {/* Row */}
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {/* Enable toggle */}
                  <button
                    onClick={() => toggleEnabled(hook)}
                    title={hook.is_enabled ? 'Disable' : 'Enable'}
                    style={{
                      width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
                      background: hook.is_enabled ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.15)',
                      position: 'relative', transition: 'background 0.2s',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 2, left: hook.is_enabled ? 18 : 2,
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }} />
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#0D0F1A', wordBreak: 'break-all' }}>
                      {hook.url}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {hook.events.map((ev) => (
                        <code key={ev} style={{
                          background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.60)',
                          padding: '1px 7px', borderRadius: 4, fontSize: 11.5,
                        }}>
                          {ev}
                        </code>
                      ))}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>
                      Added {fmt(hook.created_at)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                    <button
                      className="btn-outline"
                      style={{ fontSize: 12.5, padding: '5px 12px' }}
                      onClick={() => testWebhook(hook.id)}
                      disabled={testState[hook.id] === 'testing'}
                    >
                      {testState[hook.id] === 'testing' ? 'Sending…'
                        : testState[hook.id] === 'ok' ? 'Sent!'
                        : testState[hook.id] === 'err' ? 'Failed'
                        : 'Test'}
                    </button>
                    <button
                      className="btn-outline"
                      style={{ fontSize: 12.5, padding: '5px 12px' }}
                      onClick={() => openLogs(hook.id)}
                    >
                      {logsFor === hook.id ? 'Hide logs' : 'Logs'}
                    </button>
                    <button
                      className="btn-outline"
                      style={{ fontSize: 12.5, padding: '5px 12px', color: '#DC2626', borderColor: '#FECACA' }}
                      onClick={() => setDeleteTarget(hook.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Delete confirm */}
                {deleteTarget === hook.id && (
                  <div style={{
                    borderTop: '1px solid #FEE2E2', background: '#FFF5F5',
                    padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 13, color: '#991B1B', flex: 1 }}>
                      Delete this webhook? All delivery logs will also be removed.
                    </span>
                    <button
                      className="btn-solid"
                      style={{ background: '#DC2626', fontSize: 12.5, padding: '5px 14px' }}
                      onClick={() => deleteWebhook(hook.id)}
                      disabled={deleting === hook.id}
                    >
                      {deleting === hook.id ? 'Deleting…' : 'Delete'}
                    </button>
                    <button
                      className="btn-outline"
                      style={{ fontSize: 12.5, padding: '5px 12px' }}
                      onClick={() => setDeleteTarget(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Delivery logs panel */}
                {logsFor === hook.id && (
                  <div style={{ borderTop: '1px solid #E5E7EB', padding: '16px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                      Delivery logs (last 50)
                    </div>
                    {logsLoading ? (
                      <div style={{ color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
                    ) : deliveries.length === 0 ? (
                      <div style={{ color: '#9CA3AF', fontSize: 13 }}>No deliveries yet. Click Test to send a test event.</div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                          <thead>
                            <tr style={{ color: '#6B7280' }}>
                              {['Event', 'Status', 'HTTP', 'Attempts', 'Time'].map((h) => (
                                <th key={h} style={{ textAlign: 'left', padding: '4px 10px 8px 0', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {deliveries.map((d) => (
                              <tr key={d.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                                <td style={{ padding: '7px 10px 7px 0' }}>
                                  <code style={{ background: '#F3F4F6', padding: '1px 6px', borderRadius: 4, fontSize: 11.5 }}>
                                    {d.event_type}
                                  </code>
                                </td>
                                <td style={{ padding: '7px 10px 7px 0' }}>
                                  <StatusBadge status={d.status} />
                                </td>
                                <td style={{ padding: '7px 10px 7px 0', color: '#374151' }}>
                                  {d.response_status || '—'}
                                </td>
                                <td style={{ padding: '7px 10px 7px 0', color: '#374151' }}>
                                  {d.attempts}
                                </td>
                                <td style={{ padding: '7px 0 7px 0', color: '#6B7280', whiteSpace: 'nowrap' }}>
                                  {fmt(d.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div style={{
          marginTop: 32, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10,
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Verifying webhook signatures
          </div>
          <p style={{ fontSize: 12.5, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
            Each request includes an <code>X-Cloudach-Signature</code> header (format: <code>sha256=&lt;hex&gt;</code>).
            Compute <code>HMAC-SHA256(secret, rawBody)</code> and compare to verify authenticity.
            See the <a href="/docs#webhooks" style={{ color: 'rgba(255,255,255,0.60)' }}>webhook docs</a> for code examples.
          </p>
        </div>
      </DashboardLayout>
    </>
  );
}
