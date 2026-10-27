import Image from 'next/image'
import Link from 'next/link'
import type { EquipmentSite } from '@/payload-types'
import { imageURL, navigation } from './data'

export function YueliFooter({ site }: { site: EquipmentSite }) {
  return (
    <footer className="yl-footer">
      <div className="yl-wrap yl-footer-grid">
        <div className="yl-footer-brand">
          {imageURL(site.logo) && (
            <Image src={imageURL(site.logo)} alt={site.name} width={190} height={54} />
          )}
          <p>Industrial equipment built around your workpiece, process and production target.</p>
          <Link className="yl-text-link" href="/about-us/">
            About Yueli <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div>
          <h2>Quick Links</h2>
          <nav aria-label="Footer navigation">
            {navigation(site)
              .filter((item) => item.href !== '/')
              .map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>
        <div className="yl-footer-contact">
          <h2>Contact Us</h2>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={`tel:${site.telephone.replace(/\s/g, '')}`}>{site.telephone}</a>
          <p>{site.address}</p>
        </div>
        <div>
          <h2>Start Your Project</h2>
          <p>Share your workpiece, material, key dimensions, required process and target output.</p>
          <Link href="/contact-us/" className="yl-button">
            Get Quote <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="yl-wrap yl-footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span>Quanzhou, Fujian, China</span>
      </div>
    </footer>
  )
}
