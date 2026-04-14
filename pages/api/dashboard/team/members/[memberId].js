import { requireAuth } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

// PATCH /api/dashboard/team/members/[memberId] — update role (admin only)
// DELETE /api/dashboard/team/members/[memberId] — remove member (admin only, not self if owner)
export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;
  const { memberId } = req.query;

  // Verify caller is an admin of their team
  const callerRes = await db.query(
    `SELECT tm.team_id, tm.role, t.owner_user_id
     FROM team_members tm
     JOIN teams t ON t.id = tm.team_id
     WHERE tm.user_id = $1 AND tm.role = 'admin'
     LIMIT 1`,
    [userId]
  );
  if (callerRes.rows.length === 0) {
    return res.status(403).json({ error: 'Only team admins can manage members.' });
  }
  const { team_id: teamId, owner_user_id: ownerId } = callerRes.rows[0];

  // Fetch the target member
  const targetRes = await db.query(
    `SELECT id, user_id, role FROM team_members WHERE id = $1 AND team_id = $2`,
    [memberId, teamId]
  );
  if (targetRes.rows.length === 0) {
    return res.status(404).json({ error: 'Member not found.' });
  }
  const target = targetRes.rows[0];

  if (req.method === 'PATCH') {
    const { role } = req.body || {};
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin, member, or viewer.' });
    }
    // Cannot demote the team owner
    if (target.user_id === ownerId && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change the role of the team owner.' });
    }
    const result = await db.query(
      `UPDATE team_members SET role = $1 WHERE id = $2 RETURNING id, user_id, role, joined_at`,
      [role, memberId]
    );
    return res.status(200).json({ member: result.rows[0] });
  }

  if (req.method === 'DELETE') {
    // Cannot remove the team owner
    if (target.user_id === ownerId) {
      return res.status(400).json({ error: 'Cannot remove the team owner.' });
    }
    await db.query(`DELETE FROM team_members WHERE id = $1`, [memberId]);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
});
