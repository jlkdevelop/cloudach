import '../styles/globals.css'
import '../styles/dashboard.css'
import Head from 'next/head'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function App({ Component, pageProps }) {
  return (
    <div className={inter.variable}>
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
    </div>
  )
}
