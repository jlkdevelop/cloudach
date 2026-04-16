import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using Cloudach (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms. If you do not agree to these Terms, do not use the Service.',
  },
  {
    title: '2. Account Registration',
    body: 'You must create an account to use the Service. You agree to provide accurate, current, and complete information during registration, to maintain and promptly update your account information, and to keep your credentials confidential. You are solely responsible for all activity that occurs under your account. Notify us immediately at security@cloudach.com if you suspect unauthorized access.',
  },
  {
    title: '3. API Access and Keys',
    body: 'Upon registration, you may generate API keys to access the Service programmatically. You must not share API keys publicly, commit them to version control, or otherwise expose them to unauthorized parties. We reserve the right to rotate or revoke API keys at any time for security reasons. Each API key is subject to the rate limits and quotas associated with your plan.',
  },
  {
    title: '4. Permitted Use',
    body: 'You may use the Service to deploy, serve, and fine-tune open-source and custom language models for lawful purposes, including building AI-powered applications, running inference workloads, and integrating model outputs into your products. Your use must comply with all applicable laws and regulations, including export control laws.',
  },
  {
    title: '5. Acceptable Use',
    body: 'Your use of the Service is subject to our Acceptable Use Policy, incorporated herein by reference. You must not use the Service to generate illegal content, facilitate cyberattacks or fraud, create malware, circumvent security measures, or engage in any activity that violates our Acceptable Use Policy. Violations may result in immediate account suspension.',
  },
  {
    title: '6. Payment and Billing',
    body: 'Paid plans are billed monthly or annually in advance. Usage-based charges are billed at the end of each billing period. Prices are subject to change with 30 days\' notice. Failure to pay may result in service suspension. All fees are non-refundable except as required by law or as expressly stated in your enterprise agreement. We accept major credit cards and wire transfers for enterprise accounts.',
  },
  {
    title: '7. Free Tier',
    body: 'Free tier access is provided at our discretion and may be modified or discontinued at any time. Free tier accounts are subject to lower rate limits, token quotas, and may not include SLA guarantees or priority support. We reserve the right to suspend free accounts that abuse available resources or violate these Terms.',
  },
  {
    title: '8. Intellectual Property',
    body: 'Cloudach retains all rights, title, and interest in the Service, including its software, infrastructure, branding, and documentation. Your use of the Service does not grant you any ownership interest. You retain ownership of any content, data, or model weights you upload to the Service. By uploading content, you grant Cloudach a limited license to process and store that content solely to provide the Service to you.',
  },
  {
    title: '9. Data and Privacy',
    body: 'Your use of the Service is subject to our Privacy Policy, incorporated herein by reference. We do not store the content of your API requests or model outputs beyond what is necessary for real-time processing and debugging. Usage metadata (token counts, request timestamps, error rates) is retained for billing and service improvement. Enterprise customers may execute a Data Processing Agreement (DPA) for GDPR compliance.',
  },
  {
    title: '10. Service Availability',
    body: 'We target 99.9% monthly uptime across our infrastructure. Scheduled maintenance windows will be announced at least 24 hours in advance via our status page at cloudach.com/status. SLA credits are available on Business and Enterprise plans as described in your plan documentation. Free tier accounts do not receive SLA guarantees.',
  },
  {
    title: '11. Termination',
    body: 'You may terminate your account at any time from your dashboard settings. We may suspend or terminate your account immediately if you violate these Terms, fail to pay outstanding charges, or engage in activity that poses a security risk to the platform or other users. Upon termination, your right to access the Service ceases and your data will be deleted within 30 days, except where retention is required by law.',
  },
  {
    title: '12. Disclaimer of Warranties',
    body: 'The Service is provided "as is" and "as available" without warranties of any kind, whether express, implied, or statutory, including merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or that model outputs will be accurate, reliable, or suitable for your use case. AI-generated outputs may contain errors and should be reviewed before use.',
  },
  {
    title: '13. Limitation of Liability',
    body: 'To the maximum extent permitted by law, Cloudach and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the Service. Our total aggregate liability to you shall not exceed the greater of the fees you paid in the 12 months preceding the claim or $100 USD.',
  },
  {
    title: '14. Indemnification',
    body: 'You agree to indemnify, defend, and hold harmless Cloudach and its affiliates from any claims, liabilities, damages, and expenses (including reasonable legal fees) arising from your use of the Service, your violation of these Terms, your violation of any third-party rights, or any content you generate or process through the Service.',
  },
  {
    title: '15. Governing Law',
    body: 'These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles. Any disputes shall be resolved exclusively in the state or federal courts located in Delaware. If you are an EU resident, mandatory consumer protection provisions of your country of residence may apply.',
  },
  {
    title: '16. Modifications',
    body: 'We may update these Terms from time to time. Material changes will be communicated via email or an in-app notice at least 14 days before taking effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms. We maintain a changelog of all updates at cloudach.com/changelog.',
  },
  {
    title: '17. Contact',
    body: 'For legal questions or to report a violation, contact us at legal@cloudach.com or by mail at Cloudach, LLC, 1209 Orange Street, Wilmington, DE 19801, USA.',
  },
]

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
      <main style={{ background: '#07080f', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <div className="sec-tag">Legal</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.12, color: 'var(--text-1)', margin: '16px 0 8px' }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 16 }}>Last updated: April 14, 2026</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ fontSize: 13, color: 'var(--brand)' }}>Privacy Policy</Link>
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
