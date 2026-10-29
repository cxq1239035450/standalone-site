import { describe, expect, it } from 'vitest'
import { contentRoutePath, localizedContentPath, resolveContentRoute } from '@/i18n/contentRoutes'

describe('Yueli content URL resolution', () => {
  const languages = ['en', 'zh', 'de']
  it('recognizes registered prefixes and product/post aliases', () => {
    for (const path of ['/product/machine', '/products/machine', '/zh/product/machine/'])
      expect(resolveContentRoute(path, languages)).toEqual({
        collection: 'products',
        where: { slug: { equals: 'machine' } },
      })
    for (const path of ['/blog/news', '/posts/news', '/de/blog/news'])
      expect(resolveContentRoute(path, languages)).toEqual({
        collection: 'posts',
        where: { slug: { equals: 'news' } },
      })
    expect(resolveContentRoute('/unregistered/product/machine', languages)).toBeNull()
  })
  it('does not mistake faq or tag routes for a three-letter locale', () => {
    expect(contentRoutePath('/faq', [...languages, 'faq'])).toBe('/faq')
    expect(resolveContentRoute('/faq', languages)?.collection).toBe('pages')
    expect(contentRoutePath('/tag/cnc', [...languages, 'tag'])).toBe('/tag/cnc')
    expect(resolveContentRoute('/tag/cnc', languages)).toMatchObject({ collection: 'categories' })
  })
  it('matches dated articles and imported page paths without accepting an arbitrary date alias', () => {
    expect(resolveContentRoute('/2026/03/01/news/', languages)).toEqual({
      collection: 'posts',
      where: {
        or: [
          { 'migration.sourcePath': { equals: '/2026/03/01/news' } },
          { 'migration.sourcePath': { equals: '/2026/03/01/news/' } },
        ],
      },
    })
    expect(JSON.stringify(resolveContentRoute('/about-us', languages))).toContain(
      'migration.sourcePath',
    )
    expect(JSON.stringify(resolveContentRoute('/zh', languages))).toContain('home')
  })
  it('handles encoded slugs while rejecting unsafe or malformed paths', () => {
    expect(contentRoutePath('/zh/product/%E8%AE%BE%E5%A4%87?x=1', languages)).toBe('/product/设备')
    for (const path of [
      'https://example.com/product/a',
      '//example.com/a',
      '/product/%2F',
      '/product/%zz',
      '/product/..',
    ])
      expect(contentRoutePath(path, languages)).toBeNull()
  })
  it('preserves unprefixed English URLs and prefixes other locales', () => {
    expect(localizedContentPath('/product/machine/', 'en')).toBe('/product/machine/')
    expect(localizedContentPath('/product/machine/', 'zh')).toBe('/zh/product/machine/')
    expect(localizedContentPath('/', 'en')).toBe('/')
    expect(localizedContentPath('/', 'zh')).toBe('/zh')
  })
})
