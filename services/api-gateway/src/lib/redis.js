'use strict';

const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => {
  // pino logger not available here; use console so the process doesn't silently fail
  console.error('[redis] connection error:', err.message);
});

module.exports = { redis };
