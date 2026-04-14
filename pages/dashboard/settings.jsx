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
          <div className="db-settings-account-fields">
            <div className="db-settings-field">
              <span className="db-settings-field-label">Email address</span>
              <span className="db-settings-field-value">{user.email}</span>
            </div>
            <div className="db-settings-field">
              <span className="db-settings-field-label">Account ID</span>
              <span className="db-settings-field-value--mono">{user.id}</span>
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
              <div className="db-settings-billing-row">
                <div className="db-settings-field">
                  <span className="db-settings-field-label">Current period</span>
                  <span className="db-settings-field-value">{billing.period.start} – {billing.period.end}</span>
                </div>
                <div className="db-settings-field">
                  <span className="db-settings-field-label">Estimated cost this month</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
                    {formatCost(billing.estimatedCost)}
                  </span>
                </div>
                <div className="db-settings-field">
                  <span className="db-settings-field-label">Tokens this month</span>
                  <span className="db-settings-field-value">{formatTokens(billing.totalTokens)}</span>
                </div>
              </div>

              {/* Per-model cost breakdown */}
              {billing?.byModel?.length > 0 && (
                <div>
                  <div className="db-settings-field-label" style={{ marginBottom: 8 }}>Cost by model this month</div>
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

              <div className="db-upgrade-callout">
                <strong style={{ color: '#374151' }}>Upgrade to Startup or Business</strong> for higher rate limits, priority support, and SLA guarantees.
                Pricing starts at $0.08/1M input tokens.{' '}
                <a href="mailto:sales@cloudach.com">Contact sales →</a>
              </div>
            </div>
          ) : (
            <p className="db-settings-field-label">No billing data available.</p>
          )}
        </div>

        {/* Danger zone */}
        <div className="db-card db-card--danger">
          <div className="db-card-header">
            <span className="db-card-title db-card-title--danger">Danger zone</span>
          </div>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
            Deleting your account is permanent. All API keys, usage data, and model deployments will be removed.
          </p>
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
