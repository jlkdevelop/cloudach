import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

// GET  /api/dashboard/team  — get current user's team (or null)
// POST /api/dashboard/team  — create a team (owner becomes admin member)
export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  if (req.method === 'GET') {
    // Find any team the user owns or is a member of
    const result = await db.query(
      `SELECT t.id, t.name, t.billing_contact_email, t.owner_user_id, t.created_at,
              tm.role AS my_role
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id AND tm.user_id = $1
       ORDER BY t.created_at ASC
       LIMIT 1`,
      [userId]
    );
    if (result.rows.length === 0) return res.status(200).json({ team: null });
    return res.status(200).json({ team: result.rows[0] });
  }

  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'Team name is required.' });

    // Check the user isn't already in a team
    const existing = await db.query(
      `SELECT t.id FROM teams t
       JOIN team_members tm ON tm.team_id = t.id AND tm.user_id = $1
       LIMIT 1`,
      [userId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You are already a member of a team.' });
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const teamRes = await client.query(
        `INSERT INTO teams (name, owner_user_id, billing_contact_email)
         VALUES ($1, $2, $3)
         RETURNING id, name, billing_contact_email, owner_user_id, created_at`,
        [name.trim(), userId, req.session.email]
      );
      const team = teamRes.rows[0];
      await client.query(
        `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, 'admin')`,
        [team.id, userId]
      );
      await client.query('COMMIT');
      return res.status(201).json({ team: { ...team, my_role: 'admin' } });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  return res.status(405).end();
});
