vi.mock('@/i18n/service', () => ({
  getLanguageRegistry: async () => ({
    defaultLocale: 'zh',
    languages: [
      { id: 1, code: 'zh', htmlLang: 'zh-CN' },
      { id: 2, code: 'en', htmlLang: 'en-US' },
    ],
  }),
}))
import { beforeEach, describe, expect, it, vi } from 'vitest'
const { find, settings } = vi.hoisted(() => ({ find: vi.fn(), settings: vi.fn() }))
vi.mock('@/components/Yueli/data', () => ({
  getProducts: async () => (await find({ collection: 'products' })).docs,
  getPosts: async () => (await find({ collection: 'posts' })).docs,
  getPages: async () => (await find({ collection: 'pages' })).docs,
  getCategories: async () => [],
  contentPath: (doc: { slug: string }) => '/' + doc.slug,
  categoryIDs: () => [],
  categoryBranch: () => new Set(),
}))
vi.mock('@/components/Yueli/architecture', () => ({
  getEquipmentContent: async () => [],
  resourcePath: () => '',
}))
vi.mock('@/components/Yueli/postTaxonomy', () => ({
  getPostArchiveDefinitions: async () => [],
  postsInArchive: () => [],
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/utilities/searchSettings', () => ({
  getSearchSettings: settings,
  siteOrigin: () => 'https://pets.example',
}))
import sitemap from '@/app/sitemap'

describe('Published localized sitemap', () => {
  beforeEach(() => {
    find.mockReset()
    settings.mockResolvedValue({ allowIndexing: true })
  })
  it('omits noindex, blank translations and reserved route duplicates', async () => {
    find.mockImplementation(async ({ collection }) => ({
      docs:
        collection === 'pages'
          ? [
              { _status: 'published', slug: 'search', title: 'Shadowed page' },
              { _status: 'published', slug: 'products', title: 'Shadowed catalog' },
              {
                _status: 'published',
                slug: 'hidden',
                title: 'Hidden',
                discovery: { noIndex: true },
              },
              { _status: 'published', slug: 'untranslated', title: ' ' },
              {
                _status: 'published',
                slug: 'guide',
                title: 'Guide',
                updatedAt: '2026-10-01T00:00:00.000Z',
              },
            ]
          : [],
    }))
    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls).toContain('https://pets.example/guide')
    expect(urls.some((url) => /hidden|search|untranslated/.test(url))).toBe(false)
  })
  it('does not expose a URL list when indexing is disabled', async () => {
    settings.mockResolvedValue({ allowIndexing: false })
    expect(await sitemap()).toEqual([])
    expect(find).not.toHaveBeenCalled()
  })
})
