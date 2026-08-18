import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { adminLabel } from '@/i18n/adminLabels'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: adminLabel('用户', 'User'),
    plural: adminLabel('用户', 'Users'),
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: adminLabel('姓名', 'Name'),
    },
  ],
  timestamps: true,
}
