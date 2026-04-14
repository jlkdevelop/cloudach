import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

// POST /api/team/join/[token] — accept an invite (must be logged in)
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;
  const userEmail = req.session.email;
  const { token } = req.query;

  // Look up the invite
  const inviteRes = await db.query(
    `SELECT id, team_id, email, role, expires_at, accepted_at, revoked_at
     FROM team_invites WHERE token = $1`,
    [token]
  );
  if (inviteRes.rows.length === 0) {
    return res.status(404).json({ error: 'Invite not found.' });
  }
  const invite = inviteRes.rows[0];

  if (invite.revoked_at) return res.status(410).json({ error: 'This invite has been revoked.' });
  if (invite.accepted_at) return res.status(410).json({ error: 'This invite has already been used.' });
  if (new Date(invite.expires_at) < new Date()) {
    return res.status(410).json({ error: 'This invite has expired.' });
  }
  if (invite.email !== userEmail.toLowerCase()) {
    return res.status(403).json({ error: 'This invite is for a different email address.' });
  }

  // Check user isn't already in a team
  const alreadyMember = await db.query(
    `SELECT id FROM team_members WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  if (alreadyMember.rows.length > 0) {
    return res.status(409).json({ error: 'You are already a member of a team.' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)
       ON CONFLICT (team_id, user_id) DO NOTHING`,
      [invite.team_id, userId, invite.role]
    );
    await client.query(
      `UPDATE team_invites SET accepted_at = now() WHERE id = $1`,
      [invite.id]
    );
    await client.query('COMMIT');
    return res.status(200).json({ ok: true, teamId: invite.team_id });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});
