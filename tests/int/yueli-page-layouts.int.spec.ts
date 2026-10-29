import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import layouts from '../../src/data/yueli-page-layouts.json'
import { safeHTML } from '../../src/components/Yueli/html'
import postcss from 'postcss'

describe('original page layout migration', () => {
  it('shows each migrated page without WordPress body classes', () => {
    const stylesheet = postcss.parse(
      fs.readFileSync('src/components/Yueli/source-pages.css', 'utf8'),
    )
    for (const layout of layouts) {
      const rootRules: string[] = []
      stylesheet.walkRules((rule) => {
        if (
          rule.selectors.some(
            (selector) => selector === layout.selector || selector.endsWith(` ${layout.selector}`),
          )
        )
          rootRules.push(rule.toString())
      })
      const dom = new JSDOM(
        `<style>${rootRules.join('\n')}</style><main><div class="yl-original-layout">${safeHTML(layout.html)}</div></main>`,
      )
      expect(dom.window.document.body.className).toBe('')
      const root = dom.window.document.querySelector(layout.selector)!
      expect(dom.window.getComputedStyle(root).display).not.toBe('none')
      expect(root.querySelector('h1')?.textContent?.trim().length).toBeGreaterThan(0)
    }
  })
  it('preserves the four visible custom layouts, local media and native FAQ controls', () => {
    expect(layouts.map((layout) => layout.slug)).toEqual(['about-us', 'faq', 'contact-us', 'blog'])
    for (const layout of layouts) {
      const document = new JSDOM(safeHTML(layout.html)).window.document
      expect(document.querySelector(layout.selector)).not.toBeNull()
      expect(document.querySelector('script,style,form,input')).toBeNull()
      expect(document.querySelectorAll('h1')).toHaveLength(1)
      for (const image of document.querySelectorAll('img')) {
        expect(image.getAttribute('src')).toMatch(/^\/yueli-assets\//)
        expect(fs.existsSync(path.join(process.cwd(), 'public', image.getAttribute('src')!))).toBe(
          true,
        )
      }
    }
    const faq = new JSDOM(safeHTML(layouts.find((layout) => layout.slug === 'faq')!.html)).window
      .document
    expect(faq.querySelectorAll('details')).toHaveLength(15)
  })
  it('retains one live form insertion point and strips executable attributes from preserved classes', () => {
    const contact = new JSDOM(
      safeHTML(layouts.find((layout) => layout.slug === 'contact-us')!.html),
    ).window.document
    expect(contact.querySelectorAll('#yueli-inquiry-slot')).toHaveLength(1)
    expect(
      safeHTML(
        '<details class="yf-item" open onclick="alert(1)"><summary>Question</summary>Answer</details>',
      ),
    ).toBe('<details class="yf-item" open><summary>Question</summary>Answer</details>')
  })
})
