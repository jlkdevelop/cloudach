import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

const PAGE_SIZE = 50;

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    const {
      action,
      resource,
      q,
      from,
      to,
      page = '1',
      export: exportCsv,
    } = req.query;

    const conditions = ['al.user_id = $1'];
    const params = [userId];
    let idx = 2;

    if (action) {
      conditions.push(`al.action = $${idx++}`);
      params.push(action);
    }
    if (resource) {
      conditions.push(`al.resource = $${idx++}`);
      params.push(resource);
    }
    if (q) {
      conditions.push(`(al.action ILIKE $${idx} OR al.resource_id ILIKE $${idx} OR al.ip_address ILIKE $${idx} OR al.actor_email ILIKE $${idx})`);
      params.push(`%${q}%`);
      idx++;
    }
    if (from) {
      conditions.push(`al.created_at >= $${idx++}`);
      params.push(from);
    }
    if (to) {
      conditions.push(`al.created_at <= $${idx++}`);
      params.push(to);
    }

    // Apply retention filter based on user's setting
    const settingsRes = await db.query(
      'SELECT retention_days FROM audit_log_settings WHERE user_id = $1',
      [userId]
    );
    const retentionDays = settingsRes.rows[0]?.retention_days ?? 90;
    conditions.push(`al.created_at >= now() - ($${idx++} || ' days')::INTERVAL`);
    params.push(retentionDays);

    const where = conditions.join(' AND ');

    // CSV export
    if (exportCsv === '1') {
      const csvRes = await db.query(
        `SELECT al.id, al.created_at, al.actor_email, al.actor_type, al.action,
                al.resource, al.resource_id, al.ip_address, al.metadata
         FROM audit_logs al
         WHERE ${where}
         ORDER BY al.created_at DESC
         LIMIT 10000`,
        params
      );

      const rows = csvRes.rows;
      const header = 'id,timestamp,actor_email,actor_type,action,resource,resource_id,ip_address,metadata\n';
      const csvBody = rows.map(r =>
        [
          r.id,
          r.created_at.toISOString(),
          csvEscape(r.actor_email),
          csvEscape(r.actor_type),
          csvEscape(r.action),
          csvEscape(r.resource),
          csvEscape(r.resource_id),
          csvEscape(r.ip_address),
          csvEscape(JSON.stringify(r.metadata)),
        ].join(',')
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
      return res.status(200).send(header + csvBody);
    }

    // Paginated JSON response
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const offset = (pageNum - 1) * PAGE_SIZE;

    const [countRes, dataRes] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM audit_logs al WHERE ${where}`, params),
      db.query(
        `SELECT al.id, al.created_at, al.actor_email, al.actor_type, al.action,
                al.resource, al.resource_id, al.ip_address, al.metadata
         FROM audit_logs al
         WHERE ${where}
         ORDER BY al.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, PAGE_SIZE, offset]
      ),
    ]);

    const total = parseInt(countRes.rows[0].count, 10);
    return res.status(200).json({
      events: dataRes.rows,
      total,
      page: pageNum,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
      retentionDays,
    });
  }

  return res.status(405).end();
});

function csvEscape(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
