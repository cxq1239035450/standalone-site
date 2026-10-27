import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { isLocale, localeCodes } from '@/i18n/config'
import { YueliHeader } from '@/components/Yueli/Header'
import { YueliFooter } from '@/components/Yueli/Footer'
import { getYueli, imageURL } from '@/components/Yueli/data'
import { getSearchSettings, siteOrigin, jsonLd } from '@/utilities/searchSettings'
import '@/components/Yueli/site.css'

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
    <html lang="en">
      <body>
        <NextIntlClientProvider messages={messages}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(organization) }}
          />
          <YueliHeader site={site} />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <YueliFooter site={site} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
