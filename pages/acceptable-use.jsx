import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const SECTIONS = [
  {
    title: '1. Overview',
    body: 'This Acceptable Use Policy ("AUP") governs how you may use the Cloudach platform, APIs, and associated services (the "Service"). This policy is incorporated by reference into our Terms of Service. Violations of this AUP may result in suspension or termination of your account without notice or refund.',
  },
  {
    title: '2. Prohibited Content',
    body: 'You must not use the Service to generate, process, distribute, or facilitate: child sexual abuse material (CSAM) or any sexual content involving minors; content that incites, glorifies, or facilitates violence, terrorism, or self-harm; content designed to defraud, impersonate, or deceive others; non-consensual intimate imagery or deepfakes intended to harm individuals; hate speech targeting individuals or groups based on protected characteristics.',
  },
  {
    title: '3. Prohibited Activities',
    body: 'You must not use the Service to: develop or deploy malware, ransomware, spyware, or other malicious code; conduct denial-of-service attacks, credential stuffing, or brute-force attacks against any system; engage in phishing, social engineering, or impersonation schemes; scrape, harvest, or misuse personal data without authorization; circumvent or attempt to circumvent rate limits, quotas, or access controls; resell or sublicense access to the Service without express written permission from Cloudach.',
  },
  {
    title: '4. Legal Compliance',
    body: 'You must comply with all applicable laws when using the Service, including data protection laws (GDPR, CCPA), intellectual property laws, export control regulations, and anti-spam laws. You must not use the Service in any jurisdiction where doing so is prohibited by local law. You are solely responsible for ensuring your use of AI-generated outputs complies with applicable regulations in your industry and jurisdiction.',
  },
  {
    title: '5. Model and Infrastructure Rules',
    body: 'You must not attempt to extract, reverse-engineer, or replicate Cloudach\'s proprietary infrastructure, routing systems, or optimization layers. You must not upload model weights or datasets that contain or were trained on illegally obtained data, CSAM, or content that violates third-party intellectual property rights without a valid license. Custom model deployments must comply with the license terms of the underlying model weights.',
  },
  {
    title: '6. API Usage Guidelines',
    body: 'API requests must reflect genuine application usage. You must not use the Service to artificially inflate usage metrics, benchmark against other cloud providers in a way that violates their terms, or stress-test the platform without prior written approval. Automated abuse of the free tier to circumvent paid plan limits is prohibited and will result in account suspension.',
  },
  {
    title: '7. Content Generation Responsibility',
    body: 'You are responsible for the outputs generated through your use of the Service, including their accuracy, legality, and appropriateness. Cloudach is not liable for AI-generated content. If you build user-facing products on top of the Service, you must implement your own content moderation appropriate to your use case and user base, and you must not represent AI-generated content as human-authored in ways that could deceive or harm users.',
  },
  {
    title: '8. Competitive Intelligence',
    body: 'You must not use the Service to build tools specifically designed to scrape, monitor, or aggregate competitive intelligence about Cloudach\'s pricing, infrastructure topology, or internal systems. Benchmark results may be published for your own research and product purposes, but you must not publish misleading comparisons that misrepresent Cloudach\'s capabilities.',
  },
  {
    title: '9. Enforcement',
    body: 'Cloudach reserves the right to investigate any suspected violation of this AUP. Upon confirming a violation, we may: issue a warning; throttle or rate-limit your account; suspend your account with or without notice; terminate your account and delete your data; report activity to law enforcement where required by law or where lives are at risk. We will make reasonable efforts to notify you of enforcement actions except where doing so would compromise an investigation or is prohibited by law.',
  },
  {
    title: '10. Reporting Violations',
    body: 'If you believe someone is violating this AUP or you have discovered misuse of the platform, please report it to abuse@cloudach.com. Include as much detail as possible: account identifiers, timestamps, description of the activity, and any supporting evidence. We take all reports seriously and will investigate promptly.',
  },
  {
    title: '11. Modifications',
    body: 'We may update this AUP as the platform evolves. Material changes will be communicated via email or in-app notice at least 14 days before taking effect. Continued use of the Service after the effective date constitutes acceptance of the updated policy.',
  },
  {
    title: '12. Contact',
    body: 'For questions about this policy or to report a violation, contact us at abuse@cloudach.com. For legal matters, contact legal@cloudach.com.',
  },
]

export default function AcceptableUse() {
  return (
    <>
      <Head>
        <title>Acceptable Use Policy — Cloudach</title>
        <meta name="description" content="Cloudach acceptable use policy — what you can and cannot do with the platform." />
        <meta property="og:title" content="Acceptable Use Policy — Cloudach" />
        <meta property="og:description" content="Cloudach acceptable use policy — what you can and cannot do with the platform." />
        <meta property="og:url" content="https://cloudach.com/acceptable-use" />
        <meta name="twitter:title" content="Acceptable Use Policy — Cloudach" />
        <meta name="twitter:description" content="Cloudach acceptable use policy — what you can and cannot do with the platform." />
      </Head>
      <Nav />
      <main style={{ background: '#ffffff', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <div className="sec-tag">Legal</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.12, color: 'var(--text-1)', margin: '16px 0 8px' }}>Acceptable Use Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 16 }}>Last updated: April 14, 2026</p>
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ fontSize: 13, color: 'var(--brand)' }}>Terms of Service</Link>
          <Link href="/privacy" style={{ fontSize: 13, color: 'var(--brand)' }}>Privacy Policy</Link>
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
