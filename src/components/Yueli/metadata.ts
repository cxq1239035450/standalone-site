import type { Metadata } from 'next'
import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'
import { imageURL } from './data'

export async function equipmentMetadata(
  title: string,
  path = '',
  description?: string | null,
  image?: string,
  noIndex = false,
): Promise<Metadata> {
  const settings = await getSearchSettings('en')
  const origin = siteOrigin(settings.siteUrl)
  const fullTitle = title.includes('Yueli')
    ? title
    : `${title} | ${settings.siteName || 'Yueli Automation'}`
  const text =
    description ||
    settings.description ||
    'Industrial equipment and automation solutions from Yueli Automation.'
  const social = image || imageURL(settings.socialImage)
  const url = origin + (path === '/' ? '' : path)
  return {
    metadataBase: new URL(origin),
    title: { absolute: fullTitle },
    description: text,
    alternates: { canonical: url },
    robots: { index: settings.allowIndexing !== false && !noIndex, follow: true },
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
