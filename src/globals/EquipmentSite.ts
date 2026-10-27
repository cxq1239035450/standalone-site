import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateSearchSettings } from '@/hooks/revalidateSearch'

export const EquipmentSite: GlobalConfig = {
  slug: 'equipment-site',
  label: 'Yueli website / 网站内容',
  access: { read: () => true, update: authenticated },
  hooks: { afterChange: [revalidateSearchSettings] },
  fields: [
    { name: 'name', type: 'text', required: true, defaultValue: 'Yueli Automation' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'email', type: 'email', required: true },
    { name: 'telephone', type: 'text', required: true },
    { name: 'address', type: 'textarea', required: true },
    { name: 'introduction', type: 'textarea', localized: true },
    {
      name: 'navigation',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'slides',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'href', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    {
      name: 'factoryImages',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'certificates',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    { name: 'inquiryForm', type: 'relationship', relationTo: 'forms' },
  ],
}
