import { getSearchSettings, siteOrigin, jsonLd } from '@/utilities/searchSettings'
import { getLocale, getTranslations } from 'next-intl/server'
import { yueliLocalePath } from '@/i18n/yueliPaths'

export async function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const locale = await getLocale()
  const t = await getTranslations('yueli')
  const origin = siteOrigin((await getSearchSettings(locale)).siteUrl)
  const trail = [{ name: t('home'), href: '/' }, ...items].map(item => ({ ...item, href: yueliLocalePath(item.href, locale, [locale]) }))
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.href, origin).href,
    })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />
      <nav className="yl-breadcrumb" aria-label="Breadcrumb">
        {trail.map((item, index) => (
          <span key={item.href}>
            {index > 0 && <span aria-hidden="true"> / </span>}
            {index === trail.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <a href={item.href}>{item.name}</a>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
