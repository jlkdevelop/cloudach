import Head from 'next/head';
import Link from 'next/link';

const ENTRIES = [
  {
    date: 'Apr 2026',
    version: 'v1.0',
    tag: 'GA Release',
    color: 'var(--brand)',
    bg: 'rgba(255,255,255,0.07)',
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
    date: 'Apr 2026',
    version: 'v0.9.5',
    tag: 'Developer Experience',
    color: '#6ee7b7',
    bg: 'rgba(34,197,94,0.10)',
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
    date: 'Mar 2026',
    version: 'v0.9',
    tag: 'Security',
    color: '#fca5a5',
    bg: 'rgba(239,68,68,0.10)',
    items: [
      'Auth hardening: bcrypt password hashing, JWT-based sessions, secure cookie flags',
      'Input validation and SQL-injection prevention across all API routes',
      'Rate limiting (60 RPM / 1M TPD) with sliding window and Retry-After header',
      'CORS policy tightened; X-Content-Type-Options, X-Frame-Options headers added',
      'API key stored as SHA-256 hash — raw key never persisted after creation',
    ],
  },
  {
    date: 'Mar 2026',
    version: 'v0.8.5',
    tag: 'Enterprise',
    color: '#67e8f9',
    bg: 'rgba(8,145,178,0.10)',
    items: [
      'Enterprise page redesigned: SLA table, compliance badges, dedicated support callout',
      'Team management dashboard: invite members, assign roles (admin/developer/viewer), revoke access',
      'Fine-tuning workflow: LoRA adapter training, dataset upload, job queue, deployed adapter endpoints',
      'E2E test suite (Playwright): 18 critical-path tests covering auth, API keys, models, and billing',
      'SDK packages: official cloudach-python and cloudach-node on PyPI and npm',
    ],
  },
  {
    date: 'Mar 2026',
    version: 'v0.8',
    tag: 'Infrastructure',
    color: '#c4b5fd',
    bg: 'rgba(124,58,237,0.10)',
    items: [
      'Autoscaling from zero: GPU pods scale to 0 when idle, cold-start in ~30s',
      'Tenant isolation: per-tenant Kubernetes namespaces and network policies',
      'CI/CD pipeline: GitHub Actions → Docker build → GKE deploy on every merge to main',
      'Observability: Prometheus metrics, Grafana dashboards, PagerDuty alerting',
      'Multi-region deployment: US-east, EU-west routing with CDN edge caching',
    ],
  },
  {
    date: 'Feb 2026',
    version: 'v0.7.5',
    tag: 'Performance',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.10)',
    items: [
      'Dashboard performance: self-hosted fonts, HTTP caching headers, lazy-loaded charts',
      'CLI v0.1: cloudach chat, cloudach models list, cloudach keys create/revoke',
      'Monitoring and alerting: structured JSON logs, Datadog integration, custom dashboards',
      'API error reference: all error codes documented with causes and remediation steps',
      'Rate limit docs expanded: per-tier limits, burst budgets, and backoff examples',
    ],
  },
  {
    date: 'Feb 2026',
    version: 'v0.7',
    tag: 'Dashboard',
    color: 'var(--text-2)',
    bg: 'var(--bg-2)',
    items: [
      'API Keys page: create, name, copy, and revoke keys with one click',
      'Usage page: daily token consumption charts, per-model breakdown',
      'Models page: model catalog with context window, pricing, and status indicators',
      'Settings page: account management, password change, danger zone',
      'ErrorBoundary: graceful fallback UI for dashboard render errors',
    ],
  },
  {
    date: 'Feb 2026',
    version: 'v0.6',
    tag: 'API',
    color: '#6ee7b7',
    bg: 'rgba(34,197,94,0.10)',
    items: [
      'POST /v1/chat/completions: OpenAI-compatible chat endpoint with streaming (SSE)',
      'POST /v1/completions: legacy text completion endpoint',
      'GET /v1/models and GET /v1/models/:id: model catalog endpoints',
      'GET /health: unauthenticated health check endpoint',
      'Streaming: Server-Sent Events with delta chunks and [DONE] terminator',
    ],
  },
  {
    date: 'Feb 2026',
    version: 'v0.5',
    tag: 'Models',
    color: '#67e8f9',
    bg: 'rgba(8,145,178,0.10)',
    items: [
      'Llama 3 8B deployed on vLLM — 8K context, sub-100ms median TTFT',
      'Llama 3 70B available on dedicated GPU tier',
      'Mistral 7B: 32K context window, EU-hosted option',
      'Mixtral 8×7B: mixture-of-experts, highest accuracy tier',
      'Benchmark results: 96ms p50 TTFT on Llama 3 8B at 10 RPS',
    ],
  },
  {
    date: 'Jan 2026',
    version: 'v0.4',
    tag: 'Platform',
    color: 'var(--brand)',
    bg: 'rgba(255,255,255,0.07)',
    items: [
      'Neon Postgres integration: connection pooling, SSL-only, combined schema migration',
      'Auth system: /api/auth/register, /login, /logout with secure session management',
      'API gateway service: request routing, auth middleware, token metering',
      'Vercel deployment: serverless Next.js frontend, edge config for API base URL',
    ],
  },
  {
    date: 'Jan 2026',
    version: 'v0.1',
    tag: 'Launch',
    color: 'var(--text-2)',
    bg: 'var(--bg-2)',
    items: [
      'Initial commit: Next.js frontend, Kubernetes manifests, Docker configuration',
      'Brand identity: Cloudach logo, indigo/white design system',
      'Public landing page with pricing, feature highlights, and CTA',
      'Blog: first post on the product vision and developer-first approach',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <Head>
        <title>Changelog — Cloudach</title>
        <meta name="description" content="Everything we've shipped: new models, API features, platform improvements, and security updates." />
        <meta property="og:title" content="Changelog — Cloudach" />
        <meta property="og:description" content="Everything we've shipped: new models, API features, platform improvements, and security updates." />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content="https://cloudach.com/changelog" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Changelog — Cloudach" />
        <meta name="twitter:description" content="Everything we've shipped: new models, API features, platform improvements, and security updates." />
        <meta name="twitter:image" content="https://cloudach.com/og-image.png" />
        <link rel="alternate" type="application/rss+xml" title="Cloudach Changelog RSS" href="/api/changelog/rss" />
      </Head>

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text-1)', background: '#ffffff', minHeight: '100vh' }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 32, height: 60 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--brand)' }}>Cloudach</span>
          </Link>
          <Link href="/docs" style={{ fontSize: 14, color: 'var(--text-2)', textDecoration: 'none' }}>Docs</Link>
          <Link href="/changelog" style={{ fontSize: 14, fontWeight: 500, color: 'var(--brand)', textDecoration: 'none' }}>Changelog</Link>
          <Link href="/dashboard" style={{ fontSize: 14, color: 'var(--text-2)', textDecoration: 'none' }}>Dashboard</Link>
          <div style={{ flex: 1 }} />
          <Link href="/signup">
            <button style={{ background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Get started free
            </button>
          </Link>
        </nav>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, margin: 0 }}>Changelog</h1>
            <a
              href="/api/changelog/rss"
              title="Subscribe via RSS"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fbbf24', fontWeight: 500, textDecoration: 'none', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 6, padding: '5px 12px', marginTop: 8 }}
            >
              <RssIcon /> RSS Feed
            </a>
          </div>
          <p style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 56, lineHeight: 1.6 }}>
            Everything we&apos;ve shipped — models, API features, platform improvements, and security hardening.
            Subscribe to <a href="/blog" style={{ color: 'var(--brand)', textDecoration: 'none' }}>the blog</a> for major announcements.
          </p>

          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />

            {ENTRIES.map((entry, i) => (
              <div key={i} id={`v${entry.version.replace('.', '-')}`} style={{ display: 'flex', gap: 32, marginBottom: 48, position: 'relative' }}>
                {/* Dot */}
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: entry.color, marginTop: 6, flexShrink: 0, zIndex: 1, marginLeft: -5 }} />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>{entry.date}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: entry.color, background: entry.bg, padding: '2px 9px', borderRadius: 5 }}>{entry.tag}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace' }}>{entry.version}</span>
                  </div>

                  <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
                    {entry.items.map((item, j) => (
                      <li key={j} style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-2)' }}>
            <Link href="/docs" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>API Docs</Link>
            <Link href="/blog" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Blog</Link>
            <Link href="/status" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Status</Link>
            <a href="/api/changelog/rss" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>RSS</a>
            <a href="mailto:support@cloudach.com" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>support@cloudach.com</a>
          </div>
        </div>
      </div>
    </>
  );
}

function RssIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M3.75 3a.75.75 0 0 0 0 1.5A11.75 11.75 0 0 1 15.5 16.25a.75.75 0 0 0 1.5 0A13.25 13.25 0 0 0 3.75 3ZM3.75 7.5a.75.75 0 0 0 0 1.5A7.25 7.25 0 0 1 11 16.25a.75.75 0 0 0 1.5 0A8.75 8.75 0 0 0 3.75 7.5ZM5 15a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );
}
