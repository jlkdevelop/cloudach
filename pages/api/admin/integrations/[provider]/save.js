import { requireAdmin } from '../../../../../lib/auth';
import { upsertEnv, triggerProductionDeploy, isVercelApiConfigured, VercelApiError } from '../../../../../lib/vercel';
import { logAuditEvent, getClientIp } from '../../../../../lib/audit';
import { getIntegration } from '../../../../../lib/integrations-config';

/**
 * POST /api/admin/integrations/{provider}/save
 *
 * Body: { values: { [envName]: string } }
 *
 * For each non-empty value:
 *   1. Validate format against the integration schema.
 *   2. Upsert as a Vercel env var (production + preview + development).
 *   3. Write an audit_logs entry with last-4 of the value in metadata.
 *
 * After all values land, optionally trigger a fresh production deploy so
 * the new env values become active. Returns:
 *   { ok, saved: [envName], deploymentId, deploymentUrl }
 *
 * NOTE: never echoes the value back. Audit captures only the last-4.
 */
export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { provider } = req.query;
  const definition = getIntegration(provider);
  if (!definition) return res.status(404).json({ error: `Unknown integration: ${provider}` });

  if (!isVercelApiConfigured()) {
    return res.status(503).json({
      error: 'Vercel API not configured. Set VERCEL_TOKEN + VERCEL_PROJECT_ID server-side first.',
      code: 'vercel_not_configured',
    });
  }

  const values = req.body?.values;
  if (!values || typeof values !== 'object') {
    return res.status(400).json({ error: 'Body must include { values: { ... } }' });
  }

  const fieldsByName = new Map(definition.fields.map(f => [f.envName, f]));
  const errors = [];
  const accepted = [];

  for (const [envName, raw] of Object.entries(values)) {
    if (raw === undefined || raw === null || raw === '') continue;
    const field = fieldsByName.get(envName);
    if (!field) {
      errors.push({ envName, error: `Not a managed field for ${provider}` });
      continue;
    }
    const value = String(raw).trim();
    if (!field.validate(value)) {
      errors.push({ envName, error: `Invalid format. ${field.validationHint}` });
      continue;
    }
    accepted.push({ envName, value, sensitive: field.sensitive });
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  if (accepted.length === 0) {
    return res.status(400).json({ error: 'No values to save' });
  }

  // Save sequentially — Vercel env API isn't great about parallel writes to
  // the same project, and we want a clean per-env audit trail.
  const saved = [];
  for (const { envName, value, sensitive } of accepted) {
    try {
      const result = await upsertEnv(envName, value);
      saved.push({ envName, created: result.created });
      await logAuditEvent({
        userId: req.session.sub,
        actorEmail: req.session.email,
        actorType: 'user',
        action: 'integration.set',
        resource: 'integration_env',
        resourceId: envName,
        ipAddress: getClientIp(req),
        metadata: {
          provider,
          last4: sensitive ? value.slice(-4) : value, // non-sensitive (region, backend mode) shown in full
          sensitive,
          created: result.created,
        },
      });
    } catch (err) {
      const message = err instanceof VercelApiError ? err.message : err.message;
      return res.status(502).json({
        error: `Failed to save ${envName}: ${message}`,
        partiallySaved: saved,
      });
    }
  }

  // Trigger production deploy so the new env vars become active.
  let deployment = null;
  try {
    deployment = await triggerProductionDeploy();
  } catch (err) {
    // Save succeeded; deploy trigger is a best-effort. Surface the error
    // but report success on the env writes.
    return res.status(200).json({
      ok: true,
      saved,
      deployment: null,
      deploymentError: err instanceof VercelApiError ? err.message : err.message,
    });
  }

  return res.status(200).json({
    ok: true,
    saved,
    deployment: {
      id: deployment.id,
      url: deployment.url,
      readyState: deployment.readyState,
    },
  });
});
