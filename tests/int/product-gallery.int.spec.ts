import { NextIntlClientProvider } from 'next-intl'
import zhMessages from '../../messages/zh.json'
import enMessages from '../../messages/en.json'
import React from 'react'
import { cleanup, fireEvent, render as rawRender, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Media } from '@/payload-types'
vi.mock('@/components/Media', () => ({
  Media: ({ resource }: { resource: Media }) =>
    React.createElement('span', { 'data-testid': `media-${resource.id}` }, resource.alt),
}))
const carousel = vi.hoisted(() => {
  let selected = 0
  const listeners = new Set<() => void>()
  const change = (index: number) => {
    selected = (index + 2) % 2
    listeners.forEach((listener) => listener())
  }
  const api = {
    selectedScrollSnap: () => selected,
    scrollNext: () => change(selected + 1),
    scrollPrev: () => change(selected - 1),
    scrollTo: (index: number) => change(index),
    on: (_event: string, listener: () => void) => {
      listeners.add(listener)
      return api
    },
    off: (_event: string, listener: () => void) => {
      listeners.delete(listener)
      return api
    },
  }
  return {
    api,
    reset: () => {
      selected = 0
      listeners.clear()
    },
  }
})
vi.mock('embla-carousel-react', () => ({ default: () => [() => {}, carousel.api] }))
import { ProductGallery } from '@/components/ProductGallery'
beforeEach(() => {
  carousel.reset()
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const images = [
  { id: 1, alt: 'Front view', url: '/front.jpg', width: 800, height: 800 },
  { id: 2, alt: 'Side view', url: '/side.jpg', width: 800, height: 800 },
] as Media[]
describe('Product image browsing', () => {
  it('keeps keyboard focus on the visible slide after navigating from a main image', async () => {
    render(React.createElement(ProductGallery, { images, title: 'Pet bowl', locale: 'en' }))
    const front = screen.getByRole('button', { name: 'Enlarge product image: Front view' })
    front.focus()
    fireEvent.keyDown(front, { key: 'ArrowRight' })
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Enlarge product image: Side view' }),
      )
    })
  })
  it('switches views with labeled controls and preserves selected thumbnail state', () => {
    render(React.createElement(ProductGallery, { images, title: 'Pet bowl', locale: 'en' }))
    const first = screen.getByRole('button', { name: 'View image 1' })
    const second = screen.getByRole('button', { name: 'View image 2' })
    expect(first.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }))
    expect(second.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('2 / 2')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }))
    expect(first.getAttribute('aria-pressed')).toBe('true')
    fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' })
    expect(second.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(first)
    fireEvent.click(second)
    expect(screen.getAllByTestId('media-2')).toHaveLength(2)
  })
  it('keeps empty imagery honest while allowing a single image to open at full size', () => {
    const view = render(
      React.createElement(ProductGallery, { images: [], title: 'Pet bowl', locale: 'zh' }),
    )
    expect(screen.getByText('产品图片待补充')).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
    view.rerender(
      React.createElement(ProductGallery, {
        images: images.slice(0, 1),
        title: 'Pet bowl',
        locale: 'zh',
      }),
    )
    expect(screen.queryByRole('button', { name: '下一张图片' })).toBeNull()
    expect(screen.getByRole('button', { name: '放大查看产品图片' })).toBeTruthy()
  })
})
function render(element: React.ReactElement<{ locale: string }>) {
  const wrap = (child: typeof element) => React.createElement(NextIntlClientProvider, { locale: child.props.locale, messages: child.props.locale === 'zh' ? zhMessages : enMessages } as unknown as React.ComponentProps<typeof NextIntlClientProvider>, child)
  const view = rawRender(wrap(element))
  return { ...view, rerender: (child: typeof element) => view.rerender(wrap(child)) }
}
