const ENTRIES = [
  {
    date: '2026-04-14',
    version: 'v1.0',
    tag: 'GA Release',
    items: [
      'GPU cost optimization engine: spot instance scheduling, preemption handling, automatic fallback to on-demand',
      'Autoscaling policies: time-based, load-based, and budget-aware scaling rules',
      'Batch pricing tier: up to 40% discount on asynchronous workloads',
      'Usage alerts: configurable thresholds (50/75/90/100%) with email and webhook delivery',
      'Spending limits dashboard: monthly budget caps, real-time burn-rate progress bar',
      'Alert history log with status tracking (sent, acknowledged, resolved)',
    ],
  },
  {
    date: '2026-04-07',
    version: 'v0.9.5',
    tag: 'Developer Experience',
    items: [
      'Webhook system: subscribe to inference.completed, usage.threshold, and billing.invoice events',
      'Webhook signatures: HMAC-SHA256 on every payload — verify with the X-Cloudach-Signature header',
      'Onboarding email sequence: 7-touch drip campaign triggered on signup',
      'Model selection guide and use-case matrix published to /docs',
      'Interactive API playground embedded in /docs — run live requests without leaving the page',
      'Improved dashboard error states with actionable recovery suggestions',
    ],
  },
  {
    date: '2026-03-24',
    version: 'v0.9',
    tag: 'Security',
    items: [
      'Auth hardening: bcrypt password hashing, JWT-based sessions, secure cookie flags',
      'Input validation and SQL-injection prevention across all API routes',
      'Rate limiting (60 RPM / 1M TPD) with sliding window and Retry-After header',
      'CORS policy tightened; X-Content-Type-Options, X-Frame-Options headers added',
      'API key stored as SHA-256 hash — raw key never persisted after creation',
    ],
  },
  {
    date: '2026-03-10',
    version: 'v0.8.5',
    tag: 'Enterprise',
    items: [
      'Enterprise page redesigned: SLA table, compliance badges, dedicated support callout',
      'Team management dashboard: invite members, assign roles (admin/developer/viewer), revoke access',
      'Fine-tuning workflow: LoRA adapter training, dataset upload, job queue, deployed adapter endpoints',
      'E2E test suite (Playwright): 18 critical-path tests covering auth, API keys, models, and billing',
      'SDK packages: official cloudach-python and cloudach-node on PyPI and npm',
    ],
  },
  {
    date: '2026-03-01',
    version: 'v0.8',
    tag: 'Infrastructure',
    items: [
      'Autoscaling from zero: GPU pods scale to 0 when idle, cold-start in ~30s',
      'Tenant isolation: per-tenant Kubernetes namespaces and network policies',
      'CI/CD pipeline: GitHub Actions → Docker build → GKE deploy on every merge to main',
      'Observability: Prometheus metrics, Grafana dashboards, PagerDuty alerting',
      'Multi-region deployment: US-east, EU-west routing with CDN edge caching',
    ],
  },
  {
    date: '2026-02-15',
    version: 'v0.7.5',
    tag: 'Performance',
    items: [
      'Dashboard performance: self-hosted fonts, HTTP caching headers, lazy-loaded charts',
      'CLI v0.1: cloudach chat, cloudach models list, cloudach keys create/revoke',
      'Monitoring and alerting: structured JSON logs, Datadog integration, custom dashboards',
      'API error reference: all error codes documented with causes and remediation steps',
      'Rate limit docs expanded: per-tier limits, burst budgets, and backoff examples',
    ],
  },
];

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default function handler(req, res) {
  const baseUrl = 'https://cloudach.com';

  const items = ENTRIES.map((entry) => {
    const title = `${entry.version} — ${entry.tag}`;
    const link = `${baseUrl}/changelog`;
    const description = escapeXml(entry.items.join('\n• '));
    const pubDate = new Date(entry.date).toUTCString();
    const guid = `${baseUrl}/changelog#${entry.version.replace(/\./g, '-')}`;

    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <description>• ${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${guid}</guid>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Cloudach Changelog</title>
    <link>${baseUrl}/changelog</link>
    <description>New features, improvements, and fixes shipped by the Cloudach team.</description>
    <language>en</language>
    <atom:link href="${baseUrl}/api/changelog/rss" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date(ENTRIES[0].date).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.status(200).send(xml);
}
