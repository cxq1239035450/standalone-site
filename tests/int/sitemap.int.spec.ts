import { beforeEach, describe, expect, it, vi } from 'vitest'

const { find, rawFind, settings, createReader } = vi.hoisted(() => ({
  find: vi.fn(),
  rawFind: vi.fn(),
  settings: vi.fn(),
  createReader: vi.fn(),
}))
vi.mock('payload', () => ({
  getPayload: async () => ({ collections: { languages: {} }, find: rawFind }),
}))
vi.mock('@/i18n/content', () => ({ createContentReader: createReader }))
vi.mock('@/components/Yueli/data', () => ({
  contentPath: (doc: { slug: string; migration?: { sourcePath?: string } }, type: string) =>
    doc.migration?.sourcePath ||
    `${type === 'product' ? '/product' : type === 'post' ? '/blog' : ''}/${doc.slug}`,
  categoryIDs: (doc: { categories?: number[] }) => doc.categories || [],
  categoryBranch: (id: number) => new Set([id]),
}))
vi.mock('@/components/Yueli/postTaxonomy', () => ({
  normalizePostTaxonomies: (kind: string, docs: { id: number; slug: string }[]) =>
    docs.map((doc) => ({ ...doc, path: `/${kind}/${doc.slug}` })),
  postsInArchive: (_kind: string, archive: { id: number }, docs: { categories?: number[] }[]) =>
    docs.filter((doc) => doc.categories?.includes(archive.id)),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/utilities/searchSettings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utilities/searchSettings')>()
  return { siteOrigin: actual.siteOrigin }
})
import sitemap from '@/app/sitemap'

describe('Published localized sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createReader.mockReturnValue({ find, findGlobal: settings })
    settings.mockResolvedValue({ allowIndexing: true, siteUrl: 'https://yueli.example' })
    rawFind.mockImplementation(async ({ collection }) => ({
      docs: collection === 'languages' ? [{ code: 'en' }, { code: 'zh' }, { code: 'ja' }] : [],
    }))
    find.mockResolvedValue({ docs: [] })
  })

  it('preserves original English URLs and omits drafts, noindex and untranslated documents', async () => {
    find.mockImplementation(async ({ collection, locale }) => ({
      docs:
        locale !== 'en'
          ? []
          : collection === 'pages'
            ? [
                { _status: 'published', slug: 'home', title: 'Home' },
                { _status: 'published', slug: 'search', title: 'Shadowed page' },
                { _status: 'published', slug: 'products', title: 'Shadowed catalog' },
                {
                  _status: 'published',
                  slug: 'hidden',
                  title: 'Hidden',
                  discovery: { noIndex: true },
                },
                { _status: 'published', slug: 'untranslated', title: ' ' },
                { _status: 'draft', slug: 'draft', title: 'Unpublished' },
                {
                  _status: 'published',
                  slug: 'guide',
                  title: 'Guide',
                  migration: { sourcePath: '/buying-guide/' },
                },
              ]
            : collection === 'products'
              ? [{ _status: 'published', slug: 'machine', title: 'Machine' }]
              : collection === 'posts'
                ? [
                    {
                      _status: 'published',
                      slug: 'news',
                      title: 'News',
                      migration: { sourcePath: '/2026/03/01/news/' },
                    },
                  ]
                : [],
    }))
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls).toContain('https://yueli.example/')
    expect(urls).toContain('https://yueli.example/buying-guide/')
    expect(urls).toContain('https://yueli.example/product/machine')
    expect(urls).toContain('https://yueli.example/2026/03/01/news/')
    expect(urls.some((url) => /hidden|search|untranslated|draft|\/en\//.test(url))).toBe(false)
    expect(settings).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'en', overrideAccess: false }),
    )
    expect(createReader.mock.calls[0]).toHaveLength(1)
  })

  it('adds non-English URLs only for their published content and home', async () => {
    find.mockImplementation(async ({ collection, locale }) => ({
      docs:
        locale !== 'zh'
          ? []
          : collection === 'products'
            ? [{ _status: 'published', slug: 'machine', title: '设备' }]
            : collection === 'pages'
              ? [
                  { _status: 'published', slug: 'home', title: '首页' },
                  {
                    _status: 'published',
                    slug: 'custom',
                    title: '定制',
                    migration: { sourcePath: '/custom-solutions/' },
                  },
                ]
              : [],
    }))
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(urls).toContain('https://yueli.example/zh')
    expect(urls).toContain('https://yueli.example/zh/product/machine')
    expect(urls).toContain('https://yueli.example/zh/custom-solutions/')
    expect(urls).not.toContain('https://yueli.example/')
    expect(
      urls.some((url) => /\/ja(?:\/|$)|\/zh\/(?:products|faq|resources|blog)$/.test(url)),
    ).toBe(false)
    expect(rawFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'languages',
        overrideAccess: false,
        where: { enabled: { equals: true } },
      }),
    )
    expect(
      rawFind.mock.calls.every(([args]) =>
        ['languages', 'equipment-content'].includes(args.collection),
      ),
    ).toBe(true)
  })

  it('does not restore taxonomy snapshot archives without published category translations', async () => {
    find.mockImplementation(async ({ collection, locale }) => ({
      docs:
        collection === 'posts' && locale === 'en'
          ? [{ _status: 'published', slug: 'news', title: 'News', categories: [1] }]
          : [],
    }))
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(urls.some((url) => /\/(category|tag)\//.test(url))).toBe(false)
  })

  it('does not expose URLs when indexing is disabled', async () => {
    settings.mockResolvedValue({ allowIndexing: false })
    expect(await sitemap()).toEqual([])
    expect(find).not.toHaveBeenCalled()
    expect(rawFind).not.toHaveBeenCalled()
  })

  it('publishes only the configured production host, including translated URLs', async () => {
    settings.mockResolvedValue({ allowIndexing: true, siteUrl: 'https://yueliautomation.com/' })
    find.mockImplementation(async ({ collection }) => ({
      docs: collection === 'pages' ? [{ _status: 'published', slug: 'home', title: 'Home' }] : [],
    }))
    const urls = (await sitemap()).map(({ url }) => url)
    expect(urls).toContain('https://yueliautomation.com/')
    expect(urls).toContain('https://yueliautomation.com/zh')
    expect(urls.every((url) => new URL(url).origin === 'https://yueliautomation.com')).toBe(true)
  })
})
