import { cache } from 'react'
import type { Category, EquipmentContent, Product } from '@/payload-types'
import { getYueli } from './data'

/** These navigation/discovery lists intentionally never expose drafts, even during preview. */
export const getEquipmentContent = cache(async () => {
  const { payload } = await getYueli()
  return (
    await payload.find({
      collection: 'equipment-content',
      locale: 'en',
      depth: 0,
      pagination: false,
      draft: false,
      overrideAccess: false,
      sort: 'createdAt',
      where: { _status: { equals: 'published' } },
    })
  ).docs
})
export const resourcePath = (doc: Pick<EquipmentContent, 'kind' | 'slug'>) =>
  `${doc.kind === 'solution' ? '/solutions' : '/resources'}/${doc.slug}`
export const relationIDs = (values?: (number | { id: number })[] | null) =>
  (values || []).map((value) => (typeof value === 'object' ? value.id : value))
export function resourcesForProduct(
  product: Product,
  resources: EquipmentContent[],
): EquipmentContent[] {
  return resources.filter((item) => relationIDs(item.relatedProducts).includes(product.id))
}
export function categoryTrail(category: Category, categories: Category[]): Category[] {
  const trail = [category],
    visited = new Set([category.id])
  let current = category
  while (current.parent) {
    const id = typeof current.parent === 'object' ? current.parent.id : current.parent
    if (visited.has(id)) break
    const parent = categories.find((c) => c.id === id)
    if (!parent) break
    visited.add(id)
    trail.unshift(parent)
    current = parent
  }
  return trail
}
