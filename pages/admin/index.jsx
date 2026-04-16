import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [usersRes, reqsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/requests?limit=5'),
      ]);

      if (usersRes.status === 401) { router.replace('/login'); return; }
      if (usersRes.status === 403) { setError('Admin access required.'); setLoading(false); return; }

      const users = usersRes.ok ? (await usersRes.json()).users : [];
      const reqsData = reqsRes.ok ? await reqsRes.json() : { summary: {}, requests: [] };
      setData({ users, summary: reqsData.summary, recentRequests: reqsData.requests });
      setLoading(false);
    }
    load();
  }, [router]);

  if (error) return <AdminShell><p style={{ color: '#DC2626', padding: 24 }}>{error}</p></AdminShell>;
  if (loading) return <AdminShell><p style={{ color: '#9CA3AF', padding: 24 }}>Loading…</p></AdminShell>;

  const { users, summary, recentRequests } = data;
  const activeUsers    = users.filter(u => !u.isDisabled).length;
  const disabledUsers  = users.filter(u => u.isDisabled).length;
  const totalApiKeys   = users.reduce((s, u) => s + u.activeApiKeys, 0);

  return (
    <AdminShell>
      <Head><title>Admin — Cloudach</title></Head>

      <h1 style={pageTitle}>Admin Dashboard</h1>

      {/* Platform stats */}
      <div style={statsGrid}>
        <StatCard label="Total users" value={users.length} />
        <StatCard label="Active users" value={activeUsers} />
        <StatCard label="Disabled users" value={disabledUsers} accent={disabledUsers > 0} />
        <StatCard label="Active API keys" value={totalApiKeys} />
        <StatCard label="Requests (24h)" value={summary.totalRequests24h ?? 0} />
        <StatCard label="Errors (24h)" value={summary.errorCount24h ?? 0} accent={(summary.errorCount24h ?? 0) > 0} />
        <StatCard label="Tokens (24h)" value={formatTokens(summary.totalTokens24h ?? 0)} />
        <StatCard label="Avg latency (24h)" value={summary.avgLatencyMs24h ? `${summary.avgLatencyMs24h}ms` : '—'} />
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <Link href="/admin/users"><button style={btn}>Manage Users</button></Link>
        <Link href="/admin/requests"><button style={{ ...btn, background: '#F3F4F6', color: '#374151' }}>View All Requests</button></Link>
        <Link href="/admin/api-keys"><button style={{ ...btn, background: '#F3F4F6', color: '#374151' }}>View API Keys</button></Link>
      </div>

      {/* Recent requests */}
      {recentRequests.length > 0 && (
        <div style={card}>
          <div style={cardHeader}>
            <span style={cardTitle}>Recent requests</span>
            <Link href="/admin/requests" style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead><tr>{['Time', 'User', 'Model', 'Tokens', 'Latency', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {recentRequests.map(r => (
                  <tr key={r.id}>
                    <td style={td}>{new Date(r.createdAt).toLocaleTimeString()}</td>
                    <td style={{ ...td, fontSize: 12, color: '#6B7280' }}>{r.userEmail}</td>
                    <td style={td}><code style={mono}>{r.model}</code></td>
                    <td style={td}>{r.totalTokens?.toLocaleString()}</td>
                    <td style={td}>{r.latencyMs != null ? `${r.latencyMs}ms` : '—'}</td>
                    <td style={td}><StatusBadge code={r.statusCode} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${accent ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 10, padding: '16px 20px' }}>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent ? '#DC2626' : '#111827' }}>{value ?? '—'}</div>
    </div>
  );
}

function StatusBadge({ code }) {
  const ok = code < 400;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: ok ? '#DCFCE7' : '#FEE2E2', color: ok ? '#16A34A' : '#DC2626' }}>
      {code ?? '—'}
    </span>
  );
}

export function AdminShell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24, height: 56 }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#DC2626' }}>Cloudach Admin</span>
        <Link href="/admin" style={navLink}>Overview</Link>
        <Link href="/admin/users" style={navLink}>Users</Link>
        <Link href="/admin/requests" style={navLink}>Requests</Link>
        <Link href="/admin/api-keys" style={navLink}>API Keys</Link>
        <div style={{ flex: 1 }} />
        <Link href="/dashboard" style={{ ...navLink, color: 'rgba(255,255,255,0.65)' }}>← Dashboard</Link>
      </nav>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </div>
    </div>
  );
}

function formatTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const pageTitle = { fontSize: 26, fontWeight: 700, marginBottom: 24 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 };
const btn = { background: '#ffffff', color: '#0d0e17', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const card = { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' };
const cardHeader = { padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const cardTitle = { fontWeight: 600, fontSize: 15 };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
const th = { textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid #E5E7EB', fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' };
const td = { padding: '10px 16px', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' };
const mono = { background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' };
const navLink = { fontSize: 14, color: '#374151', textDecoration: 'none' };
