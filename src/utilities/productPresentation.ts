/** Reject malformed/unsafe page offsets before they reach the database. */
export function productPageNumber(value: unknown): number | null {
  if (value === undefined) return 1
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const page = Number(value)
  return Number.isSafeInteger(page) && page <= 100000 ? page : null
}

export function productUnitLabel(unit: string | null | undefined, locale: string): string {
  const labels: Record<string, string> =
    locale === 'zh'
      ? { kg: '千克', jin: '斤', box: '箱', piece: '件', bag: '袋', ton: '吨', set: '套' }
      : { kg: 'kg', jin: 'jin', box: 'box', piece: 'unit', bag: 'bag', ton: 'ton', set: 'set' }
  return unit ? labels[unit] || unit : locale === 'zh' ? '件' : 'unit'
}

export function productInquiryHref(title: string, category?: string | null, slug?: string): string {
  const query = new URLSearchParams({ product: title.slice(0, 200) })
  if (category && ['walking', 'feeding', 'bedding', 'toys'].includes(category))
    query.set('category', category)
  if (slug) query.set('productSlug', slug.slice(0, 200))
  return `/contact?${query.toString()}`
}
