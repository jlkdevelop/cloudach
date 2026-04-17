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
  }, [router]);

  if (error) return <AdminShell><div className="db-card"><p style={{ color: 'rgba(252,165,165,0.85)' }}>{error}</p></div></AdminShell>;

  const active  = apiKeys.filter(k => k.isActive).length;
  const revoked = apiKeys.filter(k => !k.isActive).length;

  return (
    <AdminShell>
      <Head><title>API Keys — Cloudach Admin</title></Head>

      <div className="db-page-header">
        <h1 className="db-page-title">API keys</h1>
        <p className="db-page-subtitle">
          {loading
            ? 'Loading keys…'
            : `${apiKeys.length} total · ${active} active · ${revoked} revoked`}
        </p>
      </div>

      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">All API keys</span>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
            {loading ? '' : `${apiKeys.length} key${apiKeys.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0,1,2,3,4,5].map(i => <div key={i} className="db-skeleton" style={{ height: 32 }} />)}
          </div>
        ) : apiKeys.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>No API keys have been created yet.</p>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  {['Name', 'User', 'Status', 'Rate limit (RPM)', 'Allowed models', 'Created', 'Last used'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(k => (
                  <tr key={k.id} style={!k.isActive ? { opacity: 0.55 } : undefined}>
                    <td style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{k.name}</td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{k.userEmail}</td>
                    <td>
                      <span className={k.isActive ? 'db-badge db-badge--active' : 'db-badge db-badge--revoked'}>
                        {k.isActive ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
                      {k.rateLimitRpm ?? <span style={{ color: 'rgba(255,255,255,0.35)' }}>Default (60)</span>}
                    </td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
                      {k.allowedModels && k.allowedModels.length
                        ? k.allowedModels.join(', ')
                        : <span style={{ color: 'rgba(255,255,255,0.35)' }}>All models</span>}
                    </td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                      {new Date(k.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : <span style={{ color: 'rgba(255,255,255,0.35)' }}>Never</span>}
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
