'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { createRateLimiter } = require('./rateLimiter');

const RPM_LIMIT = parseInt(process.env.RATE_LIMIT_RPM || '60', 10);

function makeRedis(returnValue) {
  return { eval: async () => returnValue };
}

function makeRedisError() {
  return { eval: async () => { throw new Error('redis down'); } };
}

function makeReqRes(userId = 'user-1') {
  const req = {
    userId,
    log: { warn: () => {} },
  };
  const res = {
    _status: null,
    _body: null,
    _headers: {},
    status(code) { this._status = code; return this; },
    json(body) { this._body = body; return this; },
    set(k, v) { this._headers[k] = v; return this; },
  };
  return { req, res };
}

test('calls next() when under the rate limit', async () => {
  const rateLimiter = createRateLimiter({ redis: makeRedis(1) });
  const { req, res } = makeReqRes();
  let called = false;
  await rateLimiter(req, res, () => { called = true; });
  assert.ok(called, 'next() should be called');
  assert.equal(res._status, null);
});

test('returns 429 when rate limit is exceeded', async () => {
  const rateLimiter = createRateLimiter({ redis: makeRedis(RPM_LIMIT + 1) });
  const { req, res } = makeReqRes();
  let called = false;
  await rateLimiter(req, res, () => { called = true; });
  assert.equal(called, false, 'next() should not be called');
  assert.equal(res._status, 429);
  assert.equal(res._body.error.code, 'rate_limit_exceeded');
  assert.ok(res._headers['Retry-After'], 'should set Retry-After header');
});

test('allows request when Redis errors (fail-open)', async () => {
  const rateLimiter = createRateLimiter({ redis: makeRedisError() });
  const { req, res } = makeReqRes();
  let called = false;
  await rateLimiter(req, res, () => { called = true; });
  assert.ok(called, 'next() should be called on Redis error');
});

test('attaches trackTokens function to req after passing', async () => {
  const rateLimiter = createRateLimiter({ redis: makeRedis(1) });
  const { req } = makeReqRes();
  await rateLimiter(req, {}, () => {});
  assert.equal(typeof req.trackTokens, 'function');
});

test('trackTokens resolves without throwing when Redis errors', async () => {
  let callCount = 0;
  const redis = {
    eval: async () => {
      callCount++;
      if (callCount === 1) return 1; // RPM check passes
      throw new Error('redis down'); // token track fails silently
    },
  };
  const rateLimiter = createRateLimiter({ redis });
  const { req } = makeReqRes();
  await rateLimiter(req, {}, () => {});
  await assert.doesNotReject(() => req.trackTokens(100, 50));
});

test('uses exact rpm limit boundary — request at limit passes', async () => {
  const rateLimiter = createRateLimiter({ redis: makeRedis(RPM_LIMIT) });
  const { req, res } = makeReqRes();
  let called = false;
  await rateLimiter(req, res, () => { called = true; });
  assert.ok(called, 'request exactly at limit should pass');
});
