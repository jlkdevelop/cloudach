import { requireAdmin } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';
import { listEnvs, isVercelApiConfigured, VercelApiError } from '../../../../lib/vercel';
import { INTEGRATIONS, allManagedEnvNames } from '../../../../lib/integrations-config';

/**
 * GET /api/admin/integrations
 *
 * Returns the current configuration state of every integration env var:
 *   {
 *     vercelApiConfigured: boolean,
 *     integrations: {
 *       stripe: { fields: [{ envName, configured, last4, lastSetAt, lastSetBy }, ...] },
 *       aws:    { ... }
 *     }
 *   }
 *
 * Last-4 + lastSetAt come from audit_logs.metadata captured on save.
 * Env vars set externally (via Vercel UI) appear as configured but with last4 = null.
 */
export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const out = {
    vercelApiConfigured: isVercelApiConfigured(),
    integrations: {},
  };

  // Initialize each provider with all its fields, none configured.
  for (const [provider, def] of Object.entries(INTEGRATIONS)) {
    out.integrations[provider] = {
      label: def.label,
      docHref: def.docHref,
      fields: def.fields.map(f => ({
        envName: f.envName,
        label: f.label,
        placeholder: f.placeholder,
        required: f.required,
        sensitive: f.sensitive,
        validationHint: f.validationHint,
        configured: false,
        last4: null,
        lastSetAt: null,
        lastSetBy: null,
      })),
    };
  }

  // Pull live env state from Vercel (if VERCEL_TOKEN is set).
  if (out.vercelApiConfigured) {
    try {
      const { envs } = await listEnvs();
      const present = new Set((envs || []).map(e => e.key));
      for (const provider of Object.keys(out.integrations)) {
        for (const field of out.integrations[provider].fields) {
          if (present.has(field.envName)) field.configured = true;
        }
      }
    } catch (err) {
      out.vercelApiError = err instanceof VercelApiError
        ? `Vercel API: ${err.message}`
        : `Vercel API: ${err.message}`;
    }
  }

  // Pull last-set audit info from audit_logs (filtered to our managed envs).
  const managedNames = allManagedEnvNames();
  try {
    const auditRows = await db.query(
      `SELECT DISTINCT ON (resource_id)
              resource_id, metadata, actor_email, created_at
       FROM audit_logs
       WHERE action = 'integration.set'
         AND resource = 'integration_env'
         AND resource_id = ANY($1::text[])
       ORDER BY resource_id, created_at DESC`,
      [managedNames]
    );
    const byEnv = new Map(auditRows.rows.map(r => [r.resource_id, r]));
    for (const provider of Object.keys(out.integrations)) {
      for (const field of out.integrations[provider].fields) {
        const row = byEnv.get(field.envName);
        if (row) {
          field.last4 = row.metadata?.last4 ?? null;
          field.lastSetAt = row.created_at;
          field.lastSetBy = row.actor_email || null;
        }
      }
    }
  } catch (err) {
    // Audit table missing or query error — log but don't fail the endpoint.
    if (!/does not exist/i.test(err.message || '')) {
      console.error('integrations index audit lookup error:', err.message);
    }
  }

  return res.status(200).json(out);
});
