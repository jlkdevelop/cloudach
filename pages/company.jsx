import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const trustItems = [
  {
    icon: '⬡',
    title: 'Private data isolation',
    desc: 'Every deployment runs in a fully isolated environment. Your prompts, completions, and model weights never touch another tenant\'s infrastructure.',
  },
  {
    icon: '◎',
    title: 'Zero data retention',
    desc: 'We do not log, store, or train on your API requests. Prompts and completions are processed in memory and discarded immediately after the response.',
  },
  {
    icon: '✦',
    title: 'SOC 2 Type II',
    desc: 'Annual third-party audit covering security, availability, and confidentiality controls. Full report available under NDA to enterprise customers.',
  },
  {
    icon: '⊕',
    title: 'HIPAA ready',
    desc: 'Business Associate Agreements (BAA) available on Enterprise plans. PHI stays within your designated network boundary at all times.',
  },
  {
    icon: '◈',
    title: 'GDPR compliant',
    desc: 'EU data residency options on all plans. Data Processing Agreements (DPA) included. We act as a data processor under your control.',
  },
  {
    icon: '⬡',
    title: 'End-to-end encryption',
    desc: 'TLS 1.3 enforced in transit. AES-256 encryption at rest. API keys are hashed using bcrypt and never stored in plaintext.',
  },
  {
    icon: '◐',
    title: 'Responsible AI',
    desc: 'Comprehensive acceptable use policy, automated abuse monitoring, and rate limiting at every tier. We work with customers to ensure ethical deployment.',
  },
  {
    icon: '⊗',
    title: 'Vulnerability disclosure',
    desc: 'Coordinated disclosure program with a dedicated security team. Critical patches deployed within 24 hours. Bug bounty available on request.',
  },
]

const team = [
  {
    name: 'Jassim AlKharafi',
    title: 'Founder & CEO',
    location: 'Kuwait · San Francisco',
    founder: true,
    vision: 'We built Cloudach because the best AI models are open-source, but running them at production scale was still too hard and too expensive. Our mission is simple: make deploying any LLM as easy as calling an API, so every developer and company can build with AI on their own terms — with full control over their data, their costs, and their infrastructure.',
  },
  {
    name: 'CTO',
    title: 'Chief Technology Officer',
    location: 'We\'re hiring',
    open: true,
  },
  {
    name: 'Head of Product',
    title: 'Head of Product',
    location: 'We\'re hiring',
    open: true,
  },
  {
    name: 'VP Engineering',
    title: 'VP Engineering',
    location: 'We\'re hiring',
    open: true,
  },
]

