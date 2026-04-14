import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const COOKIE_NAME = 'cloudach_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable must be set in production.');
    }
    return 'cloudach-dev-secret-change-in-prod';
  }
  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d', algorithm: 'HS256' });
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
}

// Adds standard rate-limit headers to a response.
// Limits are informational for the dashboard API (enforcement is at the API gateway).
export function addRateLimitHeaders(res, { limit = 300, window = 60 } = {}) {
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Window', String(window));
  const reset = Math.floor(Date.now() / 1000) + window;
  res.setHeader('X-RateLimit-Reset', String(reset));
}

export function setSessionCookie(res, token) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function clearSessionCookie(res) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function getSessionFromRequest(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    addRateLimitHeaders(res);
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.session = session;
    try {
      return await handler(req, res);
    } catch (err) {
      console.error('API handler error:', err.message);
      if (err.message?.includes('DATABASE_URL')) {
        return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
      }
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  };
}

/**
 * requireAdmin — same as requireAuth but also verifies the user has role='admin'
 * in the database (not just in the JWT, so role changes take effect immediately).
 */
export function requireAdmin(handler) {
  return async (req, res) => {
    addRateLimitHeaders(res);
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Lazy-import to avoid circular deps
      const { getDb } = await import('./db.js');
      const db = getDb();
      const result = await db.query('SELECT role, is_disabled FROM users WHERE id = $1', [session.sub]);
      const user = result.rows[0];

      if (!user || user.role !== 'admin' || user.is_disabled) {
        return res.status(403).json({ error: 'Forbidden — admin access required' });
      }

      req.session = { ...session, role: 'admin' };
      return await handler(req, res);
    } catch (err) {
      console.error('Admin handler error:', err.message);
      if (err.message?.includes('DATABASE_URL')) {
        return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
      }
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  };
}
