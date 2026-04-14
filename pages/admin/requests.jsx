import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminShell } from './index';

export default function AdminRequestsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/requests?limit=100');
      if (res.status === 401) { router.replace('/login'); return; }
      if (res.status === 403) { setError('Admin access required.'); setLoading(false); return; }
      if (res.ok) setData(await res.json());
      setLoading(false);
    }
    load();
  }, []);

  if (error) return <AdminShell><p style={{ color: '#DC2626', padding: 24 }}>{error}</p></AdminShell>;
  if (loading) return <AdminShell><p style={{ color: '#9CA3AF', padding: 24 }}>Loading…</p></AdminShell>;

  const { summary, requests } = data;
  const errorRate = summary.totalRequests24h > 0
    ? ((summary.errorCount24h / summary.totalRequests24h) * 100).toFixed(1)
    : '0.0';

  return (
    <AdminShell>
      <Head><title>Requests — Cloudach Admin</title></Head>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Inference Requests</h1>

      {/* 24h summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          ['Total (24h)', summary.totalRequests24h?.toLocaleString() ?? '0'],
          ['Tokens (24h)', formatTokens(summary.totalTokens24h ?? 0)],
          ['Avg latency', summary.avgLatencyMs24h ? `${summary.avgLatencyMs24h}ms` : '—'],
          ['Errors (24h)', `${summary.errorCount24h ?? 0} (${errorRate}%)`],
        ].map(([label, value]) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Request log */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Recent requests</span>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>Last 100</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Time', 'User', 'Key', 'Model', 'Prompt', 'Completion', 'Total', 'Cost', 'Latency', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', borderBottom: '1px solid #E5E7EB', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.userEmail}</td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280' }}>{r.apiKeyName || '—'}</td>
                  <td style={td}><code style={mono}>{r.model}</code></td>
                  <td style={td}>{r.promptTokens?.toLocaleString()}</td>
                  <td style={td}>{r.completionTokens?.toLocaleString()}</td>
                  <td style={td}><strong>{r.totalTokens?.toLocaleString()}</strong></td>
                  <td style={{ ...td, fontSize: 12, color: '#6B7280' }}>{formatCost(r.estimatedCost)}</td>
                  <td style={td}>{r.latencyMs != null ? `${r.latencyMs}ms` : '—'}</td>
                  <td style={td}>
                    <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: r.statusCode < 400 ? '#DCFCE7' : '#FEE2E2', color: r.statusCode < 400 ? '#16A34A' : '#DC2626' }}>
                      {r.statusCode ?? '—'}
                    </span>
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

function formatCost(n) {
  if (!n || n === 0) return '$0.00';
  if (n < 0.001) return '<$0.001';
  return `$${n.toFixed(4)}`;
}

const td = { padding: '10px 14px', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' };
const mono = { background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 };
