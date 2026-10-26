import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getSearchSettings, siteOrigin, jsonLd } from '@/utilities/searchSettings'
import { draftMode } from 'next/headers'

import './globals.css'

import { getHtmlLang, isLocale, localeCodes } from '@/i18n/config'
import { SiteInsights } from '@/integrations/insights/Client'
import { companyProfile } from '@/content/company'

export function generateStaticParams() {
  return localeCodes.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  setRequestLocale(locale)

  const { isEnabled } = await draftMode()
  const messages = await getMessages()
  const search = await getSearchSettings(locale)
  const origin = siteOrigin(search.siteUrl)
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: search.siteName || 'PawSupply',
    url: origin,
    description: companyProfile[locale].summary,
    address: { '@type': 'PostalAddress', addressCountry: 'CN' },
    ...(search.organization?.legalName ? { legalName: search.organization.legalName } : {}),
    ...(search.organization?.email ? { email: search.organization.email } : {}),
    ...(search.organization?.telephone ? { telephone: search.organization.telephone } : {}),
    sameAs: search.organization?.sameAs?.map((item) => item.url) || [],
  }

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={getHtmlLang(locale)}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organization) }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AdminBar
              adminBarProps={{
                preview: isEnabled,
              }}
            />

            <Header />
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
            <Footer />
            <SiteInsights preview={isEnabled} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
