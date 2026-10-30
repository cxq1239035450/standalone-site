'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import { analyticsPageURL } from '@/integrations/google/config'

type MatomoWindow = Window & {
  _paq?: { push: (command: unknown[]) => unknown }
  yueliMatomo?: { key: string; lastLocation?: string }
}

const subscribe = () => () => {}
const serverSnapshot = () => false

export function Matomo({ url, siteId, origin }: { url: string; siteId: string; origin: string }) {
  const pathname = usePathname()
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.location.origin === origin,
    serverSnapshot,
  )

  useEffect(() => {
    if (!enabled) return
    const target = window as MatomoWindow
    const key = `${url}:${siteId}`
    const queue = (target._paq ||= [] as unknown[][])
    if (target.yueliMatomo?.key === key) return
    target.yueliMatomo = { key }
    queue.push(['setTrackerUrl', `${url}matomo.php`])
    queue.push(['setSiteId', siteId])
    queue.push(['enableLinkTracking'])
  }, [enabled, siteId, url])

  useEffect(() => {
    if (!enabled || !pathname) return
    const target = window as MatomoWindow
    const state = target.yueliMatomo
    const location = analyticsPageURL(`${origin}${pathname}`)
    if (!state || !location || state.lastLocation === location) return
    target._paq?.push(['setReferrerUrl', state.lastLocation || analyticsPageURL(document.referrer)])
    target._paq?.push(['setCustomUrl', location])
    target._paq?.push(['setDocumentTitle', document.title])
    target._paq?.push(['trackPageView'])
    state.lastLocation = location
  }, [enabled, origin, pathname, siteId, url])

  return enabled ? (
    <Script id="yueli-matomo" src={`${url}matomo.js`} strategy="afterInteractive" />
  ) : null
}
