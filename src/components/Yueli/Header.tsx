import Image from 'next/image'
import type { EquipmentSite } from '@/payload-types'
import { imageURL } from './data'
import { SiteNavigation } from './Navigation'

export const originalNavigation = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products/' },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Contact', href: '/contact-us/' },
]

export function YueliHeader({ site }: { site: EquipmentSite }) {
  const items =
    site.navigation?.length &&
    !site.navigation.some((item) => /^\/(solutions|resources|manufacturing)/.test(item.href))
      ? site.navigation
      : originalNavigation
  return (
    <>
      <a href="#main-content" className="yl-skip">
        Skip to content
      </a>
      <header className="yl-header">
        <div className="yl-wrap yl-header-top">
          <a href="/" aria-label="Yueli Automation home" className="yl-brand">
            {imageURL(site.logo) ? (
              <Image src={imageURL(site.logo)} alt={site.name} width={206} height={58} priority />
            ) : (
              <strong>{site.name}</strong>
            )}
          </a>
          <div className="yl-header-assurance">
            <span>
              <b>ISO</b> Quality-focused production
            </span>
            <span>
              <b>QC</b> Engineering support
            </span>
          </div>
          <a href="/contact-us/" className="yl-button yl-header-quote">
            <span aria-hidden="true">✉</span> Get Quote
          </a>
        </div>
        <div className="yl-mobile-navigation">
          <SiteNavigation items={items} mobile />
        </div>
        <div className="yl-navigation">
          <SiteNavigation items={items} />
        </div>
      </header>
    </>
  )
}
