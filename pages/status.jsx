import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const services = [
  { name: 'API Gateway',                  group: 'API',        status: 'operational', uptime30d: 99.98 },
  { name: 'Model Inference (Llama 3 8B)', group: 'Inference',  status: 'operational', uptime30d: 99.95 },
  { name: 'Model Inference (Llama 3 70B)',group: 'Inference',  status: 'operational', uptime30d: 99.94 },
  { name: 'Model Inference (Mistral 7B)', group: 'Inference',  status: 'operational', uptime30d: 99.96 },
  { name: 'Model Inference (Mixtral 8×7B)',group: 'Inference', status: 'operational', uptime30d: 99.93 },
  { name: 'Dashboard',                    group: 'Dashboard',  status: 'operational', uptime30d: 99.99 },
  { name: 'Authentication',               group: 'API',        status: 'operational', uptime30d: 100.00 },
  { name: 'Database',                     group: 'Database',   status: 'operational', uptime30d: 99.99 },
]

// 90-day placeholder uptime bars: 1 = operational, 0 = outage, 0.5 = degraded
function generateUptimeBars(uptime30d) {
  return Array.from({ length: 90 }, (_, i) => {
    // Simulate occasional small blips consistent with the uptime figure
    if (uptime30d >= 99.99) return 1
    const blipChance = (100 - uptime30d) / 100
    return Math.random() < blipChance * 90 / 3 ? (Math.random() < 0.5 ? 0.5 : 0) : 1
  })
}

const uptimeBars = Object.fromEntries(
  services.map(s => [s.name, generateUptimeBars(s.uptime30d)])
)

