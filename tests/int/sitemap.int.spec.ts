vi.mock('@/i18n/service', () => ({ getLanguageRegistry: async () => ({ defaultLocale: 'zh', languages: [{ id: 1, code: 'zh', htmlLang: 'zh-CN' }, { id: 2, code: 'en', htmlLang: 'en-US' }] }) }))
import { beforeEach, describe, expect, it, vi } from 'vitest'
const { find, settings } = vi.hoisted(() => ({ find: vi.fn(), settings: vi.fn() }))
vi.mock('@/i18n/content', () => ({ getPayload: async () => ({ find }) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/utilities/searchSettings', () => ({ getSearchSettings: settings, siteOrigin: () => 'https://pets.example' }))
import sitemap from '@/app/sitemap'

describe('Published localized sitemap', () => {
  beforeEach(() => {
    find.mockReset()
    settings.mockResolvedValue({ allowIndexing: true })
  })
  it('omits noindex, blank translations and reserved route duplicates', async () => {
    find.mockImplementation(async ({ collection }) => ({ docs: collection === 'pages' ? [
      { slug: 'search', title: 'Shadowed page' }, { slug: 'products', title: 'Shadowed catalog' },
      { slug: 'hidden', title: 'Hidden', discovery: { noIndex: true } }, { slug: 'untranslated', title: ' ' },
      { slug: 'guide', title: 'Guide', updatedAt: '2026-10-01T00:00:00.000Z' },
    ] : [] }))
    const entries = await sitemap()
    const urls = entries.map(entry => entry.url)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls).toContain('https://pets.example/en/guide')
    expect(urls.some(url => /hidden|search|untranslated/.test(url))).toBe(false)
    for (const [options] of find.mock.calls) {
      expect(options).toMatchObject({ draft: false, overrideAccess: false, fallbackLocale: false })
      expect(options.where.and).toContainEqual({ _status: { equals: 'published' } })
    }
  })
  it('does not expose a URL list when indexing is disabled', async () => {
    settings.mockResolvedValue({ allowIndexing: false })
    expect(await sitemap()).toEqual([])
    expect(find).not.toHaveBeenCalled()
  })
})
