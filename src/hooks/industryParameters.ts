import {
  APIError,
  ValidationError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeValidateHook,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeOperationHook,
} from 'payload'
import { localeCodes } from '@/i18n/config'

type Definition = {
  id?: string | null
  key: string
  label?: unknown
  type: string
  required?: boolean | null
  options?: { id?: string | null; value: string }[] | null
}
const reserved = new Set(['__proto__', 'constructor', 'prototype'])
const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const fail = (path: string, message: string): never => {
  throw new ValidationError({ errors: [{ path, message }] })
}

// Read the actual operation option, so REST and Local API publishing follow the same rules.
export const captureParameterPublishMode: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation === 'create' || operation === 'update') {
    req.context.industryParametersPublishAllLocales = args.publishAllLocales === true
  }
  return args
}

export function templateDefinitionError(
  fields: Definition[],
  previous: Definition[] = [],
): string | undefined {
  if (!Array.isArray(fields)) return '参数定义必须是列表 / Parameters must be a list.'
  if (fields.length > 50) return 'Maximum 50 parameters.'
  const keys = new Set<string>()
  for (const field of fields) {
    if (!record(field) || typeof field.key !== 'string')
      return '参数标识不能为空 / Parameter key is required.'
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(field.key) || reserved.has(field.key) || keys.has(field.key))
      return 'Parameter keys must be unique safe lowercase identifiers.'
    keys.add(field.key)
    const old = field.id && previous.find((item) => item.id === field.id)
    if (old && old.key !== field.key)
      return 'Existing parameter keys cannot change; add a new parameter instead.'
    if (!['text', 'number', 'select'].includes(field.type)) return 'Unsupported parameter type.'
    if (field.type === 'select') {
      const options = field.options || []
      if (!Array.isArray(options)) return '选项必须是列表 / Options must be a list.'
      if (!options.length || options.length > 100) return 'Select parameters need 1–100 options.'
      const values = new Set<string>()
      for (const option of options) {
        if (!record(option) || typeof option.value !== 'string')
          return '选项值不能为空 / Option value is required.'
        if (
          !option.value?.trim() ||
          option.value !== option.value.trim() ||
          reserved.has(option.value) ||
          values.has(option.value)
        )
          return 'Option values must be nonempty, unique and safe.'
        values.add(option.value)
        const oldOption = old && option.id && old.options?.find((item) => item.id === option.id)
        if (oldOption && oldOption.value !== option.value)
          return 'Existing option values cannot change; add a new option instead.'
      }
    }
  }
}

export function parameterValuesError(
  values: unknown,
  templateID: string,
  fields: Definition[],
  published: boolean,
): string | undefined {
  if (values != null && !record(values))
    return 'Parameters must be an object grouped by template ID.'
  for (const [id, group] of Object.entries(values || {})) {
    if (reserved.has(id) || !record(group)) return 'Invalid template parameter group.'
    for (const [key, value] of Object.entries(group)) {
      if (reserved.has(key) || typeof value !== 'string' || value.length > 10000)
        return 'Parameter values must be strings up to 10000 characters with safe keys.'
    }
  }
  const selected =
    record(values) && Object.hasOwn(values, templateID) ? values[templateID] : undefined
  for (const field of fields) {
    const raw = record(selected) && Object.hasOwn(selected, field.key) ? selected[field.key] : ''
    const value = typeof raw === 'string' ? raw.trim() : ''
    const label = typeof field.label === 'string' ? `${field.label} (${field.key})` : field.key
    if (!value) {
      if (published && field.required) return `请填写必填参数 / Required parameter: ${label}`
      continue
    }
    if (field.type === 'number' && !Number.isFinite(Number(value)))
      return `请输入有效数值 / Enter a finite number: ${label}`
    if (field.type === 'select' && !field.options?.some((option) => option.value === value))
      return `请重新选择有效选项 / Choose a configured option: ${label}`
  }
}

export const validateIndustryTemplate: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (data?.fields) {
    const error = templateDefinitionError(data.fields, originalDoc?.fields ?? [])
    if (error) fail('fields', error)
  }
  return data
}

export const protectReferencedTemplate: CollectionBeforeDeleteHook = async ({ id, req }) => {
  // Internal integrity check includes all users' products and pending drafts.
  for (const draft of [false, true]) {
    const result = await req.payload.find({
      collection: 'products',
      where: { industryTemplate: { equals: id } },
      draft,
      overrideAccess: true,
      req,
      depth: 0,
      limit: 1,
    })
    if (result.docs.length)
      throw new APIError(
        'This template is used by a product. Change its template before deleting.',
        409,
      )
  }
}

export const validateProductParameters: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const selection =
    data.industryTemplate !== undefined ? data.industryTemplate : originalDoc?.industryTemplate
  const id = record(selection) ? selection.id : selection
  const values =
    data.technicalValues !== undefined ? data.technicalValues : originalDoc?.technicalValues
  if (!id) {
    const error = parameterValuesError(values, '', [], false)
    if (error) fail('technicalValues', error)
    return data
  }
  const template = await req.payload.findByID({
    collection: 'industry-templates',
    id: id as number,
    depth: 0,
    overrideAccess: false,
    req,
    disableErrors: true,
  })
  if (!template) return fail('industryTemplate', 'Select an existing industry template.')
  const publishAllLocales = req.context.industryParametersPublishAllLocales === true
  const published = publishAllLocales || (data._status ?? originalDoc?._status) === 'published'
  const error = parameterValuesError(values, String(id), template.fields || [], published)
  if (error) fail('technicalValues', error)
  if (publishAllLocales) {
    const stored = originalDoc?.id
      ? await req.payload.findByID({
          collection: 'products',
          id: originalDoc.id,
          locale: 'all',
          draft: true,
          depth: 0,
          overrideAccess: true,
          req,
        })
      : null
    for (const locale of localeCodes) {
      if (locale === req.locale) continue
      const localized = record(stored?.technicalValues) ? stored.technicalValues[locale] : undefined
      const localeError = parameterValuesError(localized, String(id), template.fields || [], true)
      if (localeError) fail('technicalValues', `${locale}: ${localeError}`)
    }
  }
  return data
}
