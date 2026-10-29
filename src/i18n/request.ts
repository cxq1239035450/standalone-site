import { getRequestConfig } from 'next-intl/server'

import { getLanguageRegistry, getLanguageMessages } from './service'
import { notFound } from 'next/navigation'

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const registry = await getLanguageRegistry(true)
  const locale = requestedLocale || registry.defaultLocale
  if (!registry.languages.some(item => item.code === locale)) notFound()
  const messages = await getLanguageMessages(locale)
  if (!messages) notFound()

  return {
    locale,
    messages: messages as import('next-intl').AbstractIntlMessages,
  }
})
