import crypto from 'crypto';
import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    const result = await db.query(
      `SELECT id, name, created_at, last_used_at, revoked_at
       FROM api_keys
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.status(200).json({ keys: result.rows });
  }

  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    // Generate a raw key: sk-cloudach-<32 random hex bytes>
    const rawKey = `sk-cloudach-${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const result = await db.query(
      'INSERT INTO api_keys (user_id, name, key_hash) VALUES ($1, $2, $3) RETURNING id, name, created_at',
      [userId, name, keyHash]
    );

    // Return the raw key once — never stored again
    return res.status(201).json({ key: result.rows[0], rawKey });
  }

  return res.status(405).end();
});
