'use strict';

const { db } = require('../lib/db');

/**
 * Authenticate requests using API key (Bearer token).
 *
 * Keys are stored in the api_keys table as bcrypt hashes.  For performance
 * we cache the lookup result in-memory with a short TTL so each key is only
 * hit the DB once per minute under load.
 */

const KEY_PREFIX = 'sk-cloudach-';
const cache = new Map(); // key_hash -> { userId, valid, expiresAt }
const CACHE_TTL_MS = 60_000;

function pruneCache() {
  const now = Date.now();
  for (const [k, v] of cache) {
    if (v.expiresAt < now) cache.delete(k);
  }
}
setInterval(pruneCache, 60_000).unref();

async function lookupApiKey(rawKey) {
  const cached = cache.get(rawKey);
  if (cached && cached.expiresAt > Date.now()) return cached;

  const result = await db.query(
    `SELECT user_id, revoked_at FROM api_keys WHERE key_hash = encode(sha256($1::bytea), 'hex') LIMIT 1`,
    [rawKey]
  );

  const row = result.rows[0];
  const entry = {
    userId: row?.user_id ?? null,
    valid: !!row && !row.revoked_at,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  cache.set(rawKey, entry);
  return entry;
}

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { message: 'Missing API key. Include it as "Authorization: Bearer sk-cloudach-..."', type: 'invalid_request_error' },
    });
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey.startsWith(KEY_PREFIX)) {
    return res.status(401).json({
      error: { message: 'Invalid API key format.', type: 'invalid_request_error' },
    });
  }

  let entry;
  try {
    entry = await lookupApiKey(rawKey);
  } catch (err) {
    req.log.error({ err }, 'auth: db lookup failed');
    return res.status(500).json({ error: { message: 'Internal server error', type: 'api_error' } });
  }

  if (!entry.valid) {
    return res.status(401).json({
      error: { message: 'Invalid or revoked API key.', type: 'authentication_error' },
    });
  }

  req.userId = entry.userId;
  next();
}

module.exports = { authenticate };
