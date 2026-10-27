import { NextResponse, type NextRequest } from 'next/server'

// Keep original English URLs; explicit locale routes support existing CMS previews.
export default function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const search = url.searchParams.get('s')
  if (search && url.pathname === '/') {
    url.pathname = '/search'
    url.search = ''
    url.searchParams.set('q', search)
    return NextResponse.redirect(url)
  }
  const locale = /^\/(en|zh)(?:\/|$)/.exec(url.pathname)?.[1]
  const headers = new Headers(request.headers)
  headers.set('X-NEXT-INTL-LOCALE', locale || 'en')
  if (locale) return NextResponse.next({ request: { headers } })
  url.pathname = `/en${url.pathname === '/' ? '' : url.pathname}`
  return NextResponse.rewrite(url, { request: { headers } })
}

export const config = { matcher: ['/((?!api|admin|next|_next|.*\\..*).*)'] }
