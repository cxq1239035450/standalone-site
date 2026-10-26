import { pageMetadata } from '@/utilities/searchSettings'
import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: Args) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({ locale, namespace: 'posts' })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    fallbackLocale: false,
    limit: 12,
    locale,
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

  const rangeEnd = Math.min(posts.totalDocs, 12)

  return (
    <main className="pet-site pb-24">
      <PageClient />
      <section className="pet-container pet-catalog-heading">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className="pt-12 sm:pt-16">
        <div className="container mb-7 flex items-center justify-between">
          <PageRange
            className="text-sm text-slate-500"
            collection="posts"
            currentPage={posts.page}
            emptyLabel={t('empty')}
            limit={12}
            rangeLabel={t('range', {
              end: rangeEnd,
              start: posts.totalDocs > 0 ? 1 : 0,
              total: posts.totalDocs,
            })}
            totalDocs={posts.totalDocs}
          />
        </div>

        <CollectionArchive posts={posts.docs} />

        <div className="container">
          {posts.totalPages > 1 && posts.page && (
            <Pagination page={posts.page} totalPages={posts.totalPages} />
          )}
        </div>
      </section>
    </main>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'posts' })

  return pageMetadata({
    locale,
    path: '/posts',
    title: t('metaTitle'),
    description: t('metaDescription'),
  })
}
