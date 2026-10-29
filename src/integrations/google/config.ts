type GoogleEnvironment = {
  NODE_ENV?: string
  GA_MEASUREMENT_ID?: string
  GOOGLE_SITE_VERIFICATION?: string
}

export function googleMeasurementId(environment: GoogleEnvironment = process.env) {
  const id = environment.GA_MEASUREMENT_ID?.trim()
  return environment.NODE_ENV === 'production' && id && /^G-[A-Z0-9]+$/.test(id) ? id : undefined
}

export function googleSiteVerification(environment: GoogleEnvironment = process.env) {
  const token = environment.GOOGLE_SITE_VERIFICATION?.trim()
  return token && /^[A-Za-z0-9_-]+$/.test(token) ? token : undefined
}

// Inquiry and preview URLs can contain private query values. Never send them to GA.
export function analyticsPageURL(value: string) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? `${url.origin}${url.pathname}` : ''
  } catch {
    return ''
  }
}
