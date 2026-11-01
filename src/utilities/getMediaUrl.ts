/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 *
 * Local paths (e.g. `/api/media/file/image.webp`) are kept relative so
 * Next.js image optimization treats them as local rather than fetching
 * through `remotePatterns`, which blocks private IPs since Next.js 16.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (!cacheTag || url.startsWith('/assets/media/')) return url
  const [base, fragment] = url.split('#', 2)
  const queryIndex = base.indexOf('?')
  const pathname = queryIndex < 0 ? base : base.slice(0, queryIndex)
  const query = new URLSearchParams(queryIndex < 0 ? '' : base.slice(queryIndex + 1))
  query.set('v', cacheTag)
  return `${pathname}?${query.toString()}${fragment === undefined ? '' : `#${fragment}`}`
}
