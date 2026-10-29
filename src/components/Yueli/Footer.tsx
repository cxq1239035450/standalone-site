import type { EquipmentSite } from '@/payload-types'
import { originalNavigation } from './Header'

import { MapPin, Phone, Mail } from 'lucide-react'

export function YueliFooter({ site }: { site: EquipmentSite }) {
  return (
    <footer className="yl-footer yl-original-footer">
      <div className="yl-wrap yl-footer-grid">
        <div>
          <h2>Quick Links</h2>
          <nav aria-label="Footer navigation">
            {originalNavigation.map((item) => (
              <a href={item.href} key={item.href}>
                {item.href === '/contact-us/'
                  ? 'Contact Us'
                  : item.href === '/faq/'
                    ? 'Faq'
                    : item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="yl-footer-contact">
          <h2>Contact Us</h2>
          <p className="yl-contact-line">
            <MapPin className="yl-footer-icon" size={24} strokeWidth={2.25} aria-hidden="true" />
            {site.address}
          </p>
          <a className="yl-contact-line" href={`tel:${site.telephone.replace(/\s/g, '')}`}>
            <Phone className="yl-footer-icon" size={24} strokeWidth={2.25} aria-hidden="true" />
            {site.telephone}
          </a>
          <a className="yl-contact-line" href={`mailto:${site.email}`}>
            <Mail className="yl-footer-icon" size={24} strokeWidth={2.25} aria-hidden="true" />
            {site.email}
          </a>
        </div>
        <div>
          <h2>Start Your Project</h2>
          <p>
            Looking for a standard machine or a custom automation solution? Send us your workpiece
            details and production requirements. Our team will respond within 24 hours.
          </p>
        </div>
      </div>
      <div className="yl-wrap yl-footer-bottom">
        <span>Automation Equipment &amp; Custom Production Line Solutions</span>
        <span>
          © {new Date().getFullYear()} Quanzhou Yueli Automation Co., Ltd. All Rights Reserved.
        </span>
      </div>
    </footer>
  )
}
