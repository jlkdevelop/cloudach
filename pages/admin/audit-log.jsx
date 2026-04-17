import { useEffect, useState, useCallback, useRef, Fragment } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminShell } from './index';

const PAGE_SIZE = 50;

const ACTOR_TYPES = [
  { id: '',         label: 'All actors' },
  { id: 'user',     label: 'User' },
  { id: 'api_key',  label: 'API key' },
  { id: 'system',   label: 'System' },
];

export default function AdminAuditLogPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionQ, setActionQ] = useState('');
  const [actorEmailQ, setActorEmailQ] = useState('');
  const [actorType, setActorType] = useState('');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    });
    if (actionQ.trim())     params.set('action', actionQ.trim());
    if (actorEmailQ.trim()) params.set('actorEmail', actorEmailQ.trim());
    if (actorType)          params.set('actorType', actorType);

    const res = await fetch(`/api/admin/audit-log?${params}`);
    if (res.status === 401) { router.replace('/login'); return; }
    if (res.status === 403) { setError('Admin access required.'); setLoading(false); return; }
    if (!res.ok) {
      setError(`Server returned ${res.status}`);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setEntries(data.entries || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, actionQ, actorEmailQ, actorType, router]);

  // Debounce filter changes by 300ms; immediate fetch on mount/page change.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { load(); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [load]);

  function exportCsv() {
    const params = new URLSearchParams({ format: 'csv' });
    if (actionQ.trim())     params.set('action', actionQ.trim());
    if (actorEmailQ.trim()) params.set('actorEmail', actorEmailQ.trim());
    if (actorType)          params.set('actorType', actorType);
    window.open(`/api/admin/audit-log?${params}`, '_blank');
  }

  if (error) return <AdminShell><div className="db-card"><p style={{ color: 'rgba(252,165,165,0.85)' }}>{error}</p></div></AdminShell>;

  const showingFrom = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const showingTo = Math.min(total, (page + 1) * PAGE_SIZE);
  const hasNext = (page + 1) * PAGE_SIZE < total;

  return (
    <AdminShell>
      <Head><title>Audit log — Cloudach Admin</title></Head>

      <div className="db-page-header">
        <h1 className="db-page-title">Audit log</h1>
        <p className="db-page-subtitle">
          Every admin action, login attempt, integration save, and key event recorded by the platform. Filterable + CSV-exportable.
        </p>
      </div>

      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Events</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
              {loading ? '' : `Showing ${showingFrom}–${showingTo} of ${total.toLocaleString()}`}
            </span>
            <button type="button" onClick={exportCsv} className="admin-action-btn admin-action-btn--enable">
              Export CSV
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input
            type="search"
            value={actionQ}
            onChange={e => { setPage(0); setActionQ(e.target.value); }}
            placeholder="Action (e.g. login, integration)…"
            className="admin-search"
            aria-label="Filter by action substring"
          />
          <input
            type="search"
            value={actorEmailQ}
            onChange={e => { setPage(0); setActorEmailQ(e.target.value); }}
            placeholder="Actor email…"
            className="admin-search"
            aria-label="Filter by actor email substring"
          />
          <select
            value={actorType}
            onChange={e => { setPage(0); setActorType(e.target.value); }}
            className="admin-search"
            style={{ flex: 'none', minWidth: 130, fontFamily: 'inherit' }}
            aria-label="Filter by actor type"
          >
            {ACTOR_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          {(actionQ || actorEmailQ || actorType) && (
            <button
              type="button"
              onClick={() => { setActionQ(''); setActorEmailQ(''); setActorType(''); setPage(0); }}
              className="admin-filter-pill"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 360 }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="db-skeleton" style={{ height: 36 }} />)}
          </div>
        ) : entries.length === 0 ? (
          <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 6 }}>
              {total === 0 && !actionQ && !actorEmailQ && !actorType
                ? 'No audit events recorded yet'
                : 'No events match these filters'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', lineHeight: 1.55 }}>
              {total === 0 && !actionQ && !actorEmailQ && !actorType
                ? 'The audit log records every login, integration save, key creation, and admin action. New events will appear here.'
                : `Try clearing filters — there ${total === 1 ? 'is 1 event' : `are ${total.toLocaleString()} events`} total.`}
            </div>
          </div>
        ) : (
          <>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th style={{ width: 130 }}>Time</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th style={{ width: 130 }}>IP</th>
                    <th style={{ width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <Fragment key={e.id}>
                      <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                        <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }} title={new Date(e.createdAt).toLocaleString()}>
                          {formatRelative(e.createdAt)}
                        </td>
                        <td>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{e.actorEmail || <span style={{ color: 'rgba(255,255,255,0.30)' }}>—</span>}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>{e.actorType}</div>
                        </td>
                        <td>
                          <code style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 12, color: actionColor(e.action) }}>{e.action}</code>
                        </td>
                        <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
                          {e.resource ? `${e.resource}${e.resourceId ? ' · ' + truncate(e.resourceId, 24) : ''}` : <span style={{ color: 'rgba(255,255,255,0.30)' }}>—</span>}
                        </td>
                        <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-jetbrains-mono), monospace' }}>
                          {e.ipAddress || <span style={{ color: 'rgba(255,255,255,0.30)' }}>—</span>}
                        </td>
                        <td style={{ textAlign: 'right', color: 'rgba(255,255,255,0.40)', fontSize: 14 }}>
                          {expanded === e.id ? '▾' : '▸'}
                        </td>
                      </tr>
                      {expanded === e.id && (
                        <tr>
                          <td colSpan={6} style={{ padding: '0 14px 14px', background: 'rgba(255,255,255,0.02)' }}>
                            <pre style={{ margin: 0, fontFamily: 'var(--font-jetbrains-mono), monospace', fontSize: 11.5, color: 'rgba(255,255,255,0.65)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{JSON.stringify({
  id: e.id,
  createdAt: e.createdAt,
  userId: e.userId,
  apiKeyId: e.apiKeyId,
  metadata: e.metadata,
}, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>
              <span>Page {page + 1}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="admin-filter-pill"
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="admin-filter-pill"
                  disabled={!hasNext}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function actionColor(action) {
  if (!action) return 'rgba(255,255,255,0.65)';
  if (action.endsWith('.failed') || action.includes('.error')) return 'rgba(252,165,165,0.85)';
  if (action.includes('.created') || action.includes('.set')) return '#a7f3d0';
  return 'rgba(255,255,255,0.78)';
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function formatRelative(iso) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60_000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
  } catch { return '—'; }
}
