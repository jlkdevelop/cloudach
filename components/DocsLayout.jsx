import Head from 'next/head';
import Link from 'next/link';
import Nav from './Nav';
import Footer from './Footer';

export default function DocsLayout({
  title = 'API Documentation — Cloudach',
  description = 'Cloudach API documentation — OpenAI-compatible LLM API. Quickstart, authentication, endpoints, and code examples.',
  ogUrl = 'https://cloudach.com/docs',
  toc,
  children,
}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://cloudach.com/og-image.png" />
        <meta property="og:url" content={ogUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://cloudach.com/og-image.png" />
      </Head>

      <Nav />

      <main
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-ink)',
          minHeight: '100vh',
          paddingTop: 112,
        }}
      >
        <div
          className="docs-shell"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 220px) minmax(0, 1fr)',
            gap: 56,
            maxWidth: 1180,
            margin: '0 auto',
            padding: '32px 24px 96px',
            alignItems: 'start',
          }}
        >
          <aside style={{ position: 'sticky', top: 120, alignSelf: 'start' }}>
            <nav aria-label="Docs navigation">
              {toc && toc.map(([href, label]) => {
                const isSub = typeof label === 'string' && label.startsWith('↳');
                return (
                  <a
                    key={href}
                    href={href}
                    className={isSub ? 'docs-toc-link docs-toc-sub' : 'docs-toc-link'}
                  >
                    {label}
                  </a>
                );
              })}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid var(--color-rule)',
                }}
              >
                <Link href="/changelog" className="docs-toc-link">
                  Changelog
                </Link>
              </div>
            </nav>
          </aside>

          <div style={{ minWidth: 0 }}>{children}</div>
        </div>
      </main>

      <Footer />
    </>
  );
}
