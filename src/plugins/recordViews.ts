import type { Plugin } from 'payload'

/** One interaction contract for all business collections and global forms. */
export const recordViewsPlugin: Plugin = (config) => {
  for (const collection of config.collections || []) {
    if (collection.slug.startsWith('payload-')) continue
    const admin = collection.admin ||= {}
    collection.disableBulkEdit = true
    const components = admin.components ||= {}
    components.beforeListTable = [...(components.beforeListTable || []), {
      path: '@/components/RecordView/ListModals', clientProps: { slug: collection.slug },
    }]
    collection.fields.push({ name: 'recordActions', type: 'ui', label: '操作', admin: { disableListColumn: false, components: { Cell: '@/components/RecordView/Actions' } } })
    admin.defaultColumns = [...(admin.defaultColumns || [admin.useAsTitle || 'id', 'updatedAt']), 'recordActions']
    components.views = { ...components.views, edit: {
      default: { Component: '@/components/RecordView' },
    } }
  }
  for (const global of config.globals || []) {
    const admin = global.admin ||= {}
    const components = admin.components ||= {}
    components.views = { ...components.views, edit: {
      default: { Component: '@/components/RecordView' },
    } }
  }
  return config
}
