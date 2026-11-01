import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from '@/i18n/content'
import { cache } from 'react'

type Collection = keyof Config['collections']

const getDocument = cache(async (collection: Collection, slug: string, depth = 0) => {
  const payload = await getPayload({ config: configPromise })

  const page = await payload.find({
    collection,
    depth,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
})

/**
 * Request-local reuse; publication and preview are checked again on the next request.
 */
export const getCachedDocument = (collection: Collection, slug: string) =>
  () => getDocument(collection, slug)
