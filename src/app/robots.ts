import type { MetadataRoute } from 'next'
import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'

export const dynamic = 'force-dynamic'
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSearchSettings('en')
  // Let crawlers read noindex on filtered pages and follow paginated catalog links.
  const privatePaths = ['/admin', '/api/', '/next/']
  return {
    rules: [
      {
        userAgent: '*',
        ...(settings.allowIndexing === false
          ? { disallow: '/' }
          : { allow: ['/', '/api/media/file/'], disallow: privatePaths }),
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot'],
        ...(settings.allowIndexing !== false && settings.geo?.allowAITraining
          ? { allow: ['/', '/api/media/file/'], disallow: privatePaths }
          : { disallow: '/' }),
      },
    ],
    sitemap: `${siteOrigin(settings.siteUrl)}/sitemap.xml`,
  }
}
