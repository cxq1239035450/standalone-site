'use client'

import { usePathname } from 'next/navigation'

type Item = { label: string; href: string }

/** Document navigation also works after browser translators replace React's text nodes. */
export function SiteNavigation({ items, mobile = false }: { items: Item[]; mobile?: boolean }) {
  const pathname =
    (usePathname().replace(/^\/(en|zh)(?=\/|$)/, '') || '/').replace(/\/$/, '') || '/'
  const links = items.map((item) => {
    const href = item.href.replace(/\/$/, '') || '/'
    const current =
      pathname === href ||
      (href === '/products' && /^\/product(?:s|\-category)?\//.test(pathname)) ||
      (href === '/blog' && /^\/\d{4}\//.test(pathname))
    return (
      <div className="yl-nav-item" key={href}>
        <a
          href={item.href}
          aria-current={pathname === href ? 'page' : undefined}
          className={current ? 'is-current' : undefined}
        >
          {item.label}
        </a>
      </div>
    )
  })
  if (mobile)
    return (
      <details className="yl-mobile-menu">
        <summary aria-label="Open navigation menu">
          <span aria-hidden="true">☰</span>
          <span className="yl-sr-only">Menu</span>
        </summary>
        <nav
          aria-label="Mobile navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a'))
              event.currentTarget.closest('details')?.removeAttribute('open')
          }}
        >
          {links}
        </nav>
      </details>
    )
  return (
    <nav className="yl-wrap" aria-label="Primary navigation">
      {links}
    </nav>
  )
}
