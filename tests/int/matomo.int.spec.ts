import { createElement, StrictMode } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { matomoConfig } from '@/integrations/matomo/config'

const route = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }))
vi.mock('next/script', () => ({
  default: ({ id, src }: { id: string; src: string }) => createElement('script', { id, src }),
}))
import { Matomo } from '@/integrations/matomo/Matomo'

type TestWindow = Window & { _paq?: unknown[][]; yueliMatomo?: unknown }
const url = 'https://analytics.coviongroup.com/'

afterEach(() => {
  cleanup()
  const target = window as TestWindow
  delete target._paq
  delete target.yueliMatomo
  route.pathname = '/'
  window.history.replaceState({}, '', '/')
})

describe('Matomo integration', () => {
  it('requires explicit production configuration and validates collector and site ID', () => {
    const config = { MATOMO_ENABLED: 'true', MATOMO_URL: url, MATOMO_SITE_ID: '1' }
    expect(matomoConfig({ ...config, NODE_ENV: 'development' })).toBeUndefined()
    expect(matomoConfig({ ...config, NODE_ENV: 'production', MATOMO_ENABLED: 'false' })).toBeUndefined()
    expect(matomoConfig({ ...config, NODE_ENV: 'production', MATOMO_URL: 'javascript:alert(1)' })).toBeUndefined()
    expect(matomoConfig({ ...config, NODE_ENV: 'production', MATOMO_SITE_ID: '0' })).toBeUndefined()
    expect(matomoConfig({ ...config, NODE_ENV: 'production' })).toEqual({ url, siteId: '1' })
  })

  it('does not load the tracker on another host', () => {
    const { container } = render(createElement(Matomo, { url, siteId: '1', origin: 'https://yueliautomation.com' }))
    expect(container.querySelector('script')).toBeNull()
    expect((window as TestWindow)._paq).toBeUndefined()
  })

  it('tracks initial, route and back views once while excluding query/hash values', () => {
    const origin = window.location.origin
    window.history.replaceState({}, '', '/?email=private@example.com#private')
    const view = () => createElement(StrictMode, null, createElement(Matomo, { url, siteId: '1', origin }))
    const { container, rerender, unmount } = render(view())
    const commands = () => (window as TestWindow)._paq!
    const views = () => commands().filter(([name]) => name === 'trackPageView')
    expect(container.querySelector('script')?.src).toBe(`${url}matomo.js`)
    expect(commands().slice(0, 3)).toEqual([
      ['setTrackerUrl', `${url}matomo.php`], ['setSiteId', '1'], ['enableLinkTracking'],
    ])
    expect(views()).toHaveLength(1)
    route.pathname = '/products'
    rerender(view())
    expect(views()).toHaveLength(2)
    expect(commands()).toContainEqual(['setReferrerUrl', `${origin}/`])
    expect(commands()).toContainEqual(['setCustomUrl', `${origin}/products`])
    unmount()
    render(view())
    expect(views()).toHaveLength(2)
    route.pathname = '/'
    cleanup()
    render(view())
    expect(views()).toHaveLength(3)
    expect(commands().filter(([name]) => name === 'setSiteId')).toHaveLength(1)
    expect(JSON.stringify(commands())).not.toContain('private')
  })
})
