import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'
import { getProducts, getPosts, contentPath } from '@/components/Yueli/data'
import { getEquipmentContent, resourcePath } from '@/components/Yueli/architecture'
export const dynamic = 'force-dynamic'
export async function GET() {
  const settings = await getSearchSettings('en')
  if (settings.allowIndexing === false || settings.geo?.enabled === false)
    return new Response('Not found', { status: 404 })
  const origin = siteOrigin(settings.siteUrl)
  const [products, posts, resources] = await Promise.all([
    getProducts(),
    getPosts(),
    getEquipmentContent(),
  ])
  const text = [
    `# ${settings.siteName || 'Yueli Automation'}`,
    '',
    `> ${settings.geo?.summary || settings.description || ''}`,
    '',
    '## Company and contact',
    ...[
      '/',
      '/products',
      '/solutions',
      '/manufacturing',
      '/resources',
      '/about-us',
      '/faq',
      '/contact-us',
    ].map((p) => `- ${origin}${p}`),
    '',
    '## Application solutions and buying guides',
    ...resources
      .filter((item) => !item.noIndex)
      .map((item) => `- [${item.title}](${origin}${resourcePath(item)}): ${item.summary}`),
    '',
    '## Published equipment',
    ...products
      .filter((p) => !p.discovery?.noIndex)
      .map(
        (p) =>
          `- [${p.title}](${new URL(contentPath(p, 'product'), origin).href}): ${p.general?.shortDescription || ''}`,
      ),
    '',
    '## Technical resources',
    ...posts
      .filter((p) => !p.discovery?.noIndex)
      .map((p) => `- [${p.title}](${new URL(contentPath(p, 'post'), origin).href})`),
    '',
    'Confirm equipment configuration, quotation, lead time and application suitability with the Yueli team. This file summarizes public content and does not guarantee inclusion in AI search.',
    '',
  ].join('\n')
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
