import { createElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ProductReviews } from '../../src/components/Yueli/ProductReviews'
import { ProductTabs } from '../../src/components/Yueli/ProductTabs'

vi.mock('next-intl', () => ({ useLocale: () => 'en' }))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const response = (data: unknown, ok = true) => ({ ok, json: async () => data }) as Response

describe('equipment review form and accessible tabs', () => {
  it('supports keyboard tab selection and counts only publicly loaded reviews', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ docs: [], totalDocs: 0 })))
    render(
      createElement(ProductTabs, {
        productID: 42,
        productTitle: 'TA-12',
        description: createElement('p', {}, 'Original technical description'),
      }),
    )
    const description = screen.getByRole('tab', { name: 'Description' })
    const reviews = screen.getByRole('tab', { name: 'Reviews (0)' })
    expect(description.getAttribute('aria-selected')).toBe('true')
    description.focus()
    fireEvent.keyDown(description, { key: 'ArrowRight' })
    await waitFor(() => expect(reviews.getAttribute('aria-selected')).toBe('true'))
    expect(document.activeElement).toBe(reviews)
    fireEvent.keyDown(reviews, { key: 'Home' })
    await waitFor(() => expect(description.getAttribute('aria-selected')).toBe('true'))
  })

  it('submits a product review for moderation without forwarding auth cookies or publication status', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ docs: [], totalDocs: 0 }))
      .mockResolvedValueOnce(response({ doc: { id: 1, status: 'pending' } }))
    vi.stubGlobal('fetch', fetch)
    const { container } = render(createElement(ProductReviews, { productID: 42 }))
    await screen.findByText('There are no reviews yet.')
    fireEvent.change(screen.getByLabelText('Your rating *'), { target: { value: '5' } })
    fireEvent.change(screen.getByLabelText('Your review *'), {
      target: { value: '  Useful machine.  ' },
    })
    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: '  Equipment buyer  ' } })
    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'buyer@example.invalid' },
    })
    fireEvent.submit(container.querySelector('form')!)
    await screen.findByText('Your review has been received and is awaiting moderation.')
    const [url, options] = fetch.mock.calls[1]
    expect(url).toBe('/api/equipment-reviews?contentLocale=en')
    expect(options.credentials).toBe('omit')
    expect(JSON.parse(options.body)).toEqual({
      product: 42,
      rating: 5,
      comment: 'Useful machine.',
      authorName: 'Equipment buyer',
      email: 'buyer@example.invalid',
    })
    expect(screen.getByText('There are no reviews yet.')).toBeTruthy()
  })

  it('renders review text as text and offers retry when loading fails', async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Reviews could not be loaded. Please retry.'))
      .mockResolvedValueOnce(
        response({
          docs: [
            {
              id: 1,
              authorName: 'Buyer',
              rating: 4,
              comment: '<img src=x onerror=alert(1)>',
              createdAt: '2026-10-28T00:00:00Z',
            },
          ],
          totalDocs: 1,
        }),
      )
    vi.stubGlobal('fetch', fetch)
    const { container } = render(createElement(ProductReviews, { productID: 42 }))
    await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await screen.findByText('<img src=x onerror=alert(1)>')
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByLabelText('4 out of 5 stars')).toBeTruthy()
  })
})
