import { requireAuth } from '../../../../lib/auth';
import { getDb } from '../../../../lib/db';

// GET /api/dashboard/team/usage — team-level aggregated usage
// Returns total usage across all team members, broken down by member and model.
export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const db = getDb();
  const userId = req.session.sub;

  // Get team membership
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

  // Get all member user IDs
  const memberRes = await db.query(
    `SELECT tm.user_id, u.email FROM team_members tm
     JOIN users u ON u.id = tm.user_id
     WHERE tm.team_id = $1`,
    [teamId]
  );
  const memberIds = memberRes.rows.map(r => r.user_id);
  const memberEmails = Object.fromEntries(memberRes.rows.map(r => [r.user_id, r.email]));

  if (memberIds.length === 0) return res.status(200).json({ total: {}, byMember: [] });

  // Total usage this month across all members
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const totalsRes = await db.query(
    `SELECT
       SUM(total_tokens)   AS total_tokens,
       SUM(request_count)  AS total_requests,
       SUM(estimated_cost) AS total_cost
     FROM daily_usage_aggregates
     WHERE user_id = ANY($1::uuid[])
       AND day >= $2`,
    [memberIds, monthStart]
  );

  // Per-member usage this month
  const perMemberRes = await db.query(
    `SELECT user_id,
       SUM(total_tokens)   AS total_tokens,
       SUM(request_count)  AS total_requests,
       SUM(estimated_cost) AS estimated_cost
     FROM daily_usage_aggregates
     WHERE user_id = ANY($1::uuid[])
       AND day >= $2
     GROUP BY user_id
     ORDER BY SUM(total_tokens) DESC`,
    [memberIds, monthStart]
  );

  const byMember = perMemberRes.rows.map(r => ({
    user_id: r.user_id,
    email: memberEmails[r.user_id] || r.user_id,
    total_tokens: parseInt(r.total_tokens || 0, 10),
    total_requests: parseInt(r.total_requests || 0, 10),
    estimated_cost: parseFloat(r.estimated_cost || 0),
  }));

  const t = totalsRes.rows[0];
  return res.status(200).json({
    period: { start: monthStart, end: now.toISOString().slice(0, 10) },
    total: {
      tokens: parseInt(t?.total_tokens || 0, 10),
      requests: parseInt(t?.total_requests || 0, 10),
      estimated_cost: parseFloat(t?.total_cost || 0),
    },
    byMember,
  });
});
