#!/usr/bin/env node
/**
 * cloudach CLI v0.1
 * Config via env vars:
 *   CLOUDACH_API_KEY   — your API key (required)
 *   CLOUDACH_API_URL   — base URL (default: https://api.cloudach.com)
 */

const https = require('https');
const http = require('http');
const url = require('url');

const BASE_URL = (process.env.CLOUDACH_API_URL || 'https://api.cloudach.com').replace(/\/$/, '');
const API_KEY = process.env.CLOUDACH_API_KEY || '';

// ── helpers ──────────────────────────────────────────────────────────────────

function apiRequest(path, opts = {}) {
  return new Promise((resolve, reject) => {
    if (!API_KEY) {
      console.error('Error: CLOUDACH_API_KEY is not set.');
      console.error('  export CLOUDACH_API_KEY=sk-cloudach-...');
      process.exit(1);
    }
    const fullUrl = `${BASE_URL}${path}`;
    const parsed = url.parse(fullUrl);
    const transport = parsed.protocol === 'https:' ? https : http;
    const body = opts.body ? JSON.stringify(opts.body) : undefined;
    const reqOpts = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.path,
      method: opts.method || 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    };
    const req = transport.request(reqOpts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function pad(str, n) {
  const s = String(str ?? '');
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length);
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── commands ─────────────────────────────────────────────────────────────────

async function cmdDeploy(args) {
  const modelId = args[0];
  if (!modelId) {
    console.error('Usage: cloudach deploy <model-id>');
    console.error('  e.g. cloudach deploy llama3-8b');
    process.exit(1);
  }
  console.log(`Deploying ${modelId}…`);
  const res = await apiRequest('/v1/dashboard/models', {
    method: 'POST',
    body: { modelId },
  });
  if (res.status >= 400) {
    console.error(`Error ${res.status}: ${res.body?.error || JSON.stringify(res.body)}`);
    process.exit(1);
  }
  console.log(`Deploy started. Polling for active status…`);

  // Poll up to 30s
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const poll = await apiRequest('/v1/dashboard/models');
    if (poll.status === 200) {
      const models = poll.body?.models || [];
      const m = models.find(x => x.model_id === modelId);
      if (m?.deploy_status === 'active') {
        console.log(`✓ ${modelId} is active.`);
        if (m.endpoint_url) console.log(`  Endpoint: ${m.endpoint_url}`);
        return;
      }
      process.stdout.write('.');
    }
  }
  console.log('\nTimed out. The model may still be starting — run "cloudach models" to check status.');
}

async function cmdModels() {
  const res = await apiRequest('/v1/dashboard/models');
  if (res.status >= 400) {
    console.error(`Error ${res.status}: ${res.body?.error || JSON.stringify(res.body)}`);
    process.exit(1);
  }
  const models = res.body?.models || [];
  if (models.length === 0) {
    console.log('No models available.');
    return;
  }
  console.log(pad('ID', 20) + pad('Name', 28) + pad('Status', 14) + 'Endpoint');
  console.log('─'.repeat(90));
  for (const m of models) {
    console.log(
      pad(m.model_id, 20) +
      pad(m.display_name, 28) +
      pad(m.deploy_status || 'not deployed', 14) +
      (m.endpoint_url || '—')
    );
  }
}

async function cmdLogs(args) {
  let limit = 20;
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--limit' || args[i] === '-n') && args[i + 1]) {
      limit = parseInt(args[i + 1], 10) || 20;
    }
  }
  const res = await apiRequest(`/v1/dashboard/usage?limit=${limit}`);
  if (res.status >= 400) {
    console.error(`Error ${res.status}: ${res.body?.error || JSON.stringify(res.body)}`);
    process.exit(1);
  }
  const logs = res.body?.logs || [];
  if (logs.length === 0) {
    console.log('No usage logs yet.');
    return;
  }
  console.log(pad('Time', 20) + pad('Model', 18) + pad('Tokens', 10) + pad('Status', 8) + 'Key');
  console.log('─'.repeat(80));
  for (const l of logs) {
    console.log(
      pad(fmtDate(l.created_at), 20) +
      pad(l.model, 18) +
      pad(l.total_tokens ?? '—', 10) +
      pad(l.status_code ?? '—', 8) +
      (l.api_key_name || '—')
    );
  }
}

