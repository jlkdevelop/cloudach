#!/usr/bin/env node
/**
 * check-api-contracts.js
 *
 * Validates that the API surface defined in api-contracts.json has not been
 * broken by recent changes. Runs as a CI step; exits with code 1 on failure.
 *
 * Usage:
 *   node scripts/check-api-contracts.js           # check mode (CI)
 *   node scripts/check-api-contracts.js --update  # regenerate lock file
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'pages', 'api');
const CONTRACTS_FILE = path.join(ROOT, 'api-contracts.json');
const UPDATE_MODE = process.argv.includes('--update');

// ---------------------------------------------------------------------------
// HTTP method inference
// ---------------------------------------------------------------------------

// We parse each handler file for method checks rather than importing it, so
// this works without a running Next.js server.
const METHOD_PATTERN = /req\.method\s*[!=]==?\s*['"]([A-Z]+)['"]/g;
const METHOD_NOT_PATTERN = /req\.method\s*!==?\s*['"]([A-Z]+)['"]/g;

function inferMethods(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const methods = new Set();

  // Explicit method checks: if (req.method === 'GET') → supports GET
  for (const m of src.matchAll(/req\.method\s*===?\s*['"]([A-Z]+)['"]/g)) {
    methods.add(m[1]);
  }

  // Method guards: if (req.method !== 'GET') return 405 → supports GET only
  for (const m of src.matchAll(/req\.method\s*!==?\s*['"]([A-Z]+)['"]/g)) {
    methods.add(m[1]);
  }

  // If no explicit method checks found, assume the handler accepts all methods
  if (methods.size === 0) {
    methods.add('GET');
    methods.add('POST');
    methods.add('PUT');
    methods.add('PATCH');
    methods.add('DELETE');
  }

  return [...methods].sort();
}

// ---------------------------------------------------------------------------
// Walk /pages/api and build current surface
// ---------------------------------------------------------------------------

function walk(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routes = {};
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = base + '/' + entry.name.replace(/\.(js|ts)$/, '');
    if (entry.isDirectory()) {
      Object.assign(routes, walk(full, rel));
    } else if (/\.(js|ts)$/.test(entry.name)) {
      const routePath = '/api' + rel;
      routes[routePath] = inferMethods(full);
    }
  }
  return routes;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const current = walk(API_DIR);

if (UPDATE_MODE) {
  const existing = JSON.parse(fs.readFileSync(CONTRACTS_FILE, 'utf8'));
  const updated = {
    ...existing,
    _updatedAt: new Date().toISOString(),
    endpoints: current,
  };
  fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(updated, null, 2) + '\n');
  console.log(`✅ api-contracts.json updated with ${Object.keys(current).length} endpoints.`);
  process.exit(0);
}

// Check mode
const locked = JSON.parse(fs.readFileSync(CONTRACTS_FILE, 'utf8'));
const lockedEndpoints = locked.endpoints || {};

let failures = 0;

// 1. Check for removed endpoints
for (const [route, lockedMethods] of Object.entries(lockedEndpoints)) {
  if (!current[route]) {
    console.error(`❌ REMOVED endpoint: ${route} — was ${lockedMethods.join(', ')}`);
    failures++;
    continue;
  }

  // 2. Check for removed methods
  for (const method of lockedMethods) {
    if (!current[route].includes(method)) {
      console.error(`❌ REMOVED method: ${method} ${route}`);
      failures++;
    }
  }
}

// Report new endpoints (informational only — not a failure)
for (const route of Object.keys(current)) {
  if (!lockedEndpoints[route]) {
    console.log(`ℹ️  New endpoint (not yet locked): ${route} — ${current[route].join(', ')}`);
  }
}

if (failures > 0) {
  console.error(
    `\n💥 ${failures} API contract violation(s) detected.` +
    `\n   Breaking changes require a new API version (see docs/api-versioning.md).` +
    `\n   If this is intentional, run: node scripts/check-api-contracts.js --update`
  );
  process.exit(1);
} else {
  console.log(`✅ API contracts OK — ${Object.keys(lockedEndpoints).length} endpoints verified.`);
  process.exit(0);
}
