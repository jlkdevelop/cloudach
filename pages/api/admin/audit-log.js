import { requireAdmin } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

/**
 * GET /api/admin/audit-log
 *
 * Filterable, paginated read of the platform-wide audit_logs table.
 *
 * Query params:
 *   limit       - 1..200 (default 50)
 *   offset      - default 0
 *   action      - case-insensitive substring of audit_logs.action
 *                 (e.g. 'login', 'integration', 'api_key.created')
 *   actorEmail  - case-insensitive substring match
 *   actorType   - exact match: 'user' | 'api_key' | 'system'
 *   from        - ISO timestamp; entries with created_at >= from
 *   to          - ISO timestamp; entries with created_at < to
 *   format      - 'json' (default) | 'csv'
 *
 * Response (json):
 *   { entries: [...], total: int, limit, offset, hasMore }
 *
 * Response (csv): text/csv with header row, sorted DESC by created_at.
 */
export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const limit = Math.max(1, Math.min(200, parseInt(req.query.limit, 10) || 50));
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
  const format = req.query.format === 'csv' ? 'csv' : 'json';

  const where = [];
  const params = [];
  let i = 1;

  if (typeof req.query.action === 'string' && req.query.action.trim()) {
    params.push(`%${req.query.action.trim()}%`);
    where.push(`action ILIKE $${i++}`);
  }
  if (typeof req.query.actorEmail === 'string' && req.query.actorEmail.trim()) {
    params.push(`%${req.query.actorEmail.trim()}%`);
    where.push(`actor_email ILIKE $${i++}`);
  }
  if (typeof req.query.actorType === 'string' && ['user', 'api_key', 'system'].includes(req.query.actorType)) {
    params.push(req.query.actorType);
    where.push(`actor_type = $${i++}`);
  }
  if (typeof req.query.from === 'string' && req.query.from) {
    const d = new Date(req.query.from);
    if (!Number.isNaN(d.getTime())) {
      params.push(d.toISOString());
      where.push(`created_at >= $${i++}`);
    }
  }
  if (typeof req.query.to === 'string' && req.query.to) {
    const d = new Date(req.query.to);
    if (!Number.isNaN(d.getTime())) {
      params.push(d.toISOString());
      where.push(`created_at < $${i++}`);
    }
  }
  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  // For CSV we ignore limit/offset and return up to 5000 rows so operator
  // can drop into a spreadsheet without paging.
  const rowCap = format === 'csv' ? 5000 : limit;

  // Count + page in parallel.
  const [countResult, rowsResult] = await Promise.all([
    db.query(`SELECT COUNT(*)::int AS n FROM audit_logs ${whereSql}`, params),
    db.query(
      `SELECT id, user_id, api_key_id, actor_email, actor_type, action,
              resource, resource_id, ip_address, metadata, created_at
       FROM audit_logs
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ${rowCap}${format === 'csv' ? '' : ` OFFSET ${offset}`}`,
      params
    ),
  ]);

  const total = countResult.rows[0]?.n ?? 0;
  const entries = rowsResult.rows.map(r => ({
    id: String(r.id),
    userId: r.user_id,
    apiKeyId: r.api_key_id,
    actorEmail: r.actor_email,
    actorType: r.actor_type,
    action: r.action,
    resource: r.resource,
    resourceId: r.resource_id,
    ipAddress: r.ip_address,
    metadata: r.metadata,
    createdAt: r.created_at,
  }));

  if (format === 'csv') {
    const csv = toCsv(entries);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.status(200).send(csv);
  }

  return res.status(200).json({
    entries,
    total,
    limit,
    offset,
    hasMore: offset + entries.length < total,
  });
});

function toCsv(entries) {
  const cols = ['createdAt', 'actorEmail', 'actorType', 'action', 'resource', 'resourceId', 'ipAddress', 'metadata'];
  const header = cols.join(',');
  const escape = v => {
    if (v == null) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = entries.map(e => cols.map(c => escape(e[c])).join(','));
  return [header, ...lines].join('\r\n');
}
