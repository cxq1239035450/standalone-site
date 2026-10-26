import type { UIField } from 'payload'

/**
 * Admin-only control for choosing which localized values are being edited.
 * This field is never persisted to the document.
 */
export const contentLanguageField = (): UIField => ({
  name: 'contentLanguageControl',
  type: 'ui',
  admin: {
    components: {
      Field: '@/components/ContentLanguageControl',
    },
    disableBulkEdit: true,
    disableListColumn: true,
  },
})
