import type { MetadataRoute } from 'next'
import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'

export const dynamic = 'force-dynamic'
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSearchSettings()
  const privatePaths = ['/admin', '/api/', '/*/search', '/*?*']
  return {
    rules: [
      { userAgent: '*', ...(settings.allowIndexing === false ? { disallow: '/' } : { allow: '/', disallow: privatePaths }) },
      { userAgent: ['GPTBot', 'ClaudeBot'], ...(settings.allowIndexing !== false && settings.geo?.allowAITraining ? { allow: '/', disallow: privatePaths } : { disallow: '/' }) },
    ],
    sitemap: `${siteOrigin(settings.siteUrl)}/sitemap.xml`,
  }
}
