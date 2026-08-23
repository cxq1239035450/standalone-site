import type { CollectionBeforeChangeHook } from 'payload'
import { ValidationError } from 'payload'

import { localeConfig } from '@/i18n/config'
import type { Post } from '@/payload-types'

type LocalizedPost = {
  content?: Record<string, Post['content'] | null | undefined>
  title?: Record<string, string | null | undefined>
}

export const validatePublishLocales: CollectionBeforeChangeHook<Post> = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const publishAllLocales = String(req.query?.publishAllLocales) === 'true'
  if (!publishAllLocales) return data

  let stored: LocalizedPost = {}
  if (operation === 'update' && originalDoc?.id) {
    stored = (await req.payload.findByID({
      collection: 'posts',
      id: originalDoc.id,
      depth: 0,
      draft: true,
      locale: 'all',
      overrideAccess: true,
    })) as unknown as LocalizedPost
  }

  const activeLocale = typeof req.locale === 'string' ? req.locale : undefined
  const missingLocales = localeConfig.locales.filter(({ code }) => {
    const isActive = code === activeLocale
    const title = isActive ? (data.title ?? stored.title?.[code]) : stored.title?.[code]
    const content = isActive ? (data.content ?? stored.content?.[code]) : stored.content?.[code]
    return !title || !content
  })

  if (missingLocales.length > 0) {
    const labels = missingLocales.map(({ label }) => label).join('、')
    const isEnglish = req.i18n?.language === 'en'
    throw new ValidationError({
      collection: 'posts',
      id: originalDoc?.id,
      req,
      errors: [
        {
          path: 'title',
          message: isEnglish
            ? `Complete the title and content for these languages before publishing all: ${labels}.`
            : `发布全部语言前，请先补全这些语言的标题和正文：${labels}。`,
        },
      ],
    })
  }

  return data
}
