import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { defaultLocale, type Locale } from '@/i18n/config'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth: number, locale: Locale): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
    fallbackLocale: false,
    overrideAccess: false,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale: Locale = defaultLocale) =>
  unstable_cache(async () => getGlobal<T>(slug, depth, locale), [slug, String(depth), locale], {
    tags: [`global_${slug}`],
  })
