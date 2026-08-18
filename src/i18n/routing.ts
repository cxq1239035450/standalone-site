import { defineRouting } from 'next-intl/routing'

import { defaultLocale, localeCodes } from './config'

export const routing = defineRouting({
  locales: localeCodes,
  defaultLocale,
})

export type { Locale } from './config'
