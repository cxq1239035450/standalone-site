import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { adminLabel } from '@/i18n/adminLabels'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: adminLabel('介绍内容', 'Intro content'),
    },
    {
      name: 'populateBy',
      type: 'select',
      label: adminLabel('内容来源', 'Populate by'),
      defaultValue: 'collection',
      options: [
        {
          label: adminLabel('集合', 'Collection'),
          value: 'collection',
        },
        {
          label: adminLabel('单独选择', 'Individual selection'),
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'posts',
      label: adminLabel('要显示的集合', 'Collections to show'),
      options: [
        {
          label: adminLabel('文章', 'Posts'),
          value: 'posts',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: adminLabel('要显示的分类', 'Categories to show'),
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: adminLabel('数量限制', 'Limit'),
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: adminLabel('选择内容', 'Selection'),
      relationTo: ['posts'],
    },
  ],
  labels: {
    plural: adminLabel('内容列表', 'Archives'),
    singular: adminLabel('内容列表', 'Archive'),
  },
}
