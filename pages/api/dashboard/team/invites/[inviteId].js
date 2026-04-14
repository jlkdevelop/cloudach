import { requireAuth } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

// DELETE /api/dashboard/team/invites/[inviteId] — revoke invite (admin only)
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;
  const { inviteId } = req.query;

  // Verify caller is admin of their team
  const callerRes = await db.query(
    `SELECT tm.team_id FROM team_members tm
     WHERE tm.user_id = $1 AND tm.role = 'admin'
     LIMIT 1`,
    [userId]
  );
  if (callerRes.rows.length === 0) {
    return res.status(403).json({ error: 'Only team admins can revoke invites.' });
  }
  const teamId = callerRes.rows[0].team_id;

  const result = await db.query(
    `UPDATE team_invites SET revoked_at = now()
     WHERE id = $1 AND team_id = $2 AND revoked_at IS NULL AND accepted_at IS NULL
     RETURNING id`,
    [inviteId, teamId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Invite not found or already resolved.' });
  }
  return res.status(200).json({ ok: true });
});
