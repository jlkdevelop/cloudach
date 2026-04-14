import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

/* ---- Icons ---- */
function IconLock() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a3 3 0 0 1 6 0v3" />
    </svg>
  )
}

function IconGpu() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="18" height="10" rx="2" />
      <path d="M7 6V4M11 6V4M15 6V4M7 16v2M11 16v2M15 16v2" />
      <rect x="6" y="9" width="3" height="4" rx="0.5" />
      <rect x="11" y="9" width="3" height="4" rx="0.5" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2L3 6v6c0 4.418 3.582 8 8 9 4.418-1 8-4.582 8-9V6l-8-4z" />
      <path d="M8 11l2 2 4-4" />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="9" />
      <path d="M2 11h18M11 2a16 16 0 0 1 0 18M11 2a16 16 0 0 0 0 18" />
    </svg>
  )
}

function IconHeadset() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11a8 8 0 0 1 16 0" />
      <rect x="2" y="11" width="3" height="6" rx="1" />
      <rect x="17" y="11" width="3" height="6" rx="1" />
      <path d="M20 17v1a2 2 0 0 1-2 2h-3" />
    </svg>
  )
}

function IconUptime() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 14 7 9 10 12 15 6 20 10" />
      <path d="M2 19h18" />
    </svg>
  )
}

function IconTeam() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="3" />
      <circle cx="15" cy="7" r="3" />
      <path d="M1 19c0-3.314 3.134-6 7-6" />
      <path d="M15 13c3.866 0 7 2.686 7 6" />
      <path d="M8 13c3.866 0 7 2.686 7 6H1c0-3.314 3.134-6 7-6z" />
    </svg>
  )
}

function IconAudit() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-4-4z" />
      <path d="M14 3v4h4" />
      <path d="M8 13h6M8 17h4M8 9h2" />
    </svg>
  )
}

/* ---- Check icon for feature list ---- */
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" fill="#EEF1FF" />
      <path d="M5 8l2 2 4-4" stroke="#4F6EF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const features = [
  { Icon: IconLock, title: 'Private VPC Deployment', desc: 'Your models run in an isolated network. No shared compute, no shared data. Full air-gap mode available on request.' },
  { Icon: IconGpu, title: 'Dedicated GPU Instances', desc: 'Reserved capacity on A100 and H100 nodes. Guaranteed throughput with no noisy neighbors. Burst capacity included.' },
  { Icon: IconShield, title: 'Compliance Ready', desc: 'HIPAA-adjacent, SOC 2 Type II, and GDPR-ready infrastructure. Audit logs for every request, exportable on demand.' },
  { Icon: IconGlobe, title: 'Multi-Region Deployment', desc: 'Deploy to any AWS or GCP region. Data residency controls for EU, US, and APAC requirements built in.' },
  { Icon: IconHeadset, title: 'Dedicated Support', desc: 'A named solutions engineer assigned to your account. Slack channel, SLA-backed response times, monthly check-ins.' },
  { Icon: IconUptime, title: '99.9% Uptime SLA', desc: 'Contractual uptime guarantee backed by redundant infrastructure and automatic failover across availability zones.' },
  { Icon: IconTeam, title: 'Team & Role Management', desc: 'Granular RBAC, SSO/SAML, and org-level usage controls. Onboard your team in minutes with managed access policies.' },
  { Icon: IconAudit, title: 'Full Audit Trail', desc: 'Every request logged with user attribution, timestamps, and model version. Retention policies configurable to 7 years.' },
]

const complianceBadges = [
  { label: 'SOC 2 Type II', sub: 'In progress' },
  { label: 'GDPR', sub: 'Compliant' },
  { label: 'HIPAA', sub: 'Adjacent' },
  { label: 'ISO 27001', sub: 'Roadmap' },
  { label: 'CCPA', sub: 'Ready' },
]

const testimonials = [
  {
    quote: "We needed a fully isolated inference environment with audit logs our compliance team could accept. Cloudach was the only provider that actually delivered that without a 6-month enterprise sales cycle.",
    name: "Sarah K.",
    role: "VP of Engineering, HealthTech startup",
  },
  {
    quote: "The dedicated GPU allocation means our p99 latency is predictable. We can actually put Cloudach endpoints in our customer-facing SLAs — we couldn't do that with any other provider.",
    name: "Marcus T.",
    role: "CTO, B2B SaaS Platform",
  },
  {
    quote: "Multi-region was the dealbreaker for us. Our EU customers needed data residency guarantees. Cloudach had it configured in under a week.",
    name: "Lena W.",
    role: "Head of Infrastructure, Fintech Scale-up",
  },
]

