import { isLocale } from '@/i18n/config'
import { pageMetadata } from '@/utilities/searchSettings'
import type { Metadata } from 'next'

import { ContactPageContent } from '@/components/ContactPage'
import { getTranslations } from 'next-intl/server'
import { getPayload } from '@/i18n/content'
import config from '@payload-config'
import { notFound } from 'next/navigation'

type Args = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    category?: string
    product?: string
    productSlug?: string
    sourceArticle?: string
  }>
}

export default async function ContactPage({ params, searchParams }: Args) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const { category, productSlug, sourceArticle } = await searchParams
  const payload = await getPayload({ config })
  const product =
    typeof productSlug === 'string' && productSlug.length <= 200
      ? (
          await payload.find({
            collection: 'products',
            locale,
            fallbackLocale: false,
            draft: false,
            overrideAccess: false,
            depth: 1,
            limit: 1,
            where: {
              slug: { equals: productSlug },
              _status: { equals: 'published' },
              title: { exists: true },
            },
          })
        ).docs[0]
      : undefined
  const article =
    typeof sourceArticle === 'string' && sourceArticle.length <= 200
      ? (
          await payload.find({
            collection: 'posts',
            locale,
            fallbackLocale: false,
            draft: false,
            overrideAccess: false,
            depth: 0,
            limit: 1,
            where: {
              slug: { equals: sourceArticle },
              _status: { equals: 'published' },
              title: { exists: true },
            },
          })
        ).docs[0]
      : undefined
  const productCategory = product?.organization?.category
  return (
    <ContactPageContent
      initialCategory={
        product
          ? typeof productCategory === 'object'
            ? productCategory?.slug || undefined
            : undefined
          : typeof category === 'string'
            ? category
            : undefined
      }
      initialProduct={product?.title || undefined}
      initialProductSlug={product?.slug || undefined}
      sourceArticle={article ? `${article.title} (${article.slug})` : undefined}
    />
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('contact')
  return pageMetadata({
    locale: isLocale(locale) ? locale : 'zh',
    path: '/contact',
    title: t('hero.title'),
    description: t('hero.description'),
  })
}
