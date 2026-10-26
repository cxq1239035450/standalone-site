import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import type { Locale } from '@/i18n/config'
import { getServerSideURL } from './getURL'
import { searchDescription, searchTitle } from './seoPresentation'

export const getSearchSettings = cache(async (locale: Locale = 'zh') => {
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
              'zh-CN': `${origin}/zh${path}`,
              'en-US': `${origin}/en${path}`,
              'x-default': `${origin}/zh${path}`,
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
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
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
