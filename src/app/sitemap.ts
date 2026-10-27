import type { MetadataRoute } from 'next'
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
  const [products, posts, pages, categories] = await Promise.all([
    getProducts(),
    getPosts(),
    getPages(),
    getCategories(),
  ])
  const paths = new Map<string, string | undefined>([
    ['/', undefined],
    ['/products', undefined],
    ['/blog', undefined],
    ['/about-us', undefined],
    ['/faq', undefined],
    ['/contact-us', undefined],
  ])
  for (const [type, docs] of [
    ['product', products],
    ['post', posts],
    ['page', pages],
  ] as const)
    for (const doc of docs) {
      if (!doc.discovery?.noIndex) paths.set(contentPath(doc, type), doc.updatedAt)
    }
  for (const cat of categories)
    if (
      products.some((p) => categoryIDs(p).some((id) => categoryBranch(cat.id, categories).has(id)))
    )
      paths.set(contentPath(cat, 'category'), cat.updatedAt)
  return [...paths]
    .filter(([path]) => path !== '/home')
    .map(([path, lastModified]) => ({
      url: new URL(path, origin).href,
      ...(lastModified ? { lastModified } : {}),
    }))
}
