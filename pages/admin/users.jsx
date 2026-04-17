import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminShell } from './index';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ totalMrrCents: 0, paidCustomers: 0, byPlan: {} });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(null);

  async function load() {
    const res = await fetch('/api/admin/users');
    if (res.status === 401) { router.replace('/login'); return; }
    if (res.status === 403) { setError('Admin access required.'); setLoading(false); return; }
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
      setSummary(data.summary || { totalMrrCents: 0, paidCustomers: 0, byPlan: {} });
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

  if (error) return <AdminShell><p style={{ color: '#DC2626', padding: 24 }}>{error}</p></AdminShell>;
  if (loading) return <AdminShell><p style={{ color: '#9CA3AF', padding: 24 }}>Loading…</p></AdminShell>;

  const q = search.trim().toLowerCase();
  const visible = users.filter(u => {
    if (filter === 'paid' && u.plan === 'free') return false;
    if (filter !== 'all' && filter !== 'paid' && u.plan !== filter) return false;
    if (q && !u.email.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <AdminShell>
      <Head><title>Customers — Cloudach Admin</title></Head>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Customers ({users.length})</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <KpiCard label="MRR"            value={formatUsd(summary.totalMrrCents)} />
        <KpiCard label="Paid customers" value={summary.paidCustomers} />
        <KpiCard label="Free"           value={summary.byPlan.free || 0} />
        <KpiCard label="Pro"            value={summary.byPlan.pro || 0} />
        <KpiCard label="Enterprise"     value={summary.byPlan.enterprise || 0} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: 200, padding: '6px 12px', fontSize: 14, borderRadius: 6, border: '1px solid #E5E7EB' }}
        />
        {['all', 'paid', 'free', 'pro', 'enterprise'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', fontSize: 13, borderRadius: 6, cursor: 'pointer',
              border: '1px solid ' + (filter === f ? '#2563EB' : '#E5E7EB'),
              background: filter === f ? '#2563EB' : '#fff',
              color: filter === f ? '#fff' : '#374151',
              textTransform: 'capitalize',
            }}>{f}</button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {['Email', 'Plan', 'MRR', 'Paid (30d)', 'Role', 'Status', 'API Keys', 'Tokens', 'Requests', 'Last Request', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid #E5E7EB', fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(u => (
                <tr key={u.id} style={{ background: u.isDisabled ? '#FEF2F2' : 'transparent' }}>
                  <td style={td}>
                    {u.email}
                    {u.stripeCustomerId && (
                      <a href={`https://dashboard.stripe.com/customers/${u.stripeCustomerId}`} target="_blank" rel="noreferrer"
                         style={{ marginLeft: 6, fontSize: 11, color: '#6B7280' }}>↗ Stripe</a>
                    )}
                  </td>
                  <td style={td}><PlanBadge plan={u.plan} /></td>
                  <td style={td}>{u.mrrCents == null ? 'Custom' : formatUsd(u.mrrCents)}</td>
                  <td style={td}>{u.stripe30dCents ? formatUsd(u.stripe30dCents) : '—'}</td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: u.role === 'admin' ? 'var(--brand-subtle)' : 'var(--bg-3)', color: u.role === 'admin' ? 'var(--brand)' : 'var(--text-2)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: u.isDisabled ? '#FEE2E2' : '#DCFCE7', color: u.isDisabled ? '#DC2626' : '#16A34A' }}>
                      {u.isDisabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td style={td}>{u.activeApiKeys}</td>
                  <td style={td}>{formatTokens(u.totalTokens)}</td>
                  <td style={td}>{u.totalRequests.toLocaleString()}</td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {u.lastRequestAt ? new Date(u.lastRequestAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => toggleUser(u)}
                      disabled={toggling === u.id || u.role === 'admin'}
                      style={{
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 6,
                        border: 'none',
                        cursor: u.role === 'admin' ? 'not-allowed' : 'pointer',
                        background: u.isDisabled ? 'rgba(255,255,255,0.10)' : 'rgba(220,38,38,0.10)',
                        color: u.isDisabled ? 'rgba(255,255,255,0.75)' : 'rgba(252,165,165,0.85)',
                        opacity: u.role === 'admin' ? 0.5 : 1,
                      }}
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
      </div>
    </AdminShell>
  );
}

function KpiCard({ label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: '#111827' }}>{value}</div>
    </div>
  );
}

function PlanBadge({ plan }) {
  const styles = {
    free:       { bg: '#F3F4F6', fg: '#374151' },
    pro:        { bg: '#EEF2FF', fg: '#4F46E5' },
    enterprise: { bg: '#FDF4FF', fg: '#A21CAF' },
  }[plan] || { bg: '#F3F4F6', fg: '#374151' };
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: styles.bg, color: styles.fg, textTransform: 'capitalize' }}>
      {plan}
    </span>
  );
}

function formatTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatUsd(cents) {
  return '$' + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const td = { padding: '10px 16px', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' };
