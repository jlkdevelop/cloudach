import { getDb } from './db.js';

/**
 * Log an audit event. Fire-and-forget — never throws so it never breaks the
 * calling request.
 *
 * @param {object} opts
 * @param {string|null} opts.userId       - UUID of the acting user (or null for system)
 * @param {string|null} [opts.apiKeyId]   - UUID of API key used (if applicable)
 * @param {string|null} [opts.actorEmail] - Email snapshot at event time
 * @param {'user'|'api_key'|'system'} [opts.actorType='user']
 * @param {string} opts.action            - Dot-notation action, e.g. 'api_key.created'
 * @param {string|null} [opts.resource]   - Resource type, e.g. 'api_key'
 * @param {string|null} [opts.resourceId] - Resource ID
 * @param {string|null} [opts.ipAddress]  - Client IP
 * @param {object} [opts.metadata]        - Extra JSON data
 */
export async function logAuditEvent({
  userId = null,
  apiKeyId = null,
  actorEmail = null,
  actorType = 'user',
  action,
  resource = null,
  resourceId = null,
  ipAddress = null,
  metadata = {},
}) {
  try {
    const db = getDb();
    await db.query(
      `INSERT INTO audit_logs
         (user_id, api_key_id, actor_email, actor_type, action, resource, resource_id, ip_address, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, apiKeyId, actorEmail, actorType, action, resource, resourceId, ipAddress, JSON.stringify(metadata)]
    );
  } catch (err) {
    // Never let audit logging crash the caller
    console.error('[audit] Failed to log event:', action, err.message);
  }
}

/**
 * Extract the client IP from a Next.js request.
 */
export function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    null
  );
}
