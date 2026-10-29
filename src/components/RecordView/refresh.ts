export const recordRefreshEvent = 'record-list-refresh'
export function refreshRecordList(slug: string, operation: 'save' | 'delete' | 'create' = 'save') {
  window.dispatchEvent(new CustomEvent(recordRefreshEvent, {detail: {slug, operation}}))
}
