import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Logo from '../../components/Logo';

export default function AdminDashboard() {
  const router = useRouter();
  const [overview, setOverview] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [overviewRes, reqsRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/requests?limit=8'),
      ]);

      if (overviewRes.status === 401) { router.replace('/login'); return; }
      if (overviewRes.status === 403) { setError('Admin access required.'); setLoading(false); return; }

      setOverview(overviewRes.ok ? await overviewRes.json() : null);
      if (reqsRes.ok) {
        const d = await reqsRes.json();
        setRecentRequests(d.requests || []);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (error) return <AdminShell><div className="db-card"><p style={{ color: 'rgba(252,165,165,0.85)' }}>{error}</p></div></AdminShell>;

  return (
    <AdminShell>
      <Head><title>Admin — Cloudach</title></Head>

      <div className="db-page-header">
        <h1 className="db-page-title">Admin overview</h1>
        <p className="db-page-subtitle">
          Platform health and customer activity at a glance.
          {overview?.generatedAt && (
            <span className="db-page-date">· Updated {formatTime(overview.generatedAt)}</span>
          )}
        </p>
      </div>

      <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <SignupsKpi loading={loading} data={overview?.users} />
        <UsersKpi   loading={loading} data={overview?.users} />
        <RevenueKpi loading={loading} data={overview?.revenue} />
        <RequestsKpi loading={loading} data={overview?.usage} />
        <LatencyKpi loading={loading} data={overview?.usage} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <TopSpendersCard loading={loading} rows={overview?.topSpenders} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
        <StripeStatusCard loading={loading} data={overview?.stripe} revenue={overview?.revenue} />
        <AwsStatusCard    loading={loading} data={overview?.aws} />
        <SystemStatusCard loading={loading} data={overview?.systemStatus} revenue={overview?.revenue} aws={overview?.aws} />
      </div>

      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Recent requests</span>
          <Link href="/admin/requests" className="admin-card-link">View all →</Link>
        </div>
        {loading ? (
          <RecentRequestsSkeleton />
        ) : recentRequests.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>No requests in the last period.</p>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead><tr>{['Time', 'User', 'Model', 'Tokens', 'Latency', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {recentRequests.map(r => (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleTimeString()}</td>
                    <td style={{ color: 'rgba(255,255,255,0.55)' }}>{r.userEmail}</td>
                    <td><code className="admin-mono">{r.model}</code></td>
                    <td className="db-col-num">{r.totalTokens?.toLocaleString() ?? '—'}</td>
                    <td className="db-col-num">{r.latencyMs != null ? `${r.latencyMs}ms` : '—'}</td>
                    <td><StatusBadge code={r.statusCode} /></td>
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

/* ---------------- KPI cards ---------------- */

function SignupsKpi({ loading, data }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">Sign-ups (last 7d)</div>
      {loading ? (
        <><div className="db-skeleton db-skeleton--value" /><div className="db-skeleton db-skeleton--sub" /></>
      ) : (
        <>
          <div className="db-stat-value">{data?.signups7d ?? '—'}</div>
          <div className="db-stat-sub">{data?.signups30d ?? '—'} in last 30d</div>
          <Sparkline points={data?.signupsByDay || []} />
        </>
      )}
    </div>
  );
}

function UsersKpi({ loading, data }) {
  const disabled = data?.disabled ?? 0;
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">Users</div>
      {loading ? (
        <><div className="db-skeleton db-skeleton--value" /><div className="db-skeleton db-skeleton--sub" /></>
      ) : (
        <>
          <div className="db-stat-value">{data?.active ?? '—'}</div>
          <div className="db-stat-sub">
            active · {disabled > 0 ? (
              <span style={{ color: 'rgba(252,165,165,0.75)' }}>{disabled} disabled</span>
            ) : '0 disabled'}
          </div>
        </>
      )}
    </div>
  );
}

function RevenueKpi({ loading, data }) {
  const cents = data?.todayCents;
  const currency = data?.currency || 'usd';
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">Revenue today</div>
      {loading ? (
        <><div className="db-skeleton db-skeleton--value" /><div className="db-skeleton db-skeleton--sub" /></>
      ) : (
        <>
          <div className="db-stat-value">{cents == null ? '—' : formatCurrency(cents, currency)}</div>
          <div className="db-stat-sub">
            {cents == null ? 'Stripe not wired' : `MTD ${formatCurrency(data?.mtdCents || 0, currency)}`}
          </div>
        </>
      )}
    </div>
  );
}

function RequestsKpi({ loading, data }) {
  const req = data?.requests24h;
  const err = data?.errors24h;
  const errPct = req ? (err / req) * 100 : 0;
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">Requests (24h)</div>
      {loading ? (
        <><div className="db-skeleton db-skeleton--value" /><div className="db-skeleton db-skeleton--sub" /></>
      ) : (
        <>
          <div className="db-stat-value">{formatCount(req)}</div>
          <div className="db-stat-sub">
            {err > 0 ? (
              <span style={{ color: errPct >= 5 ? 'rgba(252,165,165,0.85)' : 'rgba(255,255,255,0.55)' }}>
                {err} errors · {errPct.toFixed(errPct >= 1 ? 1 : 2)}%
              </span>
            ) : 'no errors'}
          </div>
        </>
      )}
    </div>
  );
}

function LatencyKpi({ loading, data }) {
  const p95 = data?.p95LatencyMs24h;
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">p95 latency (24h)</div>
      {loading ? (
        <><div className="db-skeleton db-skeleton--value" /><div className="db-skeleton db-skeleton--sub" /></>
      ) : (
        <>
          <div className="db-stat-value">{p95 ? `${p95}ms` : '—'}</div>
          <div className="db-stat-sub">avg {data?.avgLatencyMs24h ? `${data.avgLatencyMs24h}ms` : '—'}</div>
        </>
      )}
    </div>
  );
}

/* ---------------- Cards ---------------- */

function TopSpendersCard({ loading, rows }) {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <span className="db-card-title">Top spenders · last 30 days</span>
        <Link href="/admin/users" className="admin-card-link">All customers →</Link>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0,1,2,3,4].map(i => <div key={i} className="db-skeleton" style={{ height: 28 }} />)}
        </div>
      ) : !rows || rows.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>No spender activity in the last 30 days.</p>
      ) : (
        <div className="db-table-wrap">
          <table className="db-table">
            <thead><tr><th>Customer</th><th className="db-col-num">Revenue (30d)</th><th className="db-col-num">Tokens (30d)</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>
                    <span style={{ color: 'rgba(255,255,255,0.85)' }}>{r.email}</span>
                    {r.isDisabled && <span className="db-badge db-badge--revoked" style={{ marginLeft: 8 }}>Disabled</span>}
                  </td>
                  <td className="db-col-num">
                    {r.revenueCents == null ? <span style={{ color: 'rgba(255,255,255,0.30)' }}>—</span>
                      : formatCurrency(r.revenueCents, 'usd')}
                  </td>
                  <td className="db-col-num">{formatCount(r.tokens30d)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StripeStatusCard({ loading, data, revenue }) {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <span className="db-card-title">Stripe</span>
        {!loading && data && (
          <span className={`db-badge ${data.configured ? 'db-badge--active' : 'db-badge--revoked'}`}>
            {data.configured ? 'KEY_PRESENT' : 'NOT_CONFIGURED'}
          </span>
        )}
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="db-skeleton" style={{ height: 20 }} />
          <div className="db-skeleton" style={{ height: 20 }} />
          <div className="db-skeleton" style={{ height: 20 }} />
        </div>
      ) : !data?.configured ? (
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
          Set <code style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>STRIPE_SECRET_KEY</code> in Vercel envs to activate billing. See <code style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>docs/setup/stripe.md</code>.
        </p>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0, listStyle: 'none' }}>
          <KvRow
            label="Webhook"
            value={
              !data.webhookConfigured
                ? <span style={{ color: 'rgba(252,165,165,0.85)' }}>secret missing</span>
                : data.webhookLastAt
                  ? <span>{formatRelative(data.webhookLastAt)}</span>
                  : <span style={{ color: 'rgba(255,255,255,0.45)' }}>no events yet</span>
            }
          />
          <KvRow label="Paid invoices · 24h"  value={data.paidInvoices24h ?? 0} />
          <KvRow label="Paid invoices · MTD"  value={data.paidInvoicesMtd ?? 0} />
          <KvRow label="Revenue · 30 days"    value={formatCurrency(revenue?.last30dCents ?? 0, revenue?.currency || 'usd')} />
          <KvRow label="Revenue · today"      value={formatCurrency(revenue?.todayCents ?? 0, revenue?.currency || 'usd')} />
        </ul>
      )}
    </div>
  );
}

