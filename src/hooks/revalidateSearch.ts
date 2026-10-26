import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, PayloadRequest } from 'payload'
import type { Product } from '@/payload-types'

export function revalidatePublicSite(req: PayloadRequest) {
  if (req.context.disableRevalidate) return
  try {
    // Global metadata and product references are shared by layouts, listings and detail pages.
    // Invalidate all rendered routes, including previously published slugs and both languages.
    revalidatePath('/', 'layout')
  } catch (error) {
    // Payload CLI scripts run without a Next request cache. Preserve their database write;
    // callers can explicitly set context.disableRevalidate and refresh the app after import.
    req.payload.logger.warn({ err: error }, 'Public-site cache invalidation unavailable. Refresh the running Next server after CLI updates.')
  }
}

export const revalidateSearchSettings: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidatePublicSite(req)
  return doc
}

export const revalidateProduct: CollectionAfterChangeHook<Product> = ({ doc, previousDoc, req }) => {
  if (doc._status === 'published' || previousDoc?._status === 'published') revalidatePublicSite(req)
  return doc
}

export const revalidateProductDelete: CollectionAfterDeleteHook<Product> = ({ doc, req }) => {
  revalidatePublicSite(req)
  return doc
}
