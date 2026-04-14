'use strict';

const { Router } = require('express');
const { db } = require('../lib/db');
const { redis } = require('../lib/redis');

const VLLM_BASE_URL = process.env.VLLM_BASE_URL || 'http://vllm-mock:8000';

const healthRouter = Router();

async function checkInference() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${VLLM_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

healthRouter.get('/', async (req, res) => {
  const start = Date.now();
  const checks = { db: 'ok', redis: 'ok', inference: 'ok' };
  let httpStatus = 200;

  const results = await Promise.allSettled([
    (async () => { await db.query('SELECT 1'); })(),
    (async () => { await redis.ping(); })(),
    checkInference(),
  ]);

  if (results[0].status === 'rejected')                                   { checks.db        = 'error'; httpStatus = 503; }
  if (results[1].status === 'rejected')                                   { checks.redis     = 'error'; httpStatus = 503; }
  if (results[2].status === 'rejected' || results[2].value !== 'ok')     { checks.inference = 'error'; httpStatus = 503; }

  res.status(httpStatus).json({
    status: httpStatus === 200 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - start,
    checks,
  });
});

module.exports = { healthRouter };
