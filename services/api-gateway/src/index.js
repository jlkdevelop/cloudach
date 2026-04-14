'use strict';

const express = require('express');
const pino = require('pino');
const pinoHttp = require('pino-http');

const { healthRouter } = require('./routes/health');
const { modelsRouter } = require('./routes/models');
const { chatRouter } = require('./routes/chat');
const { completionsRouter } = require('./routes/completions');
const { batchRouter } = require('./routes/batch');
const { authenticate } = require('./middleware/auth');
const { rateLimiter } = require('./middleware/rateLimiter');
const { db } = require('./lib/db');
const { redis } = require('./lib/redis');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(pinoHttp({ logger }));

// Health — no auth
app.use('/health', healthRouter);

// OpenAI-compatible API — all routes require auth + rate limiting
const apiRouter = express.Router();
apiRouter.use(authenticate);
apiRouter.use(rateLimiter);
apiRouter.use('/models', modelsRouter);
apiRouter.use('/chat/completions', chatRouter);
apiRouter.use('/completions', completionsRouter);
apiRouter.use('/batches', batchRouter);

app.use('/v1', apiRouter);

// 404 for anything else
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Not found', type: 'invalid_request_error' } });
});

// Generic error handler
app.use((err, req, res, _next) => {
  req.log.error({ err }, 'Unhandled error');
  res.status(500).json({ error: { message: 'Internal server error', type: 'api_error' } });
});

const PORT = parseInt(process.env.PORT || '8080', 10);

async function start() {
  await db.connect();
  logger.info('Database connected');

  await redis.ping();
  logger.info('Redis connected');

  app.listen(PORT, '0.0.0.0', () => {
    logger.info({ port: PORT }, 'API gateway listening');
  });
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start');
  process.exit(1);
});
