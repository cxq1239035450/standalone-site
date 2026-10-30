import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createContentReader } from '@/i18n/content'
import { localizedContentPath } from '@/i18n/contentRoutes'
import { siteOrigin } from '@/utilities/searchSettings'
import { contentPath, categoryIDs, categoryBranch } from '@/components/Yueli/data'
import { normalizePostTaxonomies, postsInArchive } from '@/components/Yueli/postTaxonomy'
import { canonicalURL, sameCanonical } from '@/utilities/discoveryRules'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const raw = await getPayload({ config })
  // Metadata routes have no localized page request. Never inherit a default zh
  // request or preview user while building the English site's public sitemap.
  const reader = createContentReader(raw)
  const settings = await reader.findGlobal({
    slug: 'search-settings',
    locale: 'en',
    depth: 0,
    overrideAccess: false,
  })
  if (settings.allowIndexing === false || settings.sitemap?.enabled === false) return []
  const origin = siteOrigin(settings.siteUrl)
  const languages = raw.collections.languages
    ? (
        await raw.find({
          collection: 'languages',
          depth: 0,
          pagination: false,
          overrideAccess: false,
          where: { enabled: { equals: true } },
        })
      ).docs
    : [{ code: 'en' }]
  const paths = new Map<string, string | undefined>()
  const add = (path: string, locale: string, updated?: string) => {
    if (!path.startsWith('/') || path.startsWith('//')) return
    paths.set(localizedContentPath(path, locale), updated)
  }
  for (const language of languages) {
    const locale = language.code
    const common = {
      locale,
      depth: 0,
      pagination: false as const,
      draft: false,
      overrideAccess: false,
      where: { _status: { equals: 'published' } },
    }
    const [products, posts, pages] = await Promise.all([
      reader.find({ ...common, collection: 'products' }),
      reader.find({ ...common, collection: 'posts' }),
      reader.find({ ...common, collection: 'pages' }),
    ])
    if (locale === 'en' && settings.sitemap?.includeCore !== false) {
      // These English routes have their own Yueli layouts. Other languages must
      // never inherit them merely because the language is enabled.
      for (const path of [
        '/products',
        '/blog',
        '/about-us',
        '/faq',
        '/contact-us',
        '/solutions',
        '/manufacturing',
        '/resources',
      ])
        add(path, locale)
    }
    for (const [type, result] of [
      ['product', products],
      ['post', posts],
      ['page', pages],
    ] as const)
      for (const doc of result.docs) {
        const scope = type === 'product' ? 'includeProducts' : type === 'post' ? 'includePosts' : 'includePages'
        if (settings.sitemap?.[scope] === false) continue
        if (doc._status !== 'published' || doc.discovery?.noIndex || !doc.title?.trim()) continue
        const automatic = new URL(localizedContentPath(type === 'page' && doc.slug === 'home' ? '/' : contentPath(doc, type), locale), origin).href
        if (!sameCanonical(automatic, canonicalURL(automatic, doc.discovery?.canonicalUrl))) continue
        if (type === 'page' && ['search', 'products', 'blog'].includes(doc.slug || '')) continue
        if (type === 'page' && doc.slug === 'home') add('/', locale, doc.updatedAt)
        else add(contentPath(doc, type), locale, doc.updatedAt)
      }
    if (locale !== 'en') continue
    const [categories, resources] = await Promise.all([
      reader.find({
        collection: 'categories',
        locale,
        depth: 0,
        pagination: false,
        draft: false,
        overrideAccess: false,
      }),
      raw.find({
        collection: 'equipment-content',
        locale: 'en',
        depth: 0,
        pagination: false,
        draft: false,
        overrideAccess: false,
        where: { _status: { equals: 'published' } },
      }),
    ])
    const productCategories = categories.docs.filter(
      (cat) => !cat.taxonomy || cat.taxonomy === 'product',
    )
    for (const cat of productCategories)
      if (
        settings.sitemap?.includeProducts !== false && cat.title?.trim() &&
        products.docs.some((product) =>
          categoryIDs(product).some((id) => categoryBranch(cat.id, productCategories).has(id)),
        )
      )
        add(contentPath(cat, 'category'), locale, cat.updatedAt)
    for (const doc of resources.docs)
      if (settings.sitemap?.includePages !== false && !doc.noIndex && doc._status === 'published')
        add(
          `${doc.kind === 'solution' ? '/solutions' : '/resources'}/${doc.slug}`,
          locale,
          doc.updatedAt,
        )
    for (const kind of ['category', 'tag'] as const) {
      const records = categories.docs.filter(
        (cat) =>
          cat.taxonomy === (kind === 'category' ? 'post-category' : 'post-tag') &&
          cat.title?.trim(),
      )
      // Missing published category translations cannot fall back to source JSON.
      if (!records.length) continue
      for (const archive of normalizePostTaxonomies(kind, records)) {
        const published = postsInArchive(kind, archive, posts.docs)
        if (settings.sitemap?.includePosts !== false && published.some((post) => !post.discovery?.noIndex))
          add(
            archive.path,
            locale,
            published
              .map((post) => post.updatedAt)
              .sort()
              .at(-1),
          )
      }
    }
  }
  return [...paths].map(([path, lastModified]) => ({
    url: new URL(path, origin).href,
    ...(lastModified ? { lastModified } : {}),
  }))
}
