import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'
import { adminLabel } from '@/i18n/adminLabels'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    label: adminLabel('列宽', 'Column size'),
    defaultValue: 'oneThird',
    options: [
      {
        label: adminLabel('三分之一', 'One third'),
        value: 'oneThird',
      },
      {
        label: adminLabel('二分之一', 'Half'),
        value: 'half',
      },
      {
        label: adminLabel('三分之二', 'Two thirds'),
        value: 'twoThirds',
      },
      {
        label: adminLabel('整行', 'Full'),
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: adminLabel('启用链接', 'Enable link'),
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  labels: {
    singular: adminLabel('文本内容', 'Content'),
    plural: adminLabel('文本内容', 'Content'),
  },
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: adminLabel('内容列', 'Columns'),
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
