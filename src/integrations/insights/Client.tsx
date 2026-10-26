'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createAnalytics, type Analytics } from '@site-insights/browser-sdk'
import { localeCodes } from '@/i18n/config'

export function SiteInsights({ preview = false }: { preview?: boolean }) {
  const pathname = usePathname()
  const client = useRef<Analytics | null>(null)
  const [consent, setConsent] = useState<'granted' | 'denied'>('denied')
  const [chosen, setChosen] = useState(true)
  const enabled = process.env.NEXT_PUBLIC_INSIGHTS_ENABLED === 'true' && !preview
  const siteId = process.env.NEXT_PUBLIC_INSIGHTS_SITE_ID || 'freshconnect'
  const endpoint = process.env.NEXT_PUBLIC_INSIGHTS_ENDPOINT || ''
  const key = `insights-consent:${siteId}`
  const zh = pathname.startsWith('/zh')

  useEffect(() => {
    if (!enabled || !endpoint) return
    const analytics = createAnalytics({ siteId, endpoint, consent: 'denied' })
    client.current = analytics
    try {
      const saved = localStorage.getItem(key)
      setChosen(saved === 'granted' || saved === 'denied')
      setConsent(saved === 'granted' ? 'granted' : 'denied')
    } catch { setChosen(false) }
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
    const onConsent = (event: StorageEvent) => {
      if (event.key === key) setConsent(event.newValue === 'granted' ? 'granted' : 'denied')
    }
    document.addEventListener('focusin', onFocus)
    window.addEventListener('insights:inquiry-submitted', onSubmitted)
    window.addEventListener('storage', onConsent)
    return () => {
      analytics.destroy(); client.current = null
      document.removeEventListener('focusin', onFocus)
      window.removeEventListener('insights:inquiry-submitted', onSubmitted)
      window.removeEventListener('storage', onConsent)
    }
  }, [enabled, endpoint, siteId, key])
  useEffect(() => {
    client.current?.setConsent(consent)
    if (consent === 'granted') client.current?.page({ path: pathname, locale: localeCodes.find(code => pathname === `/${code}` || pathname.startsWith(`/${code}/`)) })
  }, [pathname, consent, enabled, endpoint])
  function choose(value: 'granted' | 'denied') {
    client.current?.setConsent(value)
    setConsent(value); setChosen(true)
    try { localStorage.setItem(key, value) } catch { /* Consent remains in memory. */ }
  }
  if (!enabled || !endpoint) return null
  if (chosen) return <button type="button" className="fixed bottom-3 left-3 z-40 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-stone-600 shadow-sm" onClick={() => setChosen(false)}>{zh ? '统计隐私设置' : 'Analytics privacy'}</button>
  return <section aria-label={zh ? '统计隐私设置' : 'Analytics privacy'} className="fixed bottom-4 left-4 right-4 z-50 max-w-md rounded-2xl border border-stone-200 bg-white p-5 text-stone-800 shadow-lg">
    <p className="text-sm leading-relaxed">{zh ? '是否允许匿名访问统计？仅统计页面和询盘行为，不读取表单内容。你可以随时撤回同意。' : 'Allow anonymous analytics? We count page views and inquiry actions, never form contents. You can withdraw at any time.'}</p>
    <div className="mt-4 flex gap-3"><button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => choose('denied')}>{zh ? '拒绝 / 撤回' : 'Decline / withdraw'}</button><button type="button" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white" onClick={() => choose('granted')}>{zh ? '允许统计' : 'Allow analytics'}</button></div>
  </section>
}
