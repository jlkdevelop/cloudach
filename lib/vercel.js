/**
 * Minimal Vercel REST API client used by the in-app integrations page
 * (/admin/integrations) to upsert env vars and trigger redeploys.
 *
 * Authentication: VERCEL_TOKEN env var (operator-set, server-side only).
 * Project: VERCEL_PROJECT_ID env var.
 * Optional team: VERCEL_TEAM_ID env var (added as ?teamId=… to all calls).
 *
 * All methods throw a VercelApiError on non-2xx responses with the parsed
 * error body so callers can surface the message in the UI.
 */

const BASE = 'https://api.vercel.com';

export class VercelApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'VercelApiError';
    this.status = status;
    this.body = body;
  }
}

function token() {
  const t = process.env.VERCEL_TOKEN;
  if (!t) throw new VercelApiError('VERCEL_TOKEN is not set', { status: 0 });
  return t;
}

function projectId() {
  const id = process.env.VERCEL_PROJECT_ID;
  if (!id) throw new VercelApiError('VERCEL_PROJECT_ID is not set', { status: 0 });
  return id;
}

function teamSuffix() {
  const t = process.env.VERCEL_TEAM_ID;
  return t ? `?teamId=${encodeURIComponent(t)}` : '';
}

function teamSuffixAfter(query) {
  const t = process.env.VERCEL_TEAM_ID;
  if (!t) return query ? `?${query}` : '';
  return query ? `?${query}&teamId=${encodeURIComponent(t)}` : `?teamId=${encodeURIComponent(t)}`;
}

async function call(method, path, { body, query } = {}) {
  const url = `${BASE}${path}${teamSuffixAfter(query)}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token()}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let parsed = null;
  try { parsed = await res.json(); } catch (_) { /* may have no body */ }
  if (!res.ok) {
    const message = parsed?.error?.message || parsed?.message || `Vercel API ${method} ${path} returned ${res.status}`;
    throw new VercelApiError(message, { status: res.status, body: parsed });
  }
  return parsed;
}

/**
 * GET /v9/projects/{id}/env
 * Returns { envs: [{ id, key, target, type, ... }] }.
 * Values are encrypted; we only use this to know which keys are present.
 */
export async function listEnvs() {
  return call('GET', `/v9/projects/${projectId()}/env`);
}

/**
 * Upsert a single env var across production/preview/development. Creates if
 * absent, updates if present (matched by key + first matching target).
 *
 * @param {string} key   env var name (e.g. 'STRIPE_SECRET_KEY')
 * @param {string} value plaintext value (Vercel encrypts at rest)
 * @returns {Promise<{ id: string, key: string, target: string[], created: boolean }>}
 */
export async function upsertEnv(key, value) {
  if (!key || typeof value !== 'string') {
    throw new VercelApiError('upsertEnv requires non-empty key + string value', { status: 0 });
  }
  const existing = await listEnvs();
  const match = (existing.envs || []).find(e => e.key === key);
  const target = ['production', 'preview', 'development'];
  if (match) {
    const updated = await call('PATCH', `/v9/projects/${projectId()}/env/${match.id}`, {
      body: { value, target, type: 'encrypted' },
    });
    return { id: updated.id, key, target, created: false };
  }
  const created = await call('POST', `/v10/projects/${projectId()}/env`, {
    body: { key, value, target, type: 'encrypted' },
  });
  return { id: created.id, key, target, created: true };
}

/**
 * Trigger a fresh production deployment from the latest commit on main.
 * Vercel infers the git source from the project's connected repo.
 *
 * @returns {Promise<{ id: string, url: string, readyState: string }>}
 */
export async function triggerProductionDeploy() {
  const project = await call('GET', `/v9/projects/${projectId()}`);
  const repo = project?.link;
  if (!repo || repo.type !== 'github') {
    throw new VercelApiError('Project is not connected to a GitHub repo; cannot trigger deploy', { status: 0 });
  }
  const deploy = await call('POST', `/v13/deployments`, {
    body: {
      name: project.name,
      target: 'production',
      gitSource: {
        type: 'github',
        repoId: repo.repoId,
        ref: 'main',
      },
    },
  });
  return { id: deploy.id, url: deploy.url, readyState: deploy.readyState || deploy.status };
}

/**
 * Get deployment by id (used to poll until READY).
 */
export async function getDeployment(deploymentId) {
  return call('GET', `/v13/deployments/${encodeURIComponent(deploymentId)}`);
}

/**
 * Returns true when the minimum env to talk to Vercel is set.
 * The /admin/integrations page surfaces a 'Vercel API not configured' state
 * when this is false rather than 500-ing.
 */
export function isVercelApiConfigured() {
  return Boolean(process.env.VERCEL_TOKEN) && Boolean(process.env.VERCEL_PROJECT_ID);
}
