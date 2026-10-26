import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { searchPublishedContent } from '@/utilities/searchPublishedContent'

describe('Live public product and resource search', () => {
  it('does not fetch all records when no keyword was entered', async () => {
    const find = vi.fn()
    expect(await searchPublishedContent({ find } as unknown as Payload, 'en', '  ')).toEqual({ products: [], posts: [] })
    expect(find).not.toHaveBeenCalled()
  })
  it('queries published source records with access control and without untranslated fallback', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    await searchPublishedContent({ find } as unknown as Payload, 'en', '  dog bowl  ')
    expect(find).toHaveBeenCalledTimes(2)
    for (const [options] of find.mock.calls) {
      expect(options).toMatchObject({ locale: 'en', draft: false, overrideAccess: false, fallbackLocale: false })
      expect(options.where.and).toContainEqual({ _status: { equals: 'published' } })
      expect(JSON.stringify(options.where)).toContain('dog bowl')
    }
    expect(find.mock.calls.map(([options]) => options.collection)).toEqual(['products', 'posts'])
  })
})
