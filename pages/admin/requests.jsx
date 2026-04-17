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
  }, [router]);

  if (error) return <AdminShell><div className="db-card"><p style={{ color: 'rgba(252,165,165,0.85)' }}>{error}</p></div></AdminShell>;

  const summary = data?.summary || {};
  const requests = data?.requests || [];
  const errorRate = summary.totalRequests24h > 0
    ? ((summary.errorCount24h / summary.totalRequests24h) * 100).toFixed(1)
    : '0.0';

  return (
    <AdminShell>
      <Head><title>Requests — Cloudach Admin</title></Head>

      <div className="db-page-header">
        <h1 className="db-page-title">Inference requests</h1>
        <p className="db-page-subtitle">Last 100 calls across the platform · 24-hour rollup.</p>
      </div>

      <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <SummaryCard label="Total (24h)" value={loading ? null : summary.totalRequests24h?.toLocaleString() ?? '0'} />
        <SummaryCard label="Tokens (24h)" value={loading ? null : formatTokens(summary.totalTokens24h ?? 0)} />
        <SummaryCard label="Avg latency" value={loading ? null : (summary.avgLatencyMs24h ? `${summary.avgLatencyMs24h}ms` : '—')} />
        <SummaryCard
          label="Errors (24h)"
          value={loading ? null : (summary.errorCount24h ?? 0).toLocaleString()}
          sub={loading ? null : `${errorRate}% of requests`}
          danger={!loading && summary.errorCount24h > 0 && parseFloat(errorRate) >= 5}
        />
      </div>

      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Request log</span>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>Showing last {requests.length}</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0,1,2,3,4,5,6,7].map(i => <div key={i} className="db-skeleton" style={{ height: 32 }} />)}
          </div>
        ) : requests.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>No requests recorded yet.</p>
        ) : (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  {['Time', 'User', 'Key', 'Model', 'Prompt', 'Completion', 'Total', 'Cost', 'Latency', 'Status'].map((h, i) => (
                    <th key={h} className={i >= 4 && i <= 8 ? 'db-col-num' : ''}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.userEmail}
                    </td>
                    <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>{r.apiKeyName || '—'}</td>
                    <td><code style={monoStyle}>{r.model}</code></td>
                    <td className="db-col-num">{r.promptTokens?.toLocaleString() ?? '—'}</td>
                    <td className="db-col-num">{r.completionTokens?.toLocaleString() ?? '—'}</td>
                    <td className="db-col-num" style={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                      {r.totalTokens?.toLocaleString() ?? '—'}
                    </td>
                    <td className="db-col-num" style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{formatCost(r.estimatedCost)}</td>
                    <td className="db-col-num">{r.latencyMs != null ? `${r.latencyMs}ms` : '—'}</td>
                    <td>
                      <span className={r.statusCode != null && r.statusCode < 400 ? 'db-badge db-badge--active' : 'db-badge db-badge--revoked'}>
                        {r.statusCode ?? '—'}
                      </span>
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

function SummaryCard({ label, value, sub, danger }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">{label}</div>
      {value == null ? (
        <>
          <div className="db-skeleton db-skeleton--value" />
          {sub === null && <div className="db-skeleton db-skeleton--sub" />}
        </>
      ) : (
        <>
          <div className="db-stat-value" style={danger ? { color: 'rgba(252,165,165,0.92)' } : undefined}>{value}</div>
          {sub !== undefined && sub !== null && (
            <div className="db-stat-sub" style={danger ? { color: 'rgba(252,165,165,0.75)' } : undefined}>{sub}</div>
          )}
        </>
      )}
    </div>
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

const monoStyle = {
  fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", "Fira Code", "Courier New", monospace',
  fontSize: 12,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  color: 'rgba(255,255,255,0.75)',
  padding: '2px 7px',
  borderRadius: 5,
};
