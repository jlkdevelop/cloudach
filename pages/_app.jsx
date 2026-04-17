import '../styles/globals.css'
import '../styles/dashboard.css'
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Inter, Cairo, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export default function App({ Component, pageProps }) {
  const { locale } = useRouter()

  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = locale || 'en'
  }, [locale])

  return (
    <div className={`${inter.variable} ${cairo.variable} ${jetbrainsMono.variable}`}>
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
