import { getPayload } from 'payload'
import config from '@payload-config'
import { createContentReader } from '@/i18n/content'
import { siteOrigin } from '@/utilities/searchSettings'
import { contentPath } from '@/components/Yueli/data'
import { resourcePath } from '@/components/Yueli/architecture'
import { llmsText, loadDiscovery } from '@/utilities/discovery'
export const dynamic = 'force-dynamic'
export async function GET() {
  // Machine-readable routes bypass the localized page proxy. Read public English
  // content explicitly, without inheriting the default language or preview user.
  const raw = await getPayload({ config })
  const reader = createContentReader(raw)
  const settings = await reader.findGlobal({
    slug: 'search-settings',
    locale: 'en',
    depth: 0,
    overrideAccess: false,
  })
  if (settings.allowIndexing === false || settings.geo?.enabled === false)
    return new Response('Not found', { status: 404 })
  if (settings.geo?.sections?.length) {
    const text = llmsText(await loadDiscovery({ lang: 'en' }))
    return text === null ? new Response('Not found', { status: 404 }) : new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
  const origin = siteOrigin(settings.siteUrl)
  const published = {
    locale: 'en' as const,
    fallbackLocale: false as const,
    depth: 0,
    pagination: false as const,
    draft: false,
    overrideAccess: false,
    where: { _status: { equals: 'published' } },
  }
  const [products, posts, resources] = await Promise.all([
    reader.find({ ...published, collection: 'products', sort: 'title' }),
    reader.find({ ...published, collection: 'posts', sort: '-publishedAt' }),
    raw.find({ ...published, collection: 'equipment-content', sort: 'createdAt' }),
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
    ...resources.docs
      .filter((item) => item._status === 'published' && item.title?.trim() && !item.noIndex)
      .map((item) => `- [${item.title}](${origin}${resourcePath(item)}): ${item.summary || ''}`),
    '',
    '## Published equipment',
    ...products.docs
      .filter((p) => p._status === 'published' && p.title?.trim() && !p.discovery?.noIndex)
      .map(
        (p) =>
          `- [${p.title}](${new URL(contentPath(p, 'product'), origin).href}): ${p.general?.shortDescription || ''}`,
      ),
    '',
    '## Technical resources',
    ...posts.docs
      .filter((p) => p._status === 'published' && p.title?.trim() && !p.discovery?.noIndex)
      .map((p) => `- [${p.title}](${new URL(contentPath(p, 'post'), origin).href})`),
    '',
    'Confirm equipment configuration, quotation, lead time and application suitability with the Yueli team. This file summarizes public content and does not guarantee inclusion in AI search.',
    '',
  ].join('\n')
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
