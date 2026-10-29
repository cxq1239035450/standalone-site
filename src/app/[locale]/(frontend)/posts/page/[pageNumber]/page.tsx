import { pageMetadata } from '@/utilities/searchSettings'
import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from '@/i18n/content'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { isLocale } from '@/i18n/config'

export const revalidate = 600

type Args = {
  params: Promise<{
    locale: string
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { locale, pageNumber } = await paramsPromise
  if (!isLocale(locale)) notFound()
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({ locale, namespace: 'posts' })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    fallbackLocale: false,
    limit: 12,
    locale,
    page: sanitizedPageNumber,
    overrideAccess: false,
    where: {
      'categories.slug': { equals: 'pet-guides' },
      title: {
        exists: true,
      },
    },
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      publishedAt: true,
    },
  })

  const rangeStart = posts.totalDocs > 0 ? (sanitizedPageNumber - 1) * 12 + 1 : 0
  const rangeEnd = Math.min(posts.totalDocs, sanitizedPageNumber * 12)

  return (
    <main className="pet-site pb-24">
      <PageClient />
      <section className="pet-container pet-catalog-heading">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className="pt-12 sm:pt-16">
        <div className="container mb-7">
          <PageRange
            className="text-sm text-slate-500"
            collection="posts"
            currentPage={posts.page}
            emptyLabel={t('empty')}
            limit={12}
            rangeLabel={t('range', { end: rangeEnd, start: rangeStart, total: posts.totalDocs })}
            totalDocs={posts.totalDocs}
          />
        </div>

        <CollectionArchive posts={posts.docs} />

        <div className="container">
          {posts?.page && posts?.totalPages > 1 && (
            <Pagination page={posts.page} totalPages={posts.totalPages} />
          )}
        </div>
      </section>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, pageNumber } = await paramsPromise
  if (!isLocale(locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'posts' })
  return pageMetadata({
    locale,
    path: `/posts/page/${pageNumber}`,
    title: t('pageMetaTitle', { page: pageNumber || '' }),
    description: t('metaDescription'),
  })
}
