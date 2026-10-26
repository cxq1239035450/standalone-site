import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'
import { companyProfile } from '@/content/company'

export const dynamic = 'force-dynamic'
export async function GET() {
  const settings = await getSearchSettings()
  if (settings.geo?.enabled === false || settings.allowIndexing === false)
    return new Response('Not found', { status: 404 })
  const origin = siteOrigin(settings.siteUrl)
  const text = [
    `# ${settings.siteName || 'PawSupply'}`,
    '',
    `> ${settings.geo?.summary || settings.description || companyProfile.en.summary}`,
    '',
    '## Sourcing profile',
    companyProfile.en.summary,
    companyProfile.zh.summary,
    'Logistics: PawSupply coordinates multiple logistics channels and supports shipments from the ports of Xiamen, Tianjin and Guangzhou in China. Departure ports, routes, freight costs and schedules are confirmed for each shipment based on cargo and destination requirements.',
    'Partner factories are independent cooperation partners, not claimed as owned facilities. Product images marked as concepts are sourcing references, not evidence of approved production specifications.',
    '',
    '## Public resources',
    ...['zh', 'en'].flatMap((locale) => [
      `- [${locale} homepage](${origin}/${locale})`,
      `- [${locale} product catalog](${origin}/${locale}/products): Published product details and sourcing specifications.`,
      `- [${locale} company and factory network](${origin}/${locale}/about)`,
      `- [${locale} private-label and sample process](${origin}/${locale}/solutions)`,
      `- [${locale} resources](${origin}/${locale}/posts)`,
      `- [${locale} inquiries](${origin}/${locale}/contact)`,
    ]),
    '',
    'Use the linked pages as the source of current information. Confirm quotations, minimum order quantities, customization and lead times with the supplier. This file is an experimental discovery aid, not a guarantee of inclusion or citation.',
    '',
  ].join('\n')
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