const enterpriseIncludes = [
  'Dedicated A100/H100 GPU clusters',
  'Private VPC with air-gap option',
  'SSO / SAML integration',
  'RBAC and org-wide access controls',
  'Monthly usage review with your CSM',
  'Custom data retention policies',
  'Priority 24/7 support with named engineer',
  'Contractual SLA with financial penalties',
  'Audit log export (CSV, SIEM integration)',
  'Multi-region data residency',
]

export default function Enterprise() {
  return (
    <>
      <Head>
        <title>Enterprise — Cloudach</title>
        <meta name="description" content="Private VPC, dedicated GPU infrastructure, compliance-ready LLM hosting for enterprise teams. SOC 2, GDPR, HIPAA-adjacent." />
        <meta property="og:title" content="Enterprise — Cloudach" />
        <meta property="og:description" content="Private VPC, dedicated GPU infrastructure, compliance-ready LLM hosting for enterprise teams." />
        <meta property="og:url" content="https://cloudach.com/enterprise" />
        <meta name="twitter:title" content="Enterprise — Cloudach" />
        <meta name="twitter:description" content="Private VPC, dedicated GPU infrastructure, compliance-ready LLM hosting for enterprise teams." />
      </Head>

      <Nav />

      <main>
        {/* Hero */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '96px 48px 80px', textAlign: 'center' }}>
          <div className="eyebrow" style={{ justifyContent: 'center', margin: '0 auto 28px', display: 'inline-flex' }}>
            <div className="eyebrow-dot" />
            Enterprise
          </div>
          <h1 style={{ fontSize: 56, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.06, color: '#0D0F1A', marginBottom: 22 }}>
            Private AI infrastructure<br />built for the enterprise.
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 44px' }}>
            Deploy open-source LLMs inside your own VPC. Isolated compute, compliance controls, and a dedicated team — so your data never leaves your environment.
          </p>

          {/* Primary CTA */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
            <Link href="/contact">
              <button className="btn-cta" style={{ fontSize: 16, padding: '15px 36px', borderRadius: 10 }}>
                Contact Sales
              </button>
            </Link>
            <Link href="/docs">
              <button className="btn-cta-ghost" style={{ fontSize: 16, padding: '15px 28px', borderRadius: 10 }}>
                View docs
              </button>
            </Link>
          </div>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>No long-term contract required to start. Most teams deploy in under 2 weeks.</p>

          {/* Trust stats */}
          <div style={{
            display: 'flex', gap: 0, justifyContent: 'center', marginTop: 56,
            borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB',
            padding: '36px 0',
          }}>
            {[
              { val: '99.9%', label: 'Uptime SLA' },
              { val: '<50ms', label: 'Median latency (A100)' },
              { val: '7 regions', label: 'Available globally' },
              { val: '24/7', label: 'Dedicated support' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center', padding: '0 32px',
                borderRight: i < 3 ? '1px solid #E5E7EB' : 'none',
              }}>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: '#0D0F1A', marginBottom: 6 }}>{s.val}</div>
                <div style={{ fontSize: 13, color: '#9CA3AF' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance badges */}
        <section style={{ background: '#0D0F1A', padding: '28px 48px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', marginRight: 8 }}>
              Compliance &amp; Security
            </span>
            {complianceBadges.map(b => (
              <div key={b.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: '#141626', border: '1px solid #1E2235',
                borderRadius: 8, padding: '10px 20px', minWidth: 90,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#A5B4FC', letterSpacing: -0.2 }}>{b.label}</span>
                <span style={{ fontSize: 11, color: '#4B5563', marginTop: 2 }}>{b.sub}</span>
              </div>
            ))}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8,
              background: '#141626', border: '1px solid #1E2235', borderRadius: 8, padding: '10px 18px',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#34D399" strokeWidth="1.5" />
                <path d="M4.5 7l1.5 1.5 3-3" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 12, color: '#34D399', fontWeight: 600 }}>Encrypted at rest &amp; in transit</span>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 48px' }}>
            <div className="sec-tag" style={{ textAlign: 'center' }}>What you get</div>
            <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: 12 }}>Everything a serious enterprise needs</h2>
            <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 15, marginBottom: 56, maxWidth: 520, margin: '0 auto 56px' }}>
              Built for security, compliance, and performance at scale — not retrofitted from a developer product.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              background: '#E5E7EB',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              overflow: 'hidden',
            }}>
              {features.map(f => (
                <div key={f.title} style={{ background: '#fff', padding: '32px 26px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: '#EEF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#4F6EF7', marginBottom: 18,
                  }}>
                    <f.Icon />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, letterSpacing: -0.3, color: '#0D0F1A' }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What's included + pricing */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'start' }}>
            {/* Includes list */}
            <div>
              <div className="sec-tag">Everything included</div>
              <h2 className="sec-title" style={{ marginBottom: 10 }}>No hidden costs.<br />No surprise bills.</h2>
              <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
                Your enterprise plan includes dedicated infrastructure, compliance tooling, and concierge support — bundled into a single predictable contract.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {enterpriseIncludes.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#374151' }}>
                    <IconCheck />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing card */}
            <div style={{
              background: '#0D0F1A',
              border: '1px solid #1E2235',
              borderRadius: 20,
              padding: '40px 36px',
              position: 'sticky',
              top: 80,
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#1E2235', borderRadius: 6, padding: '4px 12px',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#A5B4FC', marginBottom: 24,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F6EF7' }} />
                Enterprise Plan
              </div>
              <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -2, color: '#fff', lineHeight: 1 }}>
                $2,000
                <span style={{ fontSize: 15, fontWeight: 400, color: '#6B7280', letterSpacing: 0 }}>/mo</span>
              </div>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8, marginBottom: 28, lineHeight: 1.6 }}>
                Starting price. Custom scoped to your team size, usage, and compliance needs. Volume discounts above $10k/mo.
              </p>
              <Link href="/contact">
                <button style={{
                  width: '100%', padding: '14px', fontSize: 15, fontWeight: 600,
                  background: '#4F6EF7', color: '#fff', border: 'none', borderRadius: 10,
                  cursor: 'pointer', transition: 'background 0.15s', marginBottom: 16,
                }}>
                  Contact Sales
                </button>
              </Link>
              <Link href="/pricing">
                <button style={{
                  width: '100%', padding: '13px', fontSize: 14, fontWeight: 500,
                  background: 'transparent', color: '#6B7280', border: '1px solid #1E2235',
                  borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
                }}>
                  Compare all plans
                </button>
              </Link>
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #1E2235' }}>
                {[
                  'Typical deployment: under 2 weeks',
                  'No long-term contract required',
                  'Custom MSA available',
                ].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke="#34D399" strokeWidth="1.3" />
                      <path d="M4.5 7l1.5 1.5 3-3" stroke="#34D399" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ background: '#F9FAFB', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 48px' }}>
            <div className="sec-tag" style={{ textAlign: 'center' }}>Customer stories</div>
            <h2 className="sec-title" style={{ textAlign: 'center', marginBottom: 52 }}>Trusted by engineering teams</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {testimonials.map((t, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 14,
                  padding: '32px 28px',
                  display: 'flex', flexDirection: 'column', gap: 24,
                }}>
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill="#F59E0B">
                        <path d="M7 1l1.545 3.13 3.455.502-2.5 2.436.59 3.438L7 8.768l-3.09 1.738.59-3.438L2 4.632l3.455-.502L7 1z" />
                      </svg>
                    ))}
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#374151', flex: 1 }}>"{t.quote}"</p>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0D0F1A' }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 3 }}>{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section style={{
          background: '#0D0F1A',
          padding: '88px 48px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#141626', border: '1px solid #1E2235',
              borderRadius: 99, padding: '6px 16px', marginBottom: 28,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6EE7B7' }}>Solutions engineers available now</span>
            </div>
            <h2 style={{ fontSize: 44, fontWeight: 700, color: '#fff', letterSpacing: -1.5, marginBottom: 16, lineHeight: 1.1 }}>
              Ready to build on private AI infrastructure?
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 36, lineHeight: 1.7 }}>
              Talk to our team. We'll scope a deployment, provide a custom quote, and get you to production — typically in under two weeks.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/contact">
                <button style={{
                  fontSize: 16, fontWeight: 600, color: '#fff', background: '#4F6EF7',
                  padding: '15px 36px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>
                  Contact Sales
                </button>
              </Link>
              <Link href="/pricing">
                <button style={{
                  fontSize: 15, fontWeight: 500, color: '#9CA3AF',
                  padding: '15px 28px', borderRadius: 10,
                  border: '1px solid #1E2235', background: 'transparent',
                  cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
                }}>
                  Compare plans
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 900px) {
          .ent-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ent-split { grid-template-columns: 1fr !important; gap: 40px !important; }
          .ent-testimonials { grid-template-columns: 1fr !important; }
          .ent-stats { flex-direction: column !important; gap: 24px !important; }
        }
      `}</style>
    </>
  )
}
