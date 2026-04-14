import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

export default function UsagePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        setUser((await meRes.json()).user);
        const res = await fetch('/api/dashboard/usage?limit=50');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
          setDaily(data.daily || []);
        } else {
          setError('Failed to load usage data. Please refresh.');
        }
      } catch {
        setError('Network error. Please check your connection and refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading || !user) return <PageLoader />;

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

        {error && <ErrorBanner message={error} />}

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
                  <div key={d.day} className="db-bar-wrap" title={`${day}: ${tokens.toLocaleString()} tokens · ${d.requests} reqs · ${formatCost(cost)}`}>
                    <div className="db-bar" style={{ height: `${pct}%` }} />
                    <span className="db-bar-label">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Request log — consolidated to 7 columns for better density */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Recent requests</span>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>Last 50</span>
          </div>
          {logs.length === 0 ? (
            <div className="db-empty">
              <IconRequestsEmpty />
              <div className="db-empty-title">No requests yet</div>
              <div className="db-empty-desc">Deploy a model and make your first API call to see logs here.</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                <Link href="/dashboard/models">
                  <button className="db-btn db-btn--primary db-btn--sm">Deploy a model</button>
                </Link>
                <Link href="/dashboard/api-keys">
                  <button className="db-btn db-btn--ghost db-btn--sm">Create API key</button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Model</th>
                    <th className="db-col-num">Tokens</th>
                    <th className="db-col-num">Cost</th>
                    <th className="db-col-num">Latency</th>
                    <th>Status</th>
                    <th>Key</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap', color: '#6B7280', fontSize: 12 }}>
                        {fmtDateTime(l.created_at)}
                      </td>
                      <td>
                        <code style={{ fontSize: 12, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>
                          {l.model}
                        </code>
                      </td>
                      <td className="db-col-num">
                        <span style={{ fontWeight: 600 }}>{l.total_tokens?.toLocaleString() ?? '—'}</span>
                        {l.prompt_tokens != null && (
                          <span style={{ display: 'block', fontSize: 11, color: '#9CA3AF' }}>
                            {l.prompt_tokens.toLocaleString()}+{l.completion_tokens?.toLocaleString() ?? 0}
                          </span>
                        )}
                      </td>
                      <td className="db-col-num" style={{ color: '#6B7280', fontSize: 12 }}>
                        {formatCost(l.estimated_cost)}
                      </td>
                      <td className="db-col-num" style={{ fontSize: 12 }}>
                        {l.latency_ms != null ? `${l.latency_ms}ms` : '—'}
                      </td>
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

function IconRequestsEmpty() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      style={{ margin: '0 auto 12px', display: 'block', color: '#D1D5DB' }}
    >
      <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M4 14h32" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M12 20h6M12 25h10M12 25h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <circle cx="30" cy="25" r="6" fill="white" stroke="currentColor" strokeWidth="1.5" />
      <path d="M28 25l1.5 1.5L32 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatTokens(n) {
  if (n == null) return '—';
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
