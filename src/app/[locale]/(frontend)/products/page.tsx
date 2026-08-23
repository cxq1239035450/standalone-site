import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { getTranslations } from 'next-intl/server'
import { isLocale } from '@/i18n/config'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from '@/components/Pagination'
import type { Where } from 'payload'
import { PackageSearch } from 'lucide-react'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; featured?: string; page?: string }>
}

export default async function Page({ params, searchParams }: Args) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const resolvedSearchParams = await searchParams
  const page = parseInt(resolvedSearchParams.page || '1', 10)

  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({ locale, namespace: 'products' })

  const whereClause: Where = {
    _status: {
      equals: 'published',
    },
    title: {
      exists: true,
    },
  }

  if (resolvedSearchParams.category) {
    whereClause['organization.category'] = {
      equals: resolvedSearchParams.category,
    }
  }

  if (resolvedSearchParams.featured === 'true') {
    whereClause['organization.featured'] = {
      equals: true,
    }
  }

  const products = await payload.find({
    collection: 'products',
    depth: 1,
    draft: false,
    fallbackLocale: false,
    limit: 12,
    locale,
    overrideAccess: false,
    page,
    sort: '-publishedAt',
    where: whereClause,
    select: {
      title: true,
      slug: true,
      general: {
        heroImage: true,
        shortDescription: true,
      },
      pricing: {
        price: true,
        unit: true,
      },
      organization: {
        category: true,
        featured: true,
      },
    },
  })

  const allCategories = await payload.find({
    collection: 'categories',
    depth: 0,
    draft: false,
    fallbackLocale: false,
    limit: 100,
    locale,
    pagination: false,
    select: {
      id: true,
      title: true,
    },
  })

  const categories = allCategories.docs.map((cat) => ({
    id: String(cat.id),
    title: typeof cat.title === 'string' ? cat.title : cat.title?.[locale] || '',
  }))

  return (
    <main className="bg-stone-50 pb-24">
      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-emerald-950 py-20 text-white sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.22),transparent_32%),linear-gradient(135deg,transparent,rgba(255,255,255,0.04))]" />
        <div className="container relative">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-emerald-200">
            <PackageSearch className="h-6 w-6" />
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

      <section className="pt-10 sm:pt-14">
        <PageClient categories={categories} totalDocs={products.totalDocs} />

        {products.docs.length > 0 ? (
          <>
            <div className="container">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.docs.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            </div>

            {products.totalPages > 1 && page && (
              <div className="container mt-12">
                <Pagination mode="query" page={page} totalPages={products.totalPages} />
              </div>
            )}
          </>
        ) : (
          <div className="container">
            <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center text-slate-500">
              {t('empty')}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'products' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}
