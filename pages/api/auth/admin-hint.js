import { getDb } from '../../../lib/db';
import { createAuthRateLimiter } from '../../../lib/auth';
import { getClientIp } from '../../../lib/audit';

const checkRateLimit = createAuthRateLimiter(10, 60_000);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  const ip = getClientIp(req) || 'unknown';
  if (checkRateLimit(ip, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!rawEmail || !EMAIL_RE.test(rawEmail) || rawEmail.length > 254) {
    return res.status(200).json({ hint: null });
  }

  let db;
  try {
    db = getDb();
  } catch {
    return res.status(200).json({ hint: null });
  }

  try {
    const result = await db.query(
      'SELECT role, is_disabled FROM users WHERE email = $1',
      [rawEmail]
    );
    const user = result.rows[0];
    if (!user || user.role !== 'admin' || user.is_disabled) {
      return res.status(200).json({ hint: null });
    }
    return res.status(200).json({ hint: 'admin' });
  } catch (err) {
    console.error('admin-hint error:', err.message);
    return res.status(200).json({ hint: null });
  }
}
