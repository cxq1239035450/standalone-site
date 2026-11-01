import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug } from 'payload'
import { getPayload } from '@/i18n/content'
import { cache } from 'react'
import { defaultLocale, type Locale } from '@/i18n/config'

type Global = keyof Config['globals']

const getGlobal = cache(async <T extends Global>(slug: T, depth: number, locale: Locale): Promise<DataFromGlobalSlug<T>> => {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
    fallbackLocale: false,
    overrideAccess: false,
  })

  return global
})

/**
 * Deduplicate within a server render only. Global relationships and preview permissions stay live.
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale: Locale = defaultLocale) =>
  () => getGlobal<T>(slug, depth, locale)
