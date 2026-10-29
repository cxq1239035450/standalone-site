/** Capture the original custom page layouts without executable WordPress/plugin markup. */
import fs from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import sanitize from 'sanitize-html'

const origin = 'https://yueliautomation.com'
const source = JSON.parse(await fs.readFile('src/data/yueli.json', 'utf8'))
const layouts = []
const styles = []
const normalize = (value) => decodeURI(value).replace(/-\d+x\d+(?=\.[^.]+$)/, '')
const assets = new Map(
  source.assets.filter((a) => a.local).map((a) => [normalize(a.source), a.local]),
)
function localURL(value) {
  if (!value) return ''
  try {
    const url = new URL(value, origin)
    const asset = assets.get(normalize(url.href.split('?')[0]))
    if (asset) return asset
    return url.origin === origin && !url.pathname.startsWith('/wp-content/')
      ? url.pathname + url.search + url.hash
      : url.href
  } catch {
    return ''
  }
}
for (const [slug, selector] of [
  ['about-us', '.ya-about'],
  ['faq', '.yf-faq'],
  ['contact-us', '.yc-contact'],
  ['blog', '.yb-blog'],
]) {
  const response = await fetch(`${origin}/${slug}/`, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`${slug}: HTTP ${response.status}`)
  const html = await response.text()
  await fs.mkdir('.migration/source-replica', { recursive: true })
  await fs.writeFile(`.migration/source-replica/${slug}.html`, html)
  const document = new JSDOM(html).window.document
  let root = document.querySelector(selector)
  // The original Contact page has an unbalanced wrapper; preserve its visible sections.
  if (!root && slug === 'contact-us') {
    const parent = document.querySelector('.yc-hero')?.parentElement
    if (parent) {
      root = document.createElement('div')
      root.className = 'yc-contact'
      for (const node of [...parent.children])
        if (node.matches('section[class*="yc-"], .yl-direct-contact'))
          root.append(node.cloneNode(true))
    }
  }
  if (!root) throw new Error(`Original layout missing: ${selector}`)
  if (slug === 'contact-us') {
    root
      .querySelectorAll('.yl-direct-contact, .yc-contact-bar, .yc-actions')
      .forEach((node) => node.remove())
    root
      .querySelectorAll('a[href^="mailto:"]')
      .forEach((node) => node.setAttribute('href', '#project-inquiry'))
  }
  root.querySelectorAll('.yc-fact-grid').forEach((node) => node.closest('section')?.remove())
  root.querySelector('.yc-form')?.replaceWith(
    Object.assign(document.createElement('div'), {
      id: 'yueli-inquiry-slot',
      className: 'yc-form yc-elementor-form',
    }),
  )
  root
    .querySelectorAll('script,style,form,button,input,textarea,select,link,meta')
    .forEach((node) => node.remove())
  root.querySelectorAll('[src]').forEach((node) => {
    node.setAttribute('src', localURL(node.getAttribute('src')))
    node.removeAttribute('srcset')
  })
  root
    .querySelectorAll('a[href]')
    .forEach((node) => node.setAttribute('href', localURL(node.getAttribute('href'))))
  const clean = sanitize(root.outerHTML, {
    allowedTags: [
      ...sanitize.defaults.allowedTags,
      'img',
      'details',
      'summary',
      'section',
      'article',
      'figure',
      'figcaption',
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      a: ['href', 'title', 'aria-label'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      details: ['open'],
      th: ['colspan', 'rowspan', 'scope'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  })
  const css = [...document.querySelectorAll('style')]
    .filter((node) => node.textContent.includes(selector))
    .map((node) => node.textContent)
    .join('\n')
    // The new layout has no WordPress body.blog class. Preserve the visible page,
    // without its old theme's default-hidden switch.
    .replace(/\.yb-blog\s*\{\s*display\s*:\s*none\s*;?\s*\}/g, '')
    .replace(/body\.blog\s+\.yb-blog(?=\s*\{)/g, '.yl-original-layout > .yb-blog')
  if (!css) throw new Error(`Original styles missing: ${selector}`)
  styles.push(
    `/* ${origin}/${slug}/ — original page styles, captured for the authorized migration. */\n${css.replace(/url\((['"]?)([^)'"\s]+)\1\)/g, (_, quote, url) => `url('${localURL(url)}')`)}`,
  )
  const page = source.pages.find((page) => page.slug === slug)
  layouts.push({ sourceId: page?.id, slug, selector, html: clean })
  console.log(`${slug}: ${clean.length} HTML bytes, ${css.length} CSS bytes`)
}
await fs.writeFile('src/data/yueli-page-layouts.json', JSON.stringify(layouts, null, 2) + '\n')
await fs.writeFile('src/components/Yueli/source-pages.css', styles.join('\n\n') + '\n')
const contactStyles = await fetch(
  `${origin}/wp-content/plugins/yueli-direct-contact/assets/contact.css?ver=1.0.0`,
  { signal: AbortSignal.timeout(60000) },
)
if (!contactStyles.ok) throw new Error(`Contact styles: HTTP ${contactStyles.status}`)
await fs.writeFile(
  'src/components/Yueli/source-contact.css',
  (await contactStyles.text()) +
    '\n/* Exclude the labels embedded below the QR codes. */\n.yl-contact-qr img { clip-path:inset(0 0 24% 0); }\n',
)
