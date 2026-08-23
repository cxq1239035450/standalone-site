import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { isLocale } from '@/i18n/config'
import { Newspaper } from 'lucide-react'

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
    <main className="bg-stone-50 pb-24">
      <PageClient />
      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-emerald-950 py-20 text-white sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.22),transparent_32%),linear-gradient(135deg,transparent,rgba(255,255,255,0.04))]" />
        <div className="container relative">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-emerald-200">
            <Newspaper className="h-6 w-6" />
          </span>
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50/70">{t('description')}</p>
        </div>
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
  return {
    title: t('pageMetaTitle', { page: pageNumber || '' }),
    description: t('metaDescription'),
  }
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return []
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    locale: params.locale,
    overrideAccess: false,
    where: {
      title: {
        exists: true,
      },
    },
  })

  const totalPages = Math.ceil(totalDocs / 12)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
