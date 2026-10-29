import type React from 'react'

import { getPayload } from '@/i18n/content'
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirects = await getCachedRedirects()()

  const redirectItem = redirects.find((redirect) => redirect.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(redirectItem.to.url)
    }

    const reference = redirectItem.to?.reference
    const id = typeof reference?.value === 'object' ? reference.value.id : reference?.value
    if (reference && id) {
      const locale = await getLocale()
      const payload = await getPayload({ config })
      const document = await payload.findByID({ collection: reference.relationTo, id, locale, depth: 0, disableErrors: true })
      if (document?.slug) redirect(`/${locale}${reference.relationTo === 'pages' ? '' : `/${reference.relationTo}`}/${encodeURIComponent(document.slug)}`)
    }
  }

  if (disableNotFound) return null

  notFound()
}
