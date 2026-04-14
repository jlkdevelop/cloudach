'use strict';

const { redis } = require('../lib/redis');

/**
 * Sliding-window rate limiter backed by Redis.
 *
 * Limits:
 *   - 60 requests / minute  per user
 *   - 1 000 000 tokens / day per user  (approximate; counted from response)
 *
 * Both limits use atomic Lua scripts so there are no race conditions.
 */

const RPM_LIMIT = parseInt(process.env.RATE_LIMIT_RPM || '60', 10);
const TPD_LIMIT = parseInt(process.env.RATE_LIMIT_TPD || '1000000', 10);

const incrExpireLua = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1]))
end
return current
`;

async function rateLimiter(req, res, next) {
  const userId = req.userId || 'anonymous';
  const minuteKey = `rl:rpm:${userId}:${Math.floor(Date.now() / 60000)}`;

  let rpm;
  try {
    rpm = await redis.eval(incrExpireLua, 1, minuteKey, 60);
  } catch (err) {
    req.log.warn({ err }, 'rate-limiter: redis error, allowing request');
    return next();
  }

  if (rpm > RPM_LIMIT) {
    res.set('Retry-After', '60');
    return res.status(429).json({
      error: {
        message: `Rate limit exceeded: ${RPM_LIMIT} requests per minute.`,
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
}

module.exports = { rateLimiter };
