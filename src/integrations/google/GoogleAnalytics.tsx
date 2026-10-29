'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import { analyticsPageURL } from './config'

type GoogleWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  yueliGoogleAnalytics?: { measurementId: string; lastLocation?: string }
}

const subscribe = () => () => {}
const serverSnapshot = () => false

export function GoogleAnalytics({
  measurementId,
  origin,
}: {
  measurementId: string
  origin: string
}) {
  const pathname = usePathname()
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.location.origin === origin,
    serverSnapshot,
  )

  useEffect(() => {
    // A production build can also be opened on a staging host or localhost.
    // Only the configured public site should contribute to the live property.
    if (!enabled) return
    const target = window as GoogleWindow
    target.dataLayer ||= []
    target.gtag ||= function () {
      // Match Google's gtag command queue format (Arguments rather than an event object).
      // eslint-disable-next-line prefer-rest-params
      target.dataLayer!.push(arguments)
    }
    if (target.yueliGoogleAnalytics?.measurementId !== measurementId) {
      target.yueliGoogleAnalytics = { measurementId }
      target.gtag('js', new Date())
      target.gtag('config', measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: analyticsPageURL(window.location.href),
        page_referrer: analyticsPageURL(document.referrer),
      })
    }
  }, [enabled, measurementId])

  useEffect(() => {
    if (!enabled || !pathname) return
    const target = window as GoogleWindow
    const state = target.yueliGoogleAnalytics
    const location = analyticsPageURL(`${origin}${pathname}`)
    if (!state || !location || state.lastLocation === location) return
    const referrer = state.lastLocation || analyticsPageURL(document.referrer)
    // Disable GA's automatic history-based pageviews in the web-stream settings;
    // this sends exactly one initial view and one view for each route change.
    target.gtag?.('set', { page_location: location, page_referrer: referrer })
    target.gtag?.('event', 'page_view', {
      send_to: measurementId,
      page_location: location,
      page_referrer: referrer,
      page_title: document.title,
    })
    state.lastLocation = location
  }, [enabled, measurementId, origin, pathname])

  return enabled ? (
    <Script
      id="yueli-google-analytics"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  ) : null
}
