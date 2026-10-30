import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { isLocale } from '@/i18n/config'
import { getLanguageRegistry } from '@/i18n/service'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { yueliLocalePath } from '@/i18n/yueliPaths'
import type { Header } from '@/payload-types'
import { YueliHeader } from '@/components/Yueli/Header'
import { YueliFooter } from '@/components/Yueli/Footer'
import { ContactWidget } from '@/components/Yueli/ContactWidget'
import source from '@/data/yueli.json'
import { getYueli, imageURL } from '@/components/Yueli/data'
import { getSearchSettings, siteOrigin, jsonLd } from '@/utilities/searchSettings'
import { GoogleAnalytics } from '@/integrations/google/GoogleAnalytics'
import { googleMeasurementId, googleSiteVerification } from '@/integrations/google/config'
import { Matomo } from '@/integrations/matomo/Matomo'
import { matomoConfig } from '@/integrations/matomo/config'
import '@/components/Yueli/site.css'
import '@/components/Yueli/source-fonts.css'
import '@/components/Yueli/source-pages.css'
import '@/components/Yueli/source-faq-overrides.css'
import '@/components/Yueli/source-contact.css'
import '@/components/Yueli/replica-inner.css'
import '@/components/Yueli/product-content.css'

export function generateMetadata() {
  const verification = googleSiteVerification()
  return {
    ...(verification ? { verification: { google: verification } } : {}),
    icons: {
      icon: [
        { url: '/favicon.ico?v=yueli-2', sizes: '64x64' },
        { url: '/favicon.svg?v=yueli-2', type: 'image/svg+xml' },
      ],
      apple: '/favicon.png?v=yueli-2',
    },
  }
}

export async function generateStaticParams() {
  return (await getLanguageRegistry()).languages.map(({ code }) => ({ locale: code }))
}
export default async function WebsiteLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const registry = await getLanguageRegistry(true)
  const language = registry.languages.find((item) => item.code === locale)
  if (!language) notFound()
  setRequestLocale(locale)
  const [{ site, payload }, settings, messages] = await Promise.all([
    getYueli(),
    getSearchSettings(locale),
    getMessages(),
  ])
  const dynamicContent = process.env.ENABLE_DYNAMIC_CONTENT === 'true'
  const [header, footer] = dynamicContent
    ? await Promise.all([
        payload.findGlobal({ slug: 'header', locale, depth: 1 }),
        payload.findGlobal({ slug: 'footer', locale, depth: 1 }),
      ])
    : [null, null]
  const navigation = (items: Header['navItems']) =>
    (items || []).flatMap(({ link }) => {
      const reference = link.reference?.value
      const document = reference && typeof reference === 'object' ? reference : null
      const href =
        link.type === 'custom'
          ? link.url
          : document
            ? document.migration?.sourcePath ||
              `${link.reference?.relationTo === 'posts' ? '/blog' : ''}/${document.slug}`
            : undefined
      return href
        ? [
            {
              label: link.label,
              href: yueliLocalePath(
                href,
                locale,
                registry.languages.map((item) => item.code),
              ),
            },
          ]
        : []
    })
  const origin = siteOrigin(settings.siteUrl)
  const measurementId = googleMeasurementId()
  const matomo = matomoConfig()
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: site.name,
    url: origin,
    logo: imageURL(site.logo) ? new URL(imageURL(site.logo), origin).href : undefined,
    email: site.email,
    telephone: site.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address,
      addressLocality: 'Quanzhou',
      addressRegion: 'Fujian',
      addressCountry: 'CN',
    },
  }
  return (
    <html
      lang={language.htmlLang || locale}
      dir={language.direction || 'ltr'}
      data-scroll-behavior="smooth"
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider languages={registry.languages.filter((item) => item.enabled)}>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: jsonLd({
                  '@context': 'https://schema.org',
                  '@graph': [
                    organization,
                    {
                      '@type': 'WebSite',
                      '@id': `${origin}/#website`,
                      url: origin,
                      name: site.name,
                      publisher: { '@id': `${origin}/#organization` },
                      inLanguage: language.htmlLang || locale,
                    },
                  ],
                }),
              }}
            />
            <YueliHeader
              site={site}
              locale={locale}
              navigation={header ? navigation(header.navItems) : undefined}
            />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <YueliFooter
              site={site}
              locale={locale}
              navigation={footer ? navigation(footer.navItems) : undefined}
            />
            <ContactWidget
              email={site.email}
              telephone={site.telephone}
              whatsapp={source.brand.qrCodes.whatsapp}
              wechat="13600768411"
              qrImage={source.brand.qrCodes.image}
            />
          </LanguageProvider>
        </NextIntlClientProvider>
        {measurementId ? <GoogleAnalytics measurementId={measurementId} origin={origin} /> : null}
        {matomo ? <Matomo {...matomo} origin={origin} /> : null}
      </body>
    </html>
  )
}
