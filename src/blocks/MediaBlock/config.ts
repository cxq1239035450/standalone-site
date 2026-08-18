import type { Block } from 'payload'
import { adminLabel } from '@/i18n/adminLabels'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  labels: {
    singular: adminLabel('媒体区块', 'Media block'),
    plural: adminLabel('媒体区块', 'Media blocks'),
  },
  interfaceName: 'MediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      label: adminLabel('媒体', 'Media'),
      relationTo: 'media',
      required: true,
    },
  ],
}
