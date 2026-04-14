export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const status = { ok: true, db: false, env: {} };

  status.env.DATABASE_URL = !!process.env.DATABASE_URL;
  status.env.JWT_SECRET = !!process.env.JWT_SECRET;

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ ...status, ok: false, error: 'DATABASE_URL not configured' });
  }

  try {
    const { getDb } = await import('../../lib/db');
    const db = getDb();
    await db.query('SELECT 1');
    status.db = true;
  } catch (err) {
    return res.status(503).json({ ...status, ok: false, error: `DB: ${err.message}` });
  }

  return res.status(200).json(status);
}
