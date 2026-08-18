'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

import { isLocale, localeCodes, localeNames, type Locale } from '@/i18n/config'

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('language')

  function switchLocale(locale: Locale) {
    const segments = pathname.split('/')

    if (isLocale(segments[1])) {
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
        {localeCodes.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
    </label>
  )
}
