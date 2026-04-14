import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | Cloudach</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
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
            background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-muted) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16,
          }}>
            404
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            Page not found
          </h1>
          <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/">
              <button className="btn-solid">Go home</button>
            </Link>
            <Link href="/docs">
              <button className="btn-ghost">View docs</button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
