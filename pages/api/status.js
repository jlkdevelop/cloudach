/**
 * GET /api/status
 *
 * Public status summary endpoint — safe to embed in a status page or ping from
 * an uptime monitor. Returns aggregated component health without exposing
 * internal error messages.
 */

const GATEWAY_URL = process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL || '';

// Cache gateway status for 15 s to avoid hammering it under load
let gatewayCache = null;
let gatewayCacheAt = 0;
const CACHE_TTL = 15_000;

async function fetchGatewayStatus() {
  if (gatewayCache && Date.now() - gatewayCacheAt < CACHE_TTL) {
    return gatewayCache;
  }

  if (!GATEWAY_URL) {
    return { operational: null, checks: null };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${GATEWAY_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    const body = res.ok ? await res.json() : null;
    const result = {
      operational: res.ok,
      checks: body?.checks ?? null,
    };
    gatewayCache = result;
    gatewayCacheAt = Date.now();
    return result;
  } catch {
    return { operational: false, checks: null };
  }
}

async function fetchDbStatus() {
  if (!process.env.DATABASE_URL) return { operational: null };
  try {
    const { getDb } = await import('../../lib/db');
    const db = getDb();
    await db.query('SELECT 1');
    return { operational: true };
  } catch {
    return { operational: false };
  }
}

function componentStatus(operational) {
  if (operational === null) return 'unknown';
  return operational ? 'operational' : 'outage';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const [db, gateway] = await Promise.all([fetchDbStatus(), fetchGatewayStatus()]);

  const components = {
    database: {
      name: 'Database',
      status: componentStatus(db.operational),
    },
    api_gateway: {
      name: 'API Gateway',
      status: componentStatus(gateway.operational),
      ...(gateway.checks && {
        dependencies: {
          redis: componentStatus(gateway.checks.redis === 'ok'),
          inference: componentStatus(gateway.checks.inference === 'ok'),
        },
      }),
    },
    dashboard: {
      name: 'Dashboard',
      status: 'operational',
    },
  };

  const anyOutage = Object.values(components).some((c) => c.status === 'outage');
  const anyUnknown = Object.values(components).some((c) => c.status === 'unknown');

  const overallStatus = anyOutage
    ? 'partial_outage'
    : anyUnknown
      ? 'unknown'
      : 'operational';

  res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');

  return res.status(200).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    components,
  });
}
