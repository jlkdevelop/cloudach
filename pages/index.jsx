import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import ModelTicker from '../components/ModelTicker'
import Features from '../components/Features'
import Models from '../components/Models'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'
import Logo from '../components/Logo'

const testimonials = [
  {
    quote: "We swapped from a managed API to Cloudach in an afternoon. Same interface, 60% cheaper per token, and we finally own our inference stack.",
    name: "Sarah K.",
    role: "Staff ML Engineer",
    company: "Series B AI startup",
  },
  {
    quote: "The deploy-in-60-seconds claim is real. I had Llama 3 70B serving production traffic before my coffee finished brewing.",
    name: "Marcus T.",
    role: "Founder",
    company: "LLM-powered SaaS",
  },
  {
    quote: "Autoscaling and vLLM batching out of the box — it would've taken our infra team weeks to build this ourselves. Cloudach just works.",
    name: "Priya N.",
    role: "Head of Engineering",
    company: "Enterprise AI team",
  },
]

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

        {/* Animated model ticker — Replicate-inspired scrolling showcase */}
        <ModelTicker />

        {/* Trust strip */}
        <div className="trust-bar">
          <span className="trust-label">Trusted by teams at</span>
          {['Weights & Biases', 'Hugging Face', 'LangChain', 'Cohere', 'Mistral AI', 'Scale AI'].map(n => (
            <span className="trust-name" key={n}>{n}</span>
          ))}
        </div>

        <Features />
        <Models />

        {/* Testimonials */}
        <section className="section-wrap">
          <div className="sec-tag">What developers say</div>
          <h2 className="sec-title">Built for engineers who ship.</h2>
          <div className="tcard-grid">
            {testimonials.map(t => (
              <div className="tcard" key={t.name}>
                <p className="tquote">&ldquo;{t.quote}&rdquo;</p>
                <div className="tauthor">
                  <div className="tauthor-name">{t.name}</div>
                  <div className="tauthor-role">{t.role} &middot; {t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Pricing />

        {/* CTA band */}
        <section className="cta-band">
          <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'center' }}>
            <Logo size={34} />
          </div>
          <h2>Your model.<br />Production-ready today.</h2>
          <p>
            Join 5,000+ developers and teams running open-source LLMs on Cloudach.<br />
            Free to start. No credit card required.
          </p>
          <Link href="/signup">
            <button className="btn-cta-white">Deploy your first model free</button>
          </Link>
        </section>
      </main>

      <Footer />
    </>
  )
}
