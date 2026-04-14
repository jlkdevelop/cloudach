import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    // Return catalog with user's deployment status + latency stats from usage_logs
    const [catalogResult, latencyResult] = await Promise.all([
      db.query(
        `SELECT c.model_id, c.display_name, c.description, c.param_count, c.context_len,
                c.hf_repo, c.tags,
                d.status AS deploy_status, d.endpoint_url, d.deployed_at
         FROM model_catalog c
         LEFT JOIN user_deployments d ON d.model_id = c.model_id AND d.user_id = $1
         ORDER BY c.display_name`,
        [userId]
      ),
      // Latency stats per model for this user (last 24h)
      db.query(
        `SELECT model,
                COUNT(*)                                        AS request_count,
                ROUND(AVG(latency_ms))::int                    AS avg_latency_ms,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms))::int AS p50_latency_ms,
                ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms))::int AS p95_latency_ms
         FROM usage_logs
         WHERE user_id = $1
           AND latency_ms IS NOT NULL
           AND created_at > now() - interval '24 hours'
         GROUP BY model`,
        [userId]
      ),
    ]);

    // Merge latency stats into model rows
    const latencyByModel = {};
    for (const row of latencyResult.rows) {
      latencyByModel[row.model] = {
        requestCount24h:  parseInt(row.request_count, 10),
        avgLatencyMs:     row.avg_latency_ms,
        p50LatencyMs:     row.p50_latency_ms,
        p95LatencyMs:     row.p95_latency_ms,
      };
    }

    const models = catalogResult.rows.map(m => ({
      ...m,
      latency: latencyByModel[m.model_id] || null,
    }));

    return res.status(200).json({ models });
  }

  if (req.method === 'POST') {
    // Deploy a model for this user
    const { modelId } = req.body || {};
    if (!modelId) return res.status(400).json({ error: 'modelId is required.' });

    const catalogCheck = await db.query('SELECT model_id FROM model_catalog WHERE model_id = $1', [modelId]);
    if (!catalogCheck.rows.length) {
      return res.status(404).json({ error: 'Model not found in catalog.' });
    }

    // Upsert deployment — if already exists set to deploying, else insert
    const endpointUrl = `https://api.cloudach.com/v1`;
    const result = await db.query(
      `INSERT INTO user_deployments (user_id, model_id, status, endpoint_url)
       VALUES ($1, $2, 'deploying', $3)
       ON CONFLICT (user_id, model_id) DO UPDATE
         SET status = 'deploying', stopped_at = NULL, deployed_at = now()
       RETURNING *`,
      [userId, modelId, endpointUrl]
    );

    // Simulate async activation — mark active after 3 seconds (demo)
    // In production this would trigger a real vLLM job
    setTimeout(async () => {
      try {
        await db.query(
          "UPDATE user_deployments SET status = 'active' WHERE user_id = $1 AND model_id = $2",
          [userId, modelId]
        );
      } catch {}
    }, 3000);

    return res.status(201).json({ deployment: result.rows[0] });
  }

  return res.status(405).end();
});
