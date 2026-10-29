/** Read-only WordPress export. Run before import-yueli.ts. Downloads stay on D:. */
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { JSDOM } from 'jsdom'
import sharp from 'sharp'
import sanitize from 'sanitize-html'
import { sanitizeMigratedHTML, extractProductCSS } from './yueli-content.mjs'

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
  fragment((html || '').replace(/<br\s*\/?>/gi, ' '))
    .textContent.replace(/\s+/g, ' ')
    .trim()
const localPath = (url) => decodeURI(new URL(url, origin).pathname).replace(/\/$/, '') || '/'
async function request(url, { sourceAsset = false } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await fetch(url, {
        signal: AbortSignal.timeout(90000),
        // The embedded FAQ image is protected by a CDN referer/browser check.
        // Keep these headers on asset downloads rather than on WordPress API requests.
        ...(sourceAsset
          ? {
              headers: {
                Referer: `${origin}/`,
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
                Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
              },
            }
          : {}),
      })
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
const [pages, posts, products, categories, postCategories, postTags] = await Promise.all([
  collection('pages', 'wp/v2/pages'),
  collection('posts', 'wp/v2/posts'),
  collection('products', 'wc/store/v1/products'),
  collection('categories', 'wp/v2/product_cat'),
  collection('post-categories', 'wp/v2/categories'),
  collection('post-tags', 'wp/v2/tags'),
])
const html = await (await request(origin)).text()
await fs.writeFile(path.join(cache, 'home.html'), html)
const home = fragment(html)
const assets = new Map()
function addAsset(url, alt = '') {
  try {
    const u = new URL(url, origin)
    const sourceAsset =
      (u.origin === origin &&
        (u.pathname.startsWith('/wp-content/uploads/') ||
          /^\/wp-content\/plugins\/yueli-[^/]+\/assets\//.test(u.pathname))) ||
      u.href === 'http://cnc.huaqiutong.com/wp-content/uploads/2024/08/FAQS_img.webp'
    if (!sourceAsset || !/\.(png|jpe?g|webp|gif|svg|pdf|mp4|webm)$/i.test(u.pathname)) return
    u.search = ''
    if (!assets.has(u.href)) assets.set(u.href, { source: u.href, alt })
  } catch {
    /* Ignore invalid URLs in the source markup. */
  }
}
function scanHTML(value) {
  const d = fragment(value)
  d.querySelectorAll('img').forEach((img) => addAsset(img.getAttribute('src'), img.alt))
  d.querySelectorAll('video').forEach((video) => {
    addAsset(video.getAttribute('poster'), video.getAttribute('aria-label') || 'Video poster')
    addAsset(video.getAttribute('src'), video.getAttribute('aria-label') || 'Yueli process video')
  })
  d.querySelectorAll('source').forEach((source) =>
    addAsset(source.getAttribute('src'), 'Yueli automated machining process'),
  )
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
      const isImage = !['.pdf', '.svg', '.mp4', '.webm'].includes(extension)
      // Preserve the source QR pixels losslessly so both codes remain scannable.
      const preservePNG = new URL(asset.source).pathname.endsWith('/contact-codes.png')
      asset.local = `/yueli-assets/${hash}${isImage && !preservePNG ? '.webp' : extension}`
      const destination = path.join(root, 'public', asset.local)
      try {
        if (!(await fs.stat(destination).catch(() => null))) {
          const buffer = Buffer.from(
            await (await request(asset.source, { sourceAsset: true })).arrayBuffer(),
          )
          if (isImage && !preservePNG)
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
function cleanHTML(html, options) {
  return sanitizeMigratedHTML(html, mapURL, options)
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
const nodeText = (node) => text(node?.innerHTML || '')
const imageData = (image) => ({
  src: mapURL(image?.getAttribute('src')),
  alt: image?.alt || '',
})
const headingData = (section) => ({
  eyebrow: nodeText(section?.querySelector('.eyebrow,.yl-factory-label,.yl-cert-kicker')),
  title: nodeText(section?.querySelector('h2')),
  description: nodeText(section?.querySelector('.lead')),
})
const intro = home.querySelector('.intro')
const productSection = home.querySelector('section.products')
const processSection = home.querySelector('section.process')
const factory = home.querySelector('.yl-factory')
const certificatesSection = home.querySelector('.yl-cert-section')
const faqSection = home.querySelector('section.faq')
const inquiry = home.querySelector('section.cta')
const footer = home.querySelector('footer')
const footerContact = footer?.querySelector('.elementor-element-3f98f5c8')
const navigation = [...home.querySelectorAll('.uyh-nav-link')].map((link) => ({
  label: nodeText(link),
  href: mapURL(link.getAttribute('href')),
}))
const heroHTML = (value) =>
  sanitize(value, {
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
      a: (tag, attrs) => ({ tagName: tag, attribs: { ...attrs, href: mapURL(attrs.href) } }),
      img: (tag, attrs) => ({ tagName: tag, attribs: { ...attrs, src: mapURL(attrs.src) } }),
    },
  })
const dataset = {
  sourceOrigin: origin,
  collectedAt: new Date().toISOString(),
  brand: {
    name: 'Yueli Automation',
    logo: mapURL(logo?.getAttribute('src')),
    email: nodeText(footerContact?.querySelector('a[href^="mailto:"]')),
    telephone: nodeText(footerContact?.querySelectorAll('.elementor-icon-list-text')[1]),
    address: nodeText(footerContact?.querySelector('.elementor-icon-list-text')),
    navigation,
    footer: {
      projectText: nodeText(footer?.querySelector('.elementor-element-2817fc9c p')),
      tagline: nodeText(footer?.querySelector('.elementor-element-304a9656 p')),
      copyright: nodeText(footer?.querySelector('.elementor-element-58dd3e77 p')),
      links: [...footer.querySelectorAll('.elementor-element-7fb6b3ac a')].map((link) => ({
        label: nodeText(link),
        href: mapURL(link.getAttribute('href')),
      })),
    },
    qrCodes: {
      image: mapURL(footer.querySelector('.yl-qr-disclosure img')?.getAttribute('src')),
      whatsapp:
        footer
          .querySelector('.yl-qr-disclosure:first-child .yl-qr-panel a')
          ?.getAttribute('href') || '',
      wechat:
        footer.querySelector('.yl-qr-disclosure:last-child .yl-qr-panel a')?.getAttribute('href') ||
        '',
    },
    qrContacts: [...footer.querySelectorAll('.yl-qr-disclosure')].map((code) => ({
      label: nodeText(code.querySelector('summary span')),
      image: imageData(code.querySelector('img')),
      href: code.querySelector('.yl-qr-panel a')?.getAttribute('href') || '',
    })),
    slides,
    factoryImages: list
      .filter((a) => /workshop|manufacturing|assembly|verification|production-ready/i.test(a.alt))
      .slice(0, 6)
      .map((a) => ({ src: a.local, alt: a.alt })),
    certificates: list
      .filter((a) => /certificate|patent/i.test(a.alt))
      .map((a) => ({ src: a.local, alt: a.alt })),
  },
  home: {
    heroSlides: [...mainDOM.querySelectorAll('.yl-slide')].map((slide) => ({
      className: slide.className.replace(/\bis-active\b/g, '').trim(),
      html: heroHTML(slide.innerHTML),
    })),
    processVideo: mapURL(intro?.querySelector('video source')?.getAttribute('src')),
    processPoster: mapURL(intro?.querySelector('video')?.getAttribute('poster')),
    introduction: {
      ...headingData(intro),
      paragraphs: [...intro.querySelectorAll('p')].map(nodeText),
      features: [...intro.querySelectorAll('.mini > div')].map(nodeText),
    },
    featured: {
      ...headingData(productSection),
      products: [...productSection.querySelectorAll('.card')].map((card) => {
        const href = mapURL(card.getAttribute('href'))
        return {
          id: products.find((product) => localPath(product.permalink) === localPath(href))?.id,
          path: href,
          title: nodeText(card.querySelector('h3')),
          label: nodeText(card.querySelector('.category')),
          summary: nodeText(card.querySelector('p')),
          image: imageData(card.querySelector('img')),
        }
      }),
    },
    process: {
      ...headingData(processSection),
      steps: [...processSection.querySelectorAll('.step')].map((step) => ({
        number: nodeText(step.querySelector('b')),
        title: nodeText(step.querySelector('h3')),
        description: nodeText(step.querySelector('p')),
      })),
    },
    factory: {
      ...headingData(factory),
      description: nodeText(factory.querySelector('.yl-factory-copy p')),
      mainImage: imageData(factory.querySelector('.yl-factory-main img')),
      images: [...factory.querySelectorAll('.yl-factory-card')].map((card) => ({
        ...imageData(card.querySelector('img')),
        caption: nodeText(card.querySelector('figcaption')),
      })),
    },
    certificates: {
      ...headingData(certificatesSection),
      description: nodeText(certificatesSection.querySelector('p')),
      images: [...certificatesSection.querySelectorAll('img')].slice(0, 16).map(imageData),
    },
    faq: {
      ...headingData(faqSection),
      image: imageData(faqSection.querySelector('img')),
      items: [...faqSection.querySelectorAll('details')].map((item) => ({
        question: nodeText(item.querySelector('summary')),
        answer: nodeText(item.querySelector('p')),
      })),
    },
    inquiry: {
      ...headingData(inquiry),
      contact: nodeText(inquiry.querySelector('.contactline')),
    },
  },
  products: products.map((p) => ({
    id: p.id,
    slug: decodeURIComponent(p.slug),
    path: localPath(p.permalink),
    title: text(p.name),
    sku: p.sku,
    summary: text(p.short_description),
    shortHTML: cleanHTML(p.short_description, { product: true }),
    html: cleanHTML(p.description, { product: true }),
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
    categories: p.categories || [],
    tags: p.tags || [],
  })),
  postCategories: postCategories.map((term) => ({
    id: term.id,
    slug: term.slug,
    path: localPath(term.link),
    title: text(term.name),
    html: cleanHTML(term.description),
    count: term.count,
    parent: term.parent || 0,
  })),
  postTags: postTags.map((term) => ({
    id: term.id,
    slug: term.slug,
    path: localPath(term.link),
    title: text(term.name),
    html: cleanHTML(term.description),
    count: term.count,
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
    ...failures.map((failure) => `Source asset could not be downloaded: ${failure.url}`),
  ],
}
await fs.writeFile(path.join(root, 'src/data/yueli.json'), JSON.stringify(dataset, null, 2) + '\n')
await fs.writeFile(
  path.join(root, 'src/components/Yueli/product-content.css'),
  extractProductCSS(products),
)
await fs.writeFile(
  path.join(root, 'src/data/yueli-taxonomy.json'),
  JSON.stringify(
    {
      sourceOrigin: origin,
      collectedAt: dataset.collectedAt,
      categories: dataset.postCategories.map((term) => ({ ...term, description: text(term.html) })),
      tags: dataset.postTags.map((term) => ({ ...term, description: text(term.html) })),
      posts: dataset.posts.map(({ id, categories, tags }) => ({ id, categories, tags })),
    },
    null,
    2,
  ) + '\n',
)
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
        postCategories: postCategories.length,
        postTags: postTags.length,
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
