import { describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import {
  EquipmentReviews,
  enforceEquipmentReviewModeration,
  isEquipmentReviewModerator,
  prepareEquipmentReview,
  reviewRatingIsValid,
} from '../../src/collections/EquipmentReviews'

const request = (user: unknown = null) => ({ user }) as PayloadRequest

describe('equipment review moderation and privacy', () => {
  it('only gives protected CMS users moderation access', async () => {
    const anonymous = request()
    const moderator = request({ collection: 'users', id: 1 })
    expect(isEquipmentReviewModerator({ req: anonymous })).toBe(false)
    expect(isEquipmentReviewModerator({ req: request({ collection: 'customers', id: 1 }) })).toBe(
      false,
    )
    expect(isEquipmentReviewModerator({ req: moderator })).toBe(true)
    const read = EquipmentReviews.access!.read!
    expect(await read({ req: anonymous })).toEqual({
      and: [{ status: { equals: 'published' } }, { 'product._status': { equals: 'published' } }],
    })
    expect(await read({ req: moderator })).toBe(true)
    expect(await EquipmentReviews.access!.update!({ req: anonymous })).toBe(false)
    expect(await EquipmentReviews.access!.delete!({ req: anonymous })).toBe(false)
    const email = EquipmentReviews.fields.find(
      (field) => 'name' in field && field.name === 'email',
    )!
    const status = EquipmentReviews.fields.find(
      (field) => 'name' in field && field.name === 'status',
    )!
    if (!('access' in email) || !('access' in status)) throw new Error('Missing field access rules')
    expect(await email.access!.read!({ req: anonymous, id: 1 })).toBe(false)
    expect(await email.access!.read!({ req: moderator, id: 1 })).toBe(true)
    expect(await status.access!.create!({ req: anonymous })).toBe(false)
    expect(await status.access!.update!({ req: anonymous, id: 1 })).toBe(false)
  })

  it('overrides forged public moderation status and validates the related product with access control', async () => {
    const findByID = vi.fn().mockResolvedValue({ id: 42, _status: 'published' })
    const req = { user: null, payload: { collections: {}, findByID } } as unknown as PayloadRequest
    const result = await prepareEquipmentReview({
      data: {
        product: 42,
        status: 'published',
        authorName: '  Equipment buyer  ',
        email: ' buyer@example.invalid ',
        comment: '  Review text  ',
        createdAt: '1990-01-01T00:00:00Z',
      },
      operation: 'create',
      req,
    } as unknown as Parameters<typeof prepareEquipmentReview>[0])
    expect(result).toMatchObject({
      status: 'pending',
      authorName: 'Equipment buyer',
      comment: 'Review text',
    })
    expect(result).not.toHaveProperty('createdAt')
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'products',
        id: 42,
        overrideAccess: false,
        req,
      }),
    )
    const saved = await enforceEquipmentReviewModeration({
      data: { status: 'published' },
      req,
    } as unknown as Parameters<typeof enforceEquipmentReviewModeration>[0])
    expect(saved.status).toBe('pending')
  })

  it('rejects reviews for missing, nonexistent or unpublished products', async () => {
    for (const product of [undefined, null, true, [], 0, -1, 'not-an-id']) {
      const req = {
        user: null,
        payload: { collections: {}, findByID: vi.fn() },
      } as unknown as PayloadRequest
      await expect(
        prepareEquipmentReview({
          data: { product },
          operation: 'create',
          req,
        } as unknown as Parameters<typeof prepareEquipmentReview>[0]),
      ).rejects.toThrow()
      expect(req.payload.findByID).not.toHaveBeenCalled()
    }
    for (const record of [null, { id: 42, _status: 'draft' }]) {
      const req = {
        user: null,
        payload: { collections: {}, findByID: vi.fn().mockResolvedValue(record) },
      } as unknown as PayloadRequest
      await expect(
        prepareEquipmentReview({
          data: { product: 42 },
          operation: 'create',
          req,
        } as unknown as Parameters<typeof prepareEquipmentReview>[0]),
      ).rejects.toThrow()
    }
  })

  it('accepts only integer ratings from 1 to 5', () => {
    for (const value of [1, 2, 3, 4, 5]) expect(reviewRatingIsValid(value)).toBe(true)
    for (const value of [0, 6, 2.5, NaN, Infinity, '5', null, undefined])
      expect(reviewRatingIsValid(value)).toBe(false)
  })

  it('uses the requested published translation for public reviews after the product archive becomes private', async () => {
    const find = vi.fn().mockImplementation(async ({ collection }) => {
      if (collection === 'languages') return { docs: [{ id: 2, code: 'en', enabled: true }] }
      if (collection === 'products-translations')
        return { docs: [{ subject: 42, title: 'Public English machine', _status: 'published' }] }
      throw new Error('Unexpected public lookup')
    })
    const findByID = vi
      .fn()
      .mockResolvedValue({ id: 42, title: 'Private archive', _status: 'draft' })
    const req = {
      user: null,
      query: { contentLocale: 'en' },
      payload: {
        collections: {
          languages: {},
          'products-translations': { config: { custom: { translationPaths: ['title'] } } },
        },
        find,
        findByID,
      },
    } as unknown as PayloadRequest
    const result = await prepareEquipmentReview({
      data: { product: 42, status: 'published' },
      operation: 'create',
      req,
    } as unknown as Parameters<typeof prepareEquipmentReview>[0])
    expect(result).toMatchObject({ product: 42, status: 'pending' })
    expect(await EquipmentReviews.access!.read!({ req })).toEqual({
      and: [{ status: { equals: 'published' } }, { product: { in: [42] } }],
    })
    find.mockResolvedValue({ docs: [] })
    expect(await EquipmentReviews.access!.read!({ req })).toBe(false)
    await expect(
      prepareEquipmentReview({
        data: { product: 42 },
        operation: 'create',
        req,
      } as unknown as Parameters<typeof prepareEquipmentReview>[0]),
    ).rejects.toThrow()
  })
})
