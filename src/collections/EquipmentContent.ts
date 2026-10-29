import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'

export const EquipmentContent: CollectionConfig = {
  slug: 'equipment-content',
  labels: { singular: 'Solution / buying guide', plural: 'Solutions & buying guides' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', '_status', 'updatedAt'] },
  access: {
    read: authenticatedOrPublished,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  fields: [
    { name: 'kind', type: 'select', required: true, options: ['solution', 'guide'] },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: (value: unknown) =>
        (typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) ||
        'Use lowercase words separated by hyphens.',
    },
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description:
          'A direct answer to the buyer’s main question. Also used as the search description.',
      },
    },
    {
      name: 'sections',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'heading', type: 'text', required: true, localized: true },
        { name: 'body', type: 'textarea', required: true, localized: true },
      ],
    },
    {
      name: 'questions',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true, localized: true },
        { name: 'answer', type: 'textarea', required: true, localized: true },
      ],
    },
    { name: 'relatedProducts', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'relatedCategories', type: 'relationship', relationTo: 'categories', hasMany: true },
    {
      name: 'relatedContent',
      type: 'relationship',
      relationTo: 'equipment-content',
      hasMany: true,
    },
    { name: 'noIndex', type: 'checkbox', defaultValue: false },
    {
      name: 'editorialNotes',
      type: 'textarea',
      access: { read: ({ req }) => Boolean(req.user) },
      admin: {
        description: 'Internal evidence and review notes. Never rendered on the public website.',
      },
    },
  ],
}
