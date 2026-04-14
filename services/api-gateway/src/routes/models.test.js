'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

// Import the router and test it directly without HTTP
const { modelsRouter } = require('./models');

// Find a route handler by method + path in Express router stack
function findHandler(router, method, path) {
  for (const layer of router.stack) {
    if (layer.route && layer.route.path === path) {
      const handlers = layer.route.stack;
      const match = handlers.find((h) => layer.route.methods[method.toLowerCase()]);
      if (match) return match.handle;
    }
  }
  return null;
}

function makeReqRes(params = {}) {
  const req = { params };
  const res = {
    _status: 200,
    _body: null,
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
  };
  return { req, res };
}

test('GET /models returns list of models', () => {
  const handler = findHandler(modelsRouter, 'GET', '/');
  assert.ok(handler, 'handler should exist');

  const { req, res } = makeReqRes();
  handler(req, res);

  assert.equal(res._body.object, 'list');
  assert.ok(Array.isArray(res._body.data));
  assert.ok(res._body.data.length > 0);
  assert.equal(res._body.data[0].id, 'llama3-8b');
});

test('GET /models/:modelId returns specific model', () => {
  const handler = findHandler(modelsRouter, 'GET', '/:modelId');
  assert.ok(handler, 'handler should exist');

  const { req, res } = makeReqRes({ modelId: 'llama3-8b' });
  handler(req, res);

  assert.equal(res._body.id, 'llama3-8b');
  assert.equal(res._body.object, 'model');
  assert.equal(res._body.owned_by, 'cloudach');
});

test('GET /models/:modelId returns 404 for unknown model', () => {
  const handler = findHandler(modelsRouter, 'GET', '/:modelId');
  assert.ok(handler, 'handler should exist');

  const { req, res } = makeReqRes({ modelId: 'gpt-4' });
  handler(req, res);

  assert.equal(res._status, 404);
  assert.equal(res._body.error.type, 'invalid_request_error');
});
