import createMiddleware from 'next-intl/middleware'

import { getLanguageRegistry } from './i18n/service'
import type { NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  const registry = await getLanguageRegistry()
  const candidate = request.nextUrl.pathname.split('/')[1]
  const locales = registry.languages.map(language => language.code)
  // Preserve explicit language URLs; the layout performs the authoritative
  // enabled-language / authenticated-preview check, returning 404 when needed.
  if (/^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|\d{3}))?$/.test(candidate) && !locales.includes(candidate)) locales.push(candidate)
  return createMiddleware({ locales, defaultLocale: registry.defaultLocale, localePrefix: 'always' })(request)
}

export const config = {
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
