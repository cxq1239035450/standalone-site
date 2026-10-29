import { ArrowLeft, CalendarDays, BookOpen, UserRound } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

import type { Post } from '@/payload-types'
import { Link } from '@/i18n/navigation'

import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  post: Post
}> = async ({ post }) => {
  const locale = await getLocale()
  const t = await getTranslations('posts')
  const { categories, populatedAuthors, publishedAt, title } = post
  const authors = populatedAuthors ? formatAuthors(populatedAuthors) : ''
  const formattedDate = publishedAt
    ? new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: locale === 'zh' ? 'long' : 'long',
        year: 'numeric',
      }).format(new Date(publishedAt))
    : null

  return (
    <header className="relative overflow-hidden bg-[#173f35] text-[#f7f5f0]">
      <div className="pet-container flex min-h-[25rem] flex-col justify-between gap-12 py-10 sm:py-14">
        <Link
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/10 px-4 py-2 text-sm font-medium text-emerald-50 backdrop-blur transition hover:bg-white/10"
          href="/posts"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToArticles')}
        </Link>

        <div className="max-w-4xl pb-3">
          {categories && categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map((category, index) => {
                if (typeof category !== 'object' || category === null) return null
                return (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/15 px-3 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur"
                    key={category.id || index}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {category.title || t('uncategorized')}
                  </span>
                )
              })}
            </div>
          )}
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-emerald-50/70">
            {formattedDate && (
              <time className="inline-flex items-center gap-2" dateTime={publishedAt || undefined}>
                <CalendarDays className="h-4 w-4 text-emerald-300" />
                <span className="sr-only">{t('publishedAt')}: </span>
                {formattedDate}
              </time>
            )}
            {authors && (
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4 text-emerald-300" />
                <span className="sr-only">{t('author')}: </span>
                {authors}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