function KvRow({ label, value }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{value}</span>
    </li>
  );
}

function AwsStatusCard({ loading, data }) {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <span className="db-card-title">AWS</span>
        {!loading && data && (
          <span className={`db-badge ${data.configured ? 'db-badge--active' : 'db-badge--revoked'}`}>
            {data.configured ? 'KEY_PRESENT' : 'NOT_CONFIGURED'}
          </span>
        )}
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="db-skeleton" style={{ height: 20 }} />
          <div className="db-skeleton" style={{ height: 20 }} />
          <div className="db-skeleton" style={{ height: 20 }} />
        </div>
      ) : !data?.configured ? (
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
          AWS not configured — paste keys to activate. Set <code style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>AWS_REGION</code> + <code style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>AWS_ACCESS_KEY_ID</code> in Vercel envs. See <code style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}>docs/setup/aws.md</code>.
        </p>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0, listStyle: 'none' }}>
          <KvRow label="Region" value={<code style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12 }}>{data.region}</code>} />
          <KvRow label="Backend mode" value={data.inferenceBackend} />
          <KvRow
            label="GPU instances"
            value={data.gpuInstanceConfigured ? '1' : <span style={{ color: 'rgba(255,255,255,0.45)' }}>0</span>}
          />
          <KvRow
            label="vLLM endpoint"
            value={
              data.apiEndpoint
                ? <span style={{ fontSize: 12, fontFamily: 'var(--font-jetbrains-mono), monospace', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortenEndpoint(data.apiEndpoint)}</span>
                : <span style={{ color: 'rgba(255,255,255,0.45)' }}>not set</span>
            }
          />
          <KvRow
            label="Monthly cost"
            value={data.monthlyCostCents == null
              ? <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>CloudWatch pending</span>
              : formatCurrency(data.monthlyCostCents, 'usd')}
          />
        </ul>
      )}
    </div>
  );
}

