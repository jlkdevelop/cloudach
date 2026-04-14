import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — Cloudach</title>
        <meta name="description" content="Cloudach terms of service — the rules and conditions for using the platform." />
        <meta property="og:title" content="Terms of Service — Cloudach" />
        <meta property="og:description" content="Cloudach terms of service — the rules and conditions for using the platform." />
        <meta property="og:url" content="https://cloudach.com/terms" />
        <meta name="twitter:title" content="Terms of Service — Cloudach" />
        <meta name="twitter:description" content="Cloudach terms of service — the rules and conditions for using the platform." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <div className="sec-tag">Legal</div>
        <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, color: '#0D0F1A', margin: '16px 0 8px' }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 40 }}>Last updated: April 2026</p>

        {[
          { title: 'Acceptance', body: 'By using Cloudach, you agree to these terms. If you do not agree, do not use the platform.' },
          { title: 'Permitted use', body: 'You may use Cloudach to deploy, serve, and fine-tune open-source language models for lawful purposes. You may not use the platform to generate illegal content, conduct attacks, or violate any applicable law.' },
          { title: 'Account responsibility', body: 'You are responsible for all activity on your account and for keeping your API keys secure. Do not share API keys publicly or commit them to version control.' },
          { title: 'Usage limits', body: 'Free tier accounts are subject to rate limits and token quotas as described on the pricing page. We reserve the right to suspend accounts that abuse the free tier.' },
          { title: 'Uptime and SLA', body: 'We target 99.9% monthly uptime. SLA guarantees are available on Enterprise plans only and are subject to the terms of your enterprise agreement.' },
          { title: 'Termination', body: 'You may delete your account at any time. We reserve the right to terminate accounts that violate these terms. Upon termination, your data will be deleted within 30 days.' },
          { title: 'Liability', body: 'Cloudach is provided "as is". We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.' },
          { title: 'Contact', body: 'For questions about these terms, contact us at legal@cloudach.com.' },
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
