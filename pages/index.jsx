import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Models from '../components/Models'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'
import Logo from '../components/Logo'

const trustNames = ['Acme Corp', 'NeuralStack', 'DataForge', 'Synthetic Labs', 'OpenMind AI', 'Vertex Labs']

export default function Home() {
  return (
    <>
      <Head>
        <title>Cloudach — Deploy any LLM to the cloud</title>
        <meta name="description" content="The developer platform for hosting, scaling, and fine-tuning open-source language models. One API. Any model. Production-ready in minutes." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
