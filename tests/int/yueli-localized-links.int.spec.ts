import { describe, expect, it } from 'vitest'
import { safeHTML } from '@/components/Yueli/html'
import { yueliLocalePath } from '@/i18n/yueliPaths'

describe('localized imported links', () => {
  it('preserves English canonical URLs and does not duplicate dynamic prefixes', () => {
    expect(yueliLocalePath('/product/machine/?q=a#spec', 'en')).toBe('/product/machine/?q=a#spec')
    expect(yueliLocalePath('/ja/product/machine/?q=a#spec', 'ja')).toBe(
      '/ja/product/machine/?q=a#spec',
    )
    expect(yueliLocalePath('/faq/', 'fr')).toBe('/fr/faq/')
  })
  it('localizes CMS page links but preserves downloads, anchors and external contact links', () => {
    const html =
      '<a href="https://yueliautomation.com/contact-us/?product=Lathe">Contact</a><a href="/ja/products">Products</a><a href="#spec">Spec</a><a href="/api/media/file/catalog.pdf">PDF</a><a href="https://example.com/">External</a><a href="mailto:team@example.com">Email</a><script>alert(1)</script>'
    const translated = safeHTML(html, 'ja')
    expect(translated).toContain('href="/ja/contact-us/?product=Lathe"')
    expect(translated).toContain('href="/ja/products"')
    for (const href of [
      '#spec',
      '/api/media/file/catalog.pdf',
      'https://example.com/',
      'mailto:team@example.com',
    ])
      expect(translated).toContain(`href="${href}"`)
    expect(translated).not.toContain('<script>')
    expect(safeHTML(html)).toContain('href="/contact-us/?product=Lathe"')
  })
})
