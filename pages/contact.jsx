import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useState } from 'react'

export default function Contact() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <Head>
        <title>Contact — Cloudach</title>
        <meta name="description" content="Get in touch with the Cloudach team. Sales, support, partnerships." />
        <meta property="og:title" content="Contact — Cloudach" />
        <meta property="og:description" content="Get in touch with the Cloudach team. Sales, support, partnerships." />
        <meta property="og:url" content="https://cloudach.com/contact" />
        <meta name="twitter:title" content="Contact — Cloudach" />
        <meta name="twitter:description" content="Get in touch with the Cloudach team. Sales, support, partnerships." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '88px 48px' }}>
        <div className="sec-tag">Contact</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.12, color: '#0D0F1A', margin: '16px 0 12px' }}>Get in touch</h1>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, marginBottom: 40 }}>
          For enterprise sales, partnerships, or general inquiries — fill out the form and we'll get back to you within one business day.
        </p>

        {sent ? (
          <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ fontSize: 15, color: '#065F46', fontWeight: 600 }}>Message sent — we'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="db-field">
              <label className="db-label">Name</label>
              <input className="db-input" type="text" placeholder="Your name" required />
            </div>
            <div className="db-field">
              <label className="db-label">Work email</label>
              <input className="db-input" type="email" placeholder="you@company.com" required />
            </div>
            <div className="db-field">
              <label className="db-label">Subject</label>
              <select className="db-input" required style={{ cursor: 'pointer' }}>
                <option value="">Select a topic</option>
                <option>Enterprise sales</option>
                <option>Partnership</option>
                <option>Technical support</option>
                <option>General inquiry</option>
              </select>
            </div>
            <div className="db-field">
              <label className="db-label">Message</label>
              <textarea className="db-input" placeholder="Tell us what you need..." rows={5} required style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" className="btn-cta" style={{ width: '100%', padding: '13px' }}>Send message</button>
          </form>
        )}
      </main>
      <Footer />
    </>
  )
}
