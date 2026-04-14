import { requireAuth } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

// GET /api/dashboard/team/members — list all members of the caller's team
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;

  // Get the team the user belongs to
  const teamRes = await db.query(
    `SELECT t.id FROM teams t
     JOIN team_members tm ON tm.team_id = t.id AND tm.user_id = $1
     LIMIT 1`,
    [userId]
  );
  if (teamRes.rows.length === 0) {
    return res.status(404).json({ error: 'You are not a member of any team.' });
  }
  const teamId = teamRes.rows[0].id;

  const result = await db.query(
    `SELECT tm.id, tm.user_id, tm.role, tm.joined_at,
            u.email
     FROM team_members tm
     JOIN users u ON u.id = tm.user_id
     WHERE tm.team_id = $1
     ORDER BY tm.joined_at ASC`,
    [teamId]
  );
  return res.status(200).json({ members: result.rows });
});
