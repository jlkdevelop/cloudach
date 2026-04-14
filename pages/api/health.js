import { log } from '../../lib/logger';

const GATEWAY_URL = process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL || '';

async function checkDb() {
  if (!process.env.DATABASE_URL) return { status: 'unconfigured' };
  try {
    const { getDb } = await import('../../lib/db');
    const db = getDb();
    await db.query('SELECT 1');
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

async function checkGateway() {
  if (!GATEWAY_URL) return { status: 'unconfigured' };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${GATEWAY_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const body = await res.json();
      return { status: 'ok', checks: body.checks };
    }
    return { status: 'degraded', httpStatus: res.status };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const start = Date.now();
  const [db, gateway] = await Promise.all([checkDb(), checkGateway()]);

  const checks = { db, gateway };
  const allOk = Object.values(checks).every((c) => c.status === 'ok' || c.status === 'unconfigured');
  const httpStatus = allOk ? 200 : 503;

  const payload = {
    status: allOk ? 'ok' : 'degraded',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - start,
    checks,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      API_GATEWAY_URL: !!GATEWAY_URL,
    },
  };

  log.info({ event: 'health_check', status: payload.status, latencyMs: payload.latencyMs });

  return res.status(httpStatus).json(payload);
}
