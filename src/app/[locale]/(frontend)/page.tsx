import { pageMetadata } from '@/utilities/searchSettings'
import { getLocale } from 'next-intl/server'
import { isLocale } from '@/i18n/config'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { HomePageSections } from '@/components/HomePageSections'

export default function HomePage() {
  return <HomePageSections />
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home.meta')

  const value = await getLocale()
  return pageMetadata({ locale: isLocale(value) ? value : 'zh', title: t('title'), description: t('description') })
}
