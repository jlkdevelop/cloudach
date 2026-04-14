import '../styles/globals.css'
import '../styles/dashboard.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@cloudach" />
        <meta property="og:site_name" content="Cloudach" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://cloudach.com/og-default.png" />
        <meta name="twitter:image" content="https://cloudach.com/og-default.png" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
