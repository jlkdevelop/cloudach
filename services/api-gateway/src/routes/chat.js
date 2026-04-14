'use strict';

const { Router } = require('express');
const { proxyToVllm } = require('../lib/vllmProxy');

const chatRouter = Router();

const ALLOWED_MODELS = new Set(['llama3-8b']);

chatRouter.post('/', async (req, res) => {
  const { model, messages, stream } = req.body || {};

  if (!model || !ALLOWED_MODELS.has(model)) {
    return res.status(400).json({
      error: {
        message: `Model '${model}' not found. Available: ${[...ALLOWED_MODELS].join(', ')}`,
        type: 'invalid_request_error',
        param: 'model',
      },
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: { message: "'messages' must be a non-empty array.", type: 'invalid_request_error', param: 'messages' },
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
    const { usage } = await proxyToVllm(req, res, '/v1/chat/completions');
    if (usage && req.trackTokens) {
      await req.trackTokens(usage.prompt_tokens ?? 0, usage.completion_tokens ?? 0);
    }
  } catch (err) {
    req.log.error({ err }, 'chat: proxy error');
    if (!res.headersSent) {
      res.status(502).json({ error: { message: 'Model server error.', type: 'api_error' } });
    }
  }
});

module.exports = { chatRouter };
