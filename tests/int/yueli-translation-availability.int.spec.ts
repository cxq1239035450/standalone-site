// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'

const { find, readerFind, createReader } = vi.hoisted(() => ({
  find: vi.fn(),
  readerFind: vi.fn(),
  createReader: vi.fn(),
}))
vi.mock('@/i18n/content', () => ({ createContentReader: createReader }))
import { translationEndpoints } from '@/i18n/endpoints'

const available = translationEndpoints.find(
  (endpoint) => endpoint.path === '/translations/available',
)!
const query = (path: string) =>
  available.handler({
    url: `http://localhost/api/translations/available?path=${encodeURIComponent(path)}`,
    payload: { find },
    // An editor viewing the website still receives only public availability.
    user: { id: 1 },
  } as unknown as PayloadRequest)

describe('Public Yueli translation availability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createReader.mockReturnValue({ find: readerFind })
    find.mockResolvedValue({ docs: [{ code: 'en' }, { code: 'zh' }] })
    readerFind.mockResolvedValue({ docs: [] })
  })

  it('returns only enabled languages with a published title through the public reader', async () => {
    readerFind.mockImplementation(async ({ locale }) => ({
      docs: locale === 'en' ? [{ title: 'Machine' }] : [],
    }))
    expect(await (await query('/zh/product/machine')).json()).toEqual(['en'])
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'languages',
        overrideAccess: false,
        where: { enabled: { equals: true } },
      }),
    )
    expect(createReader.mock.calls[0]).toHaveLength(1)
    expect(readerFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        draft: false,
        overrideAccess: false,
        where: { and: [{ slug: { equals: 'machine' } }, { title: { exists: true } }] },
      }),
    )
    for (const [args] of readerFind.mock.calls) {
      expect(args.user).toBeUndefined()
      expect(args.req).toBeUndefined()
    }
  })

  it('does not advertise root just because a language is enabled', async () => {
    expect(await (await query('/')).json()).toEqual([])
    expect(
      readerFind.mock.calls.every(
        ([args]) => args.collection === 'pages' && JSON.stringify(args.where).includes('home'),
      ),
    ).toBe(true)
    readerFind.mockImplementation(async ({ locale }) => ({
      docs: locale === 'zh' ? [{ title: '首页' }] : [{ title: ' ' }],
    }))
    expect(await (await query('/')).json()).toEqual(['zh'])
  })

  it('rejects unrecognized nested routes without querying content', async () => {
    expect(await (await query('/unknown/nested/route')).json()).toEqual([])
    expect(readerFind).not.toHaveBeenCalled()
  })
})
