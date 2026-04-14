import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';

export default function ModelsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deploying, setDeploying] = useState(null);
  const [deployErrors, setDeployErrors] = useState({});

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        setUser((await meRes.json()).user);
        await loadModels();
      } catch {
        setError('Network error. Please refresh.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function loadModels() {
    const res = await fetch('/api/dashboard/models');
    if (res.ok) setModels((await res.json()).models);
    else setError('Failed to load models.');
  }

  async function deploy(modelId) {
    setDeploying(modelId);
    setDeployErrors(prev => ({ ...prev, [modelId]: '' }));

    const res = await fetch('/api/dashboard/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeployErrors(prev => ({ ...prev, [modelId]: data.error || 'Deploy failed. Please try again.' }));
      setDeploying(null);
      return;
    }

    // Poll for active status (max 30s)
    let activated = false;
    for (let i = 0; i < 30; i++) {
      await sleep(1000);
      const pollRes = await fetch('/api/dashboard/models');
      if (pollRes.ok) {
        const { models: updated } = await pollRes.json();
        setModels(updated);
        const m = updated.find(m => m.model_id === modelId);
        if (m?.deploy_status === 'active') { activated = true; break; }
      }
    }

    if (!activated) {
      setDeployErrors(prev => ({
        ...prev,
        [modelId]: 'Deployment is taking longer than expected. Refresh the page to check status.'
      }));
    }
    setDeploying(null);
  }

  async function stopModel(modelId) {
    const res = await fetch(`/api/dashboard/models/${modelId}/stop`, { method: 'POST' });
    if (!res.ok) {
      setDeployErrors(prev => ({ ...prev, [modelId]: 'Failed to stop model. Please try again.' }));
    } else {
      await loadModels();
    }
  }

  if (loading || !user) return <PageLoader />;

  return (
    <>
      <Head><title>Models — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Model Catalog</h1>
          <p className="db-page-subtitle">Deploy open-source LLMs and get an OpenAI-compatible endpoint instantly.</p>
        </div>

        {error && <ErrorBanner message={error} />}

        {models.length === 0 ? (
          <div className="db-empty">
            <div className="db-empty-icon">🤖</div>
            <div className="db-empty-title">No models available</div>
            <div className="db-empty-desc">The model catalog is empty. Contact support if this is unexpected.</div>
          </div>
        ) : (
          <div className="db-model-grid">
            {models.map((m) => (
              <ModelCard
                key={m.model_id}
                model={m}
                onDeploy={() => deploy(m.model_id)}
                onStop={() => stopModel(m.model_id)}
                isDeploying={deploying === m.model_id}
                deployError={deployErrors[m.model_id]}
              />
            ))}
          </div>
        )}
      </DashboardLayout>
    </>
  );
}

function ModelCard({ model, onDeploy, onStop, isDeploying, deployError }) {
  const status = model.deploy_status;
  const [copied, setCopied] = useState(false);

  function copyEndpoint() {
    const text = `${model.endpoint_url}  # model: ${model.model_id}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className={`db-model-card${status === 'active' ? ' db-model-card--active' : ''}`}>
      <div className="db-model-header">
        <div>
          <div className="db-model-name">{model.display_name}</div>
          <div className="db-model-meta">{model.param_count} params · {(model.context_len / 1000).toFixed(0)}K ctx</div>
        </div>
        <StatusBadge status={status} isDeploying={isDeploying} />
      </div>

      <p className="db-model-desc">{model.description}</p>

      {model.latency && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 12, color: '#6B7280' }}>
          <span title="Requests in last 24h">{model.latency.requestCount24h} req/24h</span>
          <span title="Average latency">avg {model.latency.avgLatencyMs}ms</span>
          <span title="P95 latency">p95 {model.latency.p95LatencyMs}ms</span>
        </div>
      )}

      {model.tags?.length > 0 && (
        <div className="db-model-tags">
          {model.tags.map(t => <span key={t} className="db-tag">{t}</span>)}
        </div>
      )}

      <div className="db-model-footer">
        {status === 'active' ? (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="db-endpoint-code">{model.endpoint_url}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="db-btn db-btn--ghost db-btn--sm" onClick={copyEndpoint}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button className="db-btn db-btn--danger db-btn--sm" onClick={onStop}>Stop</button>
            </div>
          </>
        ) : status === 'deploying' || isDeploying ? (
          <button className="db-btn db-btn--primary db-btn--sm" disabled>
            <Spinner /> Deploying…
          </button>
        ) : status === 'stopped' ? (
          <button className="db-btn db-btn--primary db-btn--sm" onClick={onDeploy} disabled={isDeploying}>
            Redeploy
          </button>
        ) : (
          <button className="db-btn db-btn--primary db-btn--sm" onClick={onDeploy} disabled={isDeploying}>
            Deploy
          </button>
        )}
      </div>

      {deployError && (
        <div className="db-deploy-error">{deployError}</div>
      )}
    </div>
  );
}

function StatusBadge({ status, isDeploying }) {
  if (isDeploying || status === 'deploying') {
    return <span className="db-badge db-badge--deploying">Deploying</span>;
  }
  if (status === 'active') {
    return <span className="db-badge db-badge--active"><span className="db-pulse" />Active</span>;
  }
  if (status === 'stopped') {
    return <span className="db-badge db-badge--stopped">Stopped</span>;
  }
  return <span className="db-badge db-badge--none">Not deployed</span>;
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'db-spin 0.8s linear infinite' }}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="2" strokeDasharray="20 15" strokeLinecap="round"/>
    </svg>
  );
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
