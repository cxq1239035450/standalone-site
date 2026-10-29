import type { EquipmentSite } from '@/payload-types'
import { originalNavigation } from './Header'

import { MapPin, Phone, Mail } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function YueliFooter({
  site,
  navigation,
  locale = 'en',
}: {
  site: EquipmentSite
  navigation?: { label: string; href: string }[]
  locale?: string
}) {
  const t = await getTranslations({ locale, namespace: 'yueli' })
  return (
    <footer className="yl-footer yl-original-footer">
      <div className="yl-wrap yl-footer-grid">
        <div>
          <h2>{t('quickLinks')}</h2>
          <nav aria-label={t('footerNavigation')}>
            {(navigation || originalNavigation).map((item) => (
              <a href={item.href} key={item.href}>
                {navigation
                  ? item.label
                  : item.href === '/contact-us/'
                    ? 'Contact Us'
                    : item.href === '/faq/'
                      ? 'Faq'
                      : item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="yl-footer-contact">
          <h2>{t('contactUs')}</h2>
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
          <h2>{t('startProject')}</h2>
          <p>{t('footerDescription')}</p>
        </div>
      </div>
      <div className="yl-wrap yl-footer-bottom">
        <span>{t('strapline')}</span>
        <span>{t('copyright', { year: new Date().getFullYear() })}</span>
      </div>
    </footer>
  )
}
