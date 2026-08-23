import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { isLocale, type Locale } from '@/i18n/config'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const { locale } = params
  if (!isLocale(locale)) return []
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    fallbackLocale: false,
    limit: 1000,
    locale,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const generatedParams = posts.docs.map(({ slug }) => {
    const slugValue = typeof slug === 'string' ? slug : slug?.[locale] || ''
    return { slug: slugValue }
  })

  return generatedParams
}

type Args = {
  params: Promise<{
    locale: string
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = '' } = await paramsPromise
  if (!isLocale(locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'posts' })
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ locale, slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="bg-stone-50 pb-24">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="container relative z-10 -mt-10">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-stone-200 bg-white px-6 py-10 shadow-xl shadow-emerald-950/5 sm:px-10 sm:py-14 lg:px-16">
          <RichText
            className="prose-lg max-w-none prose-headings:tracking-tight prose-headings:text-slate-900 prose-a:text-emerald-700 prose-p:leading-8 prose-p:text-slate-600"
            data={post.content}
            enableGutter={false}
          />
        </div>
      </div>
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="container mt-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t('continueReading')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t('relatedPosts')}
            </h2>
            {post.relatedPosts && post.relatedPosts.length > 0 && (
              <RelatedPosts
                className="mt-8"
                docs={post.relatedPosts.filter((post) => typeof post === 'object')}
              />
            )}
          </div>
        </section>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = '' } = await paramsPromise
  if (!isLocale(locale)) notFound()
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ locale, slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ locale, slug }: { locale: Locale; slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    fallbackLocale: false,
    limit: 1,
    locale,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
