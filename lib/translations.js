import { useRouter } from 'next/router'

import en from '../public/locales/en/common.json'
import ar from '../public/locales/ar/common.json'
import fr from '../public/locales/fr/common.json'
import de from '../public/locales/de/common.json'
import es from '../public/locales/es/common.json'
import ja from '../public/locales/ja/common.json'
import zh from '../public/locales/zh/common.json'
import pt from '../public/locales/pt/common.json'

const translations = { en, ar, fr, de, es, ja, zh, pt }

export function useTranslation() {
  const { locale = 'en' } = useRouter()
  const dict = translations[locale] || translations.en

  function t(key) {
    // support dot notation: t('nav.signin')
    return key.split('.').reduce((obj, k) => obj?.[k], dict) ?? key
  }

  return { t, locale }
}
