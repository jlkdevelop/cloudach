import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminShell } from './index';

export default function AdminApiKeysPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/api-keys');
      if (res.status === 401) { router.replace('/login'); return; }
      if (res.status === 403) { setError('Admin access required.'); setLoading(false); return; }
      if (res.ok) setApiKeys((await res.json()).apiKeys);
      setLoading(false);
    }
    load();
  }, []);

  if (error) return <AdminShell><p style={{ color: '#DC2626', padding: 24 }}>{error}</p></AdminShell>;
  if (loading) return <AdminShell><p style={{ color: '#9CA3AF', padding: 24 }}>Loading…</p></AdminShell>;

  const active  = apiKeys.filter(k => k.isActive).length;
  const revoked = apiKeys.filter(k => !k.isActive).length;

  return (
    <AdminShell>
      <Head><title>API Keys — Cloudach Admin</title></Head>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
        API Keys ({apiKeys.length} total · {active} active · {revoked} revoked)
      </h1>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Name', 'User', 'Status', 'Rate Limit (RPM)', 'Allowed Models', 'Created', 'Last Used'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid #E5E7EB', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apiKeys.map(k => (
                <tr key={k.id} style={{ background: k.isActive ? 'transparent' : '#F9FAFB' }}>
                  <td style={td}><strong>{k.name}</strong></td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280' }}>{k.userEmail}</td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: k.isActive ? '#DCFCE7' : '#F3F4F6', color: k.isActive ? '#16A34A' : '#9CA3AF' }}>
                      {k.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280' }}>{k.rateLimitRpm ?? 'Default (60)'}</td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280' }}>{k.allowedModels ? k.allowedModels.join(', ') : 'All models'}</td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : '—'}
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

const td = { padding: '10px 16px', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' };
