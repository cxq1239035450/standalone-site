import type { Metadata } from 'next'
import { pageMetadata } from '@/utilities/searchSettings'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { type RequiredDataFromCollectionSlug } from 'payload'
import { getPayload } from '@/i18n/content'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { defaultLocale, type Locale } from '@/i18n/config'
import {
  isMarketingPageSlug,
  MarketingPageFallback,
} from '@/components/MarketingPageFallback'
import { getTranslations } from 'next-intl/server'

type Args = {
  params: Promise<{
    locale: Locale
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = `/${locale}/${decodedSlug}`
  const page: RequiredDataFromCollectionSlug<'pages'> | null = await queryPageBySlug({
    locale,
    slug: decodedSlug,
  })

  if (!page && isMarketingPageSlug(decodedSlug)) {
    return <MarketingPageFallback slug={decodedSlug} />
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      {page.discovery?.summary && <p className="container my-6 text-lg leading-8">{page.discovery.summary}</p>}
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout || []} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)

  const page = await queryPageBySlug({
    locale,
    slug: decodedSlug,
  })

  if (!page && isMarketingPageSlug(decodedSlug)) {
    const t = await getTranslations(`marketingPages.${decodedSlug}`)
    return pageMetadata({ locale, path: `/${decodedSlug}`, title: t('title'), description: t('description') })
  }

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ locale, slug }: { locale: Locale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    locale,
    fallbackLocale: defaultLocale,
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
