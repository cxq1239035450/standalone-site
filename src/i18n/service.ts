import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPreviewUser } from './preview'
import { localeConfig } from './config'
import type { Language } from '@/payload-types'

export const getLanguageRegistry = cache(async (includePreparing = false) => {
  const payload = await getPayload({ config })
  if (!payload.collections.languages) {
    return {
      defaultLocale: localeConfig.defaultLocale,
      languages: localeConfig.locales.map((language, index) => ({
        ...language,
        id: index + 1,
        direction: 'ltr',
        enabled: true,
        createdAt: '',
        updatedAt: '',
      })) as Language[],
    }
  }
  const user = includePreparing ? await getPreviewUser() : null
  const [result, settings] = await Promise.all([
    payload.find({
      collection: 'languages',
      overrideAccess: false,
      user,
      depth: 0,
      pagination: false,
      sort: 'sortOrder',
    }),
    payload.findGlobal({ slug: 'language-settings', depth: 0, overrideAccess: false }),
  ])
  const languages = result.docs
  const selected = languages.find((language) => language.id === settings.defaultLanguage)
  if (!selected) throw new Error('默认语言尚未初始化，请先执行多语言迁移。')
  return { languages, defaultLocale: selected.code }
})

export const getLanguageMessages = cache(async (code: string) => {
  if (process.env.ENABLE_DYNAMIC_CONTENT !== 'true') {
    if (code === 'en') return (await import('../../messages/en.json')).default
    if (code === 'zh') return (await import('../../messages/zh.json')).default
    return null
  }
  const { languages } = await getLanguageRegistry(true)
  const language = languages.find((item) => item.code === code)
  if (!language) return null
  const payload = await getPayload({ config })
  const user = await getPreviewUser()
  const result = await payload.find({
    collection: 'site-copy',
    user,
    overrideAccess: false,
    depth: 0,
    draft: Boolean(user),
    limit: 1,
    where: { language: { equals: language.id } },
  })
  return result.docs[0]?.messages || null
})

export async function enabledLocale(code: string) {
  return (await getLanguageRegistry()).languages.some((language) => language.code === code)
}
