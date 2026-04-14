import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminShell } from './index';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(null);

  async function load() {
    const res = await fetch('/api/admin/users');
    if (res.status === 401) { router.replace('/login'); return; }
    if (res.status === 403) { setError('Admin access required.'); setLoading(false); return; }
    if (res.ok) setUsers((await res.json()).users);
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

  return (
    <AdminShell>
      <Head><title>Users — Cloudach Admin</title></Head>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Users ({users.length})</h1>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {['Email', 'Role', 'Status', 'API Keys', 'Total Tokens', 'Total Requests', 'Last Request', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid #E5E7EB', fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ background: u.isDisabled ? '#FEF2F2' : 'transparent' }}>
                  <td style={td}>{u.email}</td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: u.role === 'admin' ? '#EEF2FF' : '#F3F4F6', color: u.role === 'admin' ? '#4338CA' : '#374151' }}>
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
                        background: u.isDisabled ? '#6366F1' : '#FEE2E2',
                        color: u.isDisabled ? '#fff' : '#DC2626',
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

function formatTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const td = { padding: '10px 16px', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' };
