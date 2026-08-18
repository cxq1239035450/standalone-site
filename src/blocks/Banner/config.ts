import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { adminLabel } from '@/i18n/adminLabels'

export const Banner: Block = {
  slug: 'banner',
  labels: {
    singular: adminLabel('提示横幅', 'Banner'),
    plural: adminLabel('提示横幅', 'Banners'),
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      label: adminLabel('样式', 'Style'),
      defaultValue: 'info',
      options: [
        { label: adminLabel('信息', 'Info'), value: 'info' },
        { label: adminLabel('警告', 'Warning'), value: 'warning' },
        { label: adminLabel('错误', 'Error'), value: 'error' },
        { label: adminLabel('成功', 'Success'), value: 'success' },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      label: false,
      required: true,
    },
  ],
  interfaceName: 'BannerBlock',
}
