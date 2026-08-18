'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

import { routing, type Locale } from '@/i18n/routing'

const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('language')

  function switchLocale(locale: Locale) {
    const segments = pathname.split('/')

    if (routing.locales.includes(segments[1] as Locale)) {
      segments[1] = locale
    } else {
      segments.splice(1, 0, locale)
    }

    router.replace(segments.join('/') || `/${locale}`)
  }

  return (
    <label>
      <span className="sr-only">{t('switch')}</span>
      <select
        aria-label={t('switch')}
        className="ml-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700"
        onChange={(event) => switchLocale(event.target.value as Locale)}
        value={currentLocale}
      >
        {routing.locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
    </label>
  )
}
