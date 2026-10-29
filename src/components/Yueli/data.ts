import { draftMode, headers } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { cache } from 'react'
import { getPayload as getRawPayload } from 'payload'
import { createContentReader } from '@/i18n/content'
import { getPreviewUser } from '@/i18n/preview'
import { yueliLocalePath } from '@/i18n/yueliPaths'
import config from '@payload-config'
import type { Category, EquipmentSite, Media, Page, Post, Product } from '@/payload-types'
import source from '@/data/yueli.json'

// Request projections only: language metadata must never become persisted fields.
const documentLocales = new WeakMap<object, string>()
function localizeDocuments<T extends object>(documents: T[], locale: string): T[] {
  const visited = new WeakSet<object>()
  const mark = (value: unknown) => {
    if (!value || typeof value !== 'object' || visited.has(value)) return
    visited.add(value)
    documentLocales.set(value, locale)
    for (const child of Object.values(value)) mark(child)
  }
  documents.forEach(mark)
  return documents
}

export const getYueli = cache(async () => {
  const [raw, locale, previewUser] = await Promise.all([
    getRawPayload({ config }),
    getLocale(),
    getPreviewUser(),
  ])
  const payload = { ...createContentReader(raw, previewUser), auth: raw.auth.bind(raw) }
  const dynamic = Boolean(raw.collections.languages)
  const site = await raw.findGlobal({
    slug: 'equipment-site',
    // This custom global is shared site configuration, not a translated archive.
    locale: locale === 'zh' ? 'zh' : 'en',
    depth: dynamic ? 0 : 1,
    overrideAccess: false,
  })
  if (dynamic) {
    // Raw relationship population cannot read the private media/form archives.
    // Resolve through the public projection so untranslated captions never leak.
    const images = new Map<number, Promise<Media>>()
    const media = (value: number | Media | null | undefined) => {
      const id = typeof value === 'object' ? value?.id : value
      if (!id) return Promise.resolve(null)
      if (!images.has(id))
        images.set(
          id,
          payload.findByID({ collection: 'media', id, locale, depth: 0, disableErrors: true }),
        )
      return images.get(id)!
    }
    site.logo = await media(site.logo)
    for (const rows of [site.slides, site.factoryImages, site.certificates])
      await Promise.all(
        (rows || []).map(async (row) => {
          row.image = (await media(row.image)) || row.image
        }),
      )
    const formID = typeof site.inquiryForm === 'object' ? site.inquiryForm?.id : site.inquiryForm
    site.inquiryForm = formID
      ? await payload.findByID({
          collection: 'forms',
          id: formID,
          locale,
          depth: 0,
          disableErrors: true,
        })
      : null
  }
  return { payload, site, locale }
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
  const { payload, locale } = await getYueli()
  return localizeDocuments(
    (
      await payload.find({
        collection: 'products',
        locale,
        depth: 1,
        pagination: false,
        sort: 'title',
        ...(await previewAccess()),
      })
    ).docs,
    locale,
  )
})
export const getCategories = cache(async () => {
  const { payload, locale } = await getYueli()
  return localizeDocuments(
    (
      await payload.find({
        collection: 'categories',
        where: { or: [{ taxonomy: { equals: 'product' } }, { taxonomy: { exists: false } }] },
        locale,
        depth: 0,
        pagination: false,
        overrideAccess: false,
        sort: 'title',
      })
    ).docs,
    locale,
  )
})
export const getPosts = cache(async () => {
  const { payload, locale } = await getYueli()
  return localizeDocuments(
    (
      await payload.find({
        collection: 'posts',
        locale,
        depth: 1,
        pagination: false,
        sort: '-publishedAt',
        ...(await previewAccess()),
      })
    ).docs,
    locale,
  )
})
export const getPages = cache(async () => {
  const { payload, locale } = await getYueli()
  return localizeDocuments(
    (
      await payload.find({
        collection: 'pages',
        locale,
        depth: 1,
        pagination: false,
        ...(await previewAccess()),
      })
    ).docs,
    locale,
  )
})
export function imageURL(image: number | Media | null | undefined): string {
  return image && typeof image === 'object' ? image.url || '' : ''
}
export function contentPath(
  doc: Product | Post | Page | Category,
  type: 'product' | 'post' | 'page' | 'category',
): string {
  return yueliLocalePath(
    doc.migration?.sourcePath ||
      `${type === 'page' ? '' : type === 'post' ? '/blog' : type === 'category' ? '/product-category' : '/product'}/${encodeURIComponent(doc.slug || '')}`,
    documentLocales.get(doc) || 'en',
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
  site.navigation?.length ? site.navigation : source.brand.navigation
