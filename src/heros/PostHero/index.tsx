import { ArrowLeft, CalendarDays, Leaf, UserRound } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import React from 'react'

import type { Post } from '@/payload-types'
import { Link } from '@/i18n/navigation'
import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

export const PostHero: React.FC<{
  post: Post
}> = async ({ post }) => {
  const locale = await getLocale()
  const t = await getTranslations('posts')
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post
  const authors = populatedAuthors ? formatAuthors(populatedAuthors) : ''
  const formattedDate = publishedAt
    ? new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
        day: 'numeric',
        month: locale === 'zh' ? 'long' : 'long',
        year: 'numeric',
      }).format(new Date(publishedAt))
    : null

  return (
    <header className="relative isolate min-h-[34rem] overflow-hidden bg-emerald-950 text-white">
      {heroImage && typeof heroImage !== 'string' ? (
        <Media fill priority imgClassName="-z-20 object-cover" resource={heroImage} />
      ) : (
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_20%,rgba(52,211,153,0.3),transparent_34%),linear-gradient(135deg,#064e3b,#022c22)]" />
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-emerald-950 via-emerald-950/75 to-emerald-950/20" />
      <div className="absolute -bottom-28 -right-20 -z-10 h-80 w-80 rounded-full border border-emerald-300/10" />

      <div className="container flex min-h-[34rem] flex-col justify-between py-10 sm:py-14">
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
                    <Leaf className="h-3.5 w-3.5" />
                    {category.title || t('uncategorized')}
                  </span>
                )
              })}
            </div>
          )}
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
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
