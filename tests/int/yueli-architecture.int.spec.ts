import { describe, expect, it } from 'vitest'
import { buyingContent, categoryGuidance } from '../../src/data/yueli-architecture'
import source from '../../src/data/yueli.json'
import { catalogIndexing, parseCatalogPage } from '../../src/components/Yueli/catalogSEO'

describe('Yueli buyer architecture integrity', () => {
  it('links solutions and guides to real catalog entries and other distinct pages', () => {
    const slugs = new Set(buyingContent.map((item) => item.slug))
    expect(slugs.size).toBe(buyingContent.length)
    for (const item of buyingContent) {
      for (const slug of item.productSlugs)
        expect(
          source.products.some((product) => product.slug === slug),
          slug,
        ).toBe(true)
      for (const slug of item.categorySlugs)
        expect(
          source.categories.some((category) => category.slug === slug),
          slug,
        ).toBe(true)
      for (const slug of item.relatedSlugs) {
        expect(slugs.has(slug), slug).toBe(true)
        expect(slug).not.toBe(item.slug)
      }
      expect(item.sections.length).toBeGreaterThan(1)
      expect(
        buyingContent.some((other) =>
          (other.relatedSlugs as readonly string[]).includes(item.slug),
        ),
      ).toBe(true)
    }
    for (const category of categoryGuidance) {
      expect(source.categories.some((item) => item.slug === category.slug)).toBe(true)
      for (const slug of category.resources) expect(slugs.has(slug)).toBe(true)
    }
  })
  it('keeps valid pagination canonical and marks search/filter/empty results noindex', () => {
    expect(catalogIndexing('/products', { page: '2' })).toMatchObject({
      canonical: '/products?page=2',
      noIndex: false,
    })
    expect(catalogIndexing('/products', { q: 'TA-12', page: '2' })).toMatchObject({
      canonical: '/products',
      noIndex: true,
    })
    expect(catalogIndexing('/product-category/cnc', { category: 'cnc' }).noIndex).toBe(true)
    expect(catalogIndexing('/product-category/empty', {}, false).noIndex).toBe(true)
    expect(catalogIndexing('/products', { utm_source: 'email' }).noIndex).toBe(false)
  })
  it('rejects malformed and out of numeric range page selectors', () => {
    for (const value of ['0', '-1', '2junk', '1.5', '9007199254740992', ['2', '3']])
      expect(parseCatalogPage(value)).toBeNull()
    expect(parseCatalogPage(undefined)).toBe(1)
    expect(parseCatalogPage('3')).toBe(3)
  })
})
