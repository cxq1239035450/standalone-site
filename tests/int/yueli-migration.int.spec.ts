import { describe, it, expect } from 'vitest'
import { safeHTML } from '../../src/components/Yueli/html'
import source from '../../src/data/yueli.json'
import fs from 'node:fs'
import path from 'node:path'

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
    expect(source.failures).toEqual([])
    for (const asset of source.assets)
      expect(fs.existsSync(path.join(process.cwd(), 'public', asset.local))).toBe(true)
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
  it('keeps internal links local without confusing lookalike domains for the original host', () => {
    const html = safeHTML(
      '<a href="https://yueliautomation.com/product/ta-12/">TA-12</a><a href="https://yueliautomation.com.evil.example/x">Other</a>',
    )
    expect(html).toContain('href="/product/ta-12/"')
    expect(html).toContain('href="https://yueliautomation.com.evil.example/x"')
  })
})