async function cmdKeys(args) {
  const sub = args[0];

  if (!sub || sub === 'list') {
    const res = await apiRequest('/v1/dashboard/api-keys');
    if (res.status >= 400) {
      console.error(`Error ${res.status}: ${res.body?.error || JSON.stringify(res.body)}`);
      process.exit(1);
    }
    const keys = res.body?.keys || [];
    if (keys.length === 0) {
      console.log('No API keys. Create one with: cloudach keys create <name>');
      return;
    }
    console.log(pad('Name', 24) + pad('Status', 10) + pad('Created', 22) + 'Last used');
    console.log('─'.repeat(80));
    for (const k of keys) {
      console.log(
        pad(k.name, 24) +
        pad(k.revoked_at ? 'revoked' : 'active', 10) +
        pad(fmtDate(k.created_at), 22) +
        fmtDate(k.last_used_at)
      );
    }
    return;
  }

  if (sub === 'create') {
    const name = args[1];
    if (!name) {
      console.error('Usage: cloudach keys create <name> [--rpm <rate-limit>]');
      process.exit(1);
    }
    const body = { name };
    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--rpm' && args[i + 1]) {
        body.rate_limit_rpm = parseInt(args[i + 1], 10);
      }
    }
    const res = await apiRequest('/v1/dashboard/api-keys', { method: 'POST', body });
    if (res.status >= 400) {
      console.error(`Error ${res.status}: ${res.body?.error || JSON.stringify(res.body)}`);
      process.exit(1);
    }
    console.log(`Key created: ${res.body.rawKey}`);
    console.log('Copy this now — it will not be shown again.');
    return;
  }

  if (sub === 'revoke') {
    const keyId = args[1];
    if (!keyId) {
      console.error('Usage: cloudach keys revoke <key-id>');
      process.exit(1);
    }
    const res = await apiRequest(`/v1/dashboard/api-keys/${keyId}/revoke`, { method: 'POST' });
    if (res.status >= 400) {
      console.error(`Error ${res.status}: ${res.body?.error || JSON.stringify(res.body)}`);
      process.exit(1);
    }
    console.log(`Key ${keyId} revoked.`);
    return;
  }

  console.error(`Unknown keys subcommand: ${sub}`);
  console.error('Usage: cloudach keys [list|create|revoke]');
  process.exit(1);
}

function printHelp() {
  console.log(`cloudach CLI v0.1

Usage:
  cloudach deploy <model-id>             Deploy a model and wait for it to go active
  cloudach models                        List all available models and their status
  cloudach logs [--limit N]              Show recent API request logs (default: last 20)
  cloudach keys [list]                   List your API keys
  cloudach keys create <name> [--rpm N]  Create a new API key
  cloudach keys revoke <key-id>          Revoke an API key

Config (env vars):
  CLOUDACH_API_KEY   Your API key (required)
  CLOUDACH_API_URL   API base URL (default: https://api.cloudach.com)

Examples:
  export CLOUDACH_API_KEY=sk-cloudach-...
  cloudach models
  cloudach deploy llama3-8b
  cloudach logs --limit 50
  cloudach keys create "my-server"
`);
}

// ── main ─────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const cmd = argv[0];
const rest = argv.slice(1);

(async () => {
  switch (cmd) {
    case 'deploy':  await cmdDeploy(rest); break;
    case 'models':  await cmdModels(); break;
    case 'logs':    await cmdLogs(rest); break;
    case 'keys':    await cmdKeys(rest); break;
    case 'help':
    case '--help':
    case '-h':
    case undefined: printHelp(); break;
    default:
      console.error(`Unknown command: ${cmd}`);
      console.error('Run "cloudach help" for usage.');
      process.exit(1);
  }
})();
