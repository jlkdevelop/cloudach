import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    // Return catalog with user's deployment status overlaid
    const result = await db.query(
      `SELECT c.model_id, c.display_name, c.description, c.param_count, c.context_len,
              c.hf_repo, c.tags,
              d.status AS deploy_status, d.endpoint_url, d.deployed_at
       FROM model_catalog c
       LEFT JOIN user_deployments d ON d.model_id = c.model_id AND d.user_id = $1
       ORDER BY c.display_name`,
      [userId]
    );
    return res.status(200).json({ models: result.rows });
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
