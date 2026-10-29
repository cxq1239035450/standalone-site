import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { isLocale, localeCodes } from '@/i18n/config'
import { YueliHeader } from '@/components/Yueli/Header'
import { YueliFooter } from '@/components/Yueli/Footer'
import { ContactWidget } from '@/components/Yueli/ContactWidget'
import source from '@/data/yueli.json'
import { getYueli, imageURL } from '@/components/Yueli/data'
import { getSearchSettings, siteOrigin, jsonLd } from '@/utilities/searchSettings'
import '@/components/Yueli/site.css'
import '@/components/Yueli/source-fonts.css'
import '@/components/Yueli/source-pages.css'
import '@/components/Yueli/source-faq-overrides.css'
import '@/components/Yueli/source-contact.css'
import '@/components/Yueli/replica-inner.css'
import '@/components/Yueli/product-content.css'

export const metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico?v=yueli-2', sizes: '64x64' },
      { url: '/favicon.svg?v=yueli-2', type: 'image/svg+xml' },
    ],
    apple: '/favicon.png?v=yueli-2',
  },
}

export function generateStaticParams() {
  return localeCodes.map((locale) => ({ locale }))
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
  setRequestLocale(locale)
  const [{ site }, settings, messages] = await Promise.all([
    getYueli(),
    getSearchSettings('en'),
    getMessages(),
  ])
  const origin = siteOrigin(settings.siteUrl)
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
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider messages={messages}>
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
                    inLanguage: 'en',
                  },
                ],
              }),
            }}
          />
          <YueliHeader site={site} />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <YueliFooter site={site} />
          <ContactWidget
            email={site.email}
            telephone={site.telephone}
            whatsapp={source.brand.qrCodes.whatsapp}
            wechat="13600768411"
            qrImage={source.brand.qrCodes.image}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
