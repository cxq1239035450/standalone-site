import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPreviewUser } from './preview'

export const getLanguageRegistry = cache(async (includePreparing = false) => {
  const payload = await getPayload({ config })
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
