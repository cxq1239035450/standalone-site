import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath }))
import { revalidatePublicSite } from '@/hooks/revalidateSearch'
import { revalidatePage } from '@/collections/Pages/hooks/revalidatePage'
import { revalidatePost } from '@/collections/Posts/hooks/revalidatePost'

describe('SEO settings cache invalidation', () => {
  const warn = vi.fn()
  const request = (disabled = false) => ({ context: { disableRevalidate: disabled }, payload: { logger: { warn } } }) as unknown as PayloadRequest
  beforeEach(() => { vi.clearAllMocks(); revalidatePath.mockReset() })

  it('invalidates the shared layout and every descendant route', () => {
    revalidatePublicSite(request())
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith('/', 'layout')
  })
  it('supports an explicit CLI import opt-out', () => {
    revalidatePublicSite(request(true))
    expect(revalidatePath).not.toHaveBeenCalled()
  })
  it('invalidates old URLs and shared listings when published pages or posts change slug', async () => {
    const args = { doc: { slug: 'new-slug', _status: 'published' }, previousDoc: { slug: 'old-slug', _status: 'published' }, req: request() }
    await revalidatePage(args as Parameters<typeof revalidatePage>[0])
    await revalidatePost(args as Parameters<typeof revalidatePost>[0])
    expect(revalidatePath).toHaveBeenCalledTimes(2)
    expect(revalidatePath).toHaveBeenLastCalledWith('/', 'layout')
  })
  it('invalidates a withdrawn post but leaves an unpublished draft edit uncached', async () => {
    await revalidatePost({ doc: { _status: 'draft' }, previousDoc: { _status: 'published' }, req: request() } as Parameters<typeof revalidatePost>[0])
    expect(revalidatePath).toHaveBeenCalledOnce()
    revalidatePath.mockClear()
    await revalidatePost({ doc: { _status: 'draft' }, previousDoc: { _status: 'draft' }, req: request() } as Parameters<typeof revalidatePost>[0])
    expect(revalidatePath).not.toHaveBeenCalled()
  })
  it('preserves the CMS write when no Next request cache exists and logs the failure', () => {
    revalidatePath.mockImplementation(() => { throw new Error('static generation store missing') })
    expect(() => revalidatePublicSite(request())).not.toThrow()
    expect(warn).toHaveBeenCalledOnce()
  })
})
