#!/usr/bin/env node
'use strict';

/**
 * Minimal vLLM OpenAI-compatible mock for local development.
 * Responds to /health, /v1/models, /v1/chat/completions, /v1/completions.
 * Streaming responses send a few fake SSE chunks then [DONE].
 */

const http = require('http');

const MODEL_ID = 'llama3-8b';
const PORT = process.env.PORT || 8000;

function jsonBody(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

function sseChunk(res, delta, finishReason, id, created) {
  const chunk = {
    id,
    object: 'chat.completion.chunk',
    created,
    model: MODEL_ID,
    choices: [{ index: 0, delta, finish_reason: finishReason }],
  };
  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
}

function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return jsonBody(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && url.pathname === '/v1/models') {
    return jsonBody(res, 200, {
      object: 'list',
      data: [{ id: MODEL_ID, object: 'model', created: 1712000000, owned_by: 'cloudach' }],
    });
  }

  if (req.method === 'POST' && (url.pathname === '/v1/chat/completions' || url.pathname === '/v1/completions')) {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      let body = {};
      try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch (_) {}

      const id = `chatcmpl-mock-${Date.now()}`;
      const created = Math.floor(Date.now() / 1000);
      const fakeTokens = ['Hello', '!', ' I', "'m", ' a', ' mock', ' vLLM', ' server', '.'];
      const fakeText = fakeTokens.join('');

      if (body.stream) {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });

        // Role chunk
        sseChunk(res, { role: 'assistant', content: '' }, null, id, created);

        // Content chunks
        for (const token of fakeTokens) {
          sseChunk(res, { content: token }, null, id, created);
        }

        // Final chunk with usage
        const finalChunk = {
          id, object: 'chat.completion.chunk', created, model: MODEL_ID,
          choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
          usage: { prompt_tokens: 10, completion_tokens: fakeTokens.length, total_tokens: 10 + fakeTokens.length },
        };
        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const isChatCompletion = url.pathname === '/v1/chat/completions';
        const responseObj = isChatCompletion
          ? {
              id, object: 'chat.completion', created, model: MODEL_ID,
              choices: [{ index: 0, message: { role: 'assistant', content: fakeText }, finish_reason: 'stop' }],
              usage: { prompt_tokens: 10, completion_tokens: fakeTokens.length, total_tokens: 10 + fakeTokens.length },
            }
          : {
              id, object: 'text_completion', created, model: MODEL_ID,
              choices: [{ text: fakeText, index: 0, finish_reason: 'stop' }],
              usage: { prompt_tokens: 10, completion_tokens: fakeTokens.length, total_tokens: 10 + fakeTokens.length },
            };
        jsonBody(res, 200, responseObj);
      }
    });
    return;
  }

  jsonBody(res, 404, { error: { message: 'Not found', type: 'invalid_request_error' } });
}

http.createServer(handleRequest).listen(PORT, '0.0.0.0', () => {
  console.log(`[vllm-mock] Listening on :${PORT}`);
});
