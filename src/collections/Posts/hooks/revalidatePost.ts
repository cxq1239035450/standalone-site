import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'
import { localeCodes } from '@/i18n/config'

const revalidatePostPaths = (slug?: string | null) => {
  if (!slug) return
  for (const locale of localeCodes) {
    revalidatePath(`/${locale}/posts/${slug}`)
    revalidatePath(`/${locale}/posts`)
  }
}

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info(`Revalidating localized post paths for: ${doc.slug}`)
      revalidatePostPaths(doc.slug)
      revalidateTag('posts-sitemap', 'max')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      payload.logger.info(`Revalidating old localized post paths for: ${previousDoc.slug}`)
      revalidatePostPaths(previousDoc.slug)
      revalidateTag('posts-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePostPaths(doc?.slug)
    revalidateTag('posts-sitemap', 'max')
  }

  return doc
}
