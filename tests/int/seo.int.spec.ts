import { beforeEach, describe, expect, it, vi } from 'vitest'

const { findGlobal } = vi.hoisted(() => ({ findGlobal: vi.fn() }))
vi.mock('payload', () => ({ getPayload: async () => ({ findGlobal }) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/utilities/getURL', () => ({ getServerSideURL: () => 'http://localhost:3000' }))

import { jsonLd, pageMetadata, siteOrigin } from '@/utilities/searchSettings'
import robots from '@/app/robots'

describe('Public search metadata', () => {
  beforeEach(() => {
    findGlobal.mockResolvedValue({ siteName: 'PawSupply', siteUrl: 'https://pets.example/path/', allowIndexing: true, description: 'Wholesale pet supplies', socialImage: { url: '/share.png' }, geo: { allowAITraining: false } })
  })

  it('normalizes the site origin and strips paths', () => {
    expect(siteOrigin('https://pets.example/catalog/')).toBe('https://pets.example')
    expect(siteOrigin('not a URL')).toBe('http://localhost:3000')
  })

  it('uses explicit noindex over the site indexing preference and retains the canonical', async () => {
    const result = await pageMetadata({ locale: 'en', path: '/products/dog-bowl', title: 'Dog bowl', noIndex: true, languages: false })
    expect(result.robots).toEqual({ index: false, follow: true })
    expect(result.alternates).toEqual({ canonical: 'https://pets.example/en/products/dog-bowl' })
    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false, locale: 'en' }))
  })

  it('uses default share imagery and description and avoids duplicate branded titles', async () => {
    const result = await pageMetadata({ locale: 'zh', title: 'PawSupply｜宠物用品批发' })
    expect(result.title).toEqual({ absolute: '宠物用品批发 | PawSupply' })
    expect(result.description).toBe('Wholesale pet supplies')
    expect(result.openGraph).toMatchObject({ images: [{ url: 'https://pets.example/share.png' }] })
    expect(result.alternates?.languages).toMatchObject({ 'zh-CN': 'https://pets.example/zh', 'en-US': 'https://pets.example/en' })
  })

  it('the site indexing switch overrides individual pages', async () => {
    findGlobal.mockResolvedValue({ allowIndexing: false })
    expect((await pageMetadata({ locale: 'en', noIndex: false })).robots).toEqual({ index: false, follow: true })
    expect((await robots()).rules).toContainEqual({ userAgent: '*', disallow: '/' })
  })

  it('separates search discovery from training crawlers', async () => {
    const result = await robots()
    expect(result.rules).toContainEqual({ userAgent: ['GPTBot', 'ClaudeBot'], disallow: '/' })
    expect(result.rules).toContainEqual(expect.objectContaining({ userAgent: '*', allow: '/' }))
  })

  it('prevents a CMS value from terminating a JSON-LD script', () => {
    const source = { name: '</script><script>alert(1)</script>' }
    const serialized = jsonLd(source)
    expect(serialized).not.toContain('<')
    expect(JSON.parse(serialized)).toEqual(source)
  })
})
