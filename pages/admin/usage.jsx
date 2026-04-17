import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminShell } from './index';

const WINDOWS = [
  { days: 7,  label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
];

export default function AdminUsagePage() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load(d) {
    setLoading(true);
    const res = await fetch(`/api/admin/usage?days=${d}`);
    if (res.status === 401) { router.replace('/login'); return; }
    if (res.status === 403) { setError('Admin access required.'); setLoading(false); return; }
    if (!res.ok) { setError(`Server returned ${res.status}`); setLoading(false); return; }
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(days); }, [days]);

  if (error) return <AdminShell><div className="db-card"><p style={{ color: 'rgba(252,165,165,0.85)' }}>{error}</p></div></AdminShell>;

  return (
    <AdminShell>
      <Head><title>Usage & Cost — Cloudach Admin</title></Head>

      <div className="db-page-header">
        <h1 className="db-page-title">Usage & cost</h1>
        <p className="db-page-subtitle">
          Inference volume, model mix, and spend across the platform. Where the GPU money is going.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 6 }}>
        {WINDOWS.map(w => (
          <button
            key={w.days}
            onClick={() => setDays(w.days)}
            className={`admin-filter-pill${days === w.days ? ' admin-filter-pill--active' : ''}`}
          >
            Last {w.label}
          </button>
        ))}
      </div>

      <div className="db-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <Kpi label="Requests" loading={loading} value={loading ? null : formatCount(data?.summary?.requests)} />
        <Kpi label="Tokens"   loading={loading} value={loading ? null : formatCount(data?.summary?.tokens)} />
        <Kpi label="Spend"    loading={loading} value={loading ? null : `$${(data?.summary?.cost ?? 0).toFixed(2)}`} sub={loading ? null : 'estimated server-side cost'} />
        <Kpi
          label="Error rate"
          loading={loading}
          value={loading ? null : `${(data?.summary?.errorRate * 100 || 0).toFixed(2)}%`}
          sub={loading ? null : `${formatCount(data?.summary?.errorCount)} of ${formatCount(data?.summary?.requests)}`}
          danger={(data?.summary?.errorRate || 0) >= 0.05}
        />
        <Kpi label="Avg latency" loading={loading} value={loading ? null : (data?.summary?.avgLatencyMs ? `${data.summary.avgLatencyMs}ms` : '—')} />
        <Kpi label="p95 latency" loading={loading} value={loading ? null : (data?.summary?.p95LatencyMs ? `${data.summary.p95LatencyMs}ms` : '—')} />
      </div>

      {/* Daily series chart */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Tokens by day</span>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
            {loading ? '' : `${data?.dailyByDay?.length || 0} day buckets`}
          </span>
        </div>
        {loading ? (
          <div className="db-skeleton" style={{ height: 220 }} />
        ) : (
          <DailyChart points={data?.dailyByDay || []} />
        )}
      </div>

      {/* Top models + Status breakdown side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, marginBottom: 24 }}>
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Top models · last {days}d</span>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>By token volume</span>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 240 }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="db-skeleton" style={{ height: 28 }} />)}
            </div>
          ) : data?.topModels?.length === 0 ? (
            <EmptyHint title="No model usage yet" body="Once a customer makes their first inference call, models will appear here ranked by token volume." />
          ) : (
            <div className="db-table-wrap">
              <table className="db-table">
                <thead><tr><th>Model</th><th className="db-col-num">Requests</th><th className="db-col-num">Tokens</th><th className="db-col-num">Cost</th><th className="db-col-num">Share</th></tr></thead>
                <tbody>
                  {data.topModels.map(m => (
                    <tr key={m.model}>
                      <td><code style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12 }}>{m.model}</code></td>
                      <td className="db-col-num">{formatCount(m.requests)}</td>
                      <td className="db-col-num">{formatCount(m.tokens)}</td>
                      <td className="db-col-num">${m.cost.toFixed(2)}</td>
                      <td className="db-col-num" style={{ position: 'relative' }}>
                        <ShareBar pct={m.share} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="db-card">
          <div className="db-card-header"><span className="db-card-title">Status code breakdown</span></div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="db-skeleton" style={{ height: 28 }} />)}
            </div>
          ) : data?.statusBreakdown?.length === 0 || data?.summary?.requests === 0 ? (
            <EmptyHint title="No requests yet" body={`No inference traffic in the last ${days} days. Status code distribution will appear once requests start flowing.`} />
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 0, margin: 0, listStyle: 'none' }}>
              {data.statusBreakdown.map(s => {
                const pct = data.summary.requests > 0 ? s.requests / data.summary.requests : 0;
                return (
                  <li key={s.statusCodeBucket} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 13 }}>
                      <span>
                        <span style={{ color: bucketColor(s.statusCodeBucket), fontWeight: 600, fontFamily: 'var(--font-jetbrains-mono), monospace' }}>{s.statusCodeBucket}</span>
                        <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{bucketLabel(s.statusCodeBucket)}</span>
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{formatCount(s.requests)}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${(pct * 100).toFixed(1)}%`, height: '100%', background: bucketColor(s.statusCodeBucket), opacity: 0.65 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>{(pct * 100).toFixed(2)}% of requests</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function DailyChart({ points }) {
  if (!points || points.length === 0) {
    return <EmptyHint title="No data in this window" body="Tokens-per-day chart will populate once inference traffic exists." />;
  }
  const totalTokens = points.reduce((s, p) => s + p.tokens, 0);
  if (totalTokens === 0) {
    return (
      <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.40)', fontSize: 13 }}>
        No tokens consumed in this window. Chart will populate once requests start flowing.
      </div>
    );
  }
  const w = 800;
  const h = 220;
  const padL = 56;
  const padR = 16;
  const padT = 10;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const max = Math.max(...points.map(p => p.tokens), 1);
  const barW = innerW / points.length;
  // Y-axis ticks: 0, max/2, max
  const ticks = [0, max / 2, max].map(v => ({ v, y: padT + innerH - (v / max) * innerH }));
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', maxWidth: '100%' }} aria-label="Tokens by day">
        {/* Y grid + labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={w - padR} y2={t.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.40)" fontFamily="var(--font-jetbrains-mono), monospace">
              {formatCount(Math.round(t.v))}
            </text>
          </g>
        ))}
        {/* Bars */}
        {points.map((p, i) => {
          const x = padL + i * barW;
          const barH = (p.tokens / max) * innerH;
          const y = padT + innerH - barH;
          const isLast = i === points.length - 1;
          return (
            <g key={p.date}>
              <rect
                x={x + 1}
                y={y}
                width={Math.max(1, barW - 2)}
                height={barH}
                fill={p.tokens > 0 ? (isLast ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.45)') : 'rgba(255,255,255,0.04)'}
                rx={1.5}
              >
                <title>{`${new Date(p.date).toLocaleDateString()}: ${formatCount(p.tokens)} tokens · ${p.requests} requests · $${p.cost.toFixed(2)}`}</title>
              </rect>
            </g>
          );
        })}
        {/* X-axis: first + last date label */}
        <text x={padL} y={h - 8} fontSize="10" fill="rgba(255,255,255,0.40)" fontFamily="var(--font-jetbrains-mono), monospace">
          {new Date(points[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </text>
        <text x={w - padR} y={h - 8} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.40)" fontFamily="var(--font-jetbrains-mono), monospace">
          {new Date(points[points.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </text>
      </svg>
    </div>
  );
}

function ShareBar({ pct }) {
  const w = 70;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-jetbrains-mono), monospace', minWidth: 36, textAlign: 'right' }}>
        {(pct * 100).toFixed(1)}%
      </span>
      <span style={{ display: 'inline-block', width: w, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <span style={{ display: 'block', width: `${(pct * 100).toFixed(1)}%`, height: '100%', background: 'rgba(255,255,255,0.55)' }} />
      </span>
    </div>
  );
}

function Kpi({ label, value, sub, loading, danger }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">{label}</div>
      {loading || value == null ? (
        <>
          <div className="db-skeleton db-skeleton--value" />
          <div className="db-skeleton db-skeleton--sub" />
        </>
      ) : (
        <>
          <div className="db-stat-value" style={danger ? { color: 'rgba(252,165,165,0.92)' } : undefined}>{value}</div>
          {sub && <div className="db-stat-sub" style={danger ? { color: 'rgba(252,165,165,0.75)' } : undefined}>{sub}</div>}
        </>
      )}
    </div>
  );
}

function EmptyHint({ title, body }) {
  return (
    <div style={{ minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.40)', lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

function bucketColor(b) {
  switch (b) {
    case '2xx':   return '#6ee7b7';
    case '3xx':   return '#fbbf24';
    case '4xx':   return '#fbbf24';
    case '5xx':   return '#fca5a5';
    case 'none':  return 'rgba(255,255,255,0.45)';
    default:      return 'rgba(255,255,255,0.65)';
  }
}

function bucketLabel(b) {
  switch (b) {
    case '2xx':   return 'Success';
    case '3xx':   return 'Redirect';
    case '4xx':   return 'Client error';
    case '5xx':   return 'Server error';
    case 'none':  return 'No status code recorded';
    default:      return 'Other';
  }
}

function formatCount(n) {
  if (n == null) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
