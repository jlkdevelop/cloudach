import crypto from 'crypto';
import { requireAuth } from '../../../../../lib/auth';
import { getDb } from '../../../../../lib/db';

// GET  /api/dashboard/team/invites — list pending invites (admin only)
// POST /api/dashboard/team/invites — send invite (admin only)
export default requireAuth(async function handler(req, res) {
  const db = getDb();
  const userId = req.session.sub;

  // Verify caller is admin of their team
  const callerRes = await db.query(
    `SELECT tm.team_id FROM team_members tm
     WHERE tm.user_id = $1 AND tm.role = 'admin'
     LIMIT 1`,
    [userId]
  );
  if (callerRes.rows.length === 0) {
    return res.status(403).json({ error: 'Only team admins can manage invites.' });
  }
  const teamId = callerRes.rows[0].team_id;

  if (req.method === 'GET') {
    const result = await db.query(
      `SELECT id, email, role, created_at, expires_at, accepted_at, revoked_at
       FROM team_invites
       WHERE team_id = $1
       ORDER BY created_at DESC`,
      [teamId]
    );
    return res.status(200).json({ invites: result.rows });
  }

  if (req.method === 'POST') {
    const { email, role = 'member' } = req.body || {};
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required.' });
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin, member, or viewer.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if already a member
    const existingMember = await db.query(
      `SELECT tm.id FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = $1 AND u.email = $2`,
      [teamId, normalizedEmail]
    );
    if (existingMember.rows.length > 0) {
      return res.status(409).json({ error: 'This person is already a team member.' });
    }

    // Revoke any existing pending invite for this email
    await db.query(
      `UPDATE team_invites SET revoked_at = now()
       WHERE team_id = $1 AND email = $2 AND accepted_at IS NULL AND revoked_at IS NULL`,
      [teamId, normalizedEmail]
    );

    const token = crypto.randomBytes(32).toString('hex');
    const result = await db.query(
      `INSERT INTO team_invites (team_id, email, role, token, invited_by_user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, created_at, expires_at`,
      [teamId, normalizedEmail, role, token, userId]
    );

    const invite = result.rows[0];
    // In production this would send an email. We return the invite link for the demo.
    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/team/join/${token}`;
    return res.status(201).json({ invite, inviteUrl });
  }

  return res.status(405).end();
});
