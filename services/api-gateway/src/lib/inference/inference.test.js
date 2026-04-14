'use strict';

/**
 * Integration tests for the swappable InferenceBackend system.
 *
 * Tests cover:
 *  - Factory singleton and env-var dispatch
 *  - AwsInferenceBackend fallback when AWS vars are absent
 *  - LocalInferenceBackend end-to-end chat/completions via an inline HTTP mock
 *
 * Run with: npm test (uses node --test)
 */

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http   = require('node:http');

const { LocalInferenceBackend } = require('./LocalInferenceBackend');
const { AwsInferenceBackend }   = require('./AwsInferenceBackend');
const { getBackend, _resetBackend } = require('./index');

// ── Inline mock vLLM server ────────────────────────────────────────────────────

let mockServer;
let mockPort;

function startMockServer() {
  return new Promise((resolve) => {
    mockServer = http.createServer((req, res) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        let body = {};
        try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch (_) {}

        const jsonReply = (code, obj) => {
          const buf = JSON.stringify(obj);
          res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(buf) });
          res.end(buf);
        };

        if (req.url === '/health') return jsonReply(200, { status: 'ok' });

        if (req.url === '/v1/models') {
          return jsonReply(200, {
            object: 'list',
            data: [{ id: 'llama3-8b', object: 'model', created: 0, owned_by: 'cloudach' }],
          });
        }

        if (req.url === '/v1/chat/completions' || req.url === '/v1/completions') {
          const usage = { prompt_tokens: 10, completion_tokens: 9, total_tokens: 19 };

          if (body.stream) {
            res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
            res.write(`data: ${JSON.stringify({ choices: [{ delta: { role: 'assistant', content: '' } }] })}\n\n`);
            res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'hi' }, finish_reason: 'stop' }], usage })}\n\n`);
            res.write('data: [DONE]\n\n');
            return res.end();
          }

          return jsonReply(200, {
            id: 'test-id', object: 'chat.completion', created: 0, model: 'llama3-8b',
            choices: [{ index: 0, message: { role: 'assistant', content: 'hi' }, finish_reason: 'stop' }],
            usage,
          });
        }

        jsonReply(404, { error: 'not found' });
      });
    });

    mockServer.listen(0, '127.0.0.1', () => {
      mockPort = mockServer.address().port;
      resolve();
    });
  });
}

// ── Minimal Express-style req/res mock ────────────────────────────────────────

function makeMockReqRes(body = {}) {
  const req = {
    body,
    userId: 'test-user',
    apiKeyId: 'test-key',
    log: { error: () => {} },
  };
  const res = {
    _status: 200,
    _headers: {},
    _body: null,
    _ended: false,
    headersSent: false,
    status(code)   { this._status = code; return this; },
    set(k, v)      {
      if (typeof k === 'object') Object.assign(this._headers, k);
      else this._headers[k] = v;
      return this;
    },
    json(obj)      { this._body = obj; this._ended = true; this.headersSent = true; return this; },
    send(buf)      { this._body = buf; this._ended = true; this.headersSent = true; return this; },
    write()        { /* streaming — not validated in unit tests */ },
    end()          { this._ended = true; this.headersSent = true; },
  };
  return { req, res };
}

// ── Factory tests ─────────────────────────────────────────────────────────────

describe('getBackend() factory', () => {
  beforeEach(() => {
    _resetBackend();
    delete process.env.INFERENCE_BACKEND;
  });

  test('defaults to LocalInferenceBackend when INFERENCE_BACKEND is unset', () => {
    const backend = getBackend();
    assert.ok(backend instanceof LocalInferenceBackend, `expected Local, got ${backend.constructor.name}`);
  });

  test('returns LocalInferenceBackend when INFERENCE_BACKEND=local', () => {
    process.env.INFERENCE_BACKEND = 'local';
    const backend = getBackend();
    assert.ok(backend instanceof LocalInferenceBackend);
  });

  test('returns AwsInferenceBackend when INFERENCE_BACKEND=aws', () => {
    process.env.INFERENCE_BACKEND = 'aws';
    const backend = getBackend();
    assert.ok(backend instanceof AwsInferenceBackend);
  });

  test('returns same singleton on repeated calls', () => {
    const a = getBackend();
    const b = getBackend();
    assert.strictEqual(a, b);
  });
});

// ── AwsInferenceBackend fallback ──────────────────────────────────────────────

describe('AwsInferenceBackend — fallback when AWS vars absent', () => {
  test('name includes "fallback" when AWS env vars are not set', () => {
    const saved = { r: process.env.AWS_REGION, e: process.env.AWS_API_ENDPOINT };
    delete process.env.AWS_REGION;
    delete process.env.AWS_API_ENDPOINT;

    const backend = new AwsInferenceBackend();
    assert.match(backend.name, /fallback/, `expected fallback in name, got "${backend.name}"`);

    if (saved.r) process.env.AWS_REGION = saved.r;
    if (saved.e) process.env.AWS_API_ENDPOINT = saved.e;
  });
});

// ── LocalInferenceBackend end-to-end ─────────────────────────────────────────

describe('LocalInferenceBackend — end-to-end via inline mock server', () => {
  before(() => startMockServer());
  after(() => new Promise((resolve) => mockServer.close(resolve)));

  test('getModels() returns model list', async () => {
    const backend = new LocalInferenceBackend(`http://127.0.0.1:${mockPort}`);
    const models = await backend.getModels();
    assert.ok(Array.isArray(models));
    assert.ok(models.length > 0);
    assert.equal(models[0].id, 'llama3-8b');
  });

  test('chat() non-streaming resolves with usage', async () => {
    const backend = new LocalInferenceBackend(`http://127.0.0.1:${mockPort}`);
    const { req, res } = makeMockReqRes({
      model: 'llama3-8b',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false,
    });

    const result = await backend.chat(req, res, 'llama3-8b');
    assert.ok(result.usage, 'usage should be present');
    assert.equal(result.usage.prompt_tokens, 10);
    assert.equal(result.usage.completion_tokens, 9);
  });

  test('completions() non-streaming resolves with usage', async () => {
    const backend = new LocalInferenceBackend(`http://127.0.0.1:${mockPort}`);
    const { req, res } = makeMockReqRes({
      model: 'llama3-8b',
      prompt: 'Once upon a time',
      stream: false,
    });

    const result = await backend.completions(req, res, 'llama3-8b');
    assert.ok(result.usage, 'usage should be present');
    assert.equal(result.usage.total_tokens, 19);
  });

  test('chat() streaming completes without error', async () => {
    const backend = new LocalInferenceBackend(`http://127.0.0.1:${mockPort}`);
    const { req, res } = makeMockReqRes({
      model: 'llama3-8b',
      messages: [{ role: 'user', content: 'Stream this' }],
      stream: true,
    });

    const result = await backend.chat(req, res, 'llama3-8b');
    assert.ok(result !== undefined, 'should return a result object');
  });
});
