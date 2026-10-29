'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createAnalytics, type Analytics } from '@site-insights/browser-sdk'
import { useBrowserPreference, writeBrowserPreference } from '@/utilities/browserPreference'
import { useLocale, useTranslations } from 'next-intl'

export function SiteInsights({ preview = false }: { preview?: boolean }) {
  const pathname = usePathname()
  const client = useRef<Analytics | null>(null)
  const [editingConsent, setEditingConsent] = useState(false)
  const enabled = process.env.NEXT_PUBLIC_INSIGHTS_ENABLED === 'true' && !preview
  const siteId = process.env.NEXT_PUBLIC_INSIGHTS_SITE_ID || 'freshconnect'
  const endpoint = process.env.NEXT_PUBLIC_INSIGHTS_ENDPOINT || ''
  const key = `insights-consent:${siteId}`
  const saved = useBrowserPreference(key)
  const consent = saved === 'granted' ? 'granted' : 'denied'
  const chosen = !editingConsent && (saved === undefined || saved === 'granted' || saved === 'denied')
  const locale = useLocale()
  const copy = useTranslations('privacy')

  useEffect(() => {
    if (!enabled || !endpoint) return
    const analytics = createAnalytics({ siteId, endpoint, consent: 'denied' })
    client.current = analytics
    const started = new WeakSet<HTMLFormElement>()
    const onFocus = (event: FocusEvent) => {
      const form = event.target instanceof Element ? event.target.closest<HTMLFormElement>('form[data-insights-form]') : null
      if (form && !started.has(form)) {
        started.add(form)
        analytics.track('inquiry_started', { formId: form.dataset.insightsForm })
      }
    }
    const onSubmitted = (event: Event) => {
      const formId = (event as CustomEvent<{ formId: string }>).detail?.formId
      if (typeof formId === 'string') analytics.track('inquiry_submitted', { formId })
    }
    document.addEventListener('focusin', onFocus)
    window.addEventListener('insights:inquiry-submitted', onSubmitted)
    return () => {
      analytics.destroy(); client.current = null
      document.removeEventListener('focusin', onFocus)
      window.removeEventListener('insights:inquiry-submitted', onSubmitted)
    }
  }, [enabled, endpoint, siteId])
  useEffect(() => {
    client.current?.setConsent(consent)
    if (consent === 'granted') client.current?.page({ path: pathname, locale })
  }, [pathname, consent, enabled, endpoint, locale])
  function choose(value: 'granted' | 'denied') {
    client.current?.setConsent(value)
    writeBrowserPreference(key, value)
    setEditingConsent(false)
  }
  if (!enabled || !endpoint) return null
  if (chosen) return <button type="button" className="fixed bottom-3 left-3 z-40 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-600 shadow-sm" onClick={() => setEditingConsent(true)}>{copy('title')}</button>
  return <section aria-label={copy('title')} className="fixed bottom-4 left-4 right-4 z-50 max-w-md rounded-2xl border border-stone-200 bg-white p-5 text-stone-800 shadow-lg">
    <p className="text-sm leading-relaxed">{copy('description')}</p>
    <div className="mt-4 flex gap-3"><button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => choose('denied')}>{copy('decline')}</button><button type="button" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white" onClick={() => choose('granted')}>{copy('allow')}</button></div>
  </section>
}
