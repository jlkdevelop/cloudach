import Head from 'next/head'
import Link from 'next/link'
import Nav from '../components/Nav'
import AnnouncementBar from '../components/AnnouncementBar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Models from '../components/Models'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'
import Logo from '../components/Logo'
import { useTranslation } from '../lib/translations'

const trustNames = ['Weights & Biases', 'Hugging Face', 'LangChain', 'Cohere', 'Mistral AI', 'Scale AI']

export default function Home() {
  const { t } = useTranslation()

  const testimonials = [
    {
      quote: t('home.t1_quote'),
      name: t('home.t1_name'),
      role: t('home.t1_role'),
      company: t('home.t1_company'),
    },
    {
      quote: t('home.t2_quote'),
      name: t('home.t2_name'),
      role: t('home.t2_role'),
      company: t('home.t2_company'),
    },
    {
      quote: t('home.t3_quote'),
      name: t('home.t3_name'),
      role: t('home.t3_role'),
      company: t('home.t3_company'),
    },
  ]

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

      <AnnouncementBar />
      <Nav />

      <main>
        <Hero />

        {/* Trust strip */}
        <div className="trust-bar">
          {trustNames.map(n => (
            <span key={n}>{n}</span>
          ))}
        </div>

        <Features />
        <Models />

        {/* Testimonials */}
        <section className="section-wrap">
          <div className="sec-tag">{t('home.testimonials_tag')}</div>
          <h2 className="sec-title">{t('home.testimonials_title')}</h2>
          <div className="tcard-grid">
            {testimonials.map(testimonial => (
              <div className="tcard" key={testimonial.name}>
                <p className="tquote">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="tauthor">
                  <div className="tauthor-name">{testimonial.name}</div>
                  <div className="tauthor-role">{testimonial.role} &middot; {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Pricing />

        {/* CTA band */}
        <section className="cta-band">
          <div style={{ marginBottom: 22, display: 'flex', justifyContent: 'center' }}>
            <Logo size={48} />
          </div>
          <h2>{t('home.cta_title1')}<br />{t('home.cta_title2')}</h2>
          <p>
            {t('home.cta_sub').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 ? <br /> : null}</span>
            ))}
          </p>
          <div className="cta-band-actions">
            <Link href="/signup">
              <button className="btn-cta-white">{t('home.cta_primary')}</button>
            </Link>
            <Link href="/pricing">
              <button className="btn-cta-ghost-pricing">{t('home.cta_secondary')}</button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
