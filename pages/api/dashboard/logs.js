import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

const PAGE_SIZE = 50;

// Latency buckets (ms upper bounds): <100 | 100–500 | 500–1000 | 1–3s | 3–10s | >10s
const LATENCY_BUCKETS = [
  { label: '<100ms',  max: 100 },
  { label: '100–500ms', max: 500 },
  { label: '500ms–1s',  max: 1000 },
  { label: '1–3s',    max: 3000 },
  { label: '3–10s',   max: 10000 },
  { label: '>10s',    max: null },
];

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;

  const {
    model,
    status,    // e.g. "200", "4xx", "5xx"
    from,
    to,
    api_key_id,
    request_id,
    cursor,    // base64-encoded JSON { created_at, id }
    limit: limitStr,
  } = req.query;

  const limit = Math.min(parseInt(limitStr || String(PAGE_SIZE), 10), 200);

  // ── Build WHERE clause ────────────────────────────────────────────────
  const conditions = ['ul.user_id = $1'];
  const params = [userId];
  let idx = 2;

  if (model) {
    conditions.push(`ul.model = $${idx++}`);
    params.push(model);
  }

  if (status) {
    if (status === '2xx') {
      conditions.push(`ul.status_code >= 200 AND ul.status_code < 300`);
    } else if (status === '4xx') {
      conditions.push(`ul.status_code >= 400 AND ul.status_code < 500`);
    } else if (status === '5xx') {
      conditions.push(`ul.status_code >= 500`);
    } else {
      const code = parseInt(status, 10);
      if (!isNaN(code)) {
        conditions.push(`ul.status_code = $${idx++}`);
        params.push(code);
      }
    }
  }

  if (from) {
    conditions.push(`ul.created_at >= $${idx++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`ul.created_at <= $${idx++}`);
    params.push(to);
  }

  if (api_key_id) {
    conditions.push(`ul.api_key_id = $${idx++}`);
    params.push(api_key_id);
  }

  if (request_id) {
    conditions.push(`ul.request_id = $${idx++}`);
    params.push(request_id);
  }

  // Cursor-based pagination: decode cursor to get (created_at, id) boundary
  let cursorCreatedAt = null;
  let cursorId = null;
  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
      cursorCreatedAt = decoded.created_at;
      cursorId = decoded.id;
    } catch {
      // ignore malformed cursor
    }
  }

  if (cursorCreatedAt && cursorId) {
    conditions.push(
      `(ul.created_at < $${idx} OR (ul.created_at = $${idx} AND ul.id < $${idx + 1}))`
    );
    params.push(cursorCreatedAt, cursorId);
    idx += 2;
  }

  const where = conditions.join(' AND ');

  // ── Fetch page of logs ────────────────────────────────────────────────
  const logsResult = await db.query(
    `SELECT ul.id,
            ul.request_id,
            ul.model,
            ul.prompt_tokens,
            ul.completion_tokens,
            ul.total_tokens,
            ul.latency_ms,
            ul.status_code,
            ul.estimated_cost,
            ul.created_at,
            ul.request_body,
            ul.response_body,
            ak.name AS api_key_name,
            ak.id   AS api_key_id
     FROM usage_logs ul
     LEFT JOIN api_keys ak ON ak.id = ul.api_key_id
     WHERE ${where}
     ORDER BY ul.created_at DESC, ul.id DESC
     LIMIT $${idx}`,
    [...params, limit + 1]
  );

  const rows = logsResult.rows;
  const hasMore = rows.length > limit;
  const logs = hasMore ? rows.slice(0, limit) : rows;

  // Build next cursor from last item
  let nextCursor = null;
  if (hasMore && logs.length > 0) {
    const last = logs[logs.length - 1];
    nextCursor = Buffer.from(
      JSON.stringify({ created_at: last.created_at, id: last.id })
    ).toString('base64');
  }

  // ── Latency histogram (same filters, without cursor) ──────────────────
  // Only compute when no cursor (first page) to avoid redundant queries on scroll
  let latencyBuckets = null;
  if (!cursor) {
    // Build histogram conditions without cursor and without limit params
    const histConditions = ['ul.user_id = $1'];
    const histParams = [userId];
    let hi = 2;

    if (model) { histConditions.push(`ul.model = $${hi++}`); histParams.push(model); }
    if (status) {
      if (status === '2xx') histConditions.push(`ul.status_code >= 200 AND ul.status_code < 300`);
      else if (status === '4xx') histConditions.push(`ul.status_code >= 400 AND ul.status_code < 500`);
      else if (status === '5xx') histConditions.push(`ul.status_code >= 500`);
      else { const c = parseInt(status, 10); if (!isNaN(c)) { histConditions.push(`ul.status_code = $${hi++}`); histParams.push(c); } }
    }
    if (from) { histConditions.push(`ul.created_at >= $${hi++}`); histParams.push(from); }
    if (to)   { histConditions.push(`ul.created_at <= $${hi++}`); histParams.push(to); }
    if (api_key_id) { histConditions.push(`ul.api_key_id = $${hi++}`); histParams.push(api_key_id); }
    if (request_id) { histConditions.push(`ul.request_id = $${hi++}`); histParams.push(request_id); }

    const histWhere = histConditions.join(' AND ');
    const histRes = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE latency_ms < 100)                                     AS b0,
         COUNT(*) FILTER (WHERE latency_ms >= 100  AND latency_ms < 500)              AS b1,
         COUNT(*) FILTER (WHERE latency_ms >= 500  AND latency_ms < 1000)             AS b2,
         COUNT(*) FILTER (WHERE latency_ms >= 1000 AND latency_ms < 3000)             AS b3,
         COUNT(*) FILTER (WHERE latency_ms >= 3000 AND latency_ms < 10000)            AS b4,
         COUNT(*) FILTER (WHERE latency_ms >= 10000)                                  AS b5,
         ROUND(AVG(latency_ms))::INT   AS avg_ms,
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms)::INT   AS p50,
         PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::INT  AS p95
       FROM usage_logs ul
       WHERE ${histWhere} AND latency_ms IS NOT NULL`,
      histParams
    );

    const h = histRes.rows[0];
    latencyBuckets = LATENCY_BUCKETS.map((b, i) => ({
      label: b.label,
      count: parseInt(h[`b${i}`] || 0, 10),
    }));
    latencyBuckets.avgMs = parseInt(h.avg_ms || 0, 10);
    latencyBuckets.p50   = parseInt(h.p50   || 0, 10);
    latencyBuckets.p95   = parseInt(h.p95   || 0, 10);
  }

  // ── Fetch distinct models for filter dropdown ─────────────────────────
  let models = [];
  if (!cursor) {
    const modelsRes = await db.query(
      'SELECT DISTINCT model FROM usage_logs WHERE user_id = $1 ORDER BY model',
      [userId]
    );
    models = modelsRes.rows.map(r => r.model);
  }

  // ── Fetch API keys for filter dropdown ────────────────────────────────
  let apiKeys = [];
  if (!cursor) {
    const keysRes = await db.query(
      `SELECT id, name FROM api_keys WHERE user_id = $1 AND revoked_at IS NULL ORDER BY name`,
      [userId]
    );
    apiKeys = keysRes.rows;
  }

  return res.status(200).json({
    logs: logs.map(r => ({
      id:                r.id,
      request_id:        r.request_id,
      model:             r.model,
      prompt_tokens:     r.prompt_tokens,
      completion_tokens: r.completion_tokens,
      total_tokens:      r.total_tokens,
      latency_ms:        r.latency_ms,
      status_code:       r.status_code,
      estimated_cost:    parseFloat(r.estimated_cost ?? 0),
      created_at:        r.created_at,
      request_body:      r.request_body,
      response_body:     r.response_body,
      api_key_name:      r.api_key_name,
      api_key_id:        r.api_key_id,
    })),
    nextCursor,
    hasMore,
    latencyBuckets: latencyBuckets
      ? {
          buckets: latencyBuckets,
          avgMs:   latencyBuckets.avgMs,
          p50:     latencyBuckets.p50,
          p95:     latencyBuckets.p95,
        }
      : null,
    models,
    apiKeys,
  });
});
