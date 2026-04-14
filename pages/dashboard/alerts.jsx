import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

const DEFAULT_THRESHOLDS = [50, 80, 100];

export default function AlertsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Config form state
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [hardCap, setHardCap] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);

  // Data state
  const [history, setHistory] = useState([]);
  const [currentSpend, setCurrentSpend] = useState(null);

  const loadData = useCallback(async () => {
    const res = await fetch('/api/dashboard/alerts');
    if (!res.ok) {
      setError('Failed to load alert configuration.');
      return;
    }
    const data = await res.json();
    setCurrentSpend(data.currentMonthSpend ?? null);
    setHistory(data.history || []);
    if (data.config) {
      setHasConfig(true);
      setMonthlyBudget(data.config.monthlyBudget != null ? String(data.config.monthlyBudget) : '');
      setThresholds(data.config.thresholds || DEFAULT_THRESHOLDS);
      setNotifyEmail(data.config.notifyEmail !== false);
      setHardCap(!!data.config.hardCap);
    } else {
      setHasConfig(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        setUser((await meRes.json()).user);
        await loadData();
      } catch {
        setError('Network error. Please check your connection and refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, loadData]);

  // Fire-and-forget alert check when config exists
  useEffect(() => {
    if (!loading && hasConfig) {
      fetch('/api/dashboard/alerts/check', { method: 'POST' }).catch(() => {});
    }
  }, [loading, hasConfig]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/dashboard/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyBudget: monthlyBudget === '' ? null : parseFloat(monthlyBudget),
          thresholds,
          notifyEmail,
          hardCap,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Failed to save. Please try again.');
      } else {
        setSuccess('Alert configuration saved.');
        setHasConfig(true);
        await loadData();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Remove all alert settings? This cannot be undone.')) return;
    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      await fetch('/api/dashboard/alerts', { method: 'DELETE' });
      setHasConfig(false);
      setMonthlyBudget('');
      setThresholds(DEFAULT_THRESHOLDS);
      setNotifyEmail(true);
      setHardCap(false);
      setHistory([]);
      setSuccess('Alert configuration removed.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  function toggleThreshold(t) {
    setThresholds((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort((a, b) => a - b)
    );
  }

  if (loading || !user) return <PageLoader />;

  const budget = parseFloat(monthlyBudget) || 0;
  const spendPct = budget > 0 && currentSpend != null ? Math.min((currentSpend / budget) * 100, 100) : null;
  const barColor = spendPct == null ? '#4F6EF7' : spendPct >= 100 ? '#DC2626' : spendPct >= 80 ? '#F59E0B' : '#4F6EF7';

  return (
    <>
      <Head><title>Alerts — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Spending Alerts</h1>
          <p className="db-page-subtitle">Set a monthly budget and get notified when thresholds are crossed.</p>
        </div>

        {error && <ErrorBanner message={error} />}
        {success && (
          <div style={{
            background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10,
            padding: '14px 18px', marginBottom: 24, color: '#166534', fontSize: 13.5,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" stroke="#16A34A" strokeWidth="1.5"/>
              <path d="M5 8l2.5 2.5L11 6" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {success}
          </div>
        )}

        {/* Current spend vs budget */}
        {hasConfig && budget > 0 && currentSpend != null && (
          <div className="db-card" style={{ marginBottom: 24 }}>
            <div className="db-card-header">
              <span className="db-card-title">This month's spend</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>
                {formatCost(currentSpend)} of {formatCost(budget)} budget
              </span>
            </div>
            <div style={{ position: 'relative', height: 12, background: '#F3F4F6', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', inset: 0, width: `${spendPct}%`,
                background: barColor, borderRadius: 6,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#6B7280' }}>
              <span>{spendPct != null ? `${Math.round(spendPct)}%` : '—'} used</span>
              <span>{formatCost(Math.max(0, budget - currentSpend))} remaining</span>
            </div>
            {/* Threshold markers */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {thresholds.map((t) => {
                const hit = spendPct != null && spendPct >= t;
                return (
                  <span key={t} style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 20,
                    background: hit ? (t === 100 ? '#FEE2E2' : t >= 80 ? '#FEF3C7' : '#EFF6FF') : '#F9FAFB',
                    color: hit ? (t === 100 ? '#991B1B' : t >= 80 ? '#92400E' : '#1D4ED8') : '#6B7280',
                    border: `1px solid ${hit ? (t === 100 ? '#FECACA' : t >= 80 ? '#FDE68A' : '#BFDBFE') : '#E5E7EB'}`,
                    fontWeight: hit ? 600 : 400,
                  }}>
                    {hit ? '✓' : ''} {t}%
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }}>

          {/* Config form */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Alert configuration</span>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Monthly budget */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Monthly budget (USD)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    color: '#9CA3AF', fontSize: 14
                  }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 100.00"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px 10px 28px', boxSizing: 'border-box',
                      border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14,
                      outline: 'none', background: '#FAFAFA',
                    }}
                  />
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                  Leave empty to disable budget tracking.
                </p>
              </div>

              {/* Threshold percentages */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Alert thresholds
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[25, 50, 75, 80, 90, 100].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleThreshold(t)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                        border: `1px solid ${thresholds.includes(t) ? '#4F6EF7' : '#E5E7EB'}`,
                        background: thresholds.includes(t) ? '#EEF2FF' : '#F9FAFB',
                        color: thresholds.includes(t) ? '#3730A3' : '#6B7280',
                        fontWeight: thresholds.includes(t) ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                  You'll be notified when monthly spend reaches these percentages of your budget.
                </p>
              </div>

              {/* Email notifications */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#4F6EF7', width: 15, height: 15 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Email notifications</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    Send an email to {user.email} when a threshold is crossed.
                  </div>
                </div>
              </label>

              {/* Hard cap */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hardCap}
                  onChange={(e) => setHardCap(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#DC2626', width: 15, height: 15 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    Hard spending cap
                    <span style={{
                      marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 12,
                      background: '#FEE2E2', color: '#991B1B', fontWeight: 600
                    }}>caution</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    Automatically revoke all API keys when 100% of the monthly budget is spent.
                    You can re-create keys manually after.
                  </div>
                </div>
              </label>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="db-btn db-btn--primary"
                >
                  {saving ? 'Saving…' : 'Save configuration'}
                </button>
                {hasConfig && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="db-btn db-btn--ghost"
                    style={{ color: '#DC2626', borderColor: '#FECACA' }}
                  >
                    {deleting ? 'Removing…' : 'Remove alerts'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Alert history */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Alert history</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Last 50 events</span>
            </div>
            {history.length === 0 ? (
              <div className="db-empty">
                <IconBellEmpty />
                <div className="db-empty-title">No alerts yet</div>
                <div className="db-empty-desc">
                  {hasConfig
                    ? 'Alerts will appear here once a threshold is crossed.'
                    : 'Configure a budget and thresholds to start tracking.'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {history.map((h, i) => (
                  <div key={h.id} style={{
                    padding: '12px 0',
                    borderBottom: i < history.length - 1 ? '1px solid #F3F4F6' : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <ThresholdBadge pct={h.thresholdPct} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                        {h.thresholdPct}% threshold crossed
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {formatCost(h.spendAtAlert)} of {formatCost(h.budget)} budget
                        {h.notifiedEmail && (
                          <span style={{ marginLeft: 8, color: '#4F6EF7' }}>· emailed</span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {fmtDate(h.triggeredAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email template preview */}
        <div className="db-card" style={{ marginTop: 24 }}>
          <div className="db-card-header">
            <span className="db-card-title">Email template preview</span>
          </div>
          <div style={{
            background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10,
            padding: '20px 24px', fontFamily: 'monospace', fontSize: 13, color: '#374151',
            lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 12 }}>
              Cloudach — Spending Alert: {budget > 0 ? '80' : 'XX'}% of monthly budget reached
            </div>
            <div>Hi {user.email},</div>
            <br />
            <div>
              Your Cloudach account has reached <strong>80%</strong> of your ${budget > 0 ? budget.toFixed(2) : 'XX.XX'} monthly budget.
            </div>
            <br />
            <div>Current spend: <strong>{formatCost(currentSpend)}</strong></div>
            <div>Monthly budget: <strong>{budget > 0 ? formatCost(budget) : '—'}</strong></div>
            <div>Remaining: <strong>{budget > 0 && currentSpend != null ? formatCost(Math.max(0, budget - currentSpend)) : '—'}</strong></div>
            <br />
            <div>
              Manage your alerts and budget at{' '}
              <Link href="/dashboard/alerts" style={{ color: '#4F6EF7' }}>
                cloudach.com/dashboard/alerts
              </Link>.
            </div>
            <br />
            <div style={{ color: '#9CA3AF', fontSize: 12 }}>
              You're receiving this because you enabled email alerts on your Cloudach account.
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .alerts-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </DashboardLayout>
    </>
  );
}

function ThresholdBadge({ pct }) {
  const color = pct >= 100 ? { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' }
    : pct >= 80 ? { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' }
    : { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 40, height: 40, borderRadius: '50%',
      background: color.bg, color: color.text, border: `1px solid ${color.border}`,
      fontSize: 11, fontWeight: 700, flexShrink: 0,
    }}>
      {pct}%
    </span>
  );
}

function IconBellEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
      style={{ margin: '0 auto 12px', display: 'block', color: '#D1D5DB' }}>
      <path d="M20 6a10 10 0 00-10 10v6l-2 4h24l-2-4v-6A10 10 0 0020 6z"
        stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      <path d="M17 30a3 3 0 006 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M20 6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function formatCost(n) {
  if (n == null || isNaN(n)) return '—';
  if (n === 0) return '$0.00';
  return `$${n.toFixed(2)}`;
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}
