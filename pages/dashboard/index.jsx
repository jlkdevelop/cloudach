import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (router.query.welcome === '1') {
      setShowWelcome(true);
      // Remove ?welcome=1 from URL without triggering a reload
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router.query.welcome]);

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { router.replace('/login'); return; }
      const { user } = await meRes.json();
      setUser(user);

      const [statsRes, usageRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/usage?limit=7'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usageRes.ok) {
        const d = await usageRes.json();
        setDaily(d.daily || []);
      }
      setLoading(false);
    }
    init();
  }, [router]);

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
    </div>
  );

  const maxTokens = Math.max(...daily.map(d => parseInt(d.tokens || 0, 10)), 1);

  return (
    <>
      <Head><title>Dashboard — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Overview</h1>
          <p className="db-page-subtitle">Welcome back, {user.email}</p>
        </div>

        {/* Quickstart guide — shown after signup */}
        {showWelcome && (
          <div className="db-welcome-banner">
            <button
              className="db-welcome-close"
              onClick={() => setShowWelcome(false)}
              aria-label="Dismiss"
            >
              ×
            </button>
            <div className="db-welcome-title">Welcome to Cloudach!</div>
            <p className="db-welcome-sub">Get up and running in three steps:</p>
            <div className="db-welcome-steps">
              <div className="db-welcome-step">
                <div className="db-welcome-step-num">1</div>
                <div>
                  <div className="db-welcome-step-title">Create an API key</div>
                  <div className="db-welcome-step-desc">
                    Go to <Link href="/dashboard/api-keys">API Keys</Link> and create your first key.
                  </div>
                </div>
              </div>
              <div className="db-welcome-step">
                <div className="db-welcome-step-num">2</div>
                <div>
                  <div className="db-welcome-step-title">Choose a model</div>
                  <div className="db-welcome-step-desc">
                    Browse available LLMs in <Link href="/dashboard/models">Models</Link> and deploy one.
                  </div>
                </div>
              </div>
              <div className="db-welcome-step">
                <div className="db-welcome-step-num">3</div>
                <div>
                  <div className="db-welcome-step-title">Make your first request</div>
                  <div className="db-welcome-step-desc">
                    Use the OpenAI-compatible API with your key:
                  </div>
                  <pre className="db-welcome-code">{`curl https://api.cloudach.com/v1/chat/completions \\
  -H "Authorization: Bearer <your-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"llama3-8b","messages":[{"role":"user","content":"Hello!"}]}'`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="db-stats-grid">
          <StatCard
            label="Requests Today"
            value={loading ? '—' : stats?.requestsToday?.toLocaleString()}
            sub="API calls in the last 24h"
          />
          <StatCard
            label="Total Requests"
            value={loading ? '—' : stats?.totalRequests?.toLocaleString()}
            sub="All time"
          />
          <StatCard
            label="Tokens Used"
            value={loading ? '—' : formatTokens(stats?.totalTokens)}
            sub="Cumulative"
          />
          <StatCard
            label="Est. Cost This Month"
            value={loading ? '—' : formatCost(stats?.estimatedCostThisMonth)}
            sub={stats?.billingPeriod ? `${stats.billingPeriod.start} – ${stats.billingPeriod.end}` : 'Current billing period'}
          />
          <StatCard
            label="Active Models"
            value={loading ? '—' : stats?.activeDeployments}
            sub="Running endpoints"
          />
          <StatCard
            label="API Keys"
            value={loading ? '—' : stats?.apiKeyCount}
            sub="Active (not revoked)"
          />
        </div>

        {/* Usage chart */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Token usage — last 7 days</span>
          </div>
          {daily.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon">📊</div>
              <div className="db-empty-title">No usage yet</div>
              <div className="db-empty-desc">Make your first API request to see data here.</div>
            </div>
          ) : (
            <div className="db-chart">
              {daily.map((d) => {
                const tokens = parseInt(d.tokens || 0, 10);
                const pct = Math.max((tokens / maxTokens) * 100, 5);
                const day = new Date(d.day).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={d.day} className="db-bar-wrap" title={`${tokens.toLocaleString()} tokens`}>
                    <div className="db-bar" style={{ height: `${pct}%` }} />
                    <span className="db-bar-label">{day}</span>
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

function StatCard({ label, value, sub }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-label">{label}</div>
      <div className="db-stat-value">{value ?? '—'}</div>
      {sub && <div className="db-stat-sub">{sub}</div>}
    </div>
  );
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
