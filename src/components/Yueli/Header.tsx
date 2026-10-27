import Image from 'next/image'
import Link from 'next/link'
import type { EquipmentSite } from '@/payload-types'
import { imageURL, navigation } from './data'

export function YueliHeader({ site }: { site: EquipmentSite }) {
  const items = navigation(site)
  const links = items.map((item) => (
    <Link key={item.href} href={item.href}>
      {item.label}
    </Link>
  ))
  return (
    <>
      <a href="#main-content" className="yl-skip">
        Skip to content
      </a>
      <header className="yl-header">
        <div className="yl-wrap yl-header-top">
          <Link href="/" aria-label="Yueli Automation home" className="yl-brand">
            {imageURL(site.logo) ? (
              <Image src={imageURL(site.logo)} alt={site.name} width={206} height={58} priority />
            ) : (
              <strong>{site.name}</strong>
            )}
          </Link>
          <div className="yl-header-assurance">
            <span>Quality-focused production</span>
            <span>Engineering support</span>
          </div>
          <Link href="/contact-us/" className="yl-button yl-header-quote">
            Get Quote <span aria-hidden="true">↗</span>
          </Link>
          <details className="yl-mobile-menu">
            <summary>Menu</summary>
            <nav aria-label="Mobile navigation">
              {links}
              <Link href="/search/">Search equipment</Link>
            </nav>
          </details>
        </div>
        <div className="yl-navigation">
          <nav className="yl-wrap" aria-label="Main navigation">
            {links}
            <Link href="/search/" className="yl-search-link">
              Search <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}
