import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/i18n/config'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { ProductCard } from '@/components/ProductCard'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { BadgeCheck, Package } from 'lucide-react'

type Args = {
  params: Promise<{
    locale: string
    slug?: string
  }>
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const { locale } = params
  if (!isLocale(locale)) return []
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    draft: false,
    fallbackLocale: false,
    limit: 1000,
    locale,
    overrideAccess: false,
    pagination: false,
    where: {
      title: {
        exists: true,
      },
    },
    select: {
      slug: true,
    },
  })

  const generatedParams = products.docs.map(({ slug }) => {
    const slugValue = typeof slug === 'string' ? slug : slug?.[locale] || ''
    return { slug: slugValue }
  })

  return generatedParams
}

export default async function ProductDetail({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = '' } = await paramsPromise
  if (!isLocale(locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'products' })

  const decodedSlug = decodeURIComponent(slug)
  const product = await queryProductBySlug({ locale, slug: decodedSlug })

  if (!product) return notFound()

  const titleValue =
    typeof product.title === 'string' ? product.title : product.title?.[locale] || t('untitled')

  const { general, organization, pricing } = product
  const { description, gallery, heroImage, shortDescription } = general || {}
  const { category, featured } = organization || {}
  const { price, sku, stock, unit } = pricing || {}

  const shortDescValue = typeof shortDescription === 'string' ? shortDescription : ''

  const unitLabels: Record<string, string> =
    locale === 'zh'
      ? { kg: 'kg', jin: '斤', box: '箱', piece: '个', bag: '袋', ton: '吨' }
      : { kg: 'kg', jin: 'jin', box: 'box', piece: 'piece', bag: 'bag', ton: 'ton' }
  const unitLabel = unit ? unitLabels[unit] || unit : 'kg'

  const relatedProducts =
    category && typeof category === 'object'
      ? await getRelatedProducts({
          locale,
          categoryId: String(category.id),
          excludeSlug: decodedSlug,
        })
      : []

  return (
    <article className="bg-stone-50 py-12 sm:py-16">
      <div className="container">
        <nav className="mb-8 text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-emerald-700">
                {t('breadcrumb.home')}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-emerald-700">
                {t('breadcrumb.products')}
              </Link>
            </li>
            <li>/</li>
            <li className="truncate text-slate-900">{titleValue}</li>
          </ol>
        </nav>

        <div className="grid gap-10 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2 lg:gap-14">
          <div>
            {heroImage && typeof heroImage !== 'string' ? (
              <div className="overflow-hidden rounded-3xl bg-stone-100">
                <Media resource={heroImage} size="60vw" className="w-full" />
              </div>
            ) : (
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_75%_25%,rgba(52,211,153,0.22),transparent_35%),linear-gradient(135deg,#ecfdf5,#d1fae5)] text-emerald-700">
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-700/10 bg-white/60 shadow-sm">
                  <Package className="h-10 w-10" />
                </span>
              </div>
            )}

            {gallery && Array.isArray(gallery) && gallery.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((item, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg bg-stone-100"
                  >
                    {item.image && typeof item.image !== 'string' && (
                      <Media resource={item.image} size="15vw" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="py-2 lg:py-8">
            {category && typeof category === 'object' && (
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-emerald-600">
                {typeof category.title === 'string' ? category.title : ''}
              </p>
            )}

            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {titleValue}
            </h1>

            {shortDescValue && (
              <p className="mt-5 text-lg leading-8 text-slate-600">{shortDescValue}</p>
            )}

            {price !== undefined && price !== null && (
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-700">
                  ¥{typeof price === 'number' ? price.toFixed(2) : price}
                </span>
                <span className="text-lg text-stone-400">/{unitLabel}</span>
              </div>
            )}

            <div className="mt-10 space-y-5 border-t border-stone-200 pt-8">
              {sku && (
                <div className="flex justify-between">
                  <span className="text-stone-500">SKU</span>
                  <span className="font-medium">{sku}</span>
                </div>
              )}
              {stock !== undefined && stock !== null && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('stock')}</span>
                  <span className="font-medium">
                    {stock < 0 ? t('unlimited') : `${stock} ${unitLabel}`}
                  </span>
                </div>
              )}
              {featured && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('featuredLabel')}</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
                    <BadgeCheck className="h-4 w-4" />
                    {t('yes')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {description && (
          <section className="mt-16 rounded-[2rem] border border-stone-200 bg-white px-6 py-10 sm:px-10">
            <h2 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900">
              {t('details')}
            </h2>
            <div className="max-w-3xl text-slate-600">
              <RichText className="prose-stone" data={description} enableGutter={false} />
            </div>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-8 text-3xl font-semibold tracking-tight text-slate-900">
              {t('related')}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = '' } = await paramsPromise
  if (!isLocale(locale)) notFound()

  const decodedSlug = decodeURIComponent(slug)
  const product = await queryProductBySlug({ locale, slug: decodedSlug })

  if (!product) {
    return { title: 'Product Not Found' }
  }

  const title =
    typeof product.title === 'string' ? product.title : product.title?.[locale] || 'Product'

  const description = product.general?.shortDescription || ''
  const heroImage = product.general?.heroImage

  return {
    title: `${title} | FreshConnect`,
    description,
    openGraph: {
      title,
      description,
      images:
        heroImage && typeof heroImage !== 'string'
          ? [{ url: (heroImage as { url?: string }).url || '' }]
          : undefined,
    },
  }
}

const queryProductBySlug = cache(async ({ locale, slug }: { locale: Locale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    draft,
    fallbackLocale: false,
    limit: 1,
    locale,
    overrideAccess: draft,
    pagination: false,
    where: {
      title: {
        exists: true,
      },
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

const getRelatedProducts = cache(
  async ({
    locale,
    categoryId,
    excludeSlug,
  }: {
    locale: Locale
    categoryId: string
    excludeSlug: string
  }) => {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'products',
      depth: 1,
      draft: false,
      fallbackLocale: false,
      limit: 4,
      locale,
      overrideAccess: false,
      pagination: false,
      where: {
        'organization.category': {
          equals: categoryId,
        },
        slug: {
          not_equals: excludeSlug,
        },
        _status: {
          equals: 'published',
        },
        title: {
          exists: true,
        },
      },
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

    return result.docs
  },
)
