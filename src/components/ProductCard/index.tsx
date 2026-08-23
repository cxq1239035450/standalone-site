'use client'

import { ArrowUpRight, Package } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

import type { Product } from '@/payload-types'
import { Link } from '@/i18n/navigation'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

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

const unitLabels: Record<string, string> = {
  kg: 'kg',
  jin: '斤',
  box: '箱',
  piece: '个',
  bag: '袋',
  ton: '吨',
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, locale, className }) => {
  const t = useTranslations('products')
  const { general, organization, pricing, slug, title } = product
  const { heroImage, shortDescription } = general || {}
  const { category, featured } = organization || {}
  const { price, unit } = pricing || {}

  const titleValue = getLocalizedValue(title, locale)
  const descriptionValue = getLocalizedValue(shortDescription, locale)
  const slugValue = typeof slug === 'string' ? slug : getLocalizedValue(slug, locale)
  const unitLabel = unit ? unitLabels[unit] || unit : 'kg'
  const href = `/products/${slugValue}`

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5',
        className,
      )}
    >
      {featured && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-amber-950 shadow-sm">
          {t('featuredBadge')}
        </span>
      )}

      <Link className="block" href={href}>
        <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50">
          {heroImage && typeof heroImage !== 'string' ? (
            <Media
              fill
              imgClassName="object-cover transition duration-500 group-hover:scale-105"
              resource={heroImage}
              size="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_75%_25%,rgba(52,211,153,0.22),transparent_35%),linear-gradient(135deg,#ecfdf5,#d1fae5)] text-emerald-700">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-700/10 bg-white/60 shadow-sm">
                <Package className="h-7 w-7" />
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {category && typeof category === 'object' && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {getLocalizedValue(category.title, locale)}
          </p>
        )}

        <Link href={href}>
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-emerald-700">
            {titleValue || t('untitled')}
          </h3>
        </Link>

        {descriptionValue && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{descriptionValue}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          {price !== undefined && price !== null ? (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-emerald-700">
                ¥{typeof price === 'number' ? price.toFixed(2) : price}
              </span>
              <span className="text-sm text-slate-400">/{unitLabel}</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-emerald-700">{t('askPrice')}</span>
          )}
          <ArrowUpRight className="h-5 w-5 text-emerald-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </article>
  )
}
