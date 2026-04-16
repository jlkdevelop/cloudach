import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: '2xx', label: '2xx Success' },
  { value: '4xx', label: '4xx Client Error' },
  { value: '5xx', label: '5xx Server Error' },
];

const DATE_PRESETS = [
  { label: 'Last hour',  hours: 1 },
  { label: 'Last 24h',  hours: 24 },
  { label: 'Last 7d',   hours: 24 * 7 },
  { label: 'Last 30d',  hours: 24 * 30 },
];

export default function LogsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [model, setModel]         = useState('');
  const [status, setStatus]       = useState('');
  const [from, setFrom]           = useState('');
  const [to, setTo]               = useState('');
  const [apiKeyId, setApiKeyId]   = useState('');
  const [requestId, setRequestId] = useState('');

  // Filter options (populated from first fetch)
  const [models, setModels]   = useState([]);
  const [apiKeys, setApiKeys] = useState([]);

  // Data
  const [logs, setLogs]                 = useState([]);
  const [nextCursor, setNextCursor]     = useState(null);
  const [hasMore, setHasMore]           = useState(false);
  const [latencyStats, setLatencyStats] = useState(null);
  const [fetching, setFetching]         = useState(false);
  const [loadingMore, setLoadingMore]   = useState(false);

  // Expanded row state: id → { expanded, redacted }
  const [expandedRows, setExpandedRows] = useState({});

  const filtersRef = useRef({ model, status, from, to, apiKeyId, requestId });
  filtersRef.current = { model, status, from, to, apiKeyId, requestId };

  function buildParams(cursor = null) {
    const p = new URLSearchParams();
    const f = filtersRef.current;
    if (f.model)     p.set('model', f.model);
    if (f.status)    p.set('status', f.status);
    if (f.from)      p.set('from', f.from);
    if (f.to)        p.set('to', f.to);
    if (f.apiKeyId)  p.set('api_key_id', f.apiKeyId);
    if (f.requestId) p.set('request_id', f.requestId);
    if (cursor)      p.set('cursor', cursor);
    return p.toString();
  }

  const fetchLogs = useCallback(async (reset = true) => {
    if (reset) {
      setFetching(true);
      setError('');
      setLogs([]);
      setNextCursor(null);
      setHasMore(false);
      setExpandedRows({});
    } else {
      setLoadingMore(true);
    }

    try {
      const cursor = reset ? null : nextCursor;
      const res = await fetch(`/api/dashboard/logs?${buildParams(cursor)}`);
      if (!res.ok) { setError('Failed to load request logs.'); return; }
      const data = await res.json();

      if (reset) {
        setLogs(data.logs || []);
        if (data.models?.length)  setModels(data.models);
        if (data.apiKeys?.length) setApiKeys(data.apiKeys);
        if (data.latencyBuckets)  setLatencyStats(data.latencyBuckets);
      } else {
        setLogs(prev => [...prev, ...(data.logs || [])]);
      }
      setNextCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch {
      setError('Network error. Please refresh.');
    } finally {
      setFetching(false);
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCursor]);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        setUser((await meRes.json()).user);
        await fetchLogs(true);
      } catch {
        setError('Network error. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function handleSearch(e) {
    e.preventDefault();
    fetchLogs(true);
  }

  function handleReset() {
    setModel(''); setStatus(''); setFrom(''); setTo('');
    setApiKeyId(''); setRequestId('');
    // trigger re-fetch after state clears via a small workaround
    setTimeout(() => fetchLogs(true), 0);
  }

  function applyPreset(hours) {
    const now = new Date();
    const past = new Date(now.getTime() - hours * 60 * 60 * 1000);
    setFrom(past.toISOString().slice(0, 16));
    setTo(now.toISOString().slice(0, 16));
  }

  function toggleExpand(id) {
    setExpandedRows(prev => ({
      ...prev,
      [id]: { expanded: !prev[id]?.expanded, redacted: prev[id]?.redacted ?? false },
    }));
  }

  function toggleRedact(id) {
    setExpandedRows(prev => ({
      ...prev,
      [id]: { ...prev[id], redacted: !prev[id]?.redacted },
    }));
  }

  if (loading || !user) return <PageLoader />;

  const maxBucketCount = latencyStats
    ? Math.max(...latencyStats.buckets.map(b => b.count), 1)
    : 1;

  return (
    <>
      <Head><title>Request Logs — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Request Logs</h1>
          <p className="db-page-subtitle">Inspect and debug your API requests in real time.</p>
        </div>

        {error && <ErrorBanner message={error} />}

        {/* ── Filters ── */}
        <div className="db-card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Request ID</label>
                <input
                  style={inputStyle}
                  placeholder="req_…"
                  value={requestId}
                  onChange={e => setRequestId(e.target.value)}
                />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label style={labelStyle}>Model</label>
                <select style={inputStyle} value={model} onChange={e => setModel(e.target.value)}>
                  <option value="">All models</option>
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Status</label>
                <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label style={labelStyle}>API Key</label>
                <select style={inputStyle} value={apiKeyId} onChange={e => setApiKeyId(e.target.value)}>
                  <option value="">All keys</option>
                  {apiKeys.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label style={labelStyle}>From</label>
                <input type="datetime-local" style={inputStyle} value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label style={labelStyle}>To</label>
                <input type="datetime-local" style={inputStyle} value={to} onChange={e => setTo(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <button type="submit" className="db-btn db-btn--primary" disabled={fetching}>
                  {fetching ? 'Loading…' : 'Search'}
                </button>
                <button type="button" className="db-btn" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
            {/* Date presets */}
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>Quick:</span>
              {DATE_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className="db-btn db-btn--sm"
                  onClick={() => applyPreset(p.hours)}
                  style={{ fontSize: 12 }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* ── Latency Distribution Chart ── */}
        {latencyStats && latencyStats.buckets.some(b => b.count > 0) && (
          <div className="db-card" style={{ marginBottom: 20 }}>
            <div className="db-card-header">
              <span className="db-card-title">Latency distribution</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                avg {latencyStats.avgMs}ms · p50 {latencyStats.p50}ms · p95 {latencyStats.p95}ms
              </span>
            </div>
            <div className="db-chart" style={{ height: 100 }}>
              {latencyStats.buckets.map((b) => {
                const pct = Math.max((b.count / maxBucketCount) * 100, b.count > 0 ? 4 : 0);
                return (
                  <div key={b.label} className="db-bar-wrap" title={`${b.label}: ${b.count.toLocaleString()} requests`}>
                    <div className="db-bar" style={{ height: `${pct}%` }} />
                    <span className="db-bar-label" style={{ fontSize: 10 }}>{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Log Table ── */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Requests</span>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>
              {logs.length.toLocaleString()} shown{hasMore ? ' · more available' : ''}
            </span>
          </div>

          {logs.length === 0 && !fetching ? (
            <div className="db-empty">
              <IconLogsEmpty />
              <div className="db-empty-title">No requests found</div>
              <div className="db-empty-desc">
                Make an API call to see logs here, or adjust your filters.
              </div>
            </div>
          ) : (
            <>
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th style={{ width: 20 }} />
                      <th>Time</th>
                      <th>Request ID</th>
                      <th>Model</th>
                      <th className="db-col-num">Tokens</th>
                      <th className="db-col-num">Latency</th>
                      <th>Status</th>
                      <th>API Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const rowState = expandedRows[log.id] || {};
                      const isExpanded = rowState.expanded;
                      const isRedacted = rowState.redacted;
                      const isError = log.status_code >= 400;

                      return [
                        <tr
                          key={log.id}
                          style={{ cursor: 'pointer', background: isExpanded ? '#F9FAFB' : undefined }}
                          onClick={() => toggleExpand(log.id)}
                        >
                          <td style={{ paddingLeft: 12, paddingRight: 4 }}>
                            <span style={{
                              display: 'inline-block',
                              transition: 'transform 0.15s',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              color: '#9CA3AF',
                              fontSize: 10,
                            }}>▶</span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap', color: '#6B7280', fontSize: 12 }}>
                            {fmtDateTime(log.created_at)}
                          </td>
                          <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <code style={{ fontSize: 11, color: '#374151' }}>{log.request_id || '—'}</code>
                          </td>
                          <td>
                            <code style={{ fontSize: 12, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>
                              {log.model}
                            </code>
                          </td>
                          <td className="db-col-num">
                            <span style={{ fontWeight: 600 }}>{log.total_tokens?.toLocaleString() ?? '—'}</span>
                            {log.prompt_tokens != null && (
                              <span style={{ display: 'block', fontSize: 11, color: '#9CA3AF' }}>
                                {log.prompt_tokens.toLocaleString()}+{log.completion_tokens?.toLocaleString() ?? 0}
                              </span>
                            )}
                          </td>
                          <td className="db-col-num">
                            {log.latency_ms != null
                              ? <LatencyBadge ms={log.latency_ms} />
                              : <span style={{ color: '#9CA3AF' }}>—</span>}
                          </td>
                          <td>
                            <StatusBadge code={log.status_code} />
                          </td>
                          <td style={{ color: '#6B7280', fontSize: 12 }}>
                            {log.api_key_name || '—'}
                          </td>
                        </tr>,

                        // Expanded detail row
                        isExpanded && (
                          <tr key={`${log.id}-detail`} style={{ background: '#F9FAFB' }}>
                            <td colSpan={8} style={{ padding: '0 16px 16px 36px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6B7280' }}>
                                  {log.request_id && (
                                    <span>Request ID: <code style={{ color: '#374151' }}>{log.request_id}</code></span>
                                  )}
                                  <span>Cost: {formatCost(log.estimated_cost)}</span>
                                  <span>Time: {new Date(log.created_at).toLocaleString()}</span>
                                </div>
                                <button
                                  className="db-btn db-btn--sm"
                                  style={{ fontSize: 12 }}
                                  onClick={e => { e.stopPropagation(); toggleRedact(log.id); }}
                                >
                                  {isRedacted ? 'Show content' : 'Redact content'}
                                </button>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Request
                                  </div>
                                  <pre style={preStyle}>
                                    {log.request_body
                                      ? isRedacted
                                        ? redactJson(log.request_body)
                                        : JSON.stringify(log.request_body, null, 2)
                                      : '(no request body stored)'}
                                  </pre>
                                </div>
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: isError ? '#991B1B' : '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Response {isError ? `· ${log.status_code}` : ''}
                                  </div>
                                  <pre style={{ ...preStyle, borderColor: isError ? '#FECACA' : '#E5E7EB', background: isError ? '#FEF2F2' : '#F8F9FA' }}>
                                    {log.response_body
                                      ? isRedacted
                                        ? redactJson(log.response_body)
                                        : JSON.stringify(log.response_body, null, 2)
                                      : '(no response body stored)'}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ),
                      ];
                    })}
                  </tbody>
                </table>
              </div>

              {/* Load more */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <button
                    className="db-btn"
                    disabled={loadingMore}
                    onClick={() => fetchLogs(false)}
                  >
                    {loadingMore ? 'Loading…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ code }) {
  if (code == null) return <span style={{ color: '#9CA3AF' }}>—</span>;
  const ok = code < 400;
  return (
    <span className={`db-badge db-badge--${ok ? 'active' : 'revoked'}`}>
      {code}
    </span>
  );
}

function LatencyBadge({ ms }) {
  let color = '#166534'; // green
  if (ms >= 3000) color = '#991B1B';       // red
  else if (ms >= 1000) color = '#92400E';  // amber
  else if (ms >= 500) color = 'rgba(255,255,255,0.55)';   // dim
  return (
    <span style={{ fontWeight: 500, color, fontSize: 12 }}>
      {ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`}
    </span>
  );
}

function IconLogsEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
      style={{ margin: '0 auto 12px', display: 'block', color: '#D1D5DB' }}>
      <rect x="4" y="6" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      <path d="M4 13h32" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M11 20h8M11 26h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <circle cx="30" cy="26" r="6" fill="white" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M28 26h4M30 24v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

function redactJson(obj) {
  const REDACTED_KEYS = new Set(['content', 'text', 'message', 'messages', 'prompt', 'completion', 'choices']);
  function redact(val, key = '') {
    if (typeof val === 'string' && REDACTED_KEYS.has(key)) return '[REDACTED]';
    if (Array.isArray(val)) return val.map((v, i) => redact(v, String(i)));
    if (val && typeof val === 'object') {
      const out = {};
      for (const k of Object.keys(val)) out[k] = redact(val[k], k);
      return out;
    }
    return val;
  }
  return JSON.stringify(redact(obj), null, 2);
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function formatCost(n) {
  if (n == null || isNaN(n)) return '—';
  if (n === 0) return '$0.00';
  if (n < 0.01) return '<$0.01';
  return `$${n.toFixed(4)}`;
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 4,
};

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid #D1D5DB',
  borderRadius: 8,
  fontSize: 13,
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const preStyle = {
  fontSize: 11,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  background: '#F8F9FA',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  padding: '10px 12px',
  overflow: 'auto',
  maxHeight: 320,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  margin: 0,
  color: '#374151',
};
