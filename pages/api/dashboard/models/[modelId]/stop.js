import { requireAuth } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;
  const { modelId } = req.query;

  const result = await db.query(
    `UPDATE user_deployments SET status = 'stopped', stopped_at = now()
     WHERE user_id = $1 AND model_id = $2
     RETURNING *`,
    [userId, modelId]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: 'Deployment not found.' });
  }

  return res.status(200).json({ deployment: result.rows[0] });
});
