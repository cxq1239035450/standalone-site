import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'
import { PayloadRequest, CollectionSlug } from 'payload'
import { defaultLocale, isLocale } from '@/i18n/config'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/blog',
  products: '/product',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  locale?: string | null
  sourcePath?: string | null
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, locale, slug, sourcePath }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale

  const encodedParams = new URLSearchParams({
    path:
      sourcePath ||
      `${resolvedLocale === 'en' ? '' : `/${resolvedLocale}`}${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
