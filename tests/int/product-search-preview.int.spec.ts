import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { productGeography, productSearchURL, searchTitle } from '@/utilities/seoPresentation'

const state = vi.hoisted(() => ({ locale: 'zh', fields: {} as Record<string, { value: unknown }> }))
vi.mock('@payloadcms/ui', () => ({
  useFormFields: (selector: (args: unknown) => unknown) => selector([state.fields]),
  useLocale: () => ({ code: state.locale }),
  useTranslation: () => ({ i18n: { language: 'zh' } }),
}))
vi.mock('@/utilities/getURL', () => ({ getServerSideURL: () => 'https://fallback.example' }))
import ProductSearchPreview from '@/components/ProductSearchPreview'

beforeEach(() => {
  state.locale = 'zh'
  state.fields = {
    title: { value: '宠物用品' },
    slug: { value: '宠物用品' },
    'general.shortDescription': { value: '产品简短描述' },
  }
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          siteName: 'Pet Brand',
          siteUrl: 'https://pets.example/ignored/',
          allowIndexing: true,
        }),
      }),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Product search appearance', () => {
  it('uses published title rules and encoded canonical paths', () => {
    expect(searchTitle('宠物用品 | PawSupply', 'PawSupply')).toBe('宠物用品 | PawSupply')
    expect(productSearchURL('https://pets.example/path', 'en', 'dog bowl')).toBe(
      'https://pets.example/en/products/dog%20bowl',
    )
    expect(productGeography({ manufacturingOrigin: ' ', targetMarkets: ' Europe ' }, 'en')).toEqual(
      [{ name: 'Target markets', value: 'Europe' }],
    )
  })
  it('shows a real card and updates immediately as SEO and GEO fields change', async () => {
    const view = render(React.createElement(ProductSearchPreview))
    expect(await screen.findByText('宠物用品 | Pet Brand')).toBeTruthy()
    expect(screen.getByText('产品简短描述')).toBeTruthy()
    expect(
      screen.getByText('https://pets.example/zh/products/%E5%AE%A0%E7%89%A9%E7%94%A8%E5%93%81'),
    ).toBeTruthy()
    state.fields['meta.title'] = { value: '定制宠物用品' }
    state.fields['meta.description'] = { value: '后台刚填写的描述' }
    state.fields['meta.targetMarkets'] = { value: '北美、欧洲' }
    state.fields['meta.manufacturingOrigin'] = { value: '福建泉州' }
    view.rerender(React.createElement(ProductSearchPreview))
    expect(screen.getByText('定制宠物用品 | Pet Brand')).toBeTruthy()
    expect(screen.getByText('后台刚填写的描述')).toBeTruthy()
    expect(screen.getByText('产地：福建泉州')).toBeTruthy()
    expect(screen.getByText('目标市场：北美、欧洲')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '手机' }))
    expect(screen.getByRole('button', { name: '手机' }).getAttribute('aria-pressed')).toBe('true')
    expect(view.container.querySelector('.product-search-preview__frame--mobile')).toBeTruthy()
    state.fields['discovery.noIndex'] = { value: true }
    view.rerender(React.createElement(ProductSearchPreview))
    expect(screen.getByText(/当前设置为不索引/)).toBeTruthy()
  })
  it('respects the global indexing switch and shows retry on configuration failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response)
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ allowIndexing: false }),
    } as Response)
    render(React.createElement(ProductSearchPreview))
    fireEvent.click(await screen.findByRole('button', { name: '重试' }))
    expect(await screen.findByText(/当前设置为不索引/)).toBeTruthy()
  })
})
