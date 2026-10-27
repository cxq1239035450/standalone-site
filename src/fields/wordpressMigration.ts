import type { GroupField } from 'payload'

/** Original paths and markup are retained so the migration does not break inbound links. */
export const wordpressMigration: GroupField = {
  name: 'migration',
  type: 'group',
  label: 'WordPress migration / 原站迁移',
  fields: [
    { name: 'sourceId', type: 'number', unique: true, index: true, admin: { readOnly: true } },
    {
      name: 'sourcePath',
      type: 'text',
      index: true,
      admin: { description: 'Original public path. Keep this stable to preserve existing links.' },
    },
    { name: 'sourceURL', type: 'text', admin: { readOnly: true } },
    {
      name: 'contentHTML',
      type: 'code',
      localized: true,
      admin: {
        language: 'html',
        description:
          'Preserved source content, including specification tables. HTML is sanitized again when displayed.',
      },
    },
    { name: 'summary', type: 'textarea', localized: true },
    { name: 'attributes', type: 'json', localized: true },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
  ],
}
