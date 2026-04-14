import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function InternalServerError() {
  return (
    <>
      <Head>
        <title>500 — Server Error | Cloudach</title>
        <meta name="description" content="Something went wrong on our end. We're working on it." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>

      <Nav />

      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            background: 'linear-gradient(135deg, var(--color-error) 0%, #F87171 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16,
          }}>
            500
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            We hit an unexpected error on our end. Our team has been notified and is working on a fix.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-solid" onClick={() => window.location.reload()}>
              Try again
            </button>
            <Link href="/">
              <button className="btn-ghost">Go home</button>
            </Link>
          </div>
          <p style={{ marginTop: 32, fontSize: 13, color: 'var(--color-text-subtle)' }}>
            Check our <Link href="/status" style={{ color: 'var(--color-brand)', textDecoration: 'underline' }}>status page</Link> for ongoing incidents.
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}
