import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminShell } from './index';

// DB plan key -> display label. 'enterprise' is the legacy key for the
// Business tier per the deferred Phase 2 §6 rename.
const PLAN_LABEL = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Business',
};

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'paid',     label: 'Paid' },
  { id: 'free',     label: 'Free' },
  { id: 'pro',      label: 'Pro' },
  { id: 'business', label: 'Business' },
  { id: 'disabled', label: 'Disabled' },
];

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.status === 401) { router.replace('/login'); return; }
    if (res.status === 403) { setError('Admin access required.'); setLoading(false); return; }
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
      setSummary(data.summary || null);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleUser(user) {
    setToggling(user.id);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, isDisabled: !user.isDisabled }),
    });
    if (res.ok) await load();
    setToggling(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      if (q && !u.email.toLowerCase().includes(q)) return false;
      switch (filter) {
        case 'paid':     return u.mrrCents > 0;
        case 'free':     return u.plan === 'free';
        case 'pro':      return u.plan === 'pro';
        case 'business': return u.plan === 'enterprise';
        case 'disabled': return u.isDisabled;
        default:         return true;
      }
    });
  }, [users, search, filter]);

  if (error) return <AdminShell><div className="db-card"><p style={{ color: 'rgba(252,165,165,0.85)' }}>{error}</p></div></AdminShell>;

  // Hide Stripe-derived columns (MRR + 30d revenue) when:
  //   - the API reported the underlying tables aren't available, OR
  //   - no user has any Stripe activity (avoids a column of dashes)
  const stripeAvailable = summary?.stripeColumnsAvailable !== false;
  const anyStripeActivity = users.some(u => u.mrrCents > 0 || u.stripe30dCents > 0);
  const showStripeCols = stripeAvailable && anyStripeActivity;

  return (
    <AdminShell>
      <Head><title>Customers — Cloudach Admin</title></Head>

      <div className="db-page-header">
        <h1 className="db-page-title">Customers</h1>
        <p className="db-page-subtitle">
          {loading
            ? 'Loading customer list…'
            : `${summary?.totalUsers ?? 0} total · ${summary?.activeUsers ?? 0} active · ${summary?.paidCustomers ?? 0} paying`}
        </p>
      </div>

      <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <SummaryCard
          label="Total customers"
          value={loading ? null : (summary?.totalUsers ?? 0).toLocaleString()}
          sub={loading ? null : `${summary?.activeUsers ?? 0} active · ${summary?.disabledUsers ?? 0} disabled`}
        />
        <SummaryCard
          label="Paying customers"
          value={loading ? null : (summary?.paidCustomers ?? 0).toLocaleString()}
          sub={loading ? null : (() => {
            const byPlan = summary?.byPlan || {};
            const pro = byPlan.pro || 0;
            const biz = byPlan.enterprise || 0;
            return `${pro} Pro · ${biz} Business`;
          })()}
        />
        <SummaryCard
          label="Monthly recurring"
          value={loading ? null : formatCurrency(summary?.totalMrrCents ?? 0, 'usd')}
          sub={loading ? null : (summary?.stripeColumnsAvailable === false ? 'Stripe data unavailable' : 'across active subscriptions')}
        />
        <SummaryCard
          label="Revenue (30d)"
          value={loading ? null : formatCurrency(summary?.total30dRevenueCents ?? 0, 'usd')}
          sub={loading ? null : (summary?.stripeColumnsAvailable === false ? 'Stripe not wired' : 'paid Stripe invoices')}
        />
      </div>

      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">All customers</span>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
            {loading ? '' : `${filtered.length} shown · ${users.length} total`}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18, alignItems: 'center' }}>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="admin-search"
            aria-label="Search customers by email"
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`admin-filter-pill${filter === f.id ? ' admin-filter-pill--active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 360 }}>
            {[0,1,2,3,4,5,6,7].map(i => <div key={i} className="db-skeleton" style={{ height: 36 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            {users.length === 0 ? 'No customers yet.' : 'No customers match this filter.'}
          </p>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  {(showStripeCols
                    ? ['Email', 'Plan', 'Status', 'MRR', '30d revenue', 'Tokens', 'Requests', 'Last call', 'Joined', 'Actions']
                    : ['Email', 'Plan', 'Status', 'Tokens', 'Requests', 'Last call', 'Joined', 'Actions']
                  ).map((h, i) => {
                    // Numeric columns: MRR / 30d revenue / Tokens / Requests when Stripe shown,
                    // Tokens / Requests when not.
                    const numericIdx = showStripeCols ? [3,4,5,6] : [3,4];
                    return <th key={h} className={numericIdx.includes(i) ? 'db-col-num' : ''}>{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={u.isDisabled ? { opacity: 0.55 } : undefined}>
                    <td>
                      <span style={{ color: 'rgba(255,255,255,0.85)' }}>{u.email}</span>
                      {u.role === 'admin' && (
                        <span className="db-badge db-badge--active" style={{ marginLeft: 8 }}>Admin</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-plan-pill admin-plan-pill--${u.plan}`}>
                        {PLAN_LABEL[u.plan] || u.plan}
                      </span>
                      {u.cancelAtPeriodEnd && (
                        <span style={{ marginLeft: 6, fontSize: 11, color: 'rgba(252,165,165,0.65)' }} title="Cancels at period end">
                          ↘
                        </span>
                      )}
                    </td>
                    <td>
                      {u.isDisabled
                        ? <span className="db-badge db-badge--revoked">Disabled</span>
                        : u.subscriptionStatus === 'past_due'
                          ? <span className="db-badge db-badge--revoked">Past due</span>
                          : u.subscriptionStatus === 'canceled'
                            ? <span className="db-badge db-badge--stopped">Canceled</span>
                            : <span className="db-badge db-badge--active">Active</span>}
                    </td>
                    {showStripeCols && (
                      <>
                        <td className="db-col-num">
                          {u.mrrCents > 0
                            ? formatCurrency(u.mrrCents, 'usd')
                            : <span style={{ color: 'rgba(255,255,255,0.30)' }}>—</span>}
                        </td>
                        <td className="db-col-num">
                          {u.stripe30dCents > 0
                            ? formatCurrency(u.stripe30dCents, 'usd')
                            : <span style={{ color: 'rgba(255,255,255,0.30)' }}>—</span>}
                          {u.stripeCustomerId && (
                            <a
                              href={`https://dashboard.stripe.com/customers/${u.stripeCustomerId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-stripe-link"
                              title="Open in Stripe Dashboard"
                              aria-label={`Open ${u.email} in Stripe Dashboard`}
                            >
                              ↗
                            </a>
                          )}
                        </td>
                      </>
                    )}
                    <td className="db-col-num">{formatCount(u.totalTokens)}</td>
                    <td className="db-col-num">{formatCount(u.totalRequests)}</td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                      {u.lastRequestAt ? new Date(u.lastRequestAt).toLocaleDateString() : <span style={{ color: 'rgba(255,255,255,0.30)' }}>Never</span>}
                    </td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleUser(u)}
                        disabled={toggling === u.id || u.role === 'admin'}
                        className={`admin-action-btn${u.isDisabled ? ' admin-action-btn--enable' : ' admin-action-btn--disable'}`}
                        title={u.role === 'admin' ? 'Cannot disable admin accounts' : ''}
                      >
                        {toggling === u.id ? '…' : u.isDisabled ? 'Enable' : 'Disable'}
                      </button>
                    </td>
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
          <div className="db-stat-value">{value}</div>
          {sub && <div className="db-stat-sub">{sub}</div>}
        </>
      )}
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
  return v.toLocaleString(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: v < 10 && v > 0 ? 2 : 0,
  });
}
