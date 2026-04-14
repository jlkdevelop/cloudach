import bcrypt from 'bcryptjs';
import { getDb } from '../../../lib/db';
import { signToken, setSessionCookie, addRateLimitHeaders } from '../../../lib/auth';

export default async function handler(req, res) {
  addRateLimitHeaders(res, { limit: 20, window: 60 });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  let db;
  try {
    db = getDb();
  } catch (err) {
    console.error('DB init error:', err.message);
    return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
  }

  try {
    const result = await db.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ sub: user.id, email: user.email });
    setSessionCookie(res, token);

    return res.status(200).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
