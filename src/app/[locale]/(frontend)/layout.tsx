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

import { getLanguageRegistry } from '@/i18n/service'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { SiteInsights } from '@/integrations/insights/Client'

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const registry = await getLanguageRegistry(true)
  const language = registry.languages.find(item => item.code === locale)
  if (!language) notFound()

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
    description: search.geo?.summary || search.description || undefined,
    address: { '@type': 'PostalAddress', addressCountry: 'CN' },
    ...(search.organization?.legalName ? { legalName: search.organization.legalName } : {}),
    ...(search.organization?.email ? { email: search.organization.email } : {}),
    ...(search.organization?.telephone ? { telephone: search.organization.telephone } : {}),
    sameAs: search.organization?.sameAs?.map((item) => item.url) || [],
  }

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={language.htmlLang || locale}
      dir={language.direction || 'ltr'}
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
          <LanguageProvider languages={registry.languages}>
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
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
