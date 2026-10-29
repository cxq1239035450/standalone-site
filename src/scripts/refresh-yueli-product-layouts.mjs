/** Rebuild product presentation from the last read-only export without fetching or touching the DB. */
import fs from 'node:fs/promises'
import path from 'node:path'
import { sanitizeMigratedHTML, extractProductCSS } from './yueli-content.mjs'

const root = process.cwd()
const sourcePath = path.join(root, 'src/data/yueli.json')
const source = JSON.parse(await fs.readFile(sourcePath, 'utf8'))
const products = JSON.parse(
  await fs.readFile(path.join(root, '.migration/source/products.json'), 'utf8'),
)
const assets = new Map(
  source.assets.filter((asset) => asset.local).map((asset) => [asset.source, asset.local]),
)
const mapURL = (value) => {
  if (!value) return ''
  try {
    const url = new URL(value, source.sourceOrigin)
    if (assets.has(url.href.split('?')[0])) return assets.get(url.href.split('?')[0])
    return url.origin === source.sourceOrigin && !url.pathname.startsWith('/wp-content/')
      ? url.pathname + url.search + url.hash
      : url.href
  } catch {
    return ''
  }
}
await fs.mkdir(path.join(root, '.backups'), { recursive: true })
const backup = path.join(root, '.backups', `yueli-product-source-before-layouts-${Date.now()}.json`)
await fs.writeFile(backup, JSON.stringify(source.products, null, 2) + '\n')
let updated = 0
for (const product of source.products) {
  const raw = products.find((item) => item.id === product.id)
  if (!raw) throw new Error(`Missing cached source for product ${product.id}`)
  product.html = sanitizeMigratedHTML(raw.description, mapURL, { product: true })
  product.shortHTML = sanitizeMigratedHTML(raw.short_description, mapURL, { product: true })
  updated++
}
await fs.writeFile(sourcePath, JSON.stringify(source, null, 2) + '\n')
await fs.writeFile(
  path.join(root, 'src/components/Yueli/product-content.css'),
  extractProductCSS(products),
)
console.log(
  `Rebuilt ${updated} product descriptions and isolated source CSS; snapshot backup: ${backup}`,
)
