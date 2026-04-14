import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const services = [
  { name: 'API Gateway', status: 'operational' },
  { name: 'Model Inference (Llama 3 8B)', status: 'operational' },
  { name: 'Model Inference (Llama 3 70B)', status: 'operational' },
  { name: 'Model Inference (Mistral 7B)', status: 'operational' },
  { name: 'Model Inference (Mixtral 8×7B)', status: 'operational' },
  { name: 'Dashboard', status: 'operational' },
  { name: 'Authentication', status: 'operational' },
  { name: 'Database', status: 'operational' },
]

const statusConfig = {
  operational: { label: 'Operational', color: '#34D399', bg: '#ECFDF5', text: '#065F46' },
  degraded: { label: 'Degraded', color: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  outage: { label: 'Outage', color: '#EF4444', bg: '#FEF2F2', text: '#991B1B' },
}

export default function Status() {
  const allOperational = services.every(s => s.status === 'operational')

  return (
    <>
      <Head>
        <title>System Status — Cloudach</title>
        <meta name="description" content="Live status of Cloudach infrastructure and services." />
        <meta property="og:title" content="System Status — Cloudach" />
        <meta property="og:description" content="Live status of Cloudach infrastructure and services." />
        <meta property="og:url" content="https://cloudach.com/status" />
        <meta name="twitter:title" content="System Status — Cloudach" />
        <meta name="twitter:description" content="Live status of Cloudach infrastructure and services." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <div className="sec-tag">Status</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.12, color: '#0D0F1A', margin: '16px 0 8px' }}>System status</h1>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: allOperational ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${allOperational ? '#6EE7B7' : '#FCA5A5'}`,
          borderRadius: 10, padding: '14px 20px', marginBottom: 40, marginTop: 24
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: allOperational ? '#34D399' : '#EF4444' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: allOperational ? '#065F46' : '#991B1B' }}>
            {allOperational ? 'All systems operational' : 'Some systems are experiencing issues'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#E5E7EB', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          {services.map(s => {
            const cfg = statusConfig[s.status]
            return (
              <div key={s.name} style={{ background: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#0D0F1A' }}>{s.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text, padding: '3px 10px', borderRadius: 5, letterSpacing: '0.04em' }}>
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>

        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 20, textAlign: 'center' }}>
          Last updated: {new Date().toUTCString()}
        </p>
      </main>
      <Footer />
    </>
  )
}
