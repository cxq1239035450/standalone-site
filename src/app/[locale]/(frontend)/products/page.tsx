import { getTranslations as loadInterfaceCopy } from 'next-intl/server'
import { pageMetadata } from '@/utilities/searchSettings'
import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from '@/i18n/content'
import React from 'react'
import PageClient from './page.client'
import { getTranslations } from 'next-intl/server'
import { isLocale } from '@/i18n/config'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from '@/components/Pagination'
import type { Where } from 'payload'
import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { productPageNumber } from '@/utilities/productPresentation'

export const dynamic = 'force-dynamic'
export const revalidate = 600

type Args = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    category?: string
    featured?: string
    page?: string
    q?: string
    sort?: string
  }>
}

export default async function Page({ params, searchParams }: Args) {
  const interfaceCopy = await loadInterfaceCopy('interface')

  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const resolvedSearchParams = await searchParams
  const page = productPageNumber(resolvedSearchParams.page)
  if (
    page === null ||
    (resolvedSearchParams.category !== undefined &&
      typeof resolvedSearchParams.category !== 'string')
  )
    notFound()

  const query =
    typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q.trim().slice(0, 150) : ''
  const sort = resolvedSearchParams.sort === 'title' ? 'title' : '-publishedAt'
  const payload = await getPayload({ config: configPromise })
  const t = await getTranslations({ locale, namespace: 'products' })
  const home = await getTranslations({ locale, namespace: 'home' })

  const whereClause: Where = {
    and: [
      {
        or: [
          { 'organization.category.slug': { in: ['bedding', 'feeding', 'toys', 'walking'] } },
          {
            and: [
              { 'organization.category.slug': { like: 'pet-' } },
              { 'organization.category.slug': { not_equals: 'pet-guides' } },
            ],
          },
        ],
      },
    ],
    _status: {
      equals: 'published',
    },
    title: {
      exists: true,
    },
  }

  if (resolvedSearchParams.category) {
    whereClause[
      /^\d+$/.test(resolvedSearchParams.category)
        ? 'organization.category'
        : 'organization.category.slug'
    ] = {
      equals: resolvedSearchParams.category,
    }
  }

  if (query)
    whereClause.and!.push({
      or: [
        { title: { like: query } },
        { 'general.shortDescription': { like: query } },
        { 'sourcing.materials': { like: query } },
        { 'pricing.sku': { like: query } },
      ],
    })

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
    sort,
    where: whereClause,
    select: {
      sourcing: true,
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

  if (page > Math.max(1, products.totalPages)) notFound()

  const allCategories = await payload.find({
    collection: 'categories',
    depth: 0,
    draft: false,
    fallbackLocale: false,
    limit: 100,
    locale,
    pagination: false,
    where: {
      or: [
        { slug: { in: ['bedding', 'feeding', 'toys', 'walking'] } },
        { and: [{ slug: { like: 'pet-' } }, { slug: { not_equals: 'pet-guides' } }] },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  })

  const categoryKeys = ['bedding', 'feeding', 'toys', 'walking'] as const
  const categories = [
    ...categoryKeys.map((key) => ({ id: key, title: home(`categories.${key}.name`) })),
    ...allCategories.docs
      .filter((cat) => cat.slug?.startsWith('pet-') && cat.slug !== 'pet-guides')
      .map((cat) => ({
        id: cat.slug || String(cat.id),
        title: typeof cat.title === 'string' ? cat.title : cat.title?.[locale] || '',
      })),
  ]
  const activeCategory =
    allCategories.docs.find((cat) => String(cat.id) === resolvedSearchParams.category)?.slug ||
    resolvedSearchParams.category ||
    ''

  return (
    <main className="pet-site pb-24">
      <section className="pet-container pet-catalog-heading">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>
      <div className="pet-container pet-category-grid pet-catalog-categories">
        {(['bedding', 'feeding', 'toys', 'walking'] as const).map((key) => (
          <Link
            className="pet-category"
            key={key}
            href={`/products?category=${key}`}
            aria-current={activeCategory === key ? 'page' : undefined}
          >
            <div className="pet-category-image">
              <Image
                src={`/pet-assets/${key}.webp`}
                fill
                loading="eager"
                sizes="(max-width:640px) 50vw, 25vw"
                alt={home(`categories.${key}.name`)}
              />
            </div>
            <div className="pet-category-title">
              <h2>{home(`categories.${key}.name`)}</h2>
              <ArrowUpRight size={19} />
            </div>
            <p>{t(`categorySpecs.${key}`)}</p>
          </Link>
        ))}
      </div>

      <section className="pt-10 sm:pt-14">
        <PageClient
          categories={categories}
          totalDocs={products.totalDocs}
          activeCategory={activeCategory}
        />

        {products.docs.length > 0 ? (
          <>
            <div className="pet-container">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.docs.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            </div>

            {products.totalPages > 1 && page && (
              <div className="pet-container mt-12">
                <Pagination mode="query" page={page} totalPages={products.totalPages} />
              </div>
            )}
          </>
        ) : (
          <div className="pet-container">
            <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center text-slate-500">
              {query
                ? interfaceCopy('app__locale___frontend__products_page_tsx_1', {v0: query})
                : t('empty')}
              {query && (
                <div className="mt-4">
                  <Link
                    className="underline underline-offset-4"
                    href={
                      activeCategory
                        ? `/products?category=${encodeURIComponent(activeCategory)}`
                        : '/products'
                    }
                  >
                    {interfaceCopy('app__locale___frontend__products_page_tsx_2')}
                  </Link>
                </div>
              )}
              <div className="mt-6">
                <Link
                  className="pet-button"
                  href={
                    activeCategory
                      ? `/contact?category=${encodeURIComponent(activeCategory)}`
                      : '/contact'
                  }
                >
                  {t('inquire')} <ArrowUpRight size={18} />
                </Link>
              </div>
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

  return pageMetadata({
    locale,
    path: '/products',
    title: t('metaTitle'),
    description: t('metaDescription'),
  })
}
