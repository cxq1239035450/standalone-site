import { pageMetadata, getSearchSettings, siteOrigin, jsonLd } from '@/utilities/searchSettings'
import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { notFound } from 'next/navigation'
import { isLocale, type Locale } from '@/i18n/config'
import { ProductGallery } from '@/components/ProductGallery'
import type { Media as MediaDocument } from '@/payload-types'
import styles from '@/components/ProductGallery/products.module.css'
import RichText from '@/components/RichText'
import { ProductCard } from '@/components/ProductCard'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { BadgeCheck, ArrowUpRight } from 'lucide-react'
import { productInquiryHref, productUnitLabel } from '@/utilities/productPresentation'
import { productSpecifications } from '@/utilities/productSpecifications'
import { productGeography } from '@/utilities/seoPresentation'

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
  const { locale, slug = '' } = await paramsPromise
  if (!isLocale(locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'products' })
  const home = await getTranslations({ locale, namespace: 'home' })

  const decodedSlug = decodeURIComponent(slug)
  const product = await queryProductBySlug({ locale, slug: decodedSlug })

  if (!product) return notFound()

  const titleValue =
    typeof product.title === 'string' ? product.title : product.title?.[locale] || t('untitled')

  const search = await getSearchSettings(locale)
  const template =
    product.industryTemplate && typeof product.industryTemplate === 'object'
      ? product.industryTemplate
      : undefined
  const specifications = productSpecifications(template, product.technicalValues)
  const geography = productGeography(product.meta, locale)
  const additionalProperties = [
    ...specifications.map((specification) => ({
      '@type': 'PropertyValue',
      name: specification.label,
      value: specification.value,
      unitText: specification.unit,
    })),
    ...geography.map((item) => ({ '@type': 'PropertyValue', ...item })),
  ]
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: titleValue,
    description: product.general?.shortDescription || product.discovery?.summary || undefined,
    sku: product.pricing?.sku || undefined,
    url: `${siteOrigin(search.siteUrl)}/${locale}/products/${encodeURIComponent(decodedSlug)}`,
    material: product.sourcing?.materials || undefined,
    additionalProperty: additionalProperties.length ? additionalProperties : undefined,
    image:
      product.general?.heroImage &&
      typeof product.general.heroImage === 'object' &&
      product.general.heroImage.url
        ? new URL(product.general.heroImage.url, siteOrigin(search.siteUrl)).href
        : undefined,
  }
  const { general, organization, pricing } = product
  const { description, gallery, heroImage, shortDescription } = general || {}
  const { category, featured } = organization || {}
  const { price, sku, stock, unit } = pricing || {}

  const shortDescValue = typeof shortDescription === 'string' ? shortDescription : ''

  const unitLabel = productUnitLabel(unit, locale)
  const inquiryHref = productInquiryHref(
    titleValue,
    typeof category === 'object' ? category?.slug : undefined,
    decodedSlug,
  )

  const relatedProducts =
    category && typeof category === 'object'
      ? await getRelatedProducts({
          locale,
          categoryId: String(category.id),
          excludeSlug: decodedSlug,
        })
      : []

  return (
    <article className="bg-[#f7f5f0] py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }}
      />
      <div className="pet-container">
        <nav className="mb-8 text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#173f35]">
                {t('breadcrumb.home')}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-[#173f35]">
                {t('breadcrumb.products')}
              </Link>
            </li>
            <li>/</li>
            <li className="truncate text-slate-900">{titleValue}</li>
          </ol>
        </nav>

        <div className={styles.detailGrid}>
          <ProductGallery
            title={titleValue}
            locale={locale}
            images={[heroImage, ...(gallery || []).map((item) => item.image)]
              .filter((image): image is MediaDocument =>
                Boolean(image && typeof image === 'object'),
              )
              .filter(
                (image, index, all) => all.findIndex((item) => item.id === image.id) === index,
              )}
          />
          <div className={styles.detailInfo}>
            {category && typeof category === 'object' && (
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-emerald-600">
                {category.slug && ['bedding', 'feeding', 'toys', 'walking'].includes(category.slug)
                  ? home(`categories.${category.slug}.name`)
                  : typeof category.title === 'string'
                    ? category.title
                    : ''}
              </p>
            )}

            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {titleValue}
            </h1>

            {shortDescValue && (
              <p className="mt-5 text-lg leading-8 text-slate-600">{shortDescValue}</p>
            )}

            {product.discovery?.summary && (
              <p className="mt-4 leading-7 text-slate-600">{product.discovery.summary}</p>
            )}
            {product.sourcing && (
              <dl className={styles.facts}>
                {Object.entries({
                  minimumOrderQuantity: locale === 'zh' ? 'MOQ / 最小起订量' : 'Minimum order',
                  materials: locale === 'zh' ? '材质' : 'Materials',
                  customization: locale === 'zh' ? '可定制项目' : 'Customization',
                  leadTime: locale === 'zh' ? '参考交期' : 'Lead time',
                }).map(([key, label]) => {
                  const value =
                    product.sourcing?.[key as keyof NonNullable<typeof product.sourcing>]
                  return value ? (
                    <div key={key} className="flex justify-between gap-6">
                      <dt className="text-slate-500">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ) : null
                })}
              </dl>
            )}
            {geography.length > 0 && (
              <dl className="mt-5 space-y-3 border-t border-stone-200 pt-5 text-sm">
                {geography.map((item) => (
                  <div key={item.name} className="flex flex-wrap justify-between gap-x-6 gap-y-1">
                    <dt className="text-slate-500">{item.name}</dt>
                    <dd className="break-words text-slate-800">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {price !== undefined && price !== null && (
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#173f35]">
                  ¥{typeof price === 'number' ? price.toFixed(2) : price}
                </span>
                <span className="text-lg text-stone-400">/{unitLabel}</span>
              </div>
            )}

            <div className={styles.quoteBox}>
              {price == null && (
                <p className="mb-4 !mt-0 text-base font-medium !text-[#173f35]">{t('askPrice')}</p>
              )}
              <Link href={inquiryHref} className="pet-button">
                {t('productInquiry')} <ArrowUpRight size={18} />
              </Link>
              <p>
                {locale === 'zh'
                  ? '请提供采购数量、收货地区与定制要求。报价、样品及交期以双方确认的方案为准。'
                  : 'Share your quantity, delivery location and customization needs. Pricing, samples and lead times are confirmed for your project.'}
              </p>
            </div>

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

        <nav
          className={styles.sectionNav}
          aria-label={locale === 'zh' ? '产品详情导航' : 'Product information'}
        >
          {specifications.length > 0 && <a href="#product-specifications">{t('specifications')}</a>}
          {description && <a href="#product-description">{t('details')}</a>}
          <a href="#procurement-notes">
            {locale === 'zh' ? '采购准备' : 'Before requesting a quote'}
          </a>
        </nav>
        {specifications.length > 0 && (
          <section
            aria-labelledby="product-specifications"
            className="mt-12 rounded-3xl border border-stone-200 bg-white px-6 py-8 sm:px-10"
          >
            <h2 id="product-specifications" className="mb-6 text-2xl font-semibold text-[#173f35]">
              {template?.sectionTitle || t('specifications')}
            </h2>
            <dl className="grid gap-x-10 sm:grid-cols-2">
              {specifications.map(({ key, label, value, unit }) => (
                <div
                  key={key}
                  className="flex min-w-0 flex-col gap-2 border-t border-stone-100 py-4"
                >
                  <dt className="text-sm text-stone-500">{label}</dt>
                  <dd className="whitespace-pre-wrap break-words font-medium text-[#173f35]">
                    {value}
                    {unit ? ` ${unit}` : ''}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {description && (
          <section
            id="product-description"
            className="mt-12 rounded-xl border border-stone-200 bg-white px-6 py-10 sm:px-10"
          >
            <h2 className="mb-6 text-3xl font-semibold tracking-tight text-slate-900">
              {t('details')}
            </h2>
            <div className="max-w-3xl text-slate-600">
              <RichText className="prose-stone" data={description} enableGutter={false} />
            </div>
          </section>
        )}

        <section id="procurement-notes" className={styles.procurement}>
          <h2>
            {locale === 'zh'
              ? '把采购需求，说得更具体。'
              : 'A clearer brief. A better conversation.'}
          </h2>
          <div>
            <p>
              {locale === 'zh'
                ? '准备好计划数量、尺寸或容量、材料偏好、销售市场和包装要求。如果需要品牌标识或样品，请一并说明。'
                : 'Include estimated quantities, sizes or capacities, preferred materials, target market and packaging requirements. Let us know if you need branding or samples.'}
            </p>
            <Link href={inquiryHref} className="pet-text-link mt-5">
              {t('productInquiry')} <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
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

  const image = product.meta?.image || product.general?.heroImage
  return pageMetadata({
    locale,
    path: `/products/${encodeURIComponent(decodedSlug)}`,
    title: product.meta?.title || product.title,
    description:
      product.meta?.description || product.general?.shortDescription || product.discovery?.summary,
    noIndex: Boolean(product.discovery?.noIndex),
    image: image && typeof image === 'object' ? image.url : undefined,
    languages: false,
  })
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
