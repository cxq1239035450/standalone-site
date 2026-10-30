import type { Field } from 'payload'

// The original fields remain in their original tables as a migration archive.
// Only these projections may override shared business data at read time.
export const translatedCollections = [
  'products',
  'posts',
  'pages',
  'categories',
  'media',
  'industry-templates',
  'forms',
] as const
export const translatedGlobals = ['header', 'footer', 'search-settings'] as const
export type ContentSource =
  (typeof translatedCollections)[number] | (typeof translatedGlobals)[number]
export const additionalFields: Record<ContentSource, string[]> = {
  products: ['general.gallery'],
  posts: [],
  pages: [],
  categories: ['title'],
  media: ['alt', 'caption'],
  'industry-templates': [],
  forms: ['title', 'fields', 'submitButtonLabel', 'confirmationMessage'],
  header: ['navItems'],
  footer: ['navItems'],
  'search-settings': ['siteName', 'organization.legalName'],
}

export function translationSlug(source: string) {
  return `${source}-translations`
}
export function isContentSource(source: string): source is ContentSource {
  return [...translatedCollections, ...translatedGlobals].includes(source as ContentSource)
}

/** Clone config, retaining editors and structured blocks but not source hooks or UI. */
function clean(field: Field): Field {
  const result = { ...field } as Field & Record<string, unknown>
  delete result.localized
  delete result.hooks
  delete result.access
  delete result.unique
  delete result.defaultValue
  delete result.virtual
  result.admin = { ...field.admin, components: undefined }
  if ('name' in field && field.name === 'technicalValues')
    result.admin = { ...result.admin, components: { Field: '@/components/TranslationParameters' } }
  if ('fields' in field) result.fields = field.fields.filter((f) => f.type !== 'ui').map(clean)
  if (field.type === 'tabs')
    result.tabs = field.tabs.map((tab) => ({
      ...tab,
      localized: false,
      fields: tab.fields.filter((f) => f.type !== 'ui').map(clean),
    }))
  if (field.type === 'blocks')
    result.blocks = field.blocks.map((block) =>
      typeof block === 'string'
        ? block
        : { ...block, fields: block.fields.filter((f) => f.type !== 'ui').map(clean) },
    )
  return result
}

export function translationFields(fields: Field[], source: ContentSource, prefix = ''): Field[] {
  return fields.flatMap((field): Field[] => {
    if (field.type === 'ui') return field.name === 'searchPreview' ? [field] : []
    if ('virtual' in field && field.virtual) return []
    const name = 'name' in field ? field.name : ''
    const path = name ? [prefix, name].filter(Boolean).join('.') : prefix
    if (('localized' in field && field.localized) || additionalFields[source].includes(path))
      return [clean(field)]
    if (field.type === 'tabs') {
      const tabs = field.tabs.flatMap((tab) => {
        const next = 'name' in tab ? [prefix, tab.name].filter(Boolean).join('.') : prefix
        const children = translationFields(tab.fields, source, next)
        return children.length ? [{ ...tab, fields: children }] : []
      })
      return tabs.length ? [{ ...field, tabs }] : []
    }
    if ('fields' in field) {
      const children = translationFields(field.fields, source, path)
      // Array rows need stable keys/structure as well as their translated labels.
      if (field.type === 'array' && children.length) return [clean(field)]
      return children.length ? [{ ...clean(field), fields: children } as Field] : []
    }
    return []
  })
}

export function fieldPaths(fields: Field[], prefix = ''): string[] {
  return fields.flatMap((field) => {
    if (field.type === 'ui') return []
    const path = 'name' in field ? [prefix, field.name].filter(Boolean).join('.') : prefix
    if (field.type === 'tabs')
      return field.tabs.flatMap((tab) =>
        fieldPaths(
          tab.fields,
          'name' in tab ? [prefix, tab.name].filter(Boolean).join('.') : prefix,
        ),
      )
    if (field.type === 'group' || field.type === 'row' || field.type === 'collapsible')
      return fieldPaths(field.fields, path)
    return path ? [path] : []
  })
}

export function getPath(object: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined,
      object,
    )
}

