import type { MetadataRoute } from 'next'
import { getEquipmentContent, resourcePath } from '@/components/Yueli/architecture'
import { getPostArchiveDefinitions, postsInArchive } from '@/components/Yueli/postTaxonomy'
import { getSearchSettings, siteOrigin } from '@/utilities/searchSettings'
import {
  getProducts,
  getPosts,
  getPages,
  getCategories,
  contentPath,
  categoryIDs,
  categoryBranch,
} from '@/components/Yueli/data'
export const dynamic = 'force-dynamic'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSearchSettings('en')
  if (settings.allowIndexing === false) return []
  const origin = siteOrigin(settings.siteUrl)
  const [products, posts, pages, categories, resources] = await Promise.all([
    getProducts(),
    getPosts(),
    getPages(),
    getCategories(),
    getEquipmentContent(),
  ])
  const paths = new Map<string, string | undefined>([
    ['/', undefined],
    ['/products', undefined],
    ['/blog', undefined],
    ['/about-us', undefined],
    ['/faq', undefined],
    ['/contact-us', undefined],
    ['/solutions', undefined],
    ['/manufacturing', undefined],
    ['/resources', undefined],
  ])
  for (const [type, docs] of [
    ['product', products],
    ['post', posts],
    ['page', pages],
  ] as const)
    for (const doc of docs) {
      if (doc._status === 'published' && !doc.discovery?.noIndex)
        paths.set(contentPath(doc, type), doc.updatedAt)
    }
  for (const cat of categories)
    if (
      products.some((p) => categoryIDs(p).some((id) => categoryBranch(cat.id, categories).has(id)))
    )
      paths.set(contentPath(cat, 'category'), cat.updatedAt)
  for (const doc of resources) if (!doc.noIndex) paths.set(resourcePath(doc), doc.updatedAt)
  for (const kind of ['category', 'tag'] as const)
    for (const archive of await getPostArchiveDefinitions(kind)) {
      const published = postsInArchive(kind, archive, posts)
      if (published.length && published.some((post) => !post.discovery?.noIndex))
        paths.set(
          archive.path,
          published
            .map((post) => post.updatedAt)
            .sort()
            .at(-1),
        )
    }
  return [...paths]
    .filter(([path]) => path !== '/home')
    .map(([path, lastModified]) => ({
      url: new URL(path, origin).href,
      ...(lastModified ? { lastModified } : {}),
    }))
}
