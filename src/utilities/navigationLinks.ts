import type { Header } from '@/payload-types'

export type NavigationLink = { href: string; title: string; newTab?: boolean }

export function navigationLinks(items: Header['navItems']): NavigationLink[] {
  return (items ?? []).flatMap(({ link }) => {
    const title = link.label?.trim()
    const reference = link.reference
    const doc = reference?.value
    const href = link.type === 'reference'
      ? typeof doc === 'object' && doc?.slug && doc.title?.trim() && doc._status === 'published'
        ? doc.slug === 'home' && reference?.relationTo === 'pages'
          ? '/'
          : `${reference?.relationTo === 'posts' ? '/posts' : ''}/${encodeURIComponent(doc.slug)}`
        : null
      : link.url?.trim()
    // Ignore unresolved documents, placeholder anchors and unsafe URL schemes.
    if (!title || !href || href === '#' || /[\\\u0000-\u001f]/.test(href) || !/^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(href)) return []
    return [{ href, title, newTab: Boolean(link.newTab) }]
  })
}
