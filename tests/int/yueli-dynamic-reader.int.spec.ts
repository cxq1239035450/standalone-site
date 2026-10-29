// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  raw: { collections: { languages: {} }, auth: vi.fn(), findGlobal: vi.fn(), find: vi.fn() },
  reader: { find: vi.fn(), findByID: vi.fn(), findGlobal: vi.fn() },
  getLocale: vi.fn(),
  getPreviewUser: vi.fn(),
  draftMode: vi.fn(),
  createContentReader: vi.fn(),
}))
vi.mock('payload', () => ({ getPayload: async () => mocks.raw }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next-intl/server', () => ({ getLocale: mocks.getLocale }))
vi.mock('next/headers', () => ({ draftMode: mocks.draftMode, headers: async () => new Headers() }))
vi.mock('@/i18n/preview', () => ({ getPreviewUser: mocks.getPreviewUser }))
vi.mock('@/i18n/content', () => ({ createContentReader: mocks.createContentReader }))

import { contentPath, getProducts, getYueli } from '../../src/components/Yueli/data'
import { getPostArchiveDefinitions } from '../../src/components/Yueli/postTaxonomy'

beforeEach(() => {
  vi.resetAllMocks()
  mocks.getLocale.mockResolvedValue('en')
  mocks.getPreviewUser.mockResolvedValue(null)
  mocks.draftMode.mockResolvedValue({ isEnabled: false })
  mocks.createContentReader.mockReturnValue(mocks.reader)
  mocks.reader.find.mockResolvedValue({ docs: [] })
  mocks.raw.findGlobal.mockResolvedValue({
    id: 1,
    logo: 5,
    slides: [{ title: 'Machine', image: 5, href: '/products', label: 'Products' }],
    factoryImages: [{ image: 6 }],
    certificates: [],
    inquiryForm: 7,
  })
  mocks.reader.findByID.mockImplementation(async ({ collection, id }) =>
    collection === 'media'
      ? { id, url: `/api/media/file/${id}.webp`, alt: 'Translated caption' }
      : { id, title: 'Translated inquiry', fields: [] },
  )
})

describe('Yueli dynamic public reader', () => {
  it('resolves shared site assets and form through published translations, without exposing raw methods', async () => {
    const { payload, site, locale } = await getYueli()
    expect(locale).toBe('en')
    expect(payload.find).toBe(mocks.reader.find)
    expect(payload).not.toHaveProperty('create')
    expect(mocks.raw.findGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ depth: 0, overrideAccess: false }),
    )
    expect(site.logo).toMatchObject({ url: '/api/media/file/5.webp' })
    expect(site.slides?.[0].image).toEqual(site.logo)
    expect(site.inquiryForm).toMatchObject({ id: 7, title: 'Translated inquiry' })
    expect(
      mocks.reader.findByID.mock.calls.filter(
        ([args]) => args.collection === 'media' && args.id === 5,
      ),
    ).toHaveLength(1)
  })

  it('uses the current request language and public status instead of the legacy English product archive', async () => {
    mocks.getLocale.mockResolvedValue('zh')
    mocks.reader.find.mockResolvedValue({ docs: [{ id: 42, title: '已发布的中文设备' }] })
    const products = await getProducts()
    expect(products).toEqual([{ id: 42, title: '已发布的中文设备' }])
    expect(contentPath(products[0], 'product')).toBe('/zh/product/')
    expect(mocks.reader.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        locale: 'zh',
        draft: false,
        overrideAccess: false,
        where: { _status: { equals: 'published' } },
      }),
    )
    expect(mocks.raw.find).not.toHaveBeenCalled()
  })

  it('does not restore an unavailable form or non-English taxonomy from legacy snapshots', async () => {
    mocks.getLocale.mockResolvedValue('zh')
    mocks.reader.findByID.mockResolvedValue(null)
    expect((await getYueli()).site.inquiryForm).toBeNull()
    expect(await getPostArchiveDefinitions('tag')).toEqual([])
  })
})
