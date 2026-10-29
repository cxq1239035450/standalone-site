/** Restore source carousel structural wrappers from the cached, read-only source export. */
import fs from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import sanitize from 'sanitize-html'

const file = 'src/data/yueli.json'
const source = JSON.parse(await fs.readFile(file, 'utf8'))
const html = await fs.readFile('.migration/source/home.html', 'utf8')
const document = JSDOM.fragment(
  html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''),
)
const assets = new Map(source.assets.map((asset) => [asset.source, asset.local]))
const localURL = (value) => {
  const url = new URL(value, source.sourceOrigin)
  return (
    assets.get(url.href) ||
    (url.origin === source.sourceOrigin && !url.pathname.startsWith('/wp-content/')
      ? url.pathname + url.search + url.hash
      : url.href)
  )
}
source.home.heroSlides = [...document.querySelectorAll('.yl-slide')].map((slide) => ({
  className: slide.className.replace(/\bis-active\b/g, '').trim(),
  html: sanitize(slide.innerHTML, {
    allowedTags: [
      'div',
      'span',
      'strong',
      'b',
      'p',
      'h1',
      'h2',
      'br',
      'a',
      'img',
      'button',
      'ul',
      'li',
    ],
    allowedAttributes: {
      '*': ['class', 'aria-label', 'aria-hidden'],
      a: ['href'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'fetchpriority'],
      button: ['type', 'disabled', 'aria-disabled'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, href: localURL(attribs.href) } }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, src: localURL(attribs.src) } }),
    },
  }),
}))
if (source.home.heroSlides.length !== 5)
  throw new Error('Expected the complete five-slide original artwork.')
await fs.writeFile(file, JSON.stringify(source, null, 2) + '\n')
console.log('Restored five carousel artworks with their original list and layout wrappers.')
