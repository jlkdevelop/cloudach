import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'login.success', label: 'Login success' },
  { value: 'login.failed', label: 'Login failed' },
  { value: 'api_key.created', label: 'API key created' },
  { value: 'api_key.revoked', label: 'API key revoked' },
  { value: 'audit_log.retention_updated', label: 'Retention updated' },
];

const RESOURCE_OPTIONS = [
  { value: '', label: 'All resources' },
  { value: 'user', label: 'User' },
  { value: 'api_key', label: 'API Key' },
  { value: 'audit_log_settings', label: 'Audit settings' },
];

const ACTION_BADGE_COLORS = {
  'login.success':   { bg: '#DCFCE7', color: '#166534' },
  'login.failed':    { bg: '#FEE2E2', color: '#991B1B' },
  'api_key.created': { bg: '#DBEAFE', color: '#1E40AF' },
  'api_key.revoked': { bg: '#FEF3C7', color: '#92400E' },
};

function ActionBadge({ action }) {
  const style = ACTION_BADGE_COLORS[action] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      borderRadius: 6,
      padding: '2px 8px',
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {action}
    </span>
  );
}

export default function AuditLogPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [q, setQ] = useState('');
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Data
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retentionDays, setRetentionDays] = useState(90);
  const [fetching, setFetching] = useState(false);

  // Retention settings
  const [retentionSaving, setRetentionSaving] = useState(false);
  const [retentionSuccess, setRetentionSuccess] = useState('');
  const [pendingRetention, setPendingRetention] = useState(null);

  const buildQuery = useCallback((p = 1) => {
    const params = new URLSearchParams({ page: p });
    if (q) params.set('q', q);
    if (action) params.set('action', action);
    if (resource) params.set('resource', resource);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return params.toString();
  }, [q, action, resource, from, to]);

  const fetchEvents = useCallback(async (p = 1) => {
    setFetching(true);
    setError('');
    try {
      const res = await fetch(`/api/dashboard/audit-log?${buildQuery(p)}`);
      if (!res.ok) { setError('Failed to load audit log.'); return; }
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setRetentionDays(data.retentionDays || 90);
      if (pendingRetention === null) setPendingRetention(data.retentionDays || 90);
    } catch {
      setError('Network error. Please refresh.');
    } finally {
      setFetching(false);
    }
  }, [buildQuery, pendingRetention]);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        setUser((await meRes.json()).user);
        await fetchEvents(1);
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
    setPage(1);
    fetchEvents(1);
  }

  function handleReset() {
    setQ(''); setAction(''); setResource(''); setFrom(''); setTo('');
  }

  async function handleExportCsv() {
    const params = new URLSearchParams(buildQuery(1));
    params.set('export', '1');
    window.location.href = `/api/dashboard/audit-log?${params.toString()}`;
  }

  async function handleRetentionSave() {
    if (!pendingRetention) return;
    setRetentionSaving(true);
    setRetentionSuccess('');
    try {
      const res = await fetch('/api/dashboard/audit-log/retention', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionDays: pendingRetention }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Failed to save retention policy.');
      } else {
        setRetentionDays(pendingRetention);
        setRetentionSuccess('Retention policy saved.');
        setTimeout(() => setRetentionSuccess(''), 3000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setRetentionSaving(false);
    }
  }

  if (loading || !user) return <PageLoader />;

  return (
    <>
      <Head><title>Audit Log — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Audit Log</h1>
          <p className="db-page-subtitle">
            A complete trail of actions taken in your account. Showing the last {retentionDays} days.
          </p>
        </div>

        {error && <ErrorBanner message={error} />}

        {/* Filters */}
        <div className="db-card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Search</label>
                <input
                  style={inputStyle}
                  placeholder="IP, email, resource ID…"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <label style={labelStyle}>Action</label>
                <select style={inputStyle} value={action} onChange={e => setAction(e.target.value)}>
                  {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>Resource</label>
                <select style={inputStyle} value={resource} onChange={e => setResource(e.target.value)}>
                  {RESOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>From</label>
                <input type="date" style={inputStyle} value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 140px' }}>
                <label style={labelStyle}>To</label>
                <input type="date" style={inputStyle} value={to} onChange={e => setTo(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="db-btn db-btn--primary" disabled={fetching}>
                  {fetching ? 'Loading…' : 'Search'}
                </button>
                <button type="button" className="db-btn" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="db-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#6B7280' }}>
              {total.toLocaleString()} event{total !== 1 ? 's' : ''}
            </span>
            <button className="db-btn" onClick={handleExportCsv} style={{ fontSize: 13 }}>
              Export CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['Timestamp', 'Actor', 'Action', 'Resource', 'Resource ID', 'IP Address'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>
                      No audit events found.
                    </td>
                  </tr>
                )}
                {events.map(ev => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={tdStyle}>
                      <span title={ev.created_at} style={{ whiteSpace: 'nowrap' }}>
                        {new Date(ev.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500 }}>{ev.actor_email || '—'}</div>
                      <div style={{ color: '#9CA3AF', fontSize: 11 }}>{ev.actor_type}</div>
                    </td>
                    <td style={tdStyle}><ActionBadge action={ev.action} /></td>
                    <td style={tdStyle}>{ev.resource || '—'}</td>
                    <td style={{ ...tdStyle, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span title={ev.resource_id}>{ev.resource_id || '—'}</span>
                    </td>
                    <td style={tdStyle}>{ev.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button
                className="db-btn"
                disabled={page <= 1 || fetching}
                onClick={() => { const p = page - 1; setPage(p); fetchEvents(p); }}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: 13, color: '#6B7280' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="db-btn"
                disabled={page >= totalPages || fetching}
                onClick={() => { const p = page + 1; setPage(p); fetchEvents(p); }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Retention Policy */}
        <div className="db-card">
          <div className="db-card-header" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Retention Policy</h2>
          </div>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
            Audit events older than the retention window are automatically deleted.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              style={{ ...inputStyle, width: 'auto' }}
              value={pendingRetention ?? retentionDays}
              onChange={e => setPendingRetention(parseInt(e.target.value, 10))}
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
            <button
              className="db-btn db-btn--primary"
              onClick={handleRetentionSave}
              disabled={retentionSaving || pendingRetention === retentionDays}
            >
              {retentionSaving ? 'Saving…' : 'Save'}
            </button>
            {retentionSuccess && (
              <span style={{ fontSize: 13, color: '#166534' }}>{retentionSuccess}</span>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
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

const thStyle = {
  textAlign: 'left',
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 600,
  color: '#6B7280',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: '10px 12px',
  verticalAlign: 'top',
};
