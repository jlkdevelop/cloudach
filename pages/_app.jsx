import '../styles/globals.css'
import '../styles/dashboard.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
