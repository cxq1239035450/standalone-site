import { getLocale, getTranslations } from 'next-intl/server'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getSearchSettings } from '@/utilities/searchSettings'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { navigationLinks } from '@/utilities/navigationLinks'
import { defaultLocale, isLocale } from '@/i18n/config'

export async function Footer() {
  const t = await getTranslations('footer')
  const nav = await getTranslations('navigation')
  const value = await getLocale()
  const locale = isLocale(value) ? value : defaultLocale
  const [settings, footer] = await Promise.all([getSearchSettings(locale), getCachedGlobal('footer', 1, locale)()])
  const brand = settings.siteName || 'PawSupply'
  const links = footer.useCustomNavigation ? navigationLinks(footer.navItems) : []
  return (
    <footer className="pet-footer">
      <div className="pet-container pet-footer-top">
        <div>
          <Link className="pet-logo" href="/">
            {brand}<span aria-hidden="true">.</span>
          </Link>
          <p className="pet-footer-description">{t('company.description')}</p>
        </div>
        <div>
          <h2>{t('products')}</h2>
          {(['feeding', 'walking', 'bedding', 'toys'] as const).map((key) => (
            <Link key={key} href={`/products?category=${key}`}>
              {t(`categories.${key}`)}
            </Link>
          ))}
        </div>
        <div>
          <h2>{t('support')}</h2>
          {links.length ? links.map(({ href, title, newTab }) => <Link key={href} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined}>{title}</Link>) : <>
          <Link href="/solutions">{nav('solutions')}</Link>
          <Link href="/posts">{nav('articles')}</Link>
          <Link href="/about">{nav('about')}</Link>
          <Link href="/#faq">{t('faq')}</Link>
          </>}
        </div>
        <div>
          <h2>{t('contact')}</h2>
          <p>{t('contactDescription')}</p>
          {settings.organization?.email && <a href={`mailto:${settings.organization.email}`}>{settings.organization.email}</a>}
          {settings.organization?.telephone && <a href={`tel:${settings.organization.telephone.replace(/[^+\d]/g, '')}`}>{settings.organization.telephone}</a>}
          <Link className="pet-footer-contact" href="/contact">
            {t('contactAction')} <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
      <div className="pet-container pet-footer-bottom">
        <p>{t('copyright', { year: new Date().getFullYear(), brand })}</p>
        <p>{t('businessOnly')}</p>
      </div>
    </footer>
  )
}