function shortenEndpoint(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return url.length > 30 ? url.slice(0, 27) + '…' : url;
  }
}

function SystemStatusCard({ loading, data, aws }) {
  const inferenceMode = aws?.inferenceBackend || 'local';
  const inferenceOk = inferenceMode === 'local' || (inferenceMode === 'aws' && aws?.configured);
  const inferenceDetail = inferenceMode === 'local'
    ? 'Local backend (vLLM / mock)'
    : aws?.configured
      ? `AWS backend · ${aws.region}`
      : 'AWS backend selected but env not set — falling back to local';

  return (
    <div className="db-card">
      <div className="db-card-header"><span className="db-card-title">System status</span></div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="db-skeleton" style={{ height: 20 }} />
          <div className="db-skeleton" style={{ height: 20 }} />
        </div>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 0, margin: 0, listStyle: 'none' }}>
          <StatusRow
            label="Database"
            ok={data?.dbReachable}
            detail={data?.dbReachable ? 'Connected · Neon' : 'Unreachable'}
          />
          <StatusRow
            label="Inference"
            ok={inferenceOk}
            warn={inferenceMode === 'aws' && !aws?.configured}
            detail={inferenceDetail}
          />
        </ul>
      )}
    </div>
  );
}

function StatusRow({ label, ok, warn, detail }) {
  const colorClass = ok ? 'admin-dot--ok' : warn ? 'admin-dot--warn' : 'admin-dot--down';
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className={`admin-dot ${colorClass}`} aria-hidden="true" />
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, minWidth: 130 }}>{label}</span>
      <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>{detail}</span>
    </li>
  );
}

/* ---------------- Sparkline ---------------- */

function Sparkline({ points }) {
  if (!points || points.length < 2) return <div style={{ height: 28, marginTop: 10 }} />;
  const w = 140;
  const h = 28;
  const max = Math.max(1, ...points.map(p => p.count));
  const step = w / (points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(h - (p.count / max) * (h - 2) - 1).toFixed(1)}`).join(' ');
  const lastX = (points.length - 1) * step;
  const lastY = h - (points[points.length - 1].count / max) * (h - 2) - 1;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ marginTop: 10, display: 'block' }} aria-hidden="true">
      <path d={d} fill="none" stroke="rgba(255,255,255,0.50)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="2.2" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

/* ---------------- Skeleton for recent-requests table ---------------- */

function RecentRequestsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[0,1,2,3,4,5].map(i => <div key={i} className="db-skeleton" style={{ height: 32 }} />)}
    </div>
  );
}

/* ---------------- Status badge ---------------- */

function StatusBadge({ code }) {
  const ok = code != null && code < 400;
  return (
    <span className={ok ? 'db-badge db-badge--active' : 'db-badge db-badge--revoked'}>
      {code ?? '—'}
    </span>
  );
}

/* ---------------- Shared shell ---------------- */

export function AdminShell({ children }) {
  const router = useRouter();
  return (
    <div className="admin-shell">
      <header className="admin-topnav">
        <Link href="/admin" className="admin-brand">
          <Logo size={20} monochrome />
          <span>Cloudach<span style={{ opacity: 0.5, marginLeft: 8, fontWeight: 500 }}>admin</span></span>
        </Link>
        <nav className="admin-nav-links">
          <AdminNavLink href="/admin" active={router.pathname === '/admin'}>Overview</AdminNavLink>
          <AdminNavLink href="/admin/users" active={router.pathname.startsWith('/admin/users')}>Users</AdminNavLink>
          <AdminNavLink href="/admin/requests" active={router.pathname.startsWith('/admin/requests')}>Requests</AdminNavLink>
          <AdminNavLink href="/admin/api-keys" active={router.pathname.startsWith('/admin/api-keys')}>API Keys</AdminNavLink>
        </nav>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" className="admin-nav-link">← Back to dashboard</Link>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}

function AdminNavLink({ href, active, children }) {
  return (
    <Link href={href} className={`admin-nav-link${active ? ' admin-nav-link--active' : ''}`}>
      {children}
    </Link>
  );
}

/* ---------------- Formatting helpers ---------------- */

function formatCount(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCurrency(cents, currency = 'usd') {
  if (cents == null) return '—';
  const v = cents / 100;
  return v.toLocaleString(undefined, { style: 'currency', currency: currency.toUpperCase(), maximumFractionDigits: v < 10 ? 2 : 0 });
}

function formatTime(iso) {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
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
    return `${d}d ago`;
  } catch { return '—'; }
}
