import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'
import { adminLabel } from '@/i18n/adminLabels'

export const Header: GlobalConfig = {
  slug: 'header',
  label: adminLabel('页头导航', 'Header'),
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'useCustomNavigation', type: 'checkbox', defaultValue: false,
      label: adminLabel('使用下方自定义导航', 'Use custom navigation below'),
      admin: { description: adminLabel('关闭时使用宠物产品、品牌定制和采购指南导航。', 'When off, use the default product, customization and resources navigation.') },
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
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
