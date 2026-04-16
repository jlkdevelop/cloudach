import { useEffect, useState, Suspense, lazy, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout, { PageLoader, ErrorBanner } from '../../components/dashboard/DashboardLayout';
import SpendingProgress from '../../components/dashboard/SpendingProgress';

const OnboardingChecklist = lazy(() => import('../../components/dashboard/OnboardingChecklist'));

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [alertConfig, setAlertConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Clean up ?welcome=1 query param from signup redirect
    if (router.query.welcome === '1') {
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router.query.welcome]);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.replace('/login'); return; }
        const { user } = await meRes.json();
        setUser(user);
        setLoading(false);

        // Load stats separately so the page shell renders immediately
        const [statsRes, usageRes, alertsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/usage?limit=7'),
          fetch('/api/dashboard/alerts'),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        else setError('Failed to load stats. Please refresh.');
        if (usageRes.ok) {
          const d = await usageRes.json();
          setDaily(d.daily || []);
        }
        if (alertsRes.ok) {
          const d = await alertsRes.json();
          if (d.config?.monthlyBudget) {
            setAlertConfig({ budget: d.config.monthlyBudget, spend: d.currentMonthSpend, thresholds: d.config.thresholds });
          }
        }
      } catch {
        setError('Network error. Please check your connection and refresh.');
        setLoading(false);
      } finally {
        setStatsLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading || !user) return <PageLoader />;

  const maxTokens = Math.max(...daily.map(d => parseInt(d.tokens || 0, 10)), 1);
  const greeting = getGreeting();
  const firstName = user.email.split('@')[0];

  return (
    <>
      <Head><title>Dashboard — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">{greeting}, {firstName}</h1>
          <p className="db-page-subtitle">
            Here&rsquo;s what&rsquo;s happening with your infrastructure today.
            <span className="db-page-date">{formatDate()}</span>
          </p>
        </div>

        {/* What's new banner */}
        <Link href="/changelog" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 4, padding: '1px 8px', flexShrink: 0 }}>NEW</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: 500, flex: 1 }}>
              Cloudach v1.0 is GA — GPU cost optimization, usage alerts, spending limits, and more.
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500, flexShrink: 0 }}>See changelog →</span>
          </div>
        </Link>

        {error && <ErrorBanner message={error} />}

        {/* Persistent onboarding checklist — lazy-loaded, shown until all steps complete or dismissed */}
        <Suspense fallback={null}>
          <OnboardingChecklist stats={stats} />
        </Suspense>

        {/* Stats */}
        <div className="db-stats-grid">
          <StatCard loading={statsLoading} label="Requests Today" value={stats?.requestsToday?.toLocaleString()} sub="API calls in the last 24h" />
          <StatCard loading={statsLoading} label="Total Requests" value={stats?.totalRequests?.toLocaleString()} sub="All time" />
          <StatCard loading={statsLoading} label="Tokens Used" value={formatTokens(stats?.totalTokens)} sub="Cumulative" />
          <StatCard loading={statsLoading} label="Est. Cost This Month" value={formatCost(stats?.estimatedCostThisMonth)} sub={stats?.billingPeriod ? `${stats.billingPeriod.start} – ${stats.billingPeriod.end}` : 'Current billing period'} />
          <StatCard loading={statsLoading} label="Active Models" value={stats?.activeDeployments} sub="Running endpoints" />
          <StatCard loading={statsLoading} label="API Keys" value={stats?.apiKeyCount} sub="Active (not revoked)" />
        </div>

        {/* Spending progress — only shown when budget is configured */}
        {alertConfig && (
          <SpendingProgress
            spend={alertConfig.spend}
            budget={alertConfig.budget}
            thresholds={alertConfig.thresholds}
          />
        )}

        {/* Usage chart */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Token usage — last 7 days</span>
          </div>
          {statsLoading ? (
            <div className="db-chart-skeleton">
              {[60, 80, 45, 90, 55, 70, 40].map((h, i) => (
                <div key={i} className="db-skeleton-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : daily.length === 0 ? (
            <div className="db-empty">
              <IconChartEmpty />
              <div className="db-empty-title">No usage yet</div>
              <div className="db-empty-desc">Make your first API request to see data here.</div>
              <Link href="/dashboard/models">
                <button className="db-btn db-btn--primary db-btn--sm" style={{ marginTop: 14 }}>
                  Deploy a model
                </button>
              </Link>
            </div>
          ) : (
            <div className="db-chart">
              {daily.map((d) => {
                const tokens = parseInt(d.tokens || 0, 10);
                const pct = Math.max((tokens / maxTokens) * 100, 5);
                const day = new Date(d.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                return (
                  <div key={d.day} className="db-bar-wrap" title={`${day}: ${tokens.toLocaleString()} tokens`}>
                    <div className="db-bar" style={{ height: `${pct}%` }} />
                    <span className="db-bar-label">{new Date(d.day).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Quick actions</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/dashboard/models">
              <button className="db-btn db-btn--primary">Deploy a model</button>
            </Link>
            <Link href="/dashboard/api-keys">
              <button className="db-btn db-btn--ghost">Create API key</button>
            </Link>
            <Link href="/dashboard/usage">
              <button className="db-btn db-btn--ghost">View usage logs</button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}

function StatCard({ label, value, sub, loading }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">{label}</div>
      {loading ? (
        <>
          <div className="db-skeleton db-skeleton--value" />
          <div className="db-skeleton db-skeleton--sub" />
        </>
      ) : (
        <>
          <div className="db-stat-value">{value ?? '—'}</div>
          {sub && <div className="db-stat-sub">{sub}</div>}
        </>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTokens(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(n) {
  if (n == null) return '—';
  if (n < 0.01) return n === 0 ? '$0.00' : `<$0.01`;
  return `$${n.toFixed(2)}`;
}

function IconChartEmpty() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      style={{ margin: '0 auto 12px', display: 'block', color: '#D1D5DB' }}
    >
      <rect x="4" y="28" width="6" height="8" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="13" y="20" width="6" height="16" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="22" y="14" width="6" height="22" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="31" y="8" width="6" height="28" rx="2" fill="currentColor" opacity="0.5" />
      <path d="M4 37h33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
