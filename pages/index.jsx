import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Models from '../components/Models'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'
import Logo from '../components/Logo'

const trustNames = ['Weights & Biases', 'Hugging Face', 'LangChain', 'Cohere', 'Mistral AI', 'Scale AI']

export default function Home() {
  return (
    <>
      <Head>
        <title>Cloudach — Deploy any open-source LLM in under 60 seconds</title>
        <meta name="description" content="The fastest way to deploy, scale, and serve open-source LLMs in production. One API. Any model. Zero GPU ops." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:title" content="Cloudach — Deploy any open-source LLM in under 60 seconds" />
        <meta property="og:description" content="The fastest way to deploy, scale, and serve open-source LLMs in production. One API. Any model. Zero GPU ops." />
        <meta property="og:url" content="https://cloudach.com" />
        <meta name="twitter:title" content="Cloudach — Deploy any open-source LLM in under 60 seconds" />
        <meta name="twitter:description" content="The fastest way to deploy, scale, and serve open-source LLMs in production. One API. Any model. Zero GPU ops." />
      </Head>

      <Nav />

      <main>
        <Hero />

        <div className="trust-bar">
          <span className="trust-label">Trusted by teams at</span>
          {trustNames.map(n => <span className="trust-name" key={n}>{n}</span>)}
        </div>

        <Features />
        <Models />
        <Pricing />

        <section className="cta-band">
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <Logo size={36} />
          </div>
          <h2>Your model.<br />Production-ready today.</h2>
          <p>
            Join thousands of developers and businesses running LLMs on Cloudach.<br />
            No credit card required to start.
          </p>
          <Link href="/signup"><button className="btn-cta-white">Deploy your first model free</button></Link>
        </section>
      </main>

      <Footer />
    </>
  )
}
