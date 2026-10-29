import type { Where } from 'payload'
import type { Locale } from '@/i18n/config'

export async function searchPublishedContent(payload: Pick<ReturnType<typeof import('@/i18n/content').createContentReader>, 'find'>, locale: Locale, query: string) {
  if (!query.trim()) return { products: [], posts: [] }
  const term = query.trim().slice(0, 120)
  const where = (fields: string[]): Where => ({ and: [
    { _status: { equals: 'published' } }, { title: { exists: true } },
    { or: fields.map(field => ({ [field]: { like: term } })) },
  ] })
  const options = { locale, fallbackLocale: false as const, draft: false, overrideAccess: false, depth: 1, limit: 24, pagination: false as const }
  const [products, posts] = await Promise.all([
    payload.find({ ...options, collection: 'products', where: where(['title', 'general.shortDescription', 'sourcing.materials', 'pricing.sku']) }),
    payload.find({ ...options, collection: 'posts', where: where(['title', 'meta.description', 'discovery.summary']) }),
  ])
  return { products: products.docs.filter(doc => Boolean(doc.title?.trim())), posts: posts.docs.filter(doc => Boolean(doc.title?.trim())) }
}
