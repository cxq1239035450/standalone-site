import { cache } from 'react'
import { getPayload } from '@/i18n/content'
import config from '@payload-config'
import type { Metadata } from 'next'
import type { Locale } from '@/i18n/config'
import { getServerSideURL } from './getURL'
import { searchDescription, searchTitle } from './seoPresentation'
import { getLanguageRegistry } from '@/i18n/service'

export const getSearchSettings = cache(async (locale?: Locale) => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'search-settings', locale, depth: 1, overrideAccess: false })
})

export const siteOrigin = (value?: string | null) => {
  try {
    return new URL(value || getServerSideURL()).origin
  } catch {
    return new URL(getServerSideURL()).origin
  }
}

export async function pageMetadata({
  locale,
  path = '',
  title,
  description,
  noIndex = false,
  image,
  languages = true,
}: {
  locale: Locale
  path?: string
  title?: string | null
  description?: string | null
  noIndex?: boolean
  image?: string | null
  languages?: boolean
}): Promise<Metadata> {
  const settings = await getSearchSettings(locale)
  const origin = siteOrigin(settings.siteUrl)
  const name = settings.siteName || 'PawSupply'
  const fullTitle = searchTitle(title, name)
  const text = searchDescription(description, settings.description, locale)
  const canonical = `${origin}/${locale}${path}`
  const registry = await getLanguageRegistry()
  let alternateLanguages = registry.languages
  const match = /^\/(products|posts)\/([^/]+)$/.exec(path)
  if (match) {
    const payload = await getPayload({ config })
    const available = await Promise.all(registry.languages.map(async language => {
      const result = await payload.find({ collection: match[1] as 'products' | 'posts', locale: language.code, depth: 0, limit: 1, where: { slug: { equals: decodeURIComponent(match[2]) } } })
      return result.docs.length ? language : null
    }))
    alternateLanguages = available.filter((item): item is typeof registry.languages[number] => Boolean(item))
  }
  const media = settings.socialImage
  const imageURL =
    image ||
    (media && typeof media === 'object' ? media.url : undefined) ||
    '/pet-assets/hero-pets.webp'
  return {
    metadataBase: new URL(origin),
    title: { absolute: fullTitle },
    description: text,
    alternates: {
      canonical,
      ...(languages
        ? {
            languages: {
              ...Object.fromEntries(alternateLanguages.map(language => [language.htmlLang || language.code, `${origin}/${language.code}${path}`])),
              ...(alternateLanguages.some(language => language.code === registry.defaultLocale) ? { 'x-default': `${origin}/${registry.defaultLocale}${path}` } : {}),
            },
          }
        : {}),
    },
    robots: { index: settings.allowIndexing !== false && !noIndex, follow: true },
    openGraph: {
      title: fullTitle,
      description: text,
      url: canonical,
      siteName: name,
      locale: (registry.languages.find(language => language.code === locale)?.htmlLang || locale).replaceAll('-', '_'),
      type: 'website',
      ...(imageURL ? { images: [{ url: new URL(imageURL, origin).href }] } : {}),
    },
    twitter: {
      card: imageURL ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description: text,
      ...(imageURL ? { images: [new URL(imageURL, origin).href] } : {}),
    },
  }
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
