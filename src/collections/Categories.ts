import type { CollectionConfig } from 'payload'
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
  },
  fields: [
    wordpressMigration,
    {
      name: 'title',
      type: 'text',
      label: adminLabel('名称', 'Title'),
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
