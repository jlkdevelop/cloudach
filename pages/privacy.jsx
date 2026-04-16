import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const SECTIONS = [
  {
    title: '1. Introduction',
    body: 'Cloudach, LLC ("Cloudach", "we", "us", or "our") operates the Cloudach LLM infrastructure platform. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website and services (the "Service"). By using the Service, you agree to the practices described in this policy.',
  },
  {
    title: '2. Information We Collect',
    body: 'We collect information you provide directly: your name, email address, organization name, and payment information when you register or upgrade your account. We also collect usage data automatically: API request counts, token usage, model identifiers, request latency, error rates, and IP addresses. We do not store the content of your API requests, prompts, or model outputs beyond real-time processing.',
  },
  {
    title: '3. How We Use Your Information',
    body: 'We use your information to provide and operate the Service; calculate and process billing; send transactional emails (account alerts, invoices, usage notifications); monitor for abuse and enforce our Terms of Service and Acceptable Use Policy; provide customer support; and improve the platform based on aggregated, anonymized usage patterns. We do not sell your personal data to third parties.',
  },
  {
    title: '4. Legal Bases for Processing (GDPR)',
    body: 'If you are located in the European Economic Area (EEA) or UK, we process your personal data under the following legal bases: Contract performance — processing necessary to provide the Service you have signed up for; Legitimate interests — preventing abuse, improving service quality, and security monitoring; Legal obligation — complying with applicable laws and regulations; Consent — where you have provided explicit consent, which may be withdrawn at any time without affecting the lawfulness of prior processing.',
  },
  {
    title: '5. Data Sharing and Disclosure',
    body: 'We share your data only with trusted subprocessors who help us operate the Service, including cloud infrastructure providers (compute and storage), payment processors, and email delivery services. All subprocessors are bound by data processing agreements. We may disclose your data to law enforcement or regulators when required by law, or to protect the rights and safety of our users and the platform. We will notify you of such requests where legally permitted.',
  },
  {
    title: '6. International Data Transfers',
    body: 'Your data is primarily processed and stored in the United States. If you are located in the EEA, UK, or Switzerland, we transfer your data to the US under Standard Contractual Clauses (SCCs) approved by the European Commission. Enterprise customers may request data residency in specific regions (EU, APAC) as part of their enterprise agreement.',
  },
  {
    title: '7. Data Retention',
    body: 'We retain your account data for as long as your account is active and for up to 90 days after closure to allow for account recovery requests. Usage and billing records are retained for 7 years for financial and legal compliance. Anonymized, aggregated usage statistics may be retained indefinitely for platform improvement purposes.',
  },
  {
    title: '8. Cookies and Tracking',
    body: 'We use a single session cookie for authentication purposes only — it stores your login state and expires when you close your browser or log out. We do not use tracking cookies, behavioral advertising cookies, or third-party analytics cookies. We do not participate in cross-site tracking. Our status page and documentation may load assets from CDN providers that set their own cookies subject to their privacy policies.',
  },
  {
    title: '9. Your Rights',
    body: 'Depending on your location, you may have the following rights regarding your personal data: Access — request a copy of the data we hold about you; Rectification — correct inaccurate or incomplete information; Erasure — request deletion of your account and personal data; Portability — receive your data in a machine-readable format; Objection — object to processing based on legitimate interests; Restriction — limit how we process your data pending a dispute. To exercise any of these rights, email privacy@cloudach.com. We will respond within 30 days. EU/UK residents may also lodge a complaint with their local data protection authority.',
  },
  {
    title: '10. Security',
    body: 'We implement industry-standard security measures including encryption in transit (TLS 1.2+), encryption at rest (AES-256), network isolation, access controls, and regular security audits. Despite these measures, no system is completely secure. If you discover a security vulnerability, please report it responsibly to security@cloudach.com.',
  },
  {
    title: '11. Children\'s Privacy',
    body: 'The Service is not directed to individuals under the age of 16. We do not knowingly collect personal data from children. If we become aware that we have collected data from a child, we will delete it promptly. If you believe we have inadvertently collected data from a child, please contact privacy@cloudach.com.',
  },
  {
    title: '12. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Material changes will be communicated via email or an in-app notice at least 14 days before taking effect. The "Last updated" date at the top of this page indicates when the policy was last revised. Continued use of the Service after the effective date constitutes acceptance of the updated policy.',
  },
  {
    title: '13. Contact and Data Controller',
    body: 'Cloudach, LLC is the data controller for personal data processed under this policy. For privacy questions, data subject requests, or to reach our Data Protection Officer, contact us at privacy@cloudach.com or by mail at Cloudach, LLC, 1209 Orange Street, Wilmington, DE 19801, USA.',
  },
]

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Cloudach</title>
        <meta name="description" content="Cloudach privacy policy — how we collect, use, and protect your data." />
        <meta property="og:title" content="Privacy Policy — Cloudach" />
        <meta property="og:description" content="Cloudach privacy policy — how we collect, use, and protect your data." />
        <meta property="og:url" content="https://cloudach.com/privacy" />
        <meta name="twitter:title" content="Privacy Policy — Cloudach" />
        <meta name="twitter:description" content="Cloudach privacy policy — how we collect, use, and protect your data." />
      </Head>
      <Nav />
      <main style={{ background: '#07080f', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <div className="sec-tag">Legal</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.12, color: 'var(--text-1)', margin: '16px 0 8px' }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 16 }}>Last updated: April 14, 2026</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ fontSize: 13, color: 'var(--brand)' }}>Terms of Service</Link>
          <Link href="/acceptable-use" style={{ fontSize: 13, color: 'var(--brand)' }}>Acceptable Use Policy</Link>
        </div>

        {SECTIONS.map(s => (
          <div key={s.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>{s.title}</h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75 }}>{s.body}</p>
          </div>
        ))}
      </div>
      </main>
      <Footer />
    </>
  )
}
