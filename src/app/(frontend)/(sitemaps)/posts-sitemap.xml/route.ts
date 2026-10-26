import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'
export const dynamic = 'force-dynamic'
export async function GET() {
  const settings = await getSearchSettings()
  return Response.redirect(`${siteOrigin(settings.siteUrl)}/sitemap.xml`, 301)
}
