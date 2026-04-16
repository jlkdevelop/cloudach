import Link from 'next/link'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '../lib/translations'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer>
      <div className="footer-wrap">
        <div className="fbrand">
          <div className="logo">
            <Logo size={24} />
            <span className="logo-text" style={{ fontSize: 15 }}>cloud<span>ach</span></span>
          </div>
          <p>{t('footer.tagline')}</p>
        </div>
        <div className="flinks">
          <div className="fcol">
            <h5>{t('footer.col_platform')}</h5>
            <a href="#platform">{t('footer.deploy')}</a>
            <a href="#platform">{t('footer.finetuning')}</a>
            <a href="#platform">{t('footer.autoscaling')}</a>
            <Link href="/enterprise">{t('footer.private_vpc')}</Link>
          </div>
          <div className="fcol">
            <h5>{t('footer.col_models')}</h5>
            <a href="#models">{t('footer.model_library')}</a>
            <a href="#models">{t('footer.custom_weights')}</a>
            <a href="#models">{t('footer.huggingface')}</a>
            <Link href="/docs">{t('footer.benchmarks')}</Link>
          </div>
          <div className="fcol">
            <h5>{t('footer.col_developers')}</h5>
            <Link href="/docs">{t('footer.documentation')}</Link>
            <Link href="/docs#authentication">{t('footer.api_reference')}</Link>
            <Link href="/docs#sdks">{t('footer.cli')}</Link>
            <Link href="/status">{t('footer.status')}</Link>
          </div>
          <div className="fcol">
            <h5>{t('footer.col_company')}</h5>
            <Link href="/company">{t('footer.company')}</Link>
            <Link href="/about">{t('footer.about')}</Link>
            <Link href="/blog">{t('footer.blog')}</Link>
            <Link href="/enterprise">{t('footer.enterprise')}</Link>
            <Link href="/contact">{t('footer.contact')}</Link>
          </div>
        </div>
      </div>
      <div className="foot-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <p>{t('footer.copyright')}</p>
          <LanguageSwitcher compact />
        </div>
        <div className="foot-bar-links">
          <Link href="/privacy">{t('footer.privacy')}</Link>
          <Link href="/terms">{t('footer.terms')}</Link>
          <Link href="/acceptable-use">{t('footer.acceptable_use')}</Link>
        </div>
      </div>
    </footer>
  )
}
