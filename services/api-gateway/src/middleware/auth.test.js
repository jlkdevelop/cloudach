'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const { createAuthenticate } = require('./auth');

const JWT_SECRET = 'test-secret';

function makeReqRes(authHeader) {
  const req = {
    headers: authHeader ? { authorization: authHeader } : {},
    log: { error: () => {} },
  };
  const res = {
    _status: null,
    _body: null,
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
  };
  return { req, res };
}

function makeDb(rows = []) {
  return { query: async () => ({ rows }) };
}

function makeDbError() {
  return { query: async () => { throw new Error('db down'); } };
}

const authenticate = createAuthenticate({ db: makeDb(), jwtSecret: JWT_SECRET });

test('returns 401 when Authorization header is missing', async () => {
  const { req, res } = makeReqRes(null);
  await authenticate(req, res, () => {});
  assert.equal(res._status, 401);
  assert.equal(res._body.error.type, 'invalid_request_error');
});

test('returns 401 when Authorization has no Bearer prefix', async () => {
  const { req, res } = makeReqRes('Basic abc123');
  await authenticate(req, res, () => {});
  assert.equal(res._status, 401);
});

test('returns 401 for an unknown API key', async () => {
  const auth = createAuthenticate({ db: makeDb([]), jwtSecret: JWT_SECRET });
  const { req, res } = makeReqRes('Bearer sk-cloudach-notakey');
  await auth(req, res, () => {});
  assert.equal(res._status, 401);
  assert.equal(res._body.error.type, 'authentication_error');
});

test('returns 401 for a revoked API key', async () => {
  const auth = createAuthenticate({
    db: makeDb([{ id: 'key-id', user_id: 'user-1', revoked_at: new Date() }]),
    jwtSecret: JWT_SECRET,
  });
  const { req, res } = makeReqRes('Bearer sk-cloudach-revokedkey');
  await auth(req, res, () => {});
  assert.equal(res._status, 401);
  assert.equal(res._body.error.type, 'authentication_error');
});

test('calls next() and sets req.userId for a valid API key', async () => {
  const auth = createAuthenticate({
    db: makeDb([{ id: 'key-id', user_id: 'user-123', revoked_at: null }]),
    jwtSecret: JWT_SECRET,
  });
  const { req, res } = makeReqRes('Bearer sk-cloudach-validkey');
  let called = false;
  await auth(req, res, () => { called = true; });
  assert.ok(called, 'next() should be called');
  assert.equal(req.userId, 'user-123');
  assert.equal(req.apiKeyId, 'key-id');
});

test('returns 501 when DB throws during API key lookup', async () => {
  const auth = createAuthenticate({ db: makeDbError(), jwtSecret: JWT_SECRET });
  const { req, res } = makeReqRes('Bearer sk-cloudach-anykey');
  await auth(req, res, () => {});
  assert.equal(res._status, 500);
  assert.equal(res._body.error.type, 'api_error');
});

test('returns 401 for an invalid JWT', async () => {
  const { req, res } = makeReqRes('Bearer not.a.valid.jwt');
  await authenticate(req, res, () => {});
  assert.equal(res._status, 401);
  assert.equal(res._body.error.type, 'authentication_error');
});

test('returns 401 for an expired JWT', async () => {
  const expired = jwt.sign({ sub: 'user-abc' }, JWT_SECRET, { expiresIn: -1 });
  const { req, res } = makeReqRes(`Bearer ${expired}`);
  await authenticate(req, res, () => {});
  assert.equal(res._status, 401);
  assert.match(res._body.error.message, /expired/i);
});

test('calls next() and sets req.userId for a valid JWT', async () => {
  const token = jwt.sign({ sub: 'user-jwt-123' }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
  const { req, res } = makeReqRes(`Bearer ${token}`);
  let called = false;
  await authenticate(req, res, () => { called = true; });
  assert.ok(called, 'next() should be called');
  assert.equal(req.userId, 'user-jwt-123');
  assert.equal(req.apiKeyId, null);
});

test('returns 401 for JWT signed with wrong secret', async () => {
  const token = jwt.sign({ sub: 'user-abc' }, 'wrong-secret', { algorithm: 'HS256' });
  const { req, res } = makeReqRes(`Bearer ${token}`);
  await authenticate(req, res, () => {});
  assert.equal(res._status, 401);
});
