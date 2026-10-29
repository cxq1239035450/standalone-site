import type { MetadataRoute } from 'next'
import { loadDiscovery } from '@/utilities/discovery'
import { sitemapData } from '@/utilities/discoveryRules'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapData((await loadDiscovery()).entries)
}
