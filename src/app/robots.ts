import type { MetadataRoute } from 'next'
import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'
import { robotsData } from '@/utilities/discoveryRules'
export const dynamic = 'force-dynamic'
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSearchSettings('en')
  return robotsData(settings, siteOrigin(settings.siteUrl))
}
