import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

// PATCH /api/dashboard/team/settings — update team name or billing contact
// Only team admins can call this.
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;

  // Verify caller is an admin of their team
  const memberRes = await db.query(
    `SELECT tm.team_id, tm.role FROM team_members tm
     WHERE tm.user_id = $1 AND tm.role = 'admin'
     LIMIT 1`,
    [userId]
  );
  if (memberRes.rows.length === 0) {
    return res.status(403).json({ error: 'Only team admins can update team settings.' });
  }
  const teamId = memberRes.rows[0].team_id;

  const { name, billing_contact_email } = req.body || {};
  const updates = [];
  const values = [];

  if (name !== undefined) {
    if (!name.trim()) return res.status(400).json({ error: 'Team name cannot be empty.' });
    updates.push(`name = $${values.length + 1}`);
    values.push(name.trim());
  }
  if (billing_contact_email !== undefined) {
    updates.push(`billing_contact_email = $${values.length + 1}`);
    values.push(billing_contact_email || null);
  }

  if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update.' });

  updates.push(`updated_at = now()`);
  values.push(teamId);

  const result = await db.query(
    `UPDATE teams SET ${updates.join(', ')} WHERE id = $${values.length}
     RETURNING id, name, billing_contact_email, owner_user_id, created_at`,
    values
  );
  return res.status(200).json({ team: result.rows[0] });
});
