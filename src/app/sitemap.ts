import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { localeCodes } from '@/i18n/config'
import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'

export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSearchSettings()
  if (settings.allowIndexing === false) return []
  const origin = siteOrigin(settings.siteUrl)
  const payload = await getPayload({ config })
  const entries: MetadataRoute.Sitemap = []
  for (const locale of localeCodes) {
    for (const path of ['', '/products', '/posts', '/contact']) entries.push({ url: `${origin}/${locale}${path}` })
    for (const collection of ['pages', 'posts', 'products'] as const) {
      const result = await payload.find({ collection, locale, fallbackLocale: false, depth: 0, draft: false, overrideAccess: false, pagination: false,
        where: { and: [{ _status: { equals: 'published' } }, { title: { exists: true } }] },
      })
      for (const doc of result.docs) {
        if (!doc.slug || !doc.title?.trim() || doc.discovery?.noIndex || (collection === 'pages' && ['home', 'products', 'contact', 'posts', 'search'].includes(doc.slug))) continue
        entries.push({ url: `${origin}/${locale}/${collection === 'pages' ? '' : `${collection}/`}${encodeURIComponent(doc.slug)}`, lastModified: doc.updatedAt })
      }
      if (collection === 'pages') {
        for (const slug of ['solutions', 'about']) {
          if (!result.docs.some((doc) => doc.slug === slug)) entries.push({ url: `${origin}/${locale}/${slug}` })
        }
      }
    }
  }
  return entries
}
