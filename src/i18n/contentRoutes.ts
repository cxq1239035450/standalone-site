import type { Where } from 'payload'

const reservedRoots = new Set([
  'api',
  'admin',
  'next',
  'faq',
  'tag',
  'category',
  'product-category',
  'product',
  'products',
  'blog',
  'posts',
  'search',
  'resources',
  'solutions',
])

/** Recognize actual language codes, never arbitrary three-letter route names. */
export function contentRoutePath(value: string, languageCodes: readonly string[]): string | null {
  if (!value.startsWith('/') || value.startsWith('//')) return null
  const pathname = value.split(/[?#]/, 1)[0]
  const segments = pathname.split('/').filter(Boolean)
  if (languageCodes.includes(segments[0]) && !reservedRoots.has(segments[0])) segments.shift()
  try {
    const decoded = segments.map((segment) => decodeURIComponent(segment))
    if (decoded.some((segment) => segment.includes('/') || segment === '.' || segment === '..'))
      return null
    return '/' + decoded.join('/')
  } catch {
    return null
  }
}

type ContentRoute = { collection: 'products' | 'posts' | 'pages' | 'categories'; where: Where }

const sourcePath = (path: string): Where => ({
  or: [
    { 'migration.sourcePath': { equals: path } },
    { 'migration.sourcePath': { equals: path === '/' ? '/' : `${path}/` } },
  ],
})

/** Match Yueli's public URL aliases to a shared subject, before checking its translation. */
export function resolveContentRoute(
  value: string,
  languageCodes: readonly string[],
): ContentRoute | null {
  const path = contentRoutePath(value, languageCodes)
  if (path === null) return null
  const segments = path.split('/').filter(Boolean)
  if (!segments.length || path === '/home')
    return { collection: 'pages', where: { or: [{ slug: { equals: 'home' } }, sourcePath('/')] } }
  if (segments.length === 2 && ['product', 'products'].includes(segments[0]))
    return { collection: 'products', where: { slug: { equals: segments[1] } } }
  if (segments.length === 2 && ['blog', 'posts'].includes(segments[0]))
    return { collection: 'posts', where: { slug: { equals: segments[1] } } }
  if (/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+$/.test(path))
    return { collection: 'posts', where: sourcePath(path) }
  if (segments.length >= 2 && segments[0] === 'product-category')
    return {
      collection: 'categories',
      where: {
        and: [
          { or: [sourcePath(path), { slug: { equals: segments.at(-1) } }] },
          { or: [{ taxonomy: { equals: 'product' } }, { taxonomy: { exists: false } }] },
        ],
      },
    }
  if (segments.length === 2 && ['category', 'tag'].includes(segments[0]))
    return {
      collection: 'categories',
      where: {
        and: [
          { or: [sourcePath(path), { slug: { equals: segments[1] } }] },
          { taxonomy: { equals: segments[0] === 'category' ? 'post-category' : 'post-tag' } },
        ],
      },
    }
  if (segments.length === 1 && !['api', 'admin', 'next'].includes(segments[0]))
    return {
      collection: 'pages',
      where: { or: [sourcePath(path), { slug: { equals: segments[0] } }] },
    }
  return null
}

/** English keeps its original URL; other languages receive an explicit prefix. */
export function localizedContentPath(path: string, locale: string): string {
  return locale === 'en' ? path : `/${locale}${path === '/' ? '' : path}`
}
