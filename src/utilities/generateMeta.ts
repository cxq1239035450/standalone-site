import type { Metadata } from 'next'
import type { Page, Post } from '@/payload-types'
import { getLocale } from 'next-intl/server'
import { isLocale } from '@/i18n/config'
import { pageMetadata } from './searchSettings'
export async function generateMeta({ doc, prefix = '' }: { doc: Partial<Page> | Partial<Post> | null; prefix?: string }): Promise<Metadata> {
  const value = await getLocale()
  const locale = isLocale(value) ? value : 'zh'
  const image = doc?.meta?.image
  return pageMetadata({ locale, path: doc?.slug && doc.slug !== 'home' ? `${prefix}/${encodeURIComponent(doc.slug)}` : '', title: doc?.meta?.title || doc?.title, description: doc?.meta?.description || doc?.discovery?.summary, noIndex: !doc || Boolean(doc.discovery?.noIndex), image: image && typeof image === 'object' ? image.url : undefined, languages: false })
}
