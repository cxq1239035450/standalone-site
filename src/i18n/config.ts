export const localeConfig = {
  defaultLocale: 'en',
  locales: [
    {
      code: 'zh',
      label: '中文',
      htmlLang: 'zh-CN',
    },
    {
      code: 'en',
      label: 'English',
      htmlLang: 'en-US',
    },
  ],
} as const

// Legacy configuration is retained only for archived Payload fields and migration.
// Public languages are loaded from the languages collection at request time.
export type Locale = string

export const defaultLocale = localeConfig.defaultLocale

export const localeCodes = localeConfig.locales.map(({ code }) => code)

export const localeNames = Object.fromEntries(
  localeConfig.locales.map(({ code, label }) => [code, label]),
) as Record<Locale, string>

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|\d{3}))?$/.test(value)
}

export function getHtmlLang(locale: Locale): string {
  return localeConfig.locales.find(({ code }) => code === locale)?.htmlLang ?? locale
}
