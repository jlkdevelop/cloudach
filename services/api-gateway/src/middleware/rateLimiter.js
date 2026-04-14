'use strict';

/**
 * Sliding-window rate limiter backed by Redis.
 *
 * Per-request limits:
 *   - Global default: 60 requests / minute per user (RATE_LIMIT_RPM env var)
 *   - Per-key override: if req.keyRateLimitRpm is set (from auth middleware), that
 *     value takes precedence over the global default for API-key requests.
 *   - Token day limit: 1,000,000 tokens / day per user (approximate)
 *
 * @param {object} [deps]
 * @param {object} [deps.redis] - ioredis client (defaults to ./lib/redis)
 */
function createRateLimiter(deps) {
  const redis = deps?.redis ?? require('../lib/redis').redis;
  const GLOBAL_RPM_LIMIT = parseInt(process.env.RATE_LIMIT_RPM || '60', 10);

  const incrExpireLua = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))
end
return current
`;

  return async function rateLimiter(req, res, next) {
    const userId = req.userId || 'anonymous';

    // Use per-key RPM limit when set, otherwise fall back to global default
    const rpmLimit = req.keyRateLimitRpm ?? GLOBAL_RPM_LIMIT;

    // Scope the key to the API key id when available, so per-key limits are
    // isolated from other keys belonging to the same user.
    const scope = req.apiKeyId ? `key:${req.apiKeyId}` : `user:${userId}`;
    const minuteKey = `rl:rpm:${scope}:${Math.floor(Date.now() / 60000)}`;

    let rpm;
    try {
      rpm = await redis.eval(incrExpireLua, 1, minuteKey, 60);
    } catch (err) {
      req.log.warn({ err }, 'rate-limiter: redis error, allowing request');
      req.trackTokens = async () => {};
      return next();
    }

    if (rpm > rpmLimit) {
      res.set('Retry-After', '60');
      return res.status(429).json({
        error: {
          message: `Rate limit exceeded: ${rpmLimit} requests per minute.`,
          type: 'requests',
          code: 'rate_limit_exceeded',
        },
      });
    }

    // Attach token counter updater for use after proxying
    req.trackTokens = async (promptTokens, completionTokens) => {
      const dayKey = `rl:tpd:${userId}:${new Date().toISOString().slice(0, 10)}`;
      try {
        await redis.eval(incrExpireLua, 1, dayKey, 86400, promptTokens + completionTokens);
      } catch (_) {
        // non-fatal
      }
    };

    next();
  };
}

// Default export for production use
const rateLimiter = createRateLimiter();

module.exports = { rateLimiter, createRateLimiter };