export default function Company() {
  return (
    <>
      <Head>
        <title>Company — Cloudach</title>
        <meta name="description" content="Meet the team behind Cloudach. Our mission: make deploying any open-source LLM as easy as calling an API." />
        <meta property="og:title" content="Company — Cloudach" />
        <meta property="og:description" content="Meet the team behind Cloudach. Our mission: make deploying any open-source LLM as easy as calling an API." />
        <meta property="og:url" content="https://cloudach.com/company" />
      </Head>

      <Nav />

      <main style={{ background: '#0a0a0a', minHeight: '100vh' }}>

        {/* ── Hero ── */}
        <section className="section-wrap" style={{ paddingBottom: 48 }}>
          <div className="sec-tag">Company</div>
          <h1 className="sec-title" style={{ fontSize: 46, letterSpacing: '-1.8px', maxWidth: 620 }}>
            Built to give developers<br />control of their AI stack.
          </h1>
          <p className="sec-sub" style={{ maxWidth: 520, marginTop: 16 }}>
            Cloudach was founded with a single conviction: the best AI models are open-source,
            and every company deserves to run them on their own terms — without giving up their
            data, budget, or infrastructure choices.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>—</span> Founded 2025
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>—</span> Kuwait · San Francisco
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>—</span> LLM Infrastructure
            </div>
          </div>
        </section>

        {/* ── Leadership ── */}
        <section className="stripe-bg">
          <div className="section-wrap">
            <div className="sec-tag">Leadership</div>
            <h2 className="sec-title">The people building Cloudach.</h2>
            <p className="sec-sub" style={{ marginBottom: 48 }}>
              A small, focused team with deep experience in infrastructure, AI systems, and developer tooling.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {team.map((member) => (
                <div
                  key={member.name}
                  style={{
                    background: member.founder ? 'linear-gradient(135deg, #131520 0%, #111111 100%)' : 'var(--bg-1)',
                    border: member.founder ? '1px solid rgba(79,110,247,0.25)' : '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '28px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    gridColumn: member.founder ? 'span 2' : undefined,
                    boxShadow: member.founder ? '0 0 40px rgba(79,110,247,0.06)' : 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {member.founder ? (
                    <>
                      {/* Founder card */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            {/* Avatar placeholder */}
                            <div style={{
                              width: 44, height: 44, borderRadius: '50%',
                              background: 'linear-gradient(135deg, #4F6EF7, #7B96FF)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0,
                            }}>
                              J
                            </div>
                            <div>
                              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.3px' }}>
                                {member.name}
                              </div>
                              <div style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 500 }}>{member.title}</div>
                            </div>
                          </div>
                        </div>
                        <div style={{
                          fontSize: 11, color: 'var(--text-3)',
                          background: 'var(--bg-3)', border: '1px solid var(--border)',
                          borderRadius: 6, padding: '3px 10px', alignSelf: 'flex-start',
                        }}>
                          {member.location}
                        </div>
                      </div>
                      {/* Vision quote */}
                      <blockquote style={{
                        fontSize: 14.5,
                        lineHeight: 1.75,
                        color: 'var(--text-2)',
                        borderLeft: '2px solid var(--brand)',
                        paddingLeft: 16,
                        margin: 0,
                        fontStyle: 'normal',
                      }}>
                        &ldquo;{member.vision}&rdquo;
                      </blockquote>
                    </>
                  ) : (
                    <>
                      {/* Open role card */}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--bg-2)', border: '1px dashed var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, color: 'var(--text-4)',
                      }}>
                        +
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '-0.2px' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{member.title}</div>
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <Link href="/contact" style={{
                          fontSize: 12, fontWeight: 600, color: 'var(--brand)',
                          textDecoration: 'none', letterSpacing: '-0.1px',
                        }}>
                          View open role →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 24 }}>
              Interested in joining the team?{' '}
              <Link href="/contact" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
                Get in touch →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Trust, Privacy & Safety ── */}
        <section className="section-wrap">
          <div className="sec-tag">Trust & Safety</div>
          <div className="sec-header">
            <div>
              <h2 className="sec-title">Security and privacy<br />by default.</h2>
            </div>
            <p className="sec-sub">
              Your data is yours. We designed Cloudach from the ground up so that privacy,
              isolation, and compliance are not add-ons — they are the foundation.
            </p>
          </div>

          <div className="feat-grid">
            {trustItems.map((item) => (
              <div className="feat" key={item.title}>
                <div style={{ fontSize: 20, marginBottom: 16, color: 'var(--brand)', opacity: 0.9 }}>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 40, padding: '20px 24px',
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 12, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
                Have a security concern or compliance question?
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
                Our security team responds within 24 hours.
              </div>
            </div>
            <a href="mailto:security@cloudach.com" style={{
              fontSize: 13, fontWeight: 600, color: 'var(--brand)',
              textDecoration: 'none', background: 'var(--brand-subtle)',
              border: '1px solid var(--brand-border)', borderRadius: 8,
              padding: '8px 18px', whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}>
              security@cloudach.com
            </a>
          </div>
        </section>

        {/* ── Mission CTA ── */}
        <section style={{
          background: 'var(--bg-1)', borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)', padding: '72px 48px', textAlign: 'center',
        }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div className="sec-tag" style={{ justifyContent: 'center', display: 'flex', marginBottom: 16 }}>
              Mission
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-1px', lineHeight: 1.2, marginBottom: 16 }}>
              AI infrastructure that belongs to you.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 32 }}>
              We believe every company should be able to run world-class AI without compromising
              on privacy, cost, or control. Cloudach exists to make that a reality.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup">
                <button className="btn-cta">Start building free</button>
              </Link>
              <Link href="/contact">
                <button className="btn-cta-ghost">Talk to us</button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
