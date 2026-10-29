import { cache } from 'react'
import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

export const getPreviewUser = cache(async () => {
  try {
    if (!(await draftMode()).isEnabled) return null
    const payload = await getPayload({ config })
    return (await payload.auth({ headers: await headers() })).user
  } catch {
    return null
  }
})
