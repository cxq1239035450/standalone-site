'use client'

import { ArrowUpRight, Package } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

import type { Product } from '@/payload-types'
import { Link } from '@/i18n/navigation'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import { productUnitLabel, productInquiryHref } from '@/utilities/productPresentation'

interface ProductCardProps {
  product: Partial<Product>
  locale: string
  className?: string
}

function getLocalizedValue(value: unknown, locale: string): string {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && locale in value) {
    const localizedValue = (value as Record<string, unknown>)[locale]
    return typeof localizedValue === 'string' ? localizedValue : ''
  }
  return ''
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, locale, className }) => {
  const t = useTranslations('products')
  const home = useTranslations('home')
  const { general, organization, pricing, slug, title } = product
  const { heroImage, shortDescription } = general || {}
  const { category, featured } = organization || {}
  const { price, unit } = pricing || {}

  const titleValue = getLocalizedValue(title, locale)
  const descriptionValue = getLocalizedValue(shortDescription, locale)
  const slugValue = typeof slug === 'string' ? slug : getLocalizedValue(slug, locale)
  const unitLabel = productUnitLabel(unit, locale)
  const href = `/products/${slugValue}`

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#173f35]',
        className,
      )}
    >
      {featured && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-[#f7f5f0] px-3 py-1 text-xs font-medium text-[#173f35]">
          {t('featuredBadge')}
        </span>
      )}

      <Link className="block" href={href} aria-label={titleValue || t('untitled')}>
        <div className="relative aspect-square overflow-hidden bg-[#eeeae3]">
          {heroImage && typeof heroImage !== 'string' ? (
            <Media
              fill
              imgClassName="object-contain transition duration-500 group-hover:scale-105"
              resource={heroImage}
              size="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#dde5da] text-[#173f35]">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-700/10 bg-white/60 shadow-sm">
                <Package className="h-7 w-7" />
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {category && typeof category === 'object' && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#173f35]">
            {category.slug && ['bedding', 'feeding', 'toys', 'walking'].includes(category.slug)
              ? home(`categories.${category.slug}.name`)
              : getLocalizedValue(category.title, locale)}
          </p>
        )}

        <Link href={href}>
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-[#173f35]">
            {titleValue || t('untitled')}
          </h3>
        </Link>

        {descriptionValue && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{descriptionValue}</p>
        )}

        {product.sourcing?.materials && (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#5e7169]">
            {locale === 'zh' ? '材质' : 'Material'} · {product.sourcing.materials}
          </p>
        )}
        <div className="mt-auto pt-5">
          {price != null && (
            <p className="mb-4 text-lg font-semibold text-[#173f35]">
              ¥{typeof price === 'number' ? price.toFixed(2) : price}
              <span className="ml-1 text-sm font-normal text-stone-500">/{unitLabel}</span>
            </p>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#173f35]"
            >
              {locale === 'zh' ? '查看详情' : 'View details'} <ArrowUpRight size={16} />
            </Link>
            <Link
              href={productInquiryHref(
                titleValue,
                typeof category === 'object' ? category?.slug : undefined,
                slugValue,
              )}
              className="rounded-md bg-[#dde5da] px-3 py-2 text-sm font-medium text-[#173f35] hover:bg-[#cad7c6]"
            >
              {t('askPrice')}
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
