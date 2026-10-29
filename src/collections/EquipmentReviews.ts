import {
  ValidationError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeValidateHook,
  type CollectionConfig,
  type PayloadRequest,
  type Where,
} from 'payload'
import { adminLabel } from '@/i18n/adminLabels'

/** This project has one protected auth collection; its users are CMS administrators. */
export const isEquipmentReviewModerator = ({ req }: { req: Pick<PayloadRequest, 'user'> }) =>
  req.user?.collection === 'users'

export const reviewRatingIsValid = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5

export const prepareEquipmentReview: CollectionBeforeValidateHook = async ({
  data,
  operation,
  req,
}) => {
  if (!data) return data
  for (const field of ['authorName', 'email', 'comment'])
    if (typeof data[field] === 'string') data[field] = data[field].trim()

  if (operation === 'create' && !isEquipmentReviewModerator({ req })) {
    data.status = 'pending'
    delete data.createdAt
    delete data.updatedAt
    const id = typeof data.product === 'object' ? data.product?.id : data.product
    const numericID =
      typeof id === 'number'
        ? id
        : typeof id === 'string' && /^[1-9]\d*$/.test(id)
          ? Number(id)
          : NaN
    if (!Number.isSafeInteger(numericID) || numericID < 1)
      throw new ValidationError({
        errors: [{ path: 'product', message: 'Choose a published product to review.' }],
      })
    const product = await req.payload.findByID({
      collection: 'products',
      id: numericID,
      locale: 'en',
      depth: 0,
      disableErrors: true,
      overrideAccess: false,
      req,
    })
    if (!product || product._status !== 'published')
      throw new ValidationError({
        errors: [{ path: 'product', message: 'Choose a published product to review.' }],
      })
    data.product = product.id
  }
  return data
}

/** Enforce moderation even if callers attempt to submit the protected status field. */
export const enforceEquipmentReviewModeration: CollectionBeforeChangeHook = ({ data, req }) => {
  if (!isEquipmentReviewModerator({ req })) data.status = 'pending'
  return data
}

export const EquipmentReviews: CollectionConfig = {
  slug: 'equipment-reviews',
  labels: {
    singular: adminLabel('设备评价', 'Equipment review'),
    plural: adminLabel('设备评价审核', 'Equipment reviews'),
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['product', 'authorName', 'rating', 'status', 'createdAt'],
    description: adminLabel(
      '访客评价先进入待审核，发布后才会公开。邮箱仅后台可见。',
      'Visitor reviews require moderation. Email addresses are only visible in the admin panel.',
    ),
  },
  access: {
    create: () => true,
    read: ({ req }): boolean | Where =>
      isEquipmentReviewModerator({ req })
        ? true
        : {
            and: [
              { status: { equals: 'published' } },
              { 'product._status': { equals: 'published' } },
            ],
          },
    update: isEquipmentReviewModerator,
    delete: isEquipmentReviewModerator,
  },
  hooks: {
    beforeValidate: [prepareEquipmentReview],
    beforeChange: [enforceEquipmentReviewModeration],
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
      label: adminLabel('产品', 'Product'),
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      validate: (value: unknown) =>
        reviewRatingIsValid(value) || 'Choose a whole-number rating from 1 to 5.',
      label: adminLabel('评分', 'Rating'),
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      minLength: 1,
      maxLength: 5000,
      label: adminLabel('评价内容', 'Review'),
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      minLength: 1,
      maxLength: 100,
      label: adminLabel('姓名', 'Name'),
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      access: { read: isEquipmentReviewModerator },
      label: adminLabel('邮箱（不公开）', 'Email (private)'),
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      access: {
        create: isEquipmentReviewModerator,
        update: isEquipmentReviewModerator,
      },
      options: [
        { label: adminLabel('待审核', 'Pending review'), value: 'pending' },
        { label: adminLabel('已发布', 'Published'), value: 'published' },
      ],
      admin: { position: 'sidebar' },
      label: adminLabel('审核状态', 'Moderation status'),
    },
  ],
  timestamps: true,
}
