import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

const PLAN_COLORS = {
  free: { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' },
  pro: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.80)', border: 'rgba(255,255,255,0.18)' },
  enterprise: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
};

const PLAN_FEATURES = {
  free: ['1 active deployment', 'Shared GPU infrastructure', '$0.20 / million tokens', '1 GB model storage', 'Community support'],
  pro: ['10 active deployments', 'Dedicated GPU instances', '$0.15 / million tokens', '50 GB model storage', 'Priority support', 'Autoscaling + fine-tuning'],
  enterprise: ['Unlimited deployments', 'Private VPC + air-gap', 'Volume token discounts', 'Custom model storage', 'Dedicated solutions engineer', '99.9% uptime SLA'],
};

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { upgrade, session_id } = router.query;

  useEffect(() => {
    if (upgrade === 'success') {
      setSuccess('Your plan has been upgraded successfully! It may take a moment to reflect.');
    } else if (upgrade === 'cancelled') {
      setError('Plan upgrade was cancelled. No charges were made.');
    }
  }, [upgrade]);

  const loadData = useCallback(async () => {
    const [subRes, usageRes] = await Promise.all([
      fetch('/api/dashboard/billing/subscription'),
      fetch('/api/dashboard/billing'),
    ]);
    if (subRes.ok) setSub(await subRes.json());
    if (usageRes.ok) setUsage(await usageRes.json());
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

  async function handleUpgrade(plan) {
    setUpgrading(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to start upgrade.'); return; }
      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setUpgrading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to open billing portal.'); return; }
      window.location.href = data.url;
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading || !user) return <PageLoader />;

  const plan = sub?.plan ?? 'free';
  const planColors = PLAN_COLORS[plan] ?? PLAN_COLORS.free;
  const isTrialing = sub?.status === 'trialing';
  const isPastDue = sub?.status === 'past_due';

  return (
    <>
      <Head><title>Billing — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Billing</h1>
          <p className="db-page-subtitle">Manage your subscription, payment method, and invoices.</p>
        </div>

        {error && <ErrorBanner message={error} />}
        {success && (
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10,
            padding: '14px 18px', marginBottom: 24, color: '#166534', fontSize: 13.5,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" stroke="#16A34A" strokeWidth="1.5"/>
              <path d="M5 8l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {success}
          </div>
        )}

        {isPastDue && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
            padding: '14px 18px', marginBottom: 24, color: '#92400E', fontSize: 13.5,
          }}>
            <strong>Payment past due.</strong> Please update your payment method to avoid service interruption.
            {' '}<button
              onClick={handlePortal}
              style={{ color: '#92400E', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Update now
            </button>
          </div>
        )}

        {/* Current Plan */}
        <div className="db-card" style={{ marginBottom: 24 }}>
          <div className="db-card-header">
            <span className="db-card-title">Current plan</span>
            {sub?.stripeCustomerId && (
              <button
                className="db-btn db-btn--ghost db-btn--sm"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? 'Opening…' : 'Manage billing'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
                  borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
                  background: planColors.bg, color: planColors.text, border: `1px solid ${planColors.border}`,
                }}>
                  {sub?.planLabel ?? 'Free'}
                </span>
                {isTrialing && (
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    Trial ends {fmtDate(sub.trialEnd)}
                  </span>
                )}
                {sub?.cancelAtPeriodEnd && (
                  <span style={{ fontSize: 12, color: '#DC2626' }}>
                    Cancels {fmtDate(sub.currentPeriodEnd)}
                  </span>
                )}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(PLAN_FEATURES[plan] || []).map(f => (
                  <li key={f} style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <CheckIcon /> {f}
                  </li>
                ))}
              </ul>

              {sub?.currentPeriodEnd && plan !== 'free' && (
                <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 12 }}>
                  {sub.cancelAtPeriodEnd ? 'Ends' : 'Renews'} {fmtDate(sub.currentPeriodEnd)}
                </p>
              )}
            </div>

            {/* Upgrade CTAs */}
            {plan === 'free' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="db-btn db-btn--primary db-btn--sm"
                  onClick={() => handleUpgrade('pro')}
                  disabled={upgrading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {upgrading ? 'Redirecting…' : 'Upgrade to Pro — $49/mo'}
                </button>
                <Link href="/contact?plan=enterprise">
                  <button className="db-btn db-btn--ghost db-btn--sm" style={{ whiteSpace: 'nowrap', width: '100%' }}>
                    Contact sales for Enterprise
                  </button>
                </Link>
                <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
                  14-day free trial · no card required
                </p>
              </div>
            )}

            {plan === 'pro' && !sub?.cancelAtPeriodEnd && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/contact?plan=enterprise">
                  <button className="db-btn db-btn--ghost db-btn--sm" style={{ whiteSpace: 'nowrap' }}>
                    Upgrade to Enterprise
                  </button>
                </Link>
                <button
                  className="db-btn db-btn--ghost db-btn--sm"
                  onClick={handlePortal}
                  disabled={portalLoading}
                  style={{ whiteSpace: 'nowrap', color: '#9CA3AF' }}
                >
                  Cancel subscription
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Usage this period */}
        {usage && (
          <div className="db-card" style={{ marginBottom: 24 }}>
            <div className="db-card-header">
              <span className="db-card-title">Usage this period</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                {fmtDate(usage.period?.start)} – {fmtDate(usage.period?.end)}
              </span>
            </div>

            <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="db-stat-card">
                <div className="db-stat-label">Requests</div>
                <div className="db-stat-value">{(usage.requestCount || 0).toLocaleString()}</div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-label">Total tokens</div>
                <div className="db-stat-value">{formatTokens(usage.totalTokens)}</div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-label">Prompt tokens</div>
                <div className="db-stat-value">{formatTokens(usage.promptTokens)}</div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-label">Est. cost</div>
                <div className="db-stat-value">{formatCost(usage.estimatedCost)}</div>
              </div>
            </div>

            {usage.byModel?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, fontWeight: 600 }}>By model</div>
                <div className="db-table-wrap">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th className="db-col-num">Tokens</th>
                        <th className="db-col-num">Requests</th>
                        <th className="db-col-num">Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usage.byModel.map(m => (
                        <tr key={m.model}>
                          <td><code style={{ fontSize: 12, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>{m.model}</code></td>
                          <td className="db-col-num">{formatTokens(m.totalTokens)}</td>
                          <td className="db-col-num">{m.requestCount.toLocaleString()}</td>
                          <td className="db-col-num">{formatCost(m.estimatedCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Link href="/dashboard/usage">
                <button className="db-btn db-btn--ghost db-btn--sm">View full usage →</button>
              </Link>
            </div>
          </div>
        )}

        {/* Invoice history */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Invoice history</span>
          </div>

          {!sub?.invoices?.length ? (
            <div className="db-empty">
              <IconInvoicesEmpty />
              <div className="db-empty-title">No invoices yet</div>
              <div className="db-empty-desc">
                Invoices will appear here once you upgrade to a paid plan.
              </div>
              {plan === 'free' && (
                <button
                  className="db-btn db-btn--primary db-btn--sm"
                  onClick={() => handleUpgrade('pro')}
                  disabled={upgrading}
                  style={{ marginTop: 16 }}
                >
                  {upgrading ? 'Redirecting…' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Period</th>
                    <th className="db-col-num">Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sub.invoices.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {fmtDate(inv.createdAt)}
                      </td>
                      <td style={{ fontSize: 13, color: '#6B7280' }}>
                        {inv.periodStart && inv.periodEnd
                          ? `${fmtDate(inv.periodStart)} – ${fmtDate(inv.periodEnd)}`
                          : '—'}
                      </td>
                      <td className="db-col-num" style={{ fontWeight: 600 }}>
                        {formatCentsToUSD(inv.amountPaid, inv.currency)}
                      </td>
                      <td>
                        <span className={`db-badge db-badge--${inv.status === 'paid' ? 'active' : 'revoked'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {inv.hostedInvoiceUrl && (
                            <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>View</a>
                          )}
                          {inv.invoicePdfUrl && (
                            <a href={inv.invoicePdfUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, color: '#6B7280' }}>PDF</a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 7l3.5 3.5 6.5-6.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconInvoicesEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
      style={{ margin: '0 auto 12px', display: 'block', color: '#D1D5DB' }}>
      <rect x="8" y="4" width="24" height="32" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M13 13h14M13 18h14M13 23h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTokens(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(n) {
  if (n == null || isNaN(n)) return '—';
  if (n === 0) return '$0.00';
  if (n < 0.01) return '<$0.01';
  return `$${n.toFixed(2)}`;
}

function formatCentsToUSD(cents, currency = 'usd') {
  if (cents == null) return '—';
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount);
}
