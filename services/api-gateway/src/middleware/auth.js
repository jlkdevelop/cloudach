'use strict';

const jwt = require('jsonwebtoken');

const KEY_PREFIX = 'sk-cloudach-';
const CACHE_TTL_MS = 60_000;

/**
 * Create the authenticate middleware.
 *
 * Accepts both:
 *   1. API key  — "Authorization: Bearer sk-cloudach-<key>"
 *   2. JWT      — "Authorization: Bearer <jwt>"
 *
 * For API keys, also loads per-key scoping:
 *   - allowed_models: if set, requests for unlisted models are rejected (403)
 *   - rate_limit_rpm: if set, stored on req for the rateLimiter middleware to read
 *
 * @param {object} [deps]
 * @param {object} [deps.db]      - pg Pool (defaults to ./lib/db)
 * @param {string} [deps.jwtSecret]
 */
function createAuthenticate(deps) {
  const db = deps?.db ?? require('../lib/db').db;
  const jwtSecret = deps?.jwtSecret ?? process.env.JWT_SECRET ?? 'change-me';

  // In-memory cache: rawKey -> { userId, apiKeyId, valid, allowedModels, rateLimitRpm, expiresAt }
  const cache = new Map();

  function pruneCache() {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expiresAt < now) cache.delete(k);
    }
  }
  const pruneTimer = setInterval(pruneCache, CACHE_TTL_MS);
  if (pruneTimer.unref) pruneTimer.unref();

  async function lookupApiKey(rawKey) {
    const cached = cache.get(rawKey);
    if (cached && cached.expiresAt > Date.now()) return cached;

    const result = await db.query(
      `SELECT id, user_id, revoked_at, allowed_models, rate_limit_rpm
       FROM api_keys
       WHERE key_hash = encode(sha256($1::bytea), 'hex') LIMIT 1`,
      [rawKey]
    );

    const row = result.rows[0];
    const entry = {
      userId: row?.user_id ?? null,
      apiKeyId: row?.id ?? null,
      valid: !!row && !row.revoked_at,
      allowedModels: row?.allowed_models ?? null,   // string[] | null
      rateLimitRpm: row?.rate_limit_rpm ?? null,    // number | null
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    cache.set(rawKey, entry);
    return entry;
  }

  // Debounced last_used_at update — fire-and-forget
  const pendingLastUsed = new Map();
  function touchLastUsed(apiKeyId) {
    if (pendingLastUsed.has(apiKeyId)) return;
    const t = setTimeout(() => {
      pendingLastUsed.delete(apiKeyId);
      db.query('UPDATE api_keys SET last_used_at = now() WHERE id = $1', [apiKeyId]).catch(() => {});
    }, 5_000);
    if (t.unref) t.unref();
    pendingLastUsed.set(apiKeyId, t);
  }

  return async function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Missing credentials. Include "Authorization: Bearer <api-key-or-jwt>".',
          type: 'invalid_request_error',
        },
      });
    }

    const token = authHeader.slice(7).trim();

    // --- API key path ---
    if (token.startsWith(KEY_PREFIX)) {
      let entry;
      try {
        entry = await lookupApiKey(token);
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
      req.apiKeyId = entry.apiKeyId;
      req.keyAllowedModels = entry.allowedModels;   // null = unrestricted
      req.keyRateLimitRpm = entry.rateLimitRpm;     // null = no limit
      touchLastUsed(entry.apiKeyId);

      // Enforce model allowlist immediately if the request body names a model.
      // (Chat and completions routes include model in the JSON body.)
      if (entry.allowedModels && req.body && req.body.model) {
        if (!entry.allowedModels.includes(req.body.model)) {
          return res.status(403).json({
            error: {
              message: `Model '${req.body.model}' is not permitted for this API key.`,
              type: 'permission_error',
            },
          });
        }
      }

      return next();
    }

    // --- JWT path ---
    try {
      const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
      if (!payload.sub) {
        return res.status(401).json({
          error: { message: 'Invalid token: missing subject claim.', type: 'authentication_error' },
        });
      }
      req.userId = payload.sub;
      req.apiKeyId = null;
      req.keyAllowedModels = null;
      req.keyRateLimitRpm = null;
      return next();
    } catch (err) {
      return res.status(401).json({
        error: {
          message: err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.',
          type: 'authentication_error',
        },
      });
    }
  };
}

// Default export for production use
const authenticate = createAuthenticate();

module.exports = { authenticate, createAuthenticate };
