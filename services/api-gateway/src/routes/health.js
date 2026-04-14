'use strict';

const { Router } = require('express');
const { db } = require('../lib/db');
const { redis } = require('../lib/redis');

const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const checks = { db: 'ok', redis: 'ok' };
  let status = 200;

  try {
    await db.query('SELECT 1');
  } catch {
    checks.db = 'error';
    status = 503;
  }

  try {
    await redis.ping();
  } catch {
    checks.redis = 'error';
    status = 503;
  }

  res.status(status).json({ status: status === 200 ? 'ok' : 'degraded', checks });
});

module.exports = { healthRouter };
