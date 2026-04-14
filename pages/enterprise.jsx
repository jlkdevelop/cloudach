import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="9" width="12" height="10" rx="2" />
      <path d="M7 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  )
}

function IconGpu() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="16" height="10" rx="2" />
      <path d="M6 5V3M10 5V3M14 5V3M6 15v2M10 15v2M14 15v2" />
      <rect x="5" y="8" width="3" height="4" rx="0.5" />
      <rect x="9" y="8" width="3" height="4" rx="0.5" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L3 5v5c0 4.418 3.134 8.207 7 9 3.866-.793 7-4.582 7-9V5l-7-3z" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <path d="M2 10h16M10 2a14 14 0 0 1 0 16M10 2a14 14 0 0 0 0 16" />
    </svg>
  )
}

function IconHeadset() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10a7 7 0 0 1 14 0" />
      <rect x="2" y="10" width="3" height="5" rx="1" />
      <rect x="15" y="10" width="3" height="5" rx="1" />
      <path d="M18 15v1a2 2 0 0 1-2 2h-2" />
    </svg>
  )
}

function IconUptime() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 12 6 8 9 11 13 6 18 10" />
      <path d="M2 17h16" />
    </svg>
  )
}

const features = [
  { Icon: IconLock, title: 'Private VPC Deployment', desc: 'Your models run in an isolated network. No shared compute, no shared data. Full air-gap mode available.' },
  { Icon: IconGpu, title: 'Dedicated GPU Instances', desc: 'Reserved capacity on A100 and H100 nodes. Guaranteed throughput with no noisy neighbors.' },
  { Icon: IconShield, title: 'Compliance Ready', desc: 'HIPAA-adjacent, SOC 2 Type II, and GDPR-ready infrastructure. Audit logs for every request.' },
  { Icon: IconGlobe, title: 'Multi-Region Deployment', desc: 'Deploy to any AWS or GCP region. Data residency controls for EU, US, and APAC requirements.' },
  { Icon: IconHeadset, title: 'Dedicated Support', desc: 'A dedicated solutions engineer assigned to your account. SLA-backed response times.' },
  { Icon: IconUptime, title: '99.9% Uptime SLA', desc: 'Contractual uptime guarantee backed by redundant infrastructure and automatic failover.' },
]

export default function Enterprise() {
  return (
    <>
      <Head>
        <title>Enterprise — Cloudach</title>
        <meta name="description" content="Private VPC, dedicated GPU infrastructure, compliance-ready LLM hosting for enterprise teams." />
        <meta property="og:title" content="Enterprise — Cloudach" />
        <meta property="og:description" content="Private VPC, dedicated GPU infrastructure, compliance-ready LLM hosting for enterprise teams." />
        <meta property="og:url" content="https://cloudach.com/enterprise" />
        <meta name="twitter:title" content="Enterprise — Cloudach" />
        <meta name="twitter:description" content="Private VPC, dedicated GPU infrastructure, compliance-ready LLM hosting for enterprise teams." />
      </Head>

      <Nav />

      <main>
        {/* Hero */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '88px 48px 72px', textAlign: 'center' }}>
          <div className="eyebrow" style={{ justifyContent: 'center', margin: '0 auto 24px' }}>
            <div className="eyebrow-dot" />
            Enterprise
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.07, color: '#0D0F1A', marginBottom: 20 }}>
            Private AI infrastructure<br />built for the enterprise.
          </h1>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 40px' }}>
            Deploy open-source LLMs inside your own VPC. Isolated compute, compliance controls, and a dedicated team — so your data never leaves your environment.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/contact">
              <button className="btn-cta">Talk to sales</button>
            </Link>
            <Link href="/docs">
              <button className="btn-cta-ghost">View docs</button>
            </Link>
          </div>
        </section>

        {/* Features grid */}
        <section style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 48px' }}>
            <div className="sec-tag" style={{ textAlign: 'center' }}>What you get</div>
            <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: 52 }}>Everything a serious enterprise needs</h2>
            <div className="feat-grid">
              {features.map(f => (
                <div className="feat" key={f.title}>
                  <div style={{ color: '#4F6EF7', marginBottom: 14 }}><f.Icon /></div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing note */}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '72px 48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, marginBottom: 16, color: '#0D0F1A' }}>Custom pricing.<br />Volume discounts.</h2>
          <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.75, marginBottom: 36 }}>
            Enterprise plans are scoped to your usage, team size, and compliance requirements. Most teams start at $2,000/month. Volume discounts available above $10,000/month.
          </p>
          <Link href="/contact">
            <button className="btn-cta">Contact sales</button>
          </Link>
        </section>
      </main>

      <Footer />
    </>
  )
}
