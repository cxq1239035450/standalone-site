import { beforeEach, describe, expect, it, vi } from 'vitest'

const { find, rawFind, settings, createReader, raw } = vi.hoisted(() => {
  const rawFind = vi.fn()
  return {
    find: vi.fn(),
    rawFind,
    settings: vi.fn(),
    createReader: vi.fn(),
    raw: { find: rawFind },
  }
})
vi.mock('payload', () => ({ getPayload: async () => raw }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/i18n/content', () => ({ createContentReader: createReader }))
vi.mock('@/utilities/searchSettings', () => ({ siteOrigin: () => 'https://yueli.example' }))
vi.mock('@/components/Yueli/data', () => ({
  contentPath: (doc: { slug: string; migration?: { sourcePath?: string } }, type: string) =>
    doc.migration?.sourcePath || `${type === 'product' ? '/product' : '/blog'}/${doc.slug}`,
}))
vi.mock('@/components/Yueli/architecture', () => ({
  resourcePath: (doc: { kind: string; slug: string }) =>
    `${doc.kind === 'solution' ? '/solutions' : '/resources'}/${doc.slug}`,
}))
import { GET } from '@/app/llms.txt/route'

describe('Public English llms.txt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createReader.mockReturnValue({ find, findGlobal: settings })
    settings.mockResolvedValue({ siteName: 'Yueli Automation', allowIndexing: true })
    find.mockImplementation(async ({ collection, locale }) => ({
      docs:
        locale !== 'en'
          ? []
          : collection === 'products'
            ? [{ _status: 'published', title: 'Machining center', slug: 'machining-center' }]
            : [
                {
                  _status: 'published',
                  title: 'Technical news',
                  slug: 'news',
                  migration: { sourcePath: '/2026/03/01/news/' },
                },
              ],
    }))
    rawFind.mockImplementation(async ({ locale }) => ({
      docs:
        locale === 'en'
          ? [{ _status: 'published', title: 'Drilling guide', slug: 'drilling', kind: 'solution' }]
          : [{ _status: 'published', slug: 'drilling', kind: 'solution' }],
    }))
  })

  it('includes English products, articles and guides without a localized page request', async () => {
    const response = await GET()
    const text = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    expect(text).toContain('[Machining center](https://yueli.example/product/machining-center)')
    expect(text).toContain('[Technical news](https://yueli.example/2026/03/01/news/)')
    expect(text).toContain('[Drilling guide](https://yueli.example/solutions/drilling)')
    expect(text).not.toMatch(/undefined|\/en\/|\/zh\//)
    expect(createReader).toHaveBeenCalledExactlyOnceWith(raw)
    expect(settings).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'en',
        overrideAccess: false,
      }),
    )
    for (const [args] of [...find.mock.calls, ...rawFind.mock.calls]) {
      expect(args).toMatchObject({
        locale: 'en',
        fallbackLocale: false,
        draft: false,
        overrideAccess: false,
        where: { _status: { equals: 'published' } },
      })
      expect(args).not.toHaveProperty('user')
    }
  })

  it('omits unpublished, untranslated and noindex content from every content section', async () => {
    const docs = [
      { _status: 'published', title: 'Visible', slug: 'visible', kind: 'solution' },
      { _status: 'draft', title: 'Unpublished', slug: 'unpublished', kind: 'solution' },
      { _status: 'published', title: ' ', slug: 'untranslated', kind: 'solution' },
      {
        _status: 'published',
        title: 'Hidden',
        slug: 'hidden',
        kind: 'solution',
        discovery: { noIndex: true },
        noIndex: true,
      },
    ]
    find.mockResolvedValue({ docs })
    rawFind.mockResolvedValue({ docs })
    const text = await (await GET()).text()
    expect(text.match(/\[Visible\]/g)).toHaveLength(3)
    expect(text).not.toMatch(/Unpublished|untranslated|Hidden|undefined/)
  })

  it.each([{ allowIndexing: false }, { geo: { enabled: false } }])(
    'disables public discovery when settings are %j',
    async (disabled) => {
      settings.mockResolvedValue(disabled)
      expect((await GET()).status).toBe(404)
      expect(find).not.toHaveBeenCalled()
      expect(rawFind).not.toHaveBeenCalled()
    },
  )
})
