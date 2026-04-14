import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

function ErrorPage({ statusCode }) {
  const is404 = statusCode === 404
  const title = is404 ? 'Page not found' : 'Something went wrong'
  const description = is404
    ? "The page you're looking for doesn't exist or has been moved."
    : 'We hit an unexpected error on our end. Our team has been notified.'

  return (
    <>
      <Head>
        <title>{statusCode} — {title} | Cloudach</title>
        <meta name="description" content={description} />
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
            background: is404
              ? 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-muted) 100%)'
              : 'linear-gradient(135deg, var(--color-error) 0%, #F87171 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16,
          }}>
            {statusCode}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 12 }}>
            {title}
          </h1>
          <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            {description}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/">
              <button className="btn-solid">Go home</button>
            </Link>
            {!is404 && (
              <button className="btn-ghost" onClick={() => window.location.reload()}>
                Try again
              </button>
            )}
          </div>
          {!is404 && (
            <p style={{ marginTop: 32, fontSize: 13, color: 'var(--color-text-subtle)' }}>
              Check our <Link href="/status" style={{ color: 'var(--color-brand)', textDecoration: 'underline' }}>status page</Link> for ongoing incidents.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default ErrorPage
