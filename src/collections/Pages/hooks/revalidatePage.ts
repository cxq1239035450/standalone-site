import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { Page } from '@/payload-types'
import { revalidatePublicSite } from '@/hooks/revalidateSearch'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({ doc, previousDoc, req }) => {
  // Updating a published slug also invalidates its former URL and every listing that linked to it.
  if (doc._status === 'published' || previousDoc?._status === 'published') revalidatePublicSite(req)
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req }) => {
  revalidatePublicSite(req)
  return doc
}
