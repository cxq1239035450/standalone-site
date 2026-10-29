import type { CollectionConfig, Where } from 'payload'
import { wordpressMigration } from '@/fields/wordpressMigration'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { adminLabel } from '@/i18n/adminLabels'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: adminLabel('分类', 'Category'),
    plural: adminLabel('分类', 'Categories'),
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'taxonomy', 'slug', 'updatedAt'],
  },
  indexes: [{ fields: ['taxonomy', 'slug'], unique: true }],
  fields: [
    wordpressMigration,
    {
      name: 'taxonomy',
      type: 'select',
      required: true,
      defaultValue: 'product',
      index: true,
      label: adminLabel('分类用途', 'Taxonomy'),
      options: [
        { label: adminLabel('产品分类', 'Product category'), value: 'product' },
        { label: adminLabel('文章分类', 'Post category'), value: 'post-category' },
        { label: adminLabel('文章标签', 'Post tag'), value: 'post-tag' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: adminLabel('分类说明', 'Description'),
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      maxDepth: 1,
      label: adminLabel('父分类', 'Parent category'),
      admin: { position: 'sidebar', condition: (data) => data.taxonomy !== 'post-tag' },
      filterOptions: ({ data, id }): Where => ({
        taxonomy: { equals: data?.taxonomy || 'product' },
        ...(id ? { id: { not_equals: id }, 'breadcrumbs.doc': { not_in: [id] } } : {}),
      }),
    },
    {
      name: 'buyerGuide',
      type: 'group',
      label: 'Buyer guidance / 采购说明',
      admin: { condition: (data) => !data.taxonomy || data.taxonomy === 'product' },
      fields: [
        { name: 'summary', type: 'textarea', localized: true },
        { name: 'selectionNotes', type: 'textarea', localized: true },
        { name: 'resources', type: 'relationship', relationTo: 'equipment-content', hasMany: true },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: adminLabel('名称', 'Title'),
      required: true,
    },
    slugField({
      position: undefined,
      disableUnique: true,
    }),
  ],
}
