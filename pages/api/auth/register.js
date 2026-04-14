import bcrypt from 'bcryptjs';
import { getDb } from '../../../lib/db';
import { signToken, setSessionCookie, createAuthRateLimiter } from '../../../lib/auth';
import { getClientIp } from '../../../lib/audit';

// 10 requests per 60 s per IP — enforced in-process
const checkRateLimit = createAuthRateLimiter(10, 60_000);

export default async function handler(req, res) {
  const ip = getClientIp(req) || 'unknown';
  if (checkRateLimit(ip, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  let db;
  try {
    db = getDb();
  } catch (err) {
    console.error('DB init error:', err.message);
    return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email.toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const token = signToken({ sub: user.id, email: user.email });
    setSessionCookie(res, token);

    return res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
