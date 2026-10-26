import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getSearchSettings } from '@/utilities/searchSettings'
import { navigationLinks } from '@/utilities/navigationLinks'
import { getLocale } from 'next-intl/server'
import { defaultLocale, isLocale } from '@/i18n/config'

export async function Header() {
  const value = await getLocale()
  const locale = isLocale(value) ? value : defaultLocale
  const [headerData, settings] = await Promise.all([getCachedGlobal('header', 1, locale)(), getSearchSettings(locale)])

  return <HeaderClient brand={settings.siteName || 'PawSupply'} customLinks={headerData.useCustomNavigation ? navigationLinks(headerData.navItems) : []} />
}
