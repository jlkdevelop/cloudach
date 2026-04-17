import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { AdminShell } from './index';

export default function AdminIntegrationsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/integrations');
    if (res.status === 401) { router.replace('/login'); return; }
    if (res.status === 403) { setError('Admin access required.'); setLoading(false); return; }
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (error) return <AdminShell><div className="db-card"><p style={{ color: 'rgba(252,165,165,0.85)' }}>{error}</p></div></AdminShell>;

  return (
    <AdminShell>
      <Head><title>Integrations — Cloudach Admin</title></Head>

      <div className="db-page-header">
        <h1 className="db-page-title">Integrations</h1>
        <p className="db-page-subtitle">
          Connect Stripe and AWS by pasting your keys here. Saves go straight to the project's Vercel env vars and trigger a redeploy.
        </p>
      </div>

      {!loading && data?.vercelApiConfigured === false && (
        <div className="db-card" style={{ borderColor: 'rgba(252,165,165,0.40)' }}>
          <div className="db-card-title" style={{ color: 'rgba(252,165,165,0.85)', marginBottom: 8 }}>Vercel API not configured</div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
            Set <code className="admin-mono">VERCEL_TOKEN</code> and <code className="admin-mono">VERCEL_PROJECT_ID</code> in the project's environment variables (Vercel UI), then redeploy. After that the forms below will be live.
          </p>
        </div>
      )}

      {!loading && data?.vercelApiError && (
        <div className="db-card" style={{ borderColor: 'rgba(252,165,165,0.40)' }}>
          <p style={{ fontSize: 13, color: 'rgba(252,165,165,0.85)', margin: 0 }}>
            {data.vercelApiError}
          </p>
        </div>
      )}

      {loading ? (
        <div className="db-card" style={{ minHeight: 240 }}>
          <div className="db-skeleton" style={{ height: 20, marginBottom: 12 }} />
          <div className="db-skeleton" style={{ height: 20, marginBottom: 12 }} />
          <div className="db-skeleton" style={{ height: 20 }} />
        </div>
      ) : (
        Object.entries(data?.integrations || {}).map(([provider, integ]) => (
          <IntegrationCard
            key={provider}
            provider={provider}
            integration={integ}
            disabled={!data.vercelApiConfigured}
            onSaved={load}
          />
        ))
      )}
    </AdminShell>
  );
}

