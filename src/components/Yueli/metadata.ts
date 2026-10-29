import type { Metadata } from 'next'
import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'
import { imageURL, getYueli } from './data'
import { getLocale } from 'next-intl/server'
import { yueliLocalePath } from '@/i18n/yueliPaths'

export async function equipmentMetadata(
  title: string,
  path = '',
  description?: string | null,
  image?: string,
  noIndex = false,
): Promise<Metadata> {
  const locale = await getLocale()
  const settings = await getSearchSettings(locale)
  const origin = siteOrigin(settings.siteUrl)
  const fullTitle = title.includes('Yueli')
    ? title
    : `${title} | ${settings.siteName || 'Yueli Automation'}`
  const text =
    description ||
    settings.description ||
    'Industrial equipment and automation solutions from Yueli Automation.'
  const social =
    image || imageURL(settings.socialImage) || imageURL((await getYueli()).site.slides?.[0]?.image)
  const localizedPath = yueliLocalePath(path || '/', locale)
  const url = origin + (localizedPath === '/' ? '' : localizedPath)
  return {
    metadataBase: new URL(origin),
    title: { absolute: fullTitle },
    description: text,
    alternates: { canonical: url },
    robots: {
      index: settings.allowIndexing !== false && !noIndex,
      follow: true,
      'max-image-preview': 'large',
    },
    openGraph: {
      title: fullTitle,
      description: text,
      url,
      siteName: settings.siteName || 'Yueli Automation',
      type: 'website',
      ...(social ? { images: [{ url: social }] } : {}),
    },
    twitter: {
      card: social ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description: text,
      ...(social ? { images: [social] } : {}),
    },
  }
}
