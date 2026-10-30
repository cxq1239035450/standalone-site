type Environment = {
  NODE_ENV?: string
  MATOMO_URL?: string
  MATOMO_SITE_ID?: string
  MATOMO_ENABLED?: string
}

export function matomoConfig(environment: Environment = process.env) {
  if (environment.NODE_ENV !== 'production' || environment.MATOMO_ENABLED !== 'true') return
  const siteId = environment.MATOMO_SITE_ID?.trim()
  if (!siteId || !/^[1-9]\d*$/.test(siteId)) return
  try {
    const url = new URL(environment.MATOMO_URL || '')
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return
    return { url: `${url.href.replace(/\/+$/, '')}/`, siteId }
  } catch {
    return
  }
}
