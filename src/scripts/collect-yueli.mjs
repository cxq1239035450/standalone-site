/** Read-only WordPress export. Run before import-yueli.ts. Downloads stay on D:. */
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { JSDOM } from 'jsdom'
import sharp from 'sharp'
import sanitize from 'sanitize-html'

const origin = 'https://yueliautomation.com'
const root = process.cwd()
const cache = path.join(root, '.migration/source')
const out = path.join(root, 'public/yueli-assets')
await fs.mkdir(cache, { recursive: true })
await fs.mkdir(out, { recursive: true })
await fs.mkdir(path.join(root, 'src/data'), { recursive: true })
const fragment = (html) =>
  JSDOM.fragment(
    html
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''),
  )
const text = (html) =>
  fragment(html || '')
    .textContent.replace(/\s+/g, ' ')
    .trim()
const localPath = (url) => decodeURI(new URL(url, origin).pathname).replace(/\/$/, '') || '/'
async function request(url) {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(90000) })
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${url}`)
      return r
    } catch (e) {
      if (attempt >= 3) throw e
    }
  }
}
async function collection(name, endpoint) {
  const file = path.join(cache, name + '.json')
  // Fetch all pages, rather than assuming the first 100 records are complete.
  const r = await request(`${origin}/wp-json/${endpoint}?per_page=100&_embed=1`)
  let records = await r.json()
  if (!Array.isArray(records)) throw new Error(`Expected a collection: ${endpoint}`)
  const pages = Number(r.headers.get('x-wp-totalpages') || 1)
  for (let page = 2; page <= pages; page++)
    records.push(
      ...(await (
        await request(`${origin}/wp-json/${endpoint}?per_page=100&_embed=1&page=${page}`)
      ).json()),
    )
  await fs.writeFile(file, JSON.stringify(records))
  console.log(`${name}: ${records.length} records (${pages} API pages)`)
  return records
}
const [pages, posts, products, categories] = await Promise.all([
  collection('pages', 'wp/v2/pages'),
  collection('posts', 'wp/v2/posts'),
  collection('products', 'wc/store/v1/products'),
  collection('categories', 'wp/v2/product_cat'),
])
const html = await (await request(origin)).text()
await fs.writeFile(path.join(cache, 'home.html'), html)
const home = fragment(html)
const assets = new Map()
function addAsset(url, alt = '') {
  try {
    const u = new URL(url, origin)
    if (
      u.origin !== origin ||
      !u.pathname.startsWith('/wp-content/uploads/') ||
      !/\.(png|jpe?g|webp|gif|svg|pdf)$/i.test(u.pathname)
    )
      return
    u.search = ''
    if (!assets.has(u.href)) assets.set(u.href, { source: u.href, alt })
  } catch {
    /* Ignore invalid URLs in the source markup. */
  }
}
function scanHTML(value) {
  const d = fragment(value)
  d.querySelectorAll('img').forEach((img) => addAsset(img.getAttribute('src'), img.alt))
  for (const match of value.matchAll(
    /(?:https?:)?\/\/yueliautomation\.com\/wp-content\/uploads\/[^\s"'<>\)]+/g,
  ))
    addAsset(match[0].replaceAll('&amp;', '&'))
}
scanHTML(html)
for (const item of [...pages, ...posts]) {
  scanHTML(item.content.rendered)
  const media = item._embedded?.['wp:featuredmedia']?.[0]
  if (media?.source_url) addAsset(media.source_url, media.alt_text)
}
for (const item of products) {
  scanHTML(item.description)
  for (const image of item.images) addAsset(image.src, image.alt || item.name)
}
for (const cat of categories) scanHTML(cat.description || '')
const failures = []
let next = 0,
  completed = 0
const list = [...assets.values()]
await Promise.all(
  Array.from({ length: 5 }, async () => {
    while (next < list.length) {
      const asset = list[next++]
      const hash = crypto.createHash('sha256').update(asset.source).digest('hex').slice(0, 16)
      const extension = path.extname(new URL(asset.source).pathname).toLowerCase()
      const isImage = !['.pdf', '.svg'].includes(extension)
      asset.local = `/yueli-assets/${hash}${isImage ? '.webp' : extension}`
      const destination = path.join(root, 'public', asset.local)
      try {
        if (!(await fs.stat(destination).catch(() => null))) {
          const buffer = Buffer.from(await (await request(asset.source)).arrayBuffer())
          if (isImage)
            await sharp(buffer)
              .rotate()
              .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
              .webp({ quality: 88 })
              .toFile(destination)
          else await fs.writeFile(destination, buffer)
        }
        if (isImage) {
          const m = await sharp(destination).metadata()
          asset.width = m.width
          asset.height = m.height
        }
        if (++completed % 15 === 0) console.log(`Local assets: ${completed}/${list.length}`)
      } catch (error) {
        failures.push({ url: asset.source, error: String(error) })
        asset.local = ''
        console.warn(`Source asset unavailable: ${asset.source}`)
      }
    }
  }),
)
function mapURL(value) {
  if (!value) return ''
  try {
    const url = new URL(value, origin)
    const asset = assets.get(url.href.split('?')[0])
    if (asset?.local) return asset.local
    if (url.origin === origin && !url.pathname.startsWith('/wp-content/'))
      return url.pathname + url.search + url.hash
    return url.href
  } catch {
    return ''
  }
}
function cleanHTML(html) {
  const d = fragment(html || '')
  d.querySelectorAll('header,footer,nav,form,button,input,textarea,select,link,meta,svg').forEach(
    (e) => e.remove(),
  )
  return sanitize([...d.childNodes].map((n) => n.outerHTML || n.textContent || '').join(''), {
    allowedTags: [
      'p',
      'div',
      'section',
      'article',
      'span',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'strong',
      'b',
      'em',
      'i',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'figure',
      'figcaption',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'br',
      'hr',
      'blockquote',
      'details',
      'summary',
      'iframe',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'scope'],
      td: ['colspan', 'rowspan'],
      iframe: ['src', 'title', 'allowfullscreen', 'loading'],
      '*': ['id'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'www.youtube.com'],
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: (tag, attrs) => ({ tagName: tag, attribs: { ...attrs, href: mapURL(attrs.href) } }),
      img: (tag, attrs) => ({
        tagName: tag,
        attribs: { ...attrs, src: mapURL(attrs.src), loading: 'lazy' },
      }),
    },
  })
}
const main = pages.find((p) => localPath(p.link) === '/')
const mainDOM = fragment(main.content.rendered)
const slides = [...mainDOM.querySelectorAll('.yl-slide')]
  .map((el) => ({
    title: text(el.querySelector('h1,h2')?.innerHTML || ''),
    description: text(el.querySelector('p')?.innerHTML || ''),
    image: mapURL(el.querySelector('img')?.getAttribute('src')),
    href: mapURL(el.querySelector('a')?.getAttribute('href')),
    label: text(el.querySelector('a')?.innerHTML || 'View equipment'),
  }))
  .filter((s) => s.title && s.image)
const logo = [...home.querySelectorAll('img')].find((img) => img.alt === 'Yueli Automation')
const dataset = {
  sourceOrigin: origin,
  collectedAt: new Date().toISOString(),
  brand: {
    name: 'Yueli Automation',
    logo: mapURL(logo?.getAttribute('src')),
    email: 'nina.h@yueli-tech.com',
    telephone: '+86 136 0076 8411',
    address: 'No. 1 Ximei Village, Meilin Street, Nan’an, Quanzhou, Fujian, China',
    slides,
    factoryImages: list
      .filter((a) => /workshop|manufacturing|assembly|verification|production-ready/i.test(a.alt))
      .slice(0, 6)
      .map((a) => ({ src: a.local, alt: a.alt })),
    certificates: list
      .filter((a) => /certificate|patent/i.test(a.alt))
      .map((a) => ({ src: a.local, alt: a.alt })),
  },
  products: products.map((p) => ({
    id: p.id,
    slug: decodeURIComponent(p.slug),
    path: localPath(p.permalink),
    title: text(p.name),
    sku: p.sku,
    summary: text(p.short_description),
    html: cleanHTML(p.description),
    images: p.images.map((img) => ({ src: mapURL(img.src), alt: img.alt || text(p.name) })),
    categories: p.categories.map((c) => c.id),
    attributes: p.attributes.map((a) => ({
      name: text(a.name),
      values: (a.terms || []).map((t) => text(t.name)),
    })),
    publishedAt: new Date().toISOString(),
  })),
  categories: categories.map((c) => ({
    id: c.id,
    slug: decodeURIComponent(c.slug),
    title: text(c.name),
    parent: c.parent,
    path: localPath(c.link),
    html: cleanHTML(c.description || ''),
    count: c.count,
  })),
  posts: posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    path: localPath(p.link),
    title: text(p.title.rendered),
    html: cleanHTML(p.content.rendered),
    summary: text(p.excerpt.rendered),
    image: mapURL(p._embedded?.['wp:featuredmedia']?.[0]?.source_url),
    publishedAt: p.date_gmt + 'Z',
  })),
  pages: pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    path: localPath(p.link),
    title: text(p.title.rendered),
    html: cleanHTML(p.content.rendered),
    summary: text(p.excerpt.rendered),
    publishedAt: p.date_gmt + 'Z',
    noIndex: ['sample-page', 'product-detail-template-preview-electric-tapping-machine'].includes(
      p.slug,
    ),
  })),
  assets: list,
  failures,
  sourceNotes: [
    'Five older posts have no public full body; the original published excerpts are imported without inventing article text.',
    'WordPress page bodies for products and blog duplicate old FAQ content; collection views are rebuilt from the public product and post APIs.',
    'English content is migrated as published; no unverified translations or commercial claims are generated.',
  ],
}
await fs.writeFile(path.join(root, 'src/data/yueli.json'), JSON.stringify(dataset, null, 2) + '\n')
await fs.writeFile(
  path.join(cache, 'migration-report.json'),
  JSON.stringify(
    {
      collectedAt: dataset.collectedAt,
      counts: {
        products: products.length,
        posts: posts.length,
        pages: pages.length,
        categories: categories.length,
        assets: list.length,
      },
      failures,
      notes: dataset.sourceNotes,
    },
    null,
    2,
  ),
)
console.log(
  `Export ready: ${products.length} products, ${posts.length} posts, ${pages.length} pages, ${categories.length} categories, ${completed} local assets; unavailable assets: ${failures.length}`,
)
