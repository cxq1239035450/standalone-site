import Image from 'next/image'
import type { EquipmentSite } from '@/payload-types'
import { imageURL } from './data'
import { SiteNavigation } from './Navigation'
import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { yueliLocalePath } from '@/i18n/yueliPaths'

export const originalNavigation = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products/' },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Contact', href: '/contact-us/' },
]

export async function YueliHeader({
  site,
  navigation,
  locale = 'en',
}: {
  site: EquipmentSite
  navigation?: { label: string; href: string }[]
  locale?: string
}) {
  const t = await getTranslations({ locale, namespace: 'yueli' })
  const items =
    navigation ||
    (site.navigation?.length &&
    !site.navigation.some((item) => /^\/(solutions|resources|manufacturing)/.test(item.href))
      ? site.navigation
      : originalNavigation)
  return (
    <>
      <a href="#main-content" className="yl-skip">
        {t('skipToContent')}
      </a>
      <header className="yl-header">
        <div className="yl-wrap yl-header-top">
          <a href={yueliLocalePath('/', locale)} aria-label={t('homeAria')} className="yl-brand">
            {imageURL(site.logo) ? (
              <Image src={imageURL(site.logo)} alt={site.name} width={206} height={58} priority />
            ) : (
              <strong>{site.name}</strong>
            )}
          </a>
          <div className="yl-header-assurance">
            <span>
              <b>ISO</b> {t('qualityFocused')}
            </span>
            <span>
              <b>QC</b> {t('engineeringSupport')}
            </span>
          </div>
          {process.env.ENABLE_DYNAMIC_CONTENT === 'true' && (
            <LanguageSwitcher unprefixedLocale="en" />
          )}
          <a href={yueliLocalePath('/contact-us/', locale)} className="yl-button yl-header-quote">
            <span aria-hidden="true">✉</span> {t('getQuote')}
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
