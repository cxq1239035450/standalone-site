import type { Config } from 'payload'
import { createContentReader } from '@/i18n/content'
import { localizedContentPath } from '@/i18n/contentRoutes'

export function insightsContentURL(input: {
  collection: string
  locale: string
  doc: Record<string, unknown>
}, origin: string, yueli: boolean) {
  const { collection, locale, doc } = input
  const slug = encodeURIComponent(String(doc.slug || ''))
  const migration = doc.migration as { sourcePath?: string } | undefined
  const path = yueli
    ? migration?.sourcePath || (collection === 'pages'
      ? (doc.slug === 'home' ? '/' : `/${slug}`)
      : `/${collection === 'products' ? 'product' : 'blog'}/${slug}`)
    : collection === 'pages' ? (doc.slug === 'home' ? '/' : `/${slug}`) : `/${collection}/${slug}`
  return new URL(yueli ? localizedContentPath(path, locale) : `/${locale}${path === '/' ? '' : path}`, origin).href
}

/** Keep the vendor's Bearer check and pagination, but read the published translation projection. */
export function withPublishedContent(config: Config): Config {
  return { ...config, endpoints: (config.endpoints || []).map(endpoint => {
    if (endpoint.path !== '/insights/v1/content' || endpoint.method !== 'get') return endpoint
    return { ...endpoint, handler: req => {
      const payload = new Proxy(req.payload, {
        get(target, key) {
          // The vendor only accesses find after successful integration-token authentication.
          if (key === 'find') return createContentReader(target).find
          return Reflect.get(target, key, target)
        },
      })
      return endpoint.handler(new Proxy(req, {
        get(target, key) { return key === 'payload' ? payload : Reflect.get(target, key, target) },
      }))
    } }
  }) }
}
