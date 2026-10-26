import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'
import { adminLabel } from '@/i18n/adminLabels'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: adminLabel('页脚导航', 'Footer'),
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'useCustomNavigation', type: 'checkbox', defaultValue: false,
      label: adminLabel('使用下方自定义链接', 'Use custom links below'),
      admin: { description: adminLabel('开启后替换页脚“探索更多”链接。', 'When enabled, replace the footer Explore links.') },
    },
    {
      name: 'navItems',
      type: 'array',
      label: adminLabel('导航项目', 'Navigation items'),
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