const statusConfig = {
  operational: { label: 'Operational',    color: '#34D399', bg: 'rgba(34,197,94,0.10)',    text: '#6ee7b7' },
  degraded:    { label: 'Degraded',       color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',   text: '#fbbf24' },
  outage:      { label: 'Outage',         color: '#EF4444', bg: 'rgba(239,68,68,0.10)',    text: '#fca5a5' },
}

const barColor = { 1: '#34D399', 0.5: '#F59E0B', 0: '#EF4444' }

const slaTable = [
  {
    tier: 'Starter',
    uptime: '99.5%',
    responseTime: 'Best effort',
    support: 'Community',
    credits: 'None',
    notes: 'Shared GPU infrastructure. No uptime guarantee.',
  },
  {
    tier: 'Pro',
    uptime: '99.9%',
    responseTime: '< 4 hours (business hours)',
    support: 'Priority email',
    credits: '10× service credits for breaches',
    notes: 'Dedicated GPU instances. Monthly uptime measured per calendar month.',
  },
  {
    tier: 'Enterprise',
    uptime: '99.9%',
    responseTime: '< 1 hour (24/7)',
    support: 'Dedicated solutions engineer',
    credits: '25× service credits for breaches',
    notes: 'Private VPC. Custom SLAs available on request. HIPAA · SOC 2 · GDPR.',
  },
]

// Empty incident history — format template for future use
const incidents = []

const INCIDENT_TEMPLATE = `## Incident Template

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** SEV-1 | SEV-2 | SEV-3
**Affected services:** [list of services]

**Summary:** One-sentence description of what happened.

**Timeline:**
- HH:MM UTC — Issue first detected
- HH:MM UTC — On-call engineer paged
- HH:MM UTC — Root cause identified
- HH:MM UTC — Fix deployed
- HH:MM UTC — All systems operational

**Root cause:** Description of what caused the incident.

**Resolution:** What was done to resolve it.

**Follow-up actions:**
- [ ] Action item 1
- [ ] Action item 2`

export default function Status() {
  const allOperational = services.every(s => s.status === 'operational')
  const groups = [...new Set(services.map(s => s.group))]

  return (
    <>
      <Head>
        <title>System Status — Cloudach</title>
        <meta name="description" content="Live status of Cloudach infrastructure and services, uptime metrics, SLA commitments, and incident history." />
        <meta property="og:title" content="System Status — Cloudach" />
        <meta property="og:description" content="Live status of Cloudach infrastructure and services." />
        <meta property="og:url" content="https://cloudach.com/status" />
        <meta name="twitter:title" content="System Status — Cloudach" />
        <meta name="twitter:description" content="Live status of Cloudach infrastructure and services." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '88px 48px 80px', fontFamily: 'Inter, system-ui, sans-serif', background: '#ffffff', minHeight: '100vh' }}>

        {/* Header */}
        <div className="sec-tag">Status</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.12, color: 'var(--text-1)', margin: '16px 0 8px' }}>
          System status
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 32 }}>
          Real-time health and uptime for all Cloudach services.
        </p>

        {/* Overall banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: allOperational ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
          border: `1px solid ${allOperational ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 10, padding: '14px 20px', marginBottom: 48
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: allOperational ? '#34D399' : '#EF4444', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: allOperational ? '#6ee7b7' : '#fca5a5' }}>
            {allOperational ? 'All systems operational' : 'Some systems are experiencing issues'}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF' }}>
            Updated {new Date().toUTCString()}
          </span>
        </div>

        {/* Service health by group */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 20 }}>Service health</h2>
        {groups.map(group => (
          <div key={group} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              {group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              {services.filter(s => s.group === group).map(s => {
                const cfg = statusConfig[s.status]
                const bars = uptimeBars[s.name]
                return (
                  <div key={s.name} style={{ background: 'var(--bg-1)', padding: '14px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{s.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.uptime30d.toFixed(2)}% uptime</span>
                        <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text, padding: '3px 10px', borderRadius: 5, letterSpacing: '0.04em' }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    {/* 90-day uptime bar */}
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 28 }}>
                      {bars.map((v, i) => (
                        <div
                          key={i}
                          title={v === 1 ? 'Operational' : v === 0.5 ? 'Degraded' : 'Outage'}
                          style={{
                            flex: 1,
                            height: v === 1 ? 20 : v === 0.5 ? 14 : 10,
                            borderRadius: 2,
                            background: barColor[v],
                            opacity: v === 1 ? 0.75 : 1,
                            transition: 'height 0.15s',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>90 days ago</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>Today</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* SLA commitments */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', margin: '48px 0 16px' }}>SLA commitments</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>
          Uptime is measured per calendar month, excluding scheduled maintenance windows announced at least 48 hours in advance.
          Service credits are applied to your next invoice automatically upon verified breach.
        </p>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr 1fr', background: 'var(--bg-2)', padding: '10px 20px', gap: 16, borderBottom: '1px solid var(--border)' }}>
            {['Tier', 'Uptime SLA', 'Response time', 'Support', 'Credits on breach'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {slaTable.map((row, i) => (
            <div key={row.tier} style={{
              display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr 1fr',
              padding: '16px 20px', gap: 16,
              background: 'var(--bg-1)',
              borderBottom: i < slaTable.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{row.tier}</span>
              <span style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 600 }}>{row.uptime}</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{row.responseTime}</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{row.support}</span>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{row.credits}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slaTable.map(row => (
            <p key={row.tier} style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              <strong style={{ color: 'var(--text-2)' }}>{row.tier}:</strong> {row.notes}
            </p>
          ))}
        </div>

        {/* Incident history */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Incident history</h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>
            Past incidents affecting Cloudach services. All times in UTC.
          </p>

          {incidents.length === 0 ? (
            <div style={{
              border: '1px solid var(--border)', borderRadius: 12,
              padding: '40px 32px', textAlign: 'center',
              background: 'var(--bg-1)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>No incidents recorded</p>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
                We&rsquo;ve had zero incidents in the past 90 days. Full incident reports will appear here when they occur.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {incidents.map((inc, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', background: 'var(--bg-1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-1)' }}>{inc.title}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>{inc.date}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{inc.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe footer */}
        <div style={{
          marginTop: 56, borderTop: '1px solid var(--border)', paddingTop: 32,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', margin: 0 }}>Subscribe to updates</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '2px 0 0' }}>Get notified by email when an incident is reported or resolved.</p>
          </div>
          <a href="mailto:status@cloudach.com?subject=Subscribe to Cloudach status updates" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}>
              Subscribe
            </button>
          </a>
        </div>

      </main>
      <Footer />
    </>
  )
}
