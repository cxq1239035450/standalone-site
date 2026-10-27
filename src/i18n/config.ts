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

export type Locale = (typeof localeConfig.locales)[number]['code']

export const defaultLocale: Locale = localeConfig.defaultLocale

export const localeCodes = localeConfig.locales.map(({ code }) => code) as Locale[]

export const localeNames = Object.fromEntries(
  localeConfig.locales.map(({ code, label }) => [code, label]),
) as Record<Locale, string>

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && localeCodes.includes(value as Locale)
}

export function getHtmlLang(locale: Locale): string {
  return localeConfig.locales.find(({ code }) => code === locale)?.htmlLang ?? locale
}
