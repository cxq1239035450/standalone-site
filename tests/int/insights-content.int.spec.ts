// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { insightsPlugin } from '@site-insights/payload-plugin'
import type { Config, PayloadRequest } from 'payload'
import { insightsContentURL, withPublishedContent } from '../../src/integrations/insights/content'
import { createContentReader } from '../../src/i18n/content'

vi.mock('../../src/i18n/content', () => ({ createContentReader: vi.fn() }))

const token = 'test-only-insights-token-not-a-production-secret'
function setup() {
  return withPublishedContent(insightsPlugin({ enabled: true, siteId: 'test-site', readToken: token,
    collections: ['pages', 'posts', 'products'], locales: [{ code: 'en' }],
    resolveContentUrl: input => insightsContentURL(input, 'https://yueliautomation.com', true),
  })({ collections: ['pages', 'posts', 'products'].map(slug => ({ slug, fields: [] })) } as unknown as Config) as Config)
}

describe('Insights published content integration', () => {
  it('keeps authentication ahead of every content read, including administrator sessions', async () => {
    for (const authorization of ['', 'Bearer invalid']) {
      vi.mocked(createContentReader).mockClear()
      const response = await setup().endpoints![1].handler({
        headers: new Headers({ authorization }), user: { id: 1 }, payload: { find: vi.fn() },
      } as unknown as PayloadRequest)
      expect(response.status).toBe(401)
      expect(createContentReader).not.toHaveBeenCalled()
    }
  })

  it.each(['pages', 'posts', 'products'])('reads %s translations with the vendor pagination and publication filter', async collection => {
    const find = vi.fn().mockResolvedValue({ docs: [{ id: 4, title: 'Published English', slug: 'example', updatedAt: '2026-10-30', migration: { sourcePath: '/published-example/' } }], nextPage: 3 })
    vi.mocked(createContentReader).mockReturnValue({ find } as unknown as ReturnType<typeof createContentReader>)
    const raw = { find: vi.fn(), logger: { error: vi.fn() } }
    const response = await setup().endpoints![1].handler({
      headers: new Headers({ authorization: `Bearer ${token}` }), payload: raw,
      url: `https://yueliautomation.com/api/insights/v1/content?collection=${collection}&locale=en&page=2`,
    } as unknown as PayloadRequest)
    expect(response.status).toBe(200)
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ collection, locale: 'en', fallbackLocale: false, page: 2, limit: 100, draft: false, depth: 0, where: { _status: { equals: 'published' } } }))
    expect(raw.find).not.toHaveBeenCalled()
    expect(await response.json()).toMatchObject({ siteId: 'test-site', nextPage: 3, records: [{ id: '4', title: 'Published English', url: 'https://yueliautomation.com/published-example/' }] })
  })

  it('uses imported Yueli URLs and keeps generic website routes unchanged', () => {
    const input = { collection: 'products', locale: 'en', doc: { slug: 'a b' } }
    expect(insightsContentURL(input, 'https://yueliautomation.com', true)).toBe('https://yueliautomation.com/product/a%20b')
    expect(insightsContentURL({ ...input, locale: 'zh' }, 'https://yueliautomation.com', true)).toBe('https://yueliautomation.com/zh/product/a%20b')
    expect(insightsContentURL({ collection: 'pages', locale: 'en', doc: { slug: 'home' } }, 'https://yueliautomation.com', true)).toBe('https://yueliautomation.com/')
    expect(insightsContentURL(input, 'https://example.test', false)).toBe('https://example.test/en/products/a%20b')
  })
})
