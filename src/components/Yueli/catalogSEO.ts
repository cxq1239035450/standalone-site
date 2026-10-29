export type CatalogQuery = Record<string, string | string[] | undefined>
export function parseCatalogPage(value: CatalogQuery[string]): number | null {
  if (value === undefined) return 1
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const page = Number(value)
  return Number.isSafeInteger(page) ? page : null
}
export function catalogIndexing(path: string, query: CatalogQuery, hasProducts = true) {
  const page = parseCatalogPage(query['product-page'] ?? query.page)
  const filtered = Boolean(query.q || query.category || query.product_cat)
  return {
    canonical: path + (page && page > 1 && !filtered ? `${query['product-page'] ? '?product-page=' : '?page='}${page}` : ''),
    noIndex: filtered || !hasProducts || page === null,
    page,
  }
}
