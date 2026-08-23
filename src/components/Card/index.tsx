'use client'

import { ArrowUpRight, CalendarDays, Newspaper } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

import type { Post } from '@/payload-types'
import type { Locale } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'publishedAt' | 'title'>

function getLocalizedValue(value: unknown, locale: Locale): string {
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && locale in value) {
    const localizedValue = (value as Record<string, unknown>)[locale]
    return typeof localizedValue === 'string' ? localizedValue : ''
  }
  return ''
}

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const locale = useLocale() as Locale
  const t = useTranslations('posts')
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, publishedAt, title } = doc || {}
  const { description, image: metaImage } = meta || {}
  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = getLocalizedValue(titleFromProps || title, locale)
  const descriptionToUse = getLocalizedValue(description, locale).replace(/\s+/g, ' ').trim()
  const href = `/${relationTo}/${slug}`
  const formattedDate = publishedAt
    ? new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
        day: 'numeric',
        month: locale === 'zh' ? 'numeric' : 'short',
        year: 'numeric',
      }).format(new Date(publishedAt))
    : null

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-emerald-950">
        {!metaImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_75%_20%,rgba(52,211,153,0.3),transparent_35%),linear-gradient(135deg,#064e3b,#022c22)] text-emerald-100">
            <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full border border-emerald-300/15" />
            <div className="absolute -bottom-6 -left-2 h-24 w-24 rounded-full border border-emerald-300/15" />
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
              <Newspaper className="h-7 w-7" />
              <span className="sr-only">{t('noImage')}</span>
            </span>
          </div>
        )}
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            fill
            imgClassName="object-cover transition duration-500 group-hover:scale-105"
            resource={metaImage}
            size="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex min-h-6 flex-wrap items-center gap-2 text-xs font-semibold">
          {showCategories &&
            hasCategories &&
            categories.map((category, index) => {
              if (typeof category !== 'object' || category === null) return null
              const categoryTitle = getLocalizedValue(category.title, locale) || t('uncategorized')

              return (
                <span
                  className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"
                  key={category.id || index}
                >
                  {categoryTitle}
                </span>
              )
            })}
          {formattedDate && (
            <time
              className="ml-auto inline-flex items-center gap-1.5 font-medium text-slate-400"
              dateTime={publishedAt || undefined}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {formattedDate}
            </time>
          )}
        </div>

        {titleToUse && (
          <h3 className="text-xl font-semibold leading-snug tracking-tight text-slate-900">
            <Link className="transition group-hover:text-emerald-700" href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </h3>
        )}
        {descriptionToUse && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{descriptionToUse}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-emerald-700">
          {t('readMore')}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  )
}
