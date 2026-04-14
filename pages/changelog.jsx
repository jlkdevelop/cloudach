import Head from 'next/head';
import Link from 'next/link';

const ENTRIES = [
  {
    date: 'Apr 2026',
    version: 'v0.9',
    tag: 'Security',
    color: '#DC2626',
    bg: '#FEF2F2',
    items: [
      'Auth hardening: bcrypt password hashing, JWT-based sessions, secure cookie flags',
      'Input validation and SQL-injection prevention across all API routes',
      'Rate limiting (60 RPM / 1M TPD) with sliding window and Retry-After header',
      'CORS policy tightened; X-Content-Type-Options, X-Frame-Options headers added',
      'API key stored as SHA-256 hash — raw key never persisted after creation',
    ],
  },
  {
    date: 'Apr 2026',
    version: 'v0.8',
    tag: 'Infrastructure',
    color: '#0891B2',
    bg: '#ECFEFF',
    items: [
      'Autoscaling from zero: GPU pods scale to 0 when idle, cold-start in ~30s',
      'Tenant isolation: per-tenant Kubernetes namespaces and network policies',
      'CI/CD pipeline: GitHub Actions → Docker build → GKE deploy on every merge to main',
      'Observability: Prometheus metrics, Grafana dashboards, PagerDuty alerting',
      'Cost model: per-tenant billing aggregation, token counting middleware',
    ],
  },
  {
    date: 'Mar 2026',
    version: 'v0.7',
    tag: 'Dashboard',
    color: '#7C3AED',
    bg: '#F5F3FF',
    items: [
      'API Keys page: create, name, copy, and revoke keys with one click',
      'Usage page: daily token consumption charts, per-model breakdown',
      'Models page: model catalog with context window, pricing, and status indicators',
      'Settings page: account management, password change, danger zone',
      'ErrorBoundary: graceful fallback UI for dashboard render errors',
    ],
  },
  {
    date: 'Mar 2026',
    version: 'v0.6',
    tag: 'API',
    color: '#059669',
    bg: '#ECFDF5',
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
    color: '#D97706',
    bg: '#FFFBEB',
    items: [
      'Llama 3 8B deployed on vLLM — 8K context, sub-100ms median TTFT',
      'Llama 3 70B available on dedicated GPU tier',
      'Mistral 7B: 32K context window, EU-hosted option',
      'Mixtral 8×7B: mixture-of-experts, highest accuracy tier',
      'Benchmark results: 96ms p50 TTFT on Llama 3 8B at 10 RPS',
    ],
  },
  {
    date: 'Feb 2026',
    version: 'v0.4',
    tag: 'Platform',
    color: '#6366F1',
    bg: '#EEF2FF',
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
    color: '#374151',
    bg: '#F9FAFB',
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
      </Head>

      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0D0F1A' }}>
        {/* Nav */}
        <nav style={{ borderBottom: '1px solid #E5E7EB', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 32, height: 60 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#6366F1' }}>Cloudach</span>
          </Link>
          <Link href="/docs" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Docs</Link>
          <Link href="/changelog" style={{ fontSize: 14, fontWeight: 500, color: '#6366F1', textDecoration: 'none' }}>Changelog</Link>
          <Link href="/dashboard" style={{ fontSize: 14, color: '#6B7280', textDecoration: 'none' }}>Dashboard</Link>
          <div style={{ flex: 1 }} />
          <Link href="/signup">
            <button style={{ background: '#6366F1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Get started free
            </button>
          </Link>
        </nav>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px' }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, marginBottom: 8 }}>Changelog</h1>
          <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 56, lineHeight: 1.6 }}>
            Everything we've shipped — models, API features, platform improvements, and security hardening.
            Subscribe to <a href="/blog" style={{ color: '#6366F1', textDecoration: 'none' }}>the blog</a> for major announcements.
          </p>

          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: '#E5E7EB' }} />

            {ENTRIES.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: 32, marginBottom: 48, position: 'relative' }}>
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
                      <li key={j} style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: '#9CA3AF' }}>
            <Link href="/docs" style={{ color: '#9CA3AF', textDecoration: 'none' }}>API Docs</Link>
            <Link href="/blog" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Blog</Link>
            <Link href="/status" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Status</Link>
            <a href="mailto:support@cloudach.com" style={{ color: '#9CA3AF', textDecoration: 'none' }}>support@cloudach.com</a>
          </div>
        </div>
      </div>
    </>
  );
}
