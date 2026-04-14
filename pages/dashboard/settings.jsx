import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        const { user } = await meRes.json();
        setUser(user);

        const billingRes = await fetch('/api/dashboard/billing');
        if (billingRes.ok) setBilling(await billingRes.json());
        else setError('Failed to load billing info.');
      } catch {
        setError('Network error. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading || !user) return <PageLoader />;

  return (
    <>
      <Head><title>Settings — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Settings</h1>
          <p className="db-page-subtitle">Account settings and billing information.</p>
        </div>

        {error && <ErrorBanner message={error} />}

        {/* Account */}
        <div className="db-card" style={{ marginBottom: 20 }}>
          <div className="db-card-header">
            <span className="db-card-title">Account</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
            <div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Email address</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Account ID</div>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#6B7280' }}>{user.id}</div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="db-card" style={{ marginBottom: 20 }}>
          <div className="db-card-header">
            <span className="db-card-title">Billing</span>
            <span className="db-badge db-badge--active">Developer — Free</span>
          </div>
          {billing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Current period</div>
                  <div style={{ fontSize: 14 }}>{billing.period.start} – {billing.period.end}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Estimated cost this month</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
                    {formatCost(billing.estimatedCost)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Tokens this month</div>
                  <div style={{ fontSize: 14 }}>{formatTokens(billing.totalTokens)}</div>
                </div>
              </div>

              {/* Per-model cost breakdown */}
              {billing?.byModel?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Cost by model this month</div>
                  <div className="db-table-wrap">
                    <table className="db-table">
                      <thead>
                        <tr>
                          <th>Model</th>
                          <th>Tokens</th>
                          <th>Requests</th>
                          <th>Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billing.byModel.map(m => (
                          <tr key={m.model}>
                            <td><code style={{ fontSize: 12, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>{m.model}</code></td>
                            <td>{formatTokens(m.totalTokens)}</td>
                            <td>{m.requestCount.toLocaleString()}</td>
                            <td>{formatCost(m.estimatedCost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 8, padding: 12, background: '#F9FAFB', borderRadius: 8, fontSize: 13, color: '#6B7280' }}>
                <strong style={{ color: '#374151' }}>Upgrade to Startup or Business</strong> for higher rate limits, priority support, and SLA guarantees.
                Pricing starts at $0.08/1M input tokens.{' '}
                <a href="mailto:sales@cloudach.com" style={{ color: '#6366F1', textDecoration: 'none' }}>
                  Contact sales →
                </a>
              </div>
            </div>
          ) : (
            <div style={{ color: '#9CA3AF', fontSize: 14 }}>No billing data available.</div>
          )}
        </div>

        {/* Danger zone */}
        <div className="db-card" style={{ borderColor: '#FCA5A5' }}>
          <div className="db-card-header">
            <span className="db-card-title" style={{ color: '#DC2626' }}>Danger zone</span>
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
            Deleting your account is permanent. All API keys, usage data, and model deployments will be removed.
          </div>
          <button
            className="db-btn db-btn--danger"
            onClick={() => { setDeleteConfirmText(''); setShowDeleteModal(true); }}
          >
            Delete account
          </button>
        </div>

        {/* Delete confirm modal */}
        {showDeleteModal && (
          <div className="db-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
            <div className="db-modal" onClick={e => e.stopPropagation()}>
              <div className="db-modal-title" style={{ color: '#DC2626' }}>Delete account?</div>
              <p style={{ fontSize: 14, color: '#374151', margin: '12px 0 16px', lineHeight: 1.6 }}>
                This action is <strong>permanent and cannot be undone</strong>. All your API keys, usage history, and model deployments will be deleted immediately.
              </p>
              <div className="db-field">
                <label className="db-label">
                  Type <code style={{ fontFamily: 'monospace', background: '#F3F4F6', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>delete my account</code> to confirm
                </label>
                <input
                  className="db-input"
                  placeholder="delete my account"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="db-modal-actions">
                <button type="button" className="db-btn db-btn--ghost" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="db-btn db-btn--danger"
                  disabled={deleteConfirmText !== 'delete my account'}
                  onClick={() => {
                    setShowDeleteModal(false);
                    window.location.href = 'mailto:support@cloudach.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20account%3A%20' + encodeURIComponent(user.email);
                  }}
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}

function formatCost(n) {
  if (n == null || isNaN(n)) return '—';
  if (n === 0) return '$0.00';
  if (n < 0.01) return '<$0.01';
  return `$${n.toFixed(2)}`;
}

function formatTokens(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
