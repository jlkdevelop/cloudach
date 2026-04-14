import Head from 'next/head'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import Link from 'next/link'

export default function About() {
  return (
    <>
      <Head>
        <title>About — Cloudach</title>
        <meta name="description" content="Cloudach is the developer platform for hosting, scaling, and fine-tuning open-source language models." />
        <meta property="og:title" content="About — Cloudach" />
        <meta property="og:description" content="Cloudach is the developer platform for hosting, scaling, and fine-tuning open-source language models." />
        <meta property="og:url" content="https://cloudach.com/about" />
        <meta name="twitter:title" content="About — Cloudach" />
        <meta name="twitter:description" content="Cloudach is the developer platform for hosting, scaling, and fine-tuning open-source language models." />
      </Head>
      <Nav />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '88px 48px' }}>
        <div className="sec-tag">About</div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.12, color: '#0D0F1A', margin: '16px 0 24px' }}>
          We make open-source LLMs production-ready.
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.75, marginBottom: 24 }}>
          Cloudach is a developer-focused cloud platform for deploying, scaling, and fine-tuning open-source language models. We believe every developer and company should have access to powerful AI infrastructure — without managing GPUs, configuring vLLM, or building their own serving stack.
        </p>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.75, marginBottom: 24 }}>
          We built Cloudach because the gap between "I want to run Llama 3" and "I have a production-grade API endpoint" was too wide. Our platform closes that gap in under 60 seconds.
        </p>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.75, marginBottom: 48 }}>
          We're a team of engineers and operators who have worked on large-scale ML infrastructure. We're building the platform we always wanted to use.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/signup"><button className="btn-cta">Get started free</button></Link>
          <Link href="/contact"><button className="btn-cta-ghost">Get in touch</button></Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
