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

const { findGlobal } = vi.hoisted(() => ({ findGlobal: vi.fn() }))
vi.mock('@/i18n/content', () => ({
  getPayload: async () => ({ findGlobal, find: async () => ({ docs: [{}] }) }),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/utilities/getURL', () => ({ getServerSideURL: () => 'http://localhost:3000' }))
vi.mock('next-intl/server', () => ({ getLocale: async () => 'en' }))
vi.mock('@/components/Yueli/data', () => ({
  getYueli: async () => ({ site: {} }),
  imageURL: () => undefined,
}))

import { jsonLd, pageMetadata, siteOrigin } from '@/utilities/searchSettings'
import robots from '@/app/robots'
import { equipmentMetadata } from '@/components/Yueli/metadata'

describe('Public search metadata', () => {
  beforeEach(() => {
    findGlobal.mockResolvedValue({
      siteName: 'PawSupply',
      siteUrl: 'https://pets.example/path/',
      allowIndexing: true,
      description: 'Wholesale pet supplies',
      socialImage: { url: '/share.png' },
      geo: { allowAITraining: false },
    })
  })

  it('normalizes the site origin and strips paths', () => {
    expect(siteOrigin('https://pets.example/catalog/')).toBe('https://pets.example')
    expect(siteOrigin('not a URL')).toBe('http://localhost:3000')
  })

  it('uses explicit noindex over the site indexing preference and retains the canonical', async () => {
    const result = await pageMetadata({
      locale: 'en',
      path: '/products/dog-bowl',
      title: 'Dog bowl',
      noIndex: true,
      languages: false,
    })
    expect(result.robots).toEqual({ index: false, follow: true })
    expect(result.alternates).toEqual({ canonical: 'https://pets.example/en/products/dog-bowl' })
    expect(findGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ overrideAccess: false, locale: 'en' }),
    )
  })

  it('uses default share imagery and description and avoids duplicate branded titles', async () => {
    const result = await pageMetadata({ locale: 'zh', title: 'PawSupply｜宠物用品批发' })
    expect(result.title).toEqual({ absolute: '宠物用品批发 | PawSupply' })
    expect(result.description).toBe('Wholesale pet supplies')
    expect(result.openGraph).toMatchObject({ images: [{ url: 'https://pets.example/share.png' }] })
    expect(result.alternates?.languages).toMatchObject({
      'zh-CN': 'https://pets.example/zh',
      'en-US': 'https://pets.example/en',
    })
  })

  it('the site indexing switch overrides individual pages', async () => {
    findGlobal.mockResolvedValue({ allowIndexing: false })
    expect((await pageMetadata({ locale: 'en', noIndex: false })).robots).toEqual({
      index: false,
      follow: true,
    })
    expect((await robots()).rules).toContainEqual({ userAgent: '*', disallow: '/' })
  })

  it('separates search discovery from training crawlers', async () => {
    const result = await robots()
    expect(result.rules).toContainEqual({ userAgent: ['GPTBot', 'ClaudeBot'], disallow: '/' })
    expect(result.rules).toContainEqual(
      expect.objectContaining({ userAgent: '*', allow: expect.arrayContaining(['/']) }),
    )
  })

  it('uses the configured production host for Yueli canonical, Open Graph and robots sitemap', async () => {
    findGlobal.mockResolvedValue({
      siteName: 'Yueli Automation',
      siteUrl: 'https://yueliautomation.com/',
      allowIndexing: true,
    })
    const home = await equipmentMetadata('Yueli Automation')
    const product = await equipmentMetadata('Machining center', '/product/machining-center')
    expect(String(home.metadataBase)).toBe('https://yueliautomation.com/')
    expect(home.alternates?.canonical).toBe('https://yueliautomation.com')
    expect(product.alternates?.canonical).toBe(
      'https://yueliautomation.com/product/machining-center',
    )
    expect(product.openGraph).toMatchObject({ url: product.alternates?.canonical })
    expect((await robots()).sitemap).toBe('https://yueliautomation.com/sitemap.xml')
    expect(JSON.stringify([home, product, await robots()])).not.toContain('localhost')
  })

  it('prevents a CMS value from terminating a JSON-LD script', () => {
    const source = { name: '</script><script>alert(1)</script>' }
    const serialized = jsonLd(source)
    expect(serialized).not.toContain('<')
    expect(JSON.parse(serialized)).toEqual(source)
  })
})
