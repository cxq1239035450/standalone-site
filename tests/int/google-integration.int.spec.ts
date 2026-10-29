import { createElement, StrictMode } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  analyticsPageURL,
  googleMeasurementId,
  googleSiteVerification,
} from '@/integrations/google/config'

const route = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }))
vi.mock('next/script', () => ({
  default: ({ id, src }: { id: string; src: string }) => createElement('script', { id, src }),
}))
import { GoogleAnalytics } from '@/integrations/google/GoogleAnalytics'

type TestWindow = Window & {
  dataLayer?: IArguments[]
  gtag?: (...args: unknown[]) => void
  yueliGoogleAnalytics?: unknown
}

afterEach(() => {
  cleanup()
  const target = window as TestWindow
  delete target.dataLayer
  delete target.gtag
  delete target.yueliGoogleAnalytics
  window.history.replaceState({}, '', '/')
  route.pathname = '/'
})

describe('production Google integrations', () => {
  it('leaves analytics disabled without a production GA4 ID and validates verification tokens', () => {
    expect(googleMeasurementId({ NODE_ENV: 'production' })).toBeUndefined()
    expect(
      googleMeasurementId({ NODE_ENV: 'development', GA_MEASUREMENT_ID: 'G-EXAMPLE123' }),
    ).toBeUndefined()
    expect(
      googleMeasurementId({ NODE_ENV: 'production', GA_MEASUREMENT_ID: 'GTM-EXAMPLE' }),
    ).toBeUndefined()
    expect(
      googleMeasurementId({ NODE_ENV: 'production', GA_MEASUREMENT_ID: ' G-EXAMPLE123 ' }),
    ).toBe('G-EXAMPLE123')
    expect(googleSiteVerification({})).toBeUndefined()
    expect(
      googleSiteVerification({
        GOOGLE_SITE_VERIFICATION: '<meta name="google-site-verification">',
      }),
    ).toBeUndefined()
    expect(googleSiteVerification({ GOOGLE_SITE_VERIFICATION: 'example_token-123' })).toBe(
      'example_token-123',
    )
  })

  it('does not load or initialize live analytics on a staging host', () => {
    const { container } = render(
      createElement(GoogleAnalytics, {
        measurementId: 'G-EXAMPLE123',
        origin: 'https://yueliautomation.com',
      }),
    )
    expect(container.querySelector('script')).toBeNull()
    expect((window as TestWindow).dataLayer).toBeUndefined()
  })

  it('queues one first view and one view per route, even with strict effects and remounts', () => {
    const origin = window.location.origin
    window.history.replaceState({}, '', '/?email=private@example.com#private')
    const view = () =>
      createElement(
        StrictMode,
        null,
        createElement(GoogleAnalytics, { measurementId: 'G-EXAMPLE123', origin }),
      )
    const { container, rerender, unmount } = render(view())
    const commands = () => (window as TestWindow).dataLayer!.map((args) => Array.from(args))
    const pageviews = () => commands().filter(([name]) => name === 'event')
    expect(container.querySelector('script')?.src).toBe(
      'https://www.googletagmanager.com/gtag/js?id=G-EXAMPLE123',
    )
    expect(commands().filter(([name]) => name === 'config')).toHaveLength(1)
    expect(pageviews()).toHaveLength(1)
    expect(commands()).toContainEqual([
      'config',
      'G-EXAMPLE123',
      expect.objectContaining({
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: `${origin}/`,
      }),
    ])
    route.pathname = '/contact-us'
    rerender(view())
    expect(pageviews()).toHaveLength(2)
    expect(pageviews()[1]).toEqual([
      'event',
      'page_view',
      expect.objectContaining({
        page_location: `${origin}/contact-us`,
        page_referrer: `${origin}/`,
      }),
    ])
    expect(JSON.stringify(commands())).not.toContain('private')
    unmount()
    render(view())
    expect(pageviews()).toHaveLength(2)
    expect(commands().filter(([name]) => name === 'config')).toHaveLength(1)
  })

  it('strips query parameters and hashes from page/referrer URLs', () => {
    expect(
      analyticsPageURL('https://yueliautomation.com/contact-us?email=test%40example.com#details'),
    ).toBe('https://yueliautomation.com/contact-us')
    expect(analyticsPageURL('javascript:alert(1)')).toBe('')
    expect(analyticsPageURL('')).toBe('')
  })
})
