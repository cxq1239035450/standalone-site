import type { Block } from 'payload'
import { adminLabel } from '@/i18n/adminLabels'

export const Code: Block = {
  slug: 'code',
  labels: {
    singular: adminLabel('代码', 'Code'),
    plural: adminLabel('代码', 'Code'),
  },
  interfaceName: 'CodeBlock',
  fields: [
    {
      name: 'language',
      type: 'select',
      label: adminLabel('编程语言', 'Language'),
      defaultValue: 'typescript',
      options: [
        {
          label: 'Typescript',
          value: 'typescript',
        },
        {
          label: 'Javascript',
          value: 'javascript',
        },
        {
          label: 'CSS',
          value: 'css',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
    },
  ],
}
