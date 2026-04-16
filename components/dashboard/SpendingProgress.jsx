import Link from 'next/link';

/**
 * SpendingProgress — compact spending-vs-budget progress bar for the dashboard overview.
 * Shown only when the user has a monthly budget configured.
 */
export default function SpendingProgress({ spend, budget, thresholds = [] }) {
  const pct = budget > 0 ? Math.min((spend / budget) * 100, 100) : 0;
  const barColor = pct >= 100 ? '#DC2626' : pct >= 80 ? '#F59E0B' : 'rgba(255,255,255,0.70)';

  function formatCost(n) {
    if (n == null || isNaN(n)) return '—';
    if (n === 0) return '$0.00';
    return `$${n.toFixed(2)}`;
  }

  return (
    <div className="db-card" style={{ marginBottom: 24 }}>
      <div className="db-card-header">
        <span className="db-card-title">Monthly budget</span>
        <Link href="/dashboard/alerts" style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
          Manage alerts →
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.5px' }}>
          {formatCost(spend)}
        </span>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>of {formatCost(budget)}</span>
        <span style={{
          marginLeft: 'auto', fontSize: 13, fontWeight: 600,
          color: pct >= 100 ? '#DC2626' : pct >= 80 ? '#F59E0B' : 'rgba(255,255,255,0.70)',
        }}>
          {Math.round(pct)}%
        </span>
      </div>

      {/* Progress bar with threshold markers */}
      <div style={{ position: 'relative', height: 10, background: '#F3F4F6', borderRadius: 5, overflow: 'visible' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: `${pct}%`, background: barColor, borderRadius: 5,
          transition: 'width 0.6s ease',
        }} />
        {/* Threshold markers */}
        {thresholds.map((t) => (
          <div key={t} style={{
            position: 'absolute', top: -3, left: `${Math.min(t, 100)}%`,
            transform: 'translateX(-50%)',
            width: 2, height: 16, borderRadius: 1,
            background: pct >= t ? barColor : '#D1D5DB',
            opacity: 0.7,
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
        <span>{formatCost(Math.max(0, budget - spend))} remaining</span>
        <span>Budget: {formatCost(budget)} / mo</span>
      </div>
    </div>
  );
}
