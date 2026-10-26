import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { Post } from '@/payload-types'
import { revalidatePublicSite } from '@/hooks/revalidateSearch'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({ doc, previousDoc, req }) => {
  // Updating a published slug also invalidates its former URL and every listing that linked to it.
  if (doc._status === 'published' || previousDoc?._status === 'published') revalidatePublicSite(req)
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req }) => {
  revalidatePublicSite(req)
  return doc
}
