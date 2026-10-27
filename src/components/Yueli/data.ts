import { draftMode, headers } from 'next/headers'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Category, EquipmentSite, Media, Page, Post, Product } from '@/payload-types'

export const getYueli = cache(async () => {
  const payload = await getPayload({ config })
  const site = await payload.findGlobal({
    slug: 'equipment-site',
    locale: 'en',
    depth: 1,
    overrideAccess: false,
  })
  return { payload, site }
})
const previewAccess = cache(async () => {
  const { payload } = await getYueli()
  if (!(await draftMode()).isEnabled)
    return { draft: false, overrideAccess: false, where: { _status: { equals: 'published' } } }
  const { user } = await payload.auth({ headers: await headers() })
  return user
    ? { draft: true, overrideAccess: false, user }
    : { draft: false, overrideAccess: false, where: { _status: { equals: 'published' } } }
})
export const getProducts = cache(async () => {
  const { payload } = await getYueli()
  return (
    await payload.find({
      collection: 'products',
      locale: 'en',
      depth: 1,
      pagination: false,
      sort: 'title',
      ...(await previewAccess()),
    })
  ).docs
})
export const getCategories = cache(async () => {
  const { payload } = await getYueli()
  return (
    await payload.find({
      collection: 'categories',
      locale: 'en',
      depth: 0,
      pagination: false,
      overrideAccess: false,
      sort: 'title',
    })
  ).docs
})
export const getPosts = cache(async () => {
  const { payload } = await getYueli()
  return (
    await payload.find({
      collection: 'posts',
      locale: 'en',
      depth: 1,
      pagination: false,
      sort: '-publishedAt',
      ...(await previewAccess()),
    })
  ).docs
})
export const getPages = cache(async () => {
  const { payload } = await getYueli()
  return (
    await payload.find({
      collection: 'pages',
      locale: 'en',
      depth: 1,
      pagination: false,
      ...(await previewAccess()),
    })
  ).docs
})
export function imageURL(image: number | Media | null | undefined): string {
  return image && typeof image === 'object' ? image.url || '' : ''
}
export function contentPath(
  doc: Product | Post | Page | Category,
  type: 'product' | 'post' | 'page' | 'category',
): string {
  return (
    doc.migration?.sourcePath ||
    `${type === 'page' ? '' : type === 'post' ? '/blog' : type === 'category' ? '/product-category' : '/product'}/${encodeURIComponent(doc.slug || '')}`
  )
}
export function categoryIDs(product: Product): number[] {
  const categories = product.migration?.categories || []
  if (categories.length) return categories.map((c) => (typeof c === 'object' ? c.id : c))
  const primary = product.organization?.category
  return primary ? [typeof primary === 'object' ? primary.id : primary] : []
}
export function categoryBranch(id: number, categories: Category[]): Set<number> {
  const ids = new Set([id])
  for (let pass = 0; pass < categories.length; pass++) {
    let changed = false
    for (const cat of categories) {
      const parent = typeof cat.parent === 'object' ? cat.parent?.id : cat.parent
      if (parent && ids.has(parent) && !ids.has(cat.id)) {
        ids.add(cat.id)
        changed = true
      }
    }
    if (!changed) break
  }
  return ids
}
export const navigation = (site: EquipmentSite) =>
  site.navigation?.length
    ? site.navigation
    : [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products/' },
        { label: 'About Us', href: '/about-us/' },
        { label: 'Blog', href: '/blog/' },
        { label: 'FAQ', href: '/faq/' },
        { label: 'Contact', href: '/contact-us/' },
      ]
