import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { AdminShell } from '../index';

const PLAN_LABEL = { free: 'Free', pro: 'Pro', enterprise: 'Business' };

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    const res = await fetch(`/api/admin/customers/${id}`);
    if (res.status === 401) { router.replace('/login'); return; }
    if (res.status === 403) { setError('Admin access required.'); setLoading(false); return; }
    if (res.status === 404) { setError('Customer not found.'); setLoading(false); return; }
    if (!res.ok) { setError(`Server returned ${res.status}`); setLoading(false); return; }
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function toggleDisable() {
    if (!data?.user) return;
    setToggling(true);
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.user.id, isDisabled: !data.user.isDisabled }),
    });
    setToggling(false);
    await load();
  }

  if (error) return <AdminShell><div className="db-card"><p style={{ color: 'rgba(252,165,165,0.85)' }}>{error}</p></div></AdminShell>;

  return (
    <AdminShell>
      <Head><title>{data?.user?.email ?? 'Customer'} — Cloudach Admin</title></Head>

      <div className="db-page-header">
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.40)', marginBottom: 6 }}>
          <Link href="/admin/users" className="admin-card-link">← All customers</Link>
        </p>
        <h1 className="db-page-title">
          {loading ? <span className="db-skeleton" style={{ display: 'inline-block', width: 280, height: 24, verticalAlign: 'middle' }} />
                   : (data?.user?.email ?? '—')}
          {data?.user?.role === 'admin' && (
            <span className="db-badge db-badge--active" style={{ marginLeft: 12, fontSize: 11, verticalAlign: 'middle' }}>Admin</span>
          )}
          {data?.user?.isDisabled && (
            <span className="db-badge db-badge--revoked" style={{ marginLeft: 8, fontSize: 11, verticalAlign: 'middle' }}>Disabled</span>
          )}
        </h1>
        {data?.user && (
          <p className="db-page-subtitle">
            Joined {new Date(data.user.createdAt).toLocaleDateString()} · ID <code className="admin-mono" style={{ fontSize: 11 }}>{data.user.id}</code>
          </p>
        )}
      </div>

      {!loading && data?.warnings?.length > 0 && (
        <div className="db-card" style={{ borderColor: 'rgba(251,191,36,0.30)', padding: '12px 16px' }}>
          <div style={{ fontSize: 12.5, color: '#fbbf24', fontWeight: 600, marginBottom: 4 }}>Partial data</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {data.warnings.join(' · ')}
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <SummaryCard
          label="Plan · Status"
          value={loading ? null : (
            <>
              <span className={`admin-plan-pill admin-plan-pill--${data?.subscription?.plan || 'free'}`}>
                {PLAN_LABEL[data?.subscription?.plan || 'free']}
              </span>
              <span style={{ marginLeft: 8, fontSize: 13 }}>{data?.subscription?.status || 'free'}</span>
            </>
          )}
          sub={loading ? null : (data?.subscription?.cancelAtPeriodEnd ? 'Cancels at period end' : ' ')}
        />
        <SummaryCard
          label="MRR"
          value={loading ? null : formatCurrency(data?.billing?.mrrCents ?? 0, data?.billing?.currency || 'usd')}
          sub={loading ? null : 'monthly recurring'}
        />
        <SummaryCard
          label="Lifetime spend"
          value={loading ? null : formatCurrency(data?.billing?.lifetimeCents ?? 0, data?.billing?.currency || 'usd')}
          sub={loading ? null : `Last 30d: ${formatCurrency(data?.billing?.last30dCents ?? 0, data?.billing?.currency || 'usd')}`}
        />
        <SummaryCard
          label="Inference"
          value={loading ? null : formatCount(data?.usageTotals?.requests ?? 0)}
          sub={loading ? null : `${formatCount(data?.usageTotals?.tokens ?? 0)} tokens · $${(data?.usageTotals?.cost ?? 0).toFixed(2)}`}
        />
      </div>

      {/* Two-column layout: actions + Stripe link on the right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, marginBottom: 24 }}>
        {/* Recent requests */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Recent inference requests</span>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
              {loading ? '' : `Last ${data?.recentRequests?.length ?? 0}`}
            </span>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 240 }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="db-skeleton" style={{ height: 32 }} />)}
            </div>
          ) : data?.recentRequests?.length === 0 ? (
            <EmptyHint title="No requests recorded" body="When this customer makes an API call it'll appear here." />
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>Time</th><th>Model</th><th className="db-col-num">Tokens</th><th className="db-col-num">Cost</th><th className="db-col-num">Latency</th><th>Status</th></tr></thead>
                <tbody>
                  {data.recentRequests.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{formatRelative(r.createdAt)}</td>
                      <td><code className="admin-mono">{r.model}</code></td>
                      <td className="db-col-num">{r.totalTokens?.toLocaleString() ?? '—'}</td>
                      <td className="db-col-num">{r.estimatedCost > 0 ? `$${r.estimatedCost.toFixed(4)}` : <span style={{ color: 'rgba(255,255,255,0.30)' }}>—</span>}</td>
                      <td className="db-col-num">{r.latencyMs != null ? `${r.latencyMs}ms` : '—'}</td>
                      <td><span className={r.statusCode != null && r.statusCode < 400 ? 'db-badge db-badge--active' : 'db-badge db-badge--revoked'}>{r.statusCode ?? '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions + Stripe link */}
        <div>
          <div className="db-card">
            <div className="db-card-header"><span className="db-card-title">Actions</span></div>
            {loading ? (
              <div className="db-skeleton" style={{ height: 40 }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={toggleDisable}
                  disabled={toggling || data?.user?.role === 'admin'}
                  className={`admin-action-btn ${data?.user?.isDisabled ? 'admin-action-btn--enable' : 'admin-action-btn--disable'}`}
                  title={data?.user?.role === 'admin' ? 'Cannot disable admin accounts' : ''}
                >
                  {toggling ? '…' : data?.user?.isDisabled ? 'Re-enable account' : 'Disable account'}
                </button>
                <button type="button" disabled className="admin-action-btn admin-action-btn--enable" title="Coming soon — needs Stripe write access wiring">
                  Change plan (TODO)
                </button>
                <button type="button" disabled className="admin-action-btn admin-action-btn--enable" title="Coming soon — needs Stripe credit_note flow">
                  Issue credit (TODO)
                </button>
                <button type="button" disabled className="admin-action-btn admin-action-btn--enable" title="Coming soon — needs email + reset-token flow">
                  Send password reset (TODO)
                </button>
              </div>
            )}
          </div>

          <div className="db-card">
            <div className="db-card-header"><span className="db-card-title">Billing reference</span></div>
            {loading ? <div className="db-skeleton" style={{ height: 60 }} /> : data?.billing?.stripeCustomerId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <KvRow label="Stripe customer" value={
                  <a
                    href={`https://dashboard.stripe.com/customers/${data.billing.stripeCustomerId}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: '#a7f3d0', fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12, textDecoration: 'none' }}>
                    {data.billing.stripeCustomerId} ↗
                  </a>
                } />
                {data.subscription?.currentPeriodEnd && (
                  <KvRow label="Renews" value={new Date(data.subscription.currentPeriodEnd).toLocaleDateString()} />
                )}
                {data.subscription?.trialEnd && (
                  <KvRow label="Trial ends" value={new Date(data.subscription.trialEnd).toLocaleDateString()} />
                )}
              </div>
            ) : (
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.40)', margin: 0 }}>
                No Stripe customer linked. Customer is on the free tier or Stripe isn't wired yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* API keys */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">API keys</span>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
            {loading ? '' : `${data?.apiKeys?.filter(k => k.isActive).length ?? 0} active · ${data?.apiKeys?.length ?? 0} total`}
          </span>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="db-skeleton" style={{ height: 32 }} />)}
          </div>
        ) : data?.apiKeys?.length === 0 ? (
          <EmptyHint title="No API keys" body="This customer hasn't created any keys. They'll appear here once they do." />
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead><tr><th>Name</th><th>Status</th><th className="db-col-num">Rate limit (RPM)</th><th>Allowed models</th><th>Created</th><th>Last used</th></tr></thead>
              <tbody>
                {data.apiKeys.map(k => (
                  <tr key={k.id} style={!k.isActive ? { opacity: 0.55 } : undefined}>
                    <td style={{ fontWeight: 600 }}>{k.name}</td>
                    <td>{k.isActive ? <span className="db-badge db-badge--active">Active</span> : <span className="db-badge db-badge--revoked">Revoked</span>}</td>
                    <td className="db-col-num">{k.rateLimitRpm ?? <span style={{ color: 'rgba(255,255,255,0.35)' }}>default</span>}</td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
                      {k.allowedModels && k.allowedModels.length > 0
                        ? k.allowedModels.join(', ')
                        : <span style={{ color: 'rgba(255,255,255,0.35)' }}>all models</span>}
                    </td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{k.lastUsedAt ? formatRelative(k.lastUsedAt) : <span style={{ color: 'rgba(255,255,255,0.30)' }}>Never</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent invoices */}
      {data?.invoices?.length > 0 && (
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Recent Stripe invoices</span>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>Last {data.invoices.length}</span>
          </div>
          <div className="db-table-wrap">
            <table className="db-table">
              <thead><tr><th>Date</th><th>Period</th><th>Status</th><th className="db-col-num">Amount</th><th>Links</th></tr></thead>
              <tbody>
                {data.invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                      {inv.periodStart && inv.periodEnd
                        ? `${new Date(inv.periodStart).toLocaleDateString()} → ${new Date(inv.periodEnd).toLocaleDateString()}`
                        : '—'}
                    </td>
                    <td><span className={inv.status === 'paid' ? 'db-badge db-badge--active' : 'db-badge db-badge--stopped'}>{inv.status}</span></td>
                    <td className="db-col-num">{formatCurrency(inv.amountPaid, inv.currency)}</td>
                    <td>
                      {inv.hostedInvoiceUrl && <a href={inv.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer" className="admin-card-link" style={{ marginRight: 12 }}>Invoice ↗</a>}
                      {inv.invoicePdfUrl && <a href={inv.invoicePdfUrl} target="_blank" rel="noopener noreferrer" className="admin-card-link">PDF ↗</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit log */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Audit log entries</span>
          <Link href={`/admin/audit-log?actorEmail=${encodeURIComponent(data?.user?.email ?? '')}`} className="admin-card-link">All entries →</Link>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="db-skeleton" style={{ height: 28 }} />)}
          </div>
        ) : data?.auditLog?.length === 0 ? (
          <EmptyHint title="No audit entries" body="No recorded events for this customer yet." />
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead><tr><th>Time</th><th>Action</th><th>Resource</th><th>IP</th></tr></thead>
              <tbody>
                {data.auditLog.map(a => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12, color: 'rgba(255,255,255,0.55)' }} title={new Date(a.createdAt).toLocaleString()}>{formatRelative(a.createdAt)}</td>
                    <td><code className="admin-mono">{a.action}</code></td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
                      {a.resource ? `${a.resource}${a.resourceId ? ' · ' + a.resourceId.slice(0, 24) : ''}` : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{a.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

/* ---------------- Helpers ---------------- */

function SummaryCard({ label, value, sub }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">{label}</div>
      {value == null ? (
        <>
          <div className="db-skeleton db-skeleton--value" />
          <div className="db-skeleton db-skeleton--sub" />
        </>
      ) : (
        <>
          <div className="db-stat-value" style={{ fontSize: 20 }}>{value}</div>
          {sub && <div className="db-stat-sub">{sub}</div>}
        </>
      )}
    </div>
  );
}

function KvRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 12.5 }}>
      <span style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.85)' }}>{value}</span>
    </div>
  );
}

function EmptyHint({ title, body }) {
  return (
    <div style={{ minHeight: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.40)' }}>{body}</div>
    </div>
  );
}

function formatCount(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCurrency(cents, currency = 'usd') {
  if (cents == null) return '—';
  const v = cents / 100;
  return v.toLocaleString(undefined, { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: v < 10 && v > 0 ? 2 : 0 });
}

function formatRelative(iso) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60_000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch { return '—'; }
}
