// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server'
import { redirects } from '../../redirects'

describe('Legacy Yueli URL redirects', () => {
  it.each([
    ['/home', '/'],
    ['/en/home', '/'],
    ['/zh/home', '/zh'],
    ['/posts/news', '/blog/news'],
    ['/en/posts/news', '/blog/news'],
    ['/zh/posts/news', '/zh/blog/news'],
    ['/contact?productSlug=machine', '/contact-us?productSlug=machine'],
    ['/en/contact', '/contact-us'],
    ['/zh/contact?productSlug=machine', '/zh/contact-us?productSlug=machine'],
    ['/products/machine', '/product/machine'],
    ['/en/products/machine', '/product/machine'],
    ['/zh/products/machine', '/zh/product/machine'],
  ])('redirects %s to %s without changing the requested language', async (source, destination) => {
    const response = await unstable_getResponseFromNextConfig({
      url: `https://yueli.example${source}`,
      nextConfig: { redirects },
    })
    expect(response.status).toBe(308)
    expect(getRedirectUrl(response)).toBe(`https://yueli.example${destination}`)
  })

  it.each(['/product/machine', '/zh/product/machine', '/ja/products/machine'])(
    'leaves canonical and other dynamic language routes intact: %s',
    async (path) => {
      const response = await unstable_getResponseFromNextConfig({
        url: `https://yueli.example${path}`,
        nextConfig: { redirects },
      })
      expect(getRedirectUrl(response)).toBeNull()
    },
  )
})
