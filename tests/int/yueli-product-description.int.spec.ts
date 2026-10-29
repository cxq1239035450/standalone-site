import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import source from '../../src/data/yueli.json'
import { ProductDescription } from '../../src/components/Yueli/ProductDescription'

const documentFor = (html: string) => new JSDOM(html).window.document
const cells = (document: Document) =>
  Array.from(document.querySelectorAll('table')).map((table) =>
    Array.from(table.querySelectorAll('tr')).map((row) =>
      Array.from(row.querySelectorAll('th,td')).map((cell) =>
        cell.textContent?.replace(/\s+/g, ' ').trim(),
      ),
    ),
  )

describe('shared product technical description', () => {
  it('preserves every specification cell across all 34 products and makes all five navigation links local', () => {
    for (const product of source.products) {
      const original = documentFor(product.html)
      const rendered = documentFor(
        renderToStaticMarkup(
          createElement(ProductDescription, {
            html: product.html,
            summary: product.summary,
            title: product.title,
          }),
        ),
      )
      expect(cells(rendered), product.slug).toEqual(cells(original))
      const links = rendered.querySelectorAll('.yueli-detail-nav a')
      expect(links).toHaveLength(5)
      for (const link of links) {
        const href = link.getAttribute('href')!
        expect(href).toMatch(/^#yl-/)
        expect(rendered.querySelectorAll(href), product.slug).toHaveLength(1)
      }
      expect(rendered.querySelector('#yl-overview h2')?.textContent).toBe('Product Overview')
      expect(rendered.querySelectorAll('details.yl-model').length).toBeGreaterThanOrEqual(
        original.querySelectorAll('details.yl-model').length,
      )
    }
  })
  it('keeps multi-column lathe data and the custom-equipment state instead of inventing parameters', () => {
    for (const id of [2450, 1722]) {
      const product = source.products.find((product) => product.id === id)!
      const rendered = documentFor(
        renderToStaticMarkup(
          createElement(ProductDescription, {
            html: product.html,
            title: product.title,
            summary: product.summary,
          }),
        ),
      )
      if (id === 2450) {
        expect(rendered.querySelectorAll('#yl-technical details')).toHaveLength(2)
        expect(rendered.querySelector('#yl-technical thead tr')?.children).toHaveLength(3)
      } else {
        expect(rendered.querySelector('#yl-technical .yl-custom-spec')?.textContent).toContain(
          'does not provide a fixed technical parameter table',
        )
        expect(rendered.querySelectorAll('table')).toHaveLength(0)
      }
    }
  })
})
