import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function UsagePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.replace('/login'); return; }
      setUser((await meRes.json()).user);
      const res = await fetch('/api/dashboard/usage?limit=50');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setDaily(data.daily || []);
      }
      setLoading(false);
    }
    init();
  }, [router]);

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
    </div>
  );

  const totalTokens = daily.reduce((s, d) => s + parseInt(d.tokens || 0, 10), 0);
  const totalReqs = daily.reduce((s, d) => s + parseInt(d.requests || 0, 10), 0);
  const totalCost = daily.reduce((s, d) => s + parseFloat(d.cost || 0), 0);
  const maxTokens = Math.max(...daily.map(d => parseInt(d.tokens || 0, 10)), 1);

  return (
    <>
      <Head><title>Usage — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Usage</h1>
          <p className="db-page-subtitle">Token consumption and request history for the last 7 days.</p>
        </div>

        {/* Summary stats */}
        <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: 800, marginBottom: 24 }}>
          <div className="db-stat-card">
            <div className="db-stat-label">Requests (7d)</div>
            <div className="db-stat-value">{totalReqs.toLocaleString()}</div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-label">Tokens (7d)</div>
            <div className="db-stat-value">{formatTokens(totalTokens)}</div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-label">Est. Cost (7d)</div>
            <div className="db-stat-value">{formatCost(totalCost)}</div>
          </div>
          <div className="db-stat-card">
            <div className="db-stat-label">Avg tokens/req</div>
            <div className="db-stat-value">{totalReqs > 0 ? Math.round(totalTokens / totalReqs).toLocaleString() : '—'}</div>
          </div>
        </div>

        {/* Chart */}
        {daily.length > 0 && (
          <div className="db-card" style={{ marginBottom: 24 }}>
            <div className="db-card-header">
              <span className="db-card-title">Daily tokens</span>
            </div>
            <div className="db-chart">
              {daily.map((d) => {
                const tokens = parseInt(d.tokens || 0, 10);
                const pct = Math.max((tokens / maxTokens) * 100, 5);
                const day = new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const cost = parseFloat(d.cost || 0);
                return (
                  <div key={d.day} className="db-bar-wrap" title={`${tokens.toLocaleString()} tokens · ${d.requests} reqs · ${formatCost(cost)}`}>
                    <div className="db-bar" style={{ height: `${pct}%` }} />
                    <span className="db-bar-label">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Request log */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Recent requests</span>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>Last 50</span>
          </div>
          {loading ? (
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</p>
          ) : logs.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">📡</div>
              <div className="db-empty-title">No requests yet</div>
              <div className="db-empty-desc">Make your first API call to see logs here.</div>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Model</th>
                    <th>Prompt</th>
                    <th>Completion</th>
                    <th>Total</th>
                    <th>Cost</th>
                    <th>Latency</th>
                    <th>Status</th>
                    <th>Key</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap', color: '#6B7280', fontSize: 12 }}>
                        {new Date(l.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td><code style={{ fontSize: 12, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>{l.model}</code></td>
                      <td>{l.prompt_tokens?.toLocaleString()}</td>
                      <td>{l.completion_tokens?.toLocaleString()}</td>
                      <td><strong>{l.total_tokens?.toLocaleString()}</strong></td>
                      <td style={{ color: '#6B7280', fontSize: 12 }}>{formatCost(l.estimated_cost)}</td>
                      <td>{l.latency_ms != null ? `${l.latency_ms}ms` : '—'}</td>
                      <td>
                        <span className={`db-badge db-badge--${l.status_code < 400 ? 'active' : 'revoked'}`}>
                          {l.status_code ?? '—'}
                        </span>
                      </td>
                      <td style={{ color: '#6B7280', fontSize: 12 }}>{l.api_key_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

function formatTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(n) {
  if (n == null || isNaN(n)) return '—';
  if (n === 0) return '$0.00';
  if (n < 0.01) return '<$0.01';
  return `$${n.toFixed(4)}`;
}
