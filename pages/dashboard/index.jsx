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

  if (!user) return null;

  const maxTokens = Math.max(...daily.map(d => parseInt(d.tokens || 0, 10)), 1);

  return (
    <>
      <Head><title>Dashboard — Cloudach</title></Head>
      <DashboardLayout user={user}>
        <div className="db-page-header">
          <h1 className="db-page-title">Overview</h1>
          <p className="db-page-subtitle">Welcome back, {user.email}</p>
        </div>

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
