import { describe, it, expect } from 'vitest'
import { safeHTML } from '../../src/components/Yueli/html'
import source from '../../src/data/yueli.json'
import fs from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'
import { sanitizeMigratedHTML } from '../../src/scripts/yueli-content.mjs'

describe('Yueli migration data and rendering boundary', () => {
  it('retains a distinct original URL and specification body for every source product', () => {
    expect(source.products.length).toBe(34)
    expect(new Set(source.products.map((p) => p.path)).size).toBe(source.products.length)
    expect(
      source.products.every(
        (p) => p.path.startsWith('/product/') && p.html.length > 0 && p.images.length > 0,
      ),
    ).toBe(true)
    expect(source.posts.every((p) => /^\/\d{4}\/\d{2}\/\d{2}\//.test(p.path))).toBe(true)
  })
  it('has a downloaded asset for every exported image, including specifications and certificates', () => {
    const missing = source.assets.filter((asset) => !asset.local)
    expect(missing).toEqual([])
    expect(source.failures).toEqual([])
    expect(source.home.faq.image.src).toMatch(/^\/yueli-assets\/.+\.webp$/)
    for (const asset of source.assets.filter((asset) => asset.local))
      expect(fs.statSync(path.join(process.cwd(), 'public', asset.local)).isFile()).toBe(true)
  })
  it('preserves the homepage sequence, all certificates, source contact details and blog taxonomies', () => {
    expect(source.home.heroSlides).toHaveLength(5)
    expect(source.home.heroSlides[2].html).toContain('<ul class="yl-ta12-specs">')
    expect(source.home.heroSlides[2].html).toContain('<li><strong>TCT: 0.4S</strong></li>')
    expect(source.home.featured.products.map((product) => product.id)).toEqual([
      1708, 1710, 1712, 2436, 1716, 2290, 2450, 1724,
    ])
    expect(source.home.certificates.images).toHaveLength(16)
    expect(source.home.factory.images).toHaveLength(3)
    expect(source.brand.address).toContain('NO. 1111, MAOSHENG ROAD')
    expect(source.brand.navigation.map((link) => link.label)).toEqual([
      'Home',
      'Products',
      'About Us',
      'Blog',
      'FAQ',
      'Contact',
    ])
    expect(source.postCategories).toHaveLength(6)
    expect(source.postTags).toHaveLength(24)
    expect(
      source.posts.every((post) => Array.isArray(post.categories) && Array.isArray(post.tags)),
    ).toBe(true)
  })
  it('stores the process video and original contact QR pixels locally', () => {
    expect(source.home.processVideo).toMatch(/^\/yueli-assets\/.+\.mp4$/)
    const video = fs.readFileSync(path.join(process.cwd(), 'public', source.home.processVideo))
    expect(video.subarray(4, 8).toString()).toBe('ftyp')
    expect(source.brand.qrCodes.image).toMatch(/^\/yueli-assets\/.+\.png$/)
    const qr = fs.readFileSync(path.join(process.cwd(), 'public', source.brand.qrCodes.image))
    expect(qr.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  })
  it('strips executable markup while retaining machine specification tables', () => {
    const html = safeHTML(
      '<script>alert(1)</script><img src="/photo.webp" onerror="alert(1)"><a href="javascript:alert(1)">Unsafe</a><table><tr><th>Travel</th><td>400 mm</td></tr></table><iframe src="https://untrusted.example/embed"></iframe>',
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('untrusted.example')
    expect(html).toContain('<th>Travel</th>')
    expect(html).toContain('400 mm')
  })
  it('retains product layout hooks and disclosure state without allowing executable content', () => {
    const html = sanitizeMigratedHTML(
      '<style>.feature{color:red}</style><script>alert(1)</script><div class="ta12-detail" onclick="alert(1)" style="position:fixed"><nav class="yueli-detail-nav"><a href="#specs">Specs</a></nav><details class="yl-model" open><summary>Model</summary><div class="feature-grid">Details</div></details></div>',
      (url: string) => url,
      { product: true },
    )
    expect(html).toContain('class="ta12-detail"')
    expect(html).toContain('<nav class="yueli-detail-nav">')
    expect(html).toContain('<details class="yl-model" open>')
    expect(html).toContain('class="feature-grid"')
    expect(html).not.toMatch(/<style|<script|onclick=|style=/)
    const ta12 = source.products.find((product) => product.id === 2290)!
    expect(ta12.html).toContain('class="ta12-detail"')
    expect(ta12.html).toContain('class="feature-grid"')
    expect(ta12.shortHTML).toContain('class="yueli-summary-rows"')
    const css = postcss.parse(fs.readFileSync('src/components/Yueli/product-content.css', 'utf8'))
    css.walkRules((rule) => {
      expect(
        rule.selectors.every(
          (selector) =>
            selector.startsWith('.yl-product-content .yl-source-content ') ||
            selector.startsWith('.yl-product-description .yueli-summary'),
        ),
      ).toBe(true)
    })
  })
  it('keeps internal links local without confusing lookalike domains for the original host', () => {
    const html = safeHTML(
      '<a href="https://yueliautomation.com/product/ta-12/">TA-12</a><a href="https://yueliautomation.com.evil.example/x">Other</a>',
    )
    expect(html).toContain('href="/product/ta-12/"')
    expect(html).toContain('href="https://yueliautomation.com.evil.example/x"')
  })
})
