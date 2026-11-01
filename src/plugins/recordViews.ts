import type { Plugin } from 'payload'

/** One interaction contract for all business collections and global forms. */
export const recordViewsPlugin: Plugin = (config) => {
  for (const collection of config.collections || []) {
    if (collection.slug.startsWith('payload-')) continue
    // Mail delivery records are immutable audit data. Their dedicated global
    // panel provides detail dialogs and controlled retries, without edit/delete.
    if (collection.slug === 'inquiry-mail-deliveries') {
      collection.admin = { ...collection.admin, hidden: true }
      collection.disableBulkEdit = true
      continue
    }
    if (['pages-translations', 'posts-translations', 'products-translations'].includes(collection.slug)) {
      collection.fields.push({ name: 'canonicalPreview', type: 'ui', admin: { components: { Field: '@/components/DiscoveryPanel/CanonicalField' } } })
    }
    if (collection.slug === 'search-settings-translations') {
      collection.fields.unshift({ name: 'discoveryPreview', type: 'ui', admin: { components: { Field: '@/components/DiscoveryPanel' } } })
    }
    const admin = collection.admin ||= {}
    collection.disableBulkEdit = true
    if (collection.slug === 'forms') {
      admin.defaultColumns = ['title', 'mailEnabled', 'mailMode', 'mailRecipients', 'updatedAt']
      collection.fields.unshift({ name: 'mailPanel', type: 'ui', admin: {components: {Field: '@/components/InquiryMailPanel/FormField'}} })
    }
    const components = admin.components ||= {}
    if (collection.slug === 'media') {
      components.beforeListTable = [...(components.beforeListTable || []), '@/components/PerformancePanel']
    }
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
    if (global.slug === 'search-settings') {
      global.fields.unshift({ name: 'discoveryPreview', type: 'ui', admin: { components: { Field: '@/components/DiscoveryPanel' } } })
    }
    if (global.slug === 'inquiry-mail-settings') {
      global.fields.unshift({ name: 'mailStatus', type: 'ui', admin: { components: { Field: '@/components/InquiryMailPanel' } } })
    }
    const admin = global.admin ||= {}
    const components = admin.components ||= {}
    components.views = { ...components.views, edit: {
      default: { Component: '@/components/RecordView' },
    } }
  }
  return config
}
