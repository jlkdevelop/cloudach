'use strict';

const { Router } = require('express');
const { proxyToVllm } = require('../lib/vllmProxy');

const completionsRouter = Router();

const ALLOWED_MODELS = new Set(['llama3-8b']);

// Legacy text completions endpoint (OpenAI /v1/completions)
completionsRouter.post('/', async (req, res) => {
  const { model, prompt, stream } = req.body || {};

  if (!model || !ALLOWED_MODELS.has(model)) {
    return res.status(400).json({
      error: {
        message: `Model '${model}' not found. Available: ${[...ALLOWED_MODELS].join(', ')}`,
        type: 'invalid_request_error',
        param: 'model',
      },
    });
  }

  if (prompt === undefined || prompt === null) {
    return res.status(400).json({
      error: { message: "'prompt' is required.", type: 'invalid_request_error', param: 'prompt' },
    });
  }

  if (stream) {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
  }

  try {
    const { usage } = await proxyToVllm(req, res, '/v1/completions');
    if (usage && req.trackTokens) {
      await req.trackTokens(usage.prompt_tokens ?? 0, usage.completion_tokens ?? 0);
    }
  } catch (err) {
    req.log.error({ err }, 'completions: proxy error');
    if (!res.headersSent) {
      res.status(502).json({ error: { message: 'Model server error.', type: 'api_error' } });
    }
  }
});

module.exports = { completionsRouter };