function IntegrationCard({ provider, integration, disabled, onSaved }) {
  const [values, setValues] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [deployStatus, setDeployStatus] = useState(null);

  const allConfigured = integration.fields.filter(f => f.required).every(f => f.configured);
  const summaryStatus = allConfigured ? 'KEY_PRESENT' : 'NOT_CONFIGURED';

  function setField(envName, value) {
    setValues(v => ({ ...v, [envName]: value }));
    setTestResult(null); // dirty state invalidates last test
  }

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    let body;
    if (provider === 'stripe') {
      body = { secretKey: values.STRIPE_SECRET_KEY };
    } else if (provider === 'aws') {
      body = {
        accessKeyId: values.AWS_ACCESS_KEY_ID,
        secretAccessKey: values.AWS_SECRET_ACCESS_KEY,
        region: values.AWS_REGION || 'us-east-1',
      };
    } else {
      body = values;
    }
    try {
      const res = await fetch(`/api/admin/integrations/${provider}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setTestResult({ ok: !!data.ok, message: data.message || (data.ok ? 'OK' : 'Failed') });
    } catch (err) {
      setTestResult({ ok: false, message: err.message });
    }
    setTesting(false);
  }

  async function runSave() {
    setSaving(true);
    setSaveResult(null);
    setDeployStatus(null);
    try {
      const filled = Object.fromEntries(Object.entries(values).filter(([_, v]) => v && String(v).trim()));
      const res = await fetch(`/api/admin/integrations/${provider}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: filled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveResult({ ok: false, message: data.error || 'Save failed', details: data.details });
        setSaving(false);
        return;
      }
      setSaveResult({
        ok: true,
        message: `Saved ${data.saved.length} value${data.saved.length === 1 ? '' : 's'}.`,
        deployment: data.deployment,
        deploymentError: data.deploymentError,
      });
      if (data.deployment?.id) {
        setDeployStatus({ id: data.deployment.id, state: data.deployment.readyState });
      }
      // Reset form fields, refresh state
      setValues({});
      onSaved && onSaved();
    } catch (err) {
      setSaveResult({ ok: false, message: err.message });
    }
    setSaving(false);
  }

  // Save is enabled when the (provider-specific) test passed AND there's
  // at least one value to save. Test on its own does not enable Save —
  // we want operator to verify before persisting.
  const dirty = Object.values(values).some(v => v && String(v).trim());
  const canTest = canTestProvider(provider, values);
  const canSave = dirty && testResult?.ok === true;

  return (
    <div className="db-card" style={{ marginBottom: 24, opacity: disabled ? 0.55 : 1, pointerEvents: disabled ? 'none' : undefined }}>
      <div className="db-card-header">
        <span className="db-card-title">{integration.label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`db-badge ${summaryStatus === 'KEY_PRESENT' ? 'db-badge--active' : 'db-badge--revoked'}`}>
            {summaryStatus}
          </span>
          {integration.docHref && (
            <a href={integration.docHref} target="_blank" rel="noopener noreferrer" className="admin-card-link">
              Setup doc →
            </a>
          )}
        </div>
      </div>

      <div className="admin-int-fields">
        {integration.fields.map(f => (
          <FieldRow
            key={f.envName}
            field={f}
            value={values[f.envName] ?? ''}
            onChange={v => setField(f.envName, v)}
          />
        ))}
      </div>

      {testResult && (
        <p className={`admin-int-result ${testResult.ok ? 'admin-int-result--ok' : 'admin-int-result--err'}`}>
          {testResult.ok ? '✓ ' : '✗ '}{testResult.message}
        </p>
      )}

      {saveResult && (
        <p className={`admin-int-result ${saveResult.ok ? 'admin-int-result--ok' : 'admin-int-result--err'}`}>
          {saveResult.ok ? '✓ ' : '✗ '}{saveResult.message}
          {saveResult.deployment && (
            <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
              Deployment <code className="admin-mono">{saveResult.deployment.id?.slice(0, 12)}</code> triggered. New value will be active in ~60s.
            </span>
          )}
          {saveResult.deploymentError && (
            <span style={{ display: 'block', fontSize: 12, color: 'rgba(252,165,165,0.85)', marginTop: 4 }}>
              Deploy trigger failed: {saveResult.deploymentError}. Save succeeded — operator can manually redeploy.
            </span>
          )}
          {saveResult.details && (
            <ul style={{ marginTop: 6, paddingLeft: 18, fontSize: 12 }}>
              {saveResult.details.map((d, i) => <li key={i}>{d.envName}: {d.error}</li>)}
            </ul>
          )}
        </p>
      )}

      <div className="admin-int-actions">
        <button
          type="button"
          onClick={runTest}
          disabled={!canTest || testing || saving}
          className="admin-action-btn admin-action-btn--enable"
        >
          {testing ? 'Testing…' : 'Test connection'}
        </button>
        <button
          type="button"
          onClick={runSave}
          disabled={!canSave || saving}
          className="admin-action-btn admin-action-btn--enable"
          style={{ background: canSave ? 'rgba(110,231,183,0.18)' : undefined, color: canSave ? '#a7f3d0' : undefined, borderColor: canSave ? 'rgba(110,231,183,0.30)' : undefined }}
          title={canSave ? 'Save to Vercel envs and trigger production redeploy' : 'Run Test connection first'}
        >
          {saving ? 'Saving…' : 'Save & redeploy'}
        </button>
      </div>
    </div>
  );
}

function FieldRow({ field, value, onChange }) {
  return (
    <div className="admin-int-field">
      <label className="admin-int-label">
        <span style={{ color: 'rgba(255,255,255,0.85)' }}>{field.label}</span>
        <code className="admin-mono" style={{ marginLeft: 8 }}>{field.envName}</code>
        {field.required && <span style={{ marginLeft: 8, fontSize: 10, color: 'rgba(252,165,165,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Required</span>}
      </label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type={field.sensitive ? 'password' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          autoComplete="off"
          spellCheck={false}
          className="admin-int-input"
          aria-label={field.envName}
        />
        <CurrentBadge field={field} />
      </div>
      {field.validationHint && (
        <p className="admin-int-hint">{field.validationHint}</p>
      )}
    </div>
  );
}

function CurrentBadge({ field }) {
  if (!field.configured) return <span className="admin-int-badge admin-int-badge--off">not set</span>;
  if (field.last4) {
    return (
      <span className="admin-int-badge admin-int-badge--on" title={field.lastSetAt ? `Set ${formatDate(field.lastSetAt)}${field.lastSetBy ? ' by ' + field.lastSetBy : ''}` : ''}>
        {field.sensitive ? '••••' + field.last4 : field.last4}
      </span>
    );
  }
  return <span className="admin-int-badge admin-int-badge--on" title="Set externally via Vercel UI">●●●● set</span>;
}

function canTestProvider(provider, values) {
  if (provider === 'stripe') return Boolean(values.STRIPE_SECRET_KEY);
  if (provider === 'aws') return Boolean(values.AWS_ACCESS_KEY_ID && values.AWS_SECRET_ACCESS_KEY);
  return false;
}

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return ''; }
}