export function sourceRowID(id: unknown) {
  return typeof id === 'string' ? id.replace(/::language:[^:]+$/, '') : id
}

/** SQL-backed arrays use [] for an empty value; legacy reads may return null. */
export function normalizeTranslationInput(data: Record<string, unknown>, fields: Field[], language?: string | number) {
  for (const field of fields) {
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const value = 'name' in tab ? data[tab.name] : data
        if (value && typeof value === 'object') normalizeTranslationInput(value as Record<string, unknown>, tab.fields, language)
      }
      continue
    }
    if (!('name' in field)) {
      if ('fields' in field) normalizeTranslationInput(data, field.fields, language)
      continue
    }
    let value = data[field.name]
    if (value === null && (field.type === 'array' || field.type === 'blocks' || ('hasMany' in field && field.hasMany))) value = data[field.name] = []
    if ((field.type === 'array' || field.type === 'blocks') && Array.isArray(value) && language) {
      for (const row of value) {
        if (row.id) row.id = `${sourceRowID(row.id)}::language:${language}`
      }
    }
    if (field.type === 'blocks' && Array.isArray(value)) {
      for (const row of value) {
        const block = field.blocks.find(block => typeof block !== 'string' && block.slug === row.blockType)
        if (block && typeof block !== 'string') normalizeTranslationInput(row, block.fields, language)
      }
    } else if ('fields' in field && value && typeof value === 'object') {
      for (const row of Array.isArray(value) ? value : [value]) normalizeTranslationInput(row as Record<string, unknown>, field.fields, language)
    }
  }
  return data
}
export function setPath(object: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split('.')
  let target = object
  for (const key of keys.slice(0, -1)) {
    if (!target[key] || typeof target[key] !== 'object') target[key] = {}
    target = target[key] as Record<string, unknown>
  }
  target[keys[keys.length - 1]] = value
}
export function projectTranslation(document: Record<string, unknown>, paths: string[]) {
  const result: Record<string, unknown> = {}
  for (const path of paths) setPath(result, path, getPath(document, path) ?? null)
  return result
}
export function mergeTranslation(
  base: Record<string, unknown>,
  translation: Record<string, unknown>,
  paths: string[],
) {
  const result = structuredClone(base)
  for (const key of ['mailEnabled', 'mailMode', 'mailRecipients', 'mailSubject', 'mailReplyField', 'mailLegacy']) delete result[key]
  for (const path of paths) setPath(result, path, getPath(translation, path) ?? null)
  if (paths.includes('general.gallery')) {
    const shared = getPath(base, 'general.gallery') as Array<Record<string, unknown>> | undefined
    const localized = getPath(translation, 'general.gallery') as
      Array<Record<string, unknown>> | undefined
    setPath(
      result,
      'general.gallery',
      shared?.map((row) => ({
        ...row,
        caption: localized?.find((item) => sourceRowID(item.id) === sourceRowID(row.id))?.caption ?? null,
      })) || [],
    )
  }
  if (paths.includes('fields') && Array.isArray(base.fields)) {
    const rows = Array.isArray(translation.fields)
      ? (translation.fields as Record<string, unknown>[])
      : []
    result.fields = (base.fields as Record<string, unknown>[]).map((row) => {
      const translated = rows.find((item) =>
        row.key ? item.key === row.key : row.name ? item.name === row.name : sourceRowID(item.id) === sourceRowID(row.id),
      )
      const merged: Record<string, unknown> = {
        ...translated,
        id: row.id,
        key: row.key,
        name: row.name,
        type: row.type,
        blockType: row.blockType,
        required: row.required,
      }
      if (row.key)
        Object.assign(merged, {
          label: translated?.label ?? null,
          unit: translated?.unit ?? null,
          placeholder: translated?.placeholder ?? null,
        })
      if (Array.isArray(row.options))
        merged.options = row.options.map((option) => ({
          ...option,
          label:
            (translated?.options as Record<string, unknown>[] | undefined)?.find(
              (item) => item.value === option.value,
            )?.label ?? null,
        }))
      return merged
    })
  }
  result._status = translation._status
  return result
}
