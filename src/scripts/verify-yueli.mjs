import fs from 'node:fs/promises'
import source from '../data/yueli.json' with { type: 'json' }
import taxonomy from '../data/yueli-taxonomy.json' with { type: 'json' }

const origin = process.env.YUELI_VERIFY_ORIGIN || 'http://localhost:3000'
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
  throw new Error('Verification is restricted to a local migration preview.')
const paths = [
  ...new Set([
    '/',
    '/products',
    '/products?product-page=2',
    '/products?product-page=3',
    '/blog',
    '/contact-us',
    '/admin',
    '/sitemap.xml',
    '/robots.txt',
    '/llms.txt',
    '/wp-sitemap.xml',
    '/wp-sitemap-posts-post-1.xml',
    '/wp-sitemap-posts-page-1.xml',
    '/wp-sitemap-posts-product-1.xml',
    '/wp-sitemap-taxonomies-category-1.xml',
    '/wp-sitemap-taxonomies-post_tag-1.xml',
    '/wp-sitemap-taxonomies-product_cat-1.xml',
    ...source.products.map((item) => item.path),
    ...source.pages.map((item) => item.path),
    ...source.posts.map((item) => item.path),
    ...source.categories.map((item) => item.path),
    ...taxonomy.categories.map((item) => item.path),
    ...taxonomy.tags.map((item) => item.path),
  ]),
]
const results = []
let cursor = 0
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (cursor < paths.length) {
      const pathname = paths[cursor++]
      try {
        const response = await fetch(origin + pathname, { signal: AbortSignal.timeout(90000) })
        const body = await response.text()
        const failed =
          !response.ok ||
          body.includes('NEXT_HTTP_ERROR_FALLBACK;404') ||
          body.includes('Something went wrong') ||
          body.includes('Build Error')
        results.push({ path: pathname, status: response.status, failed })
      } catch (error) {
        results.push({ path: pathname, failed: true, error: String(error) })
      }
    }
  }),
)
await fs.mkdir('.migration', { recursive: true })
await fs.writeFile(
  '.migration/replica-route-report.json',
  JSON.stringify({ origin, checkedAt: new Date().toISOString(), results }, null, 2),
)
const failures = results.filter((item) => item.failed)
const assets = source.assets.filter((asset) => new URL(asset.source).origin === source.sourceOrigin)
const assetResults = []
cursor = 0
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (cursor < assets.length) {
      const asset = assets[cursor++]
      const pathname = new URL(asset.source).pathname
      try {
        const response = await fetch(origin + pathname, {
          method: 'HEAD',
          redirect: 'manual',
          signal: AbortSignal.timeout(60000),
        })
        const location = response.headers.get('location')
        const target = location ? new URL(location).pathname : ''
        const local =
          target === asset.local
            ? await fetch(origin + asset.local, {
                method: 'HEAD',
                signal: AbortSignal.timeout(60000),
              })
            : null
        assetResults.push({
          path: pathname,
          status: response.status,
          target,
          failed: response.status !== 308 || target !== asset.local || local?.status !== 200,
        })
      } catch (error) {
        assetResults.push({ path: pathname, failed: true, error: String(error) })
      }
    }
  }),
)
const assetFailures = assetResults.filter((item) => item.failed)
await fs.writeFile(
  '.migration/replica-asset-url-report.json',
  JSON.stringify(assetResults, null, 2),
)
console.log(
  JSON.stringify(
    { origin, total: results.length, failures, legacyAssets: assetResults.length, assetFailures },
    null,
    2,
  ),
)
if (failures.length || assetFailures.length) process.exitCode = 1
