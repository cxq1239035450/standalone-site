import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from '@/i18n/content'
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
import { Link } from '@/i18n/navigation'
import { ArrowUpRight } from 'lucide-react'

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
    <article className="bg-[#f7f5f0] pb-24">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <div className="container relative z-10 -mt-10">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-stone-200 bg-white px-6 py-10 shadow-xl shadow-emerald-950/5 sm:px-10 sm:py-14 lg:px-16">
          {post.discovery?.summary && <p className="mb-8 border-l-2 border-[#173f35] pl-5 text-lg leading-8 text-[#5e7169]">{post.discovery.summary}</p>}
          <RichText
            className="prose-lg max-w-none prose-headings:tracking-tight prose-headings:text-slate-900 prose-a:text-emerald-700 prose-p:leading-8 prose-p:text-slate-600"
            data={post.content!}
            enableGutter={false}
          />
        </div>
      </div>
      {post.categories?.some(category => typeof category === 'object' && category.slug === 'pet-guides') && <section className="pet-container mt-12" aria-labelledby="guide-next-step">
        <div className="pet-guide-next mx-auto max-w-4xl">
          <div><h2 id="guide-next-step">{t('inquiryTitle')}</h2><p>{t('inquiryDescription')}</p></div>
          <Link href={`/contact?sourceArticle=${encodeURIComponent(decodedSlug)}`} className="pet-button">{t('inquiryAction')} <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>}
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

  return generateMeta({ doc: post, prefix: '/posts' })
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
