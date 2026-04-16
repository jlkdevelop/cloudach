import Link from 'next/link';
import { useTranslation } from '../lib/translations';

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2.5 7.5l3.5 3.5 6.5-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function Pricing() {
  const { t } = useTranslation()

  const plans = [
    {
      key: 'starter',
      name: t('pricing.plan_starter_name'),
      desc: t('pricing.plan_starter_desc'),
      price: t('pricing.plan_starter_price'),
      unit: t('pricing.plan_starter_unit'),
      features: [
        t('pricing.plan_starter_f1'),
        t('pricing.plan_starter_f2'),
        t('pricing.plan_starter_f3'),
        t('pricing.plan_starter_f4'),
      ],
      cta: t('pricing.plan_starter_cta'),
      href: '/signup',
      featured: false,
      showNoCC: true,
    },
    {
      key: 'pro',
      name: t('pricing.plan_pro_name'),
      desc: t('pricing.plan_pro_desc'),
      price: t('pricing.plan_pro_price'),
      unit: t('pricing.plan_pro_unit'),
      features: [
        t('pricing.plan_pro_f1'),
        t('pricing.plan_pro_f2'),
        t('pricing.plan_pro_f3'),
        t('pricing.plan_pro_f4'),
        t('pricing.plan_pro_f5'),
      ],
      cta: t('pricing.plan_pro_cta'),
      href: '/signup',
      featured: true,
      showNoCC: false,
    },
    {
      key: 'enterprise',
      name: t('pricing.plan_enterprise_name'),
      desc: t('pricing.plan_enterprise_desc'),
      price: t('pricing.plan_enterprise_price'),
      unit: t('pricing.plan_enterprise_unit'),
      features: [
        t('pricing.plan_enterprise_f1'),
        t('pricing.plan_enterprise_f2'),
        t('pricing.plan_enterprise_f3'),
        t('pricing.plan_enterprise_f4'),
        t('pricing.plan_enterprise_f5'),
      ],
      cta: t('pricing.plan_enterprise_cta'),
      href: null,
      featured: false,
      showNoCC: false,
    },
  ]

  return (
    <>
      <section className="section-wrap">
        <div className="sec-tag">{t('pricing.how_tag')}</div>
        <h2 className="sec-title">{t('pricing.how_title')}</h2>
        <div className="steps">
          <div className="step">
            <div className="step-n">{t('pricing.step1_n')}</div>
            <div className="step-line" />
            <h3>{t('pricing.step1_title')}</h3>
            <p>{t('pricing.step1_desc')}</p>
          </div>
          <div className="step">
            <div className="step-n">{t('pricing.step2_n')}</div>
            <div className="step-line" />
            <h3>{t('pricing.step2_title')}</h3>
            <p>{t('pricing.step2_desc')}</p>
          </div>
          <div className="step">
            <div className="step-n">{t('pricing.step3_n')}</div>
            <div className="step-line" />
            <h3>{t('pricing.step3_title')}</h3>
            <p>{t('pricing.step3_desc')}</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="stripe-bg">
        <div className="section-wrap">
          <div className="sec-header">
            <div>
              <div className="sec-tag">{t('pricing.tag')}</div>
              <h2 className="sec-title">{t('pricing.title1')}<br />{t('pricing.title2')}</h2>
            </div>
            <p className="sec-sub">{t('pricing.sub')}</p>
          </div>
          <p className="price-trust-note">{t('pricing.trust_note')}</p>
          <div className="price-grid">
            {plans.map(plan => (
              <div className={`pcard${plan.featured ? ' featured' : ''}`} key={plan.key}>
                {plan.featured && <div className="ptag">{t('pricing.most_popular')}</div>}
                <h3>{plan.name}</h3>
                <p className="pdesc">{plan.desc}</p>
                <div className="pamt" style={plan.key === 'enterprise' ? { fontSize: 28, paddingTop: 6 } : {}}>{plan.price}</div>
                <div className="punit">{plan.unit}</div>
                <ul className="plist">
                  {plan.features.map(f => (
                    <li key={f}><CheckIcon />{f}</li>
                  ))}
                </ul>
                {plan.key === 'enterprise' ? (
                  <button className="pbtn pbtn-outline">{plan.cta}</button>
                ) : plan.href ? (
                  <Link href={plan.href}><button className={`pbtn${plan.featured ? ' pblu' : ''}`}>{plan.cta}</button></Link>
                ) : (
                  <button className={`pbtn${plan.featured ? ' pblu' : ''}`}>{plan.cta}</button>
                )}
                {plan.showNoCC && (
                  <p className="plan-free-note">{t('pricing.no_cc')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
