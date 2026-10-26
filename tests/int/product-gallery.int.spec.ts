import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Media } from '@/payload-types'
vi.mock('@/components/Media', () => ({
  Media: ({ resource }: { resource: Media }) =>
    React.createElement('span', { 'data-testid': `media-${resource.id}` }, resource.alt),
}))
import { ProductGallery } from '@/components/ProductGallery'
afterEach(cleanup)
const images = [
  { id: 1, alt: 'Front view' },
  { id: 2, alt: 'Side view' },
] as Media[]
describe('Product image browsing', () => {
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
    fireEvent.click(second)
    expect(screen.getAllByTestId('media-2')).toHaveLength(2)
  })
  it('does not invent imagery or unnecessary controls for empty and single-image products', () => {
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
    expect(screen.queryByRole('button')).toBeNull()
  })
})
