import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Cloudach</title>
        <meta name="description" content="Cloudach Privacy Policy — how we collect, use, and protect your data." />
        <meta property="og:title" content="Privacy Policy — Cloudach" />
        <meta property="og:description" content="Cloudach Privacy Policy — how we collect, use, and protect your data." />
        <meta property="og:url" content="https://cloudach.com/privacy" />
        <meta property="og:type" content="website" />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <div className="sec-tag">Legal</div>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, color: '#0D0F1A', margin: '16px 0 8px' }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 40 }}>Last updated: April 2026</p>

        {[
          { title: 'What we collect', body: 'We collect your email address, usage data (API requests, token counts), and billing information when you upgrade to a paid plan. We do not store the content of your API requests or model outputs.' },
          { title: 'How we use your data', body: 'Your data is used to provide the Cloudach service, calculate billing, send transactional emails, and improve the platform. We do not sell your data to third parties.' },
          { title: 'Data storage', body: 'Your data is stored on servers in the United States. Enterprise customers may request data residency in specific regions (EU, APAC) as part of their plan.' },
          { title: 'Cookies', body: 'We use session cookies for authentication only. We do not use tracking cookies or third-party advertising cookies.' },
          { title: 'Your rights', body: 'You may request deletion of your account and all associated data at any time by emailing privacy@cloudach.com. We will process deletion requests within 30 days.' },
          { title: 'Contact', body: 'For privacy questions, contact us at privacy@cloudach.com.' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0D0F1A', marginBottom: 8 }}>{s.title}</h2>
            <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.75 }}>{s.body}</p>
          </div>
        ))}
      </main>
      <Footer />
    </>
  )
}
