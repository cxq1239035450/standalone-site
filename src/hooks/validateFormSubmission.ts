import { ValidationError, type CollectionBeforeValidateHook } from 'payload'
import type { Form, FormSubmission } from '@/payload-types'
import { createContentReader } from '@/i18n/content'

export function validateSubmissionFields(fields: Form['fields'], submitted: unknown) {
  const definitions = new Map((fields || []).flatMap(field => 'name' in field && field.name ? [[field.name, field] as const] : []))
  const values = new Map<string, string>()
  const errors: { path: string; message: string }[] = []
  if (!Array.isArray(submitted)) return [{ path: 'submissionData', message: 'Submit the configured form fields.' }]
  for (const [index, row] of submitted.entries()) {
    const path = `submissionData.${index}.value`
    if (!row || typeof row.field !== 'string' || !definitions.has(row.field) || values.has(row.field)) {
      errors.push({ path, message: 'Unknown or duplicate form field.' })
      continue
    }
    const definition = definitions.get(row.field)!
    const rawValue = row.value
    const normalized = typeof rawValue === 'string'
      ? rawValue
      : definition.blockType === 'checkbox' && typeof rawValue === 'boolean'
        ? String(rawValue)
        : definition.blockType === 'number' && typeof rawValue === 'number' && Number.isFinite(rawValue)
          ? String(rawValue)
          : null
    if (normalized === null) { errors.push({ path, message: 'A valid field value is required.' }); continue }
    const value = normalized.trim()
    values.set(row.field, value)
    const maxLength = definition.blockType === 'textarea' ? 10000 : 1000
    if (value.length > maxLength) errors.push({ path, message: `Maximum length is ${maxLength} characters.` })
    if (!value) continue
    if (definition.blockType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push({ path, message: 'Enter a valid email address.' })
    if (definition.blockType === 'select' && !definition.options?.some(option => option.value === value)) errors.push({ path, message: 'Choose one of the configured options.' })
    if (definition.blockType === 'number' && !Number.isFinite(Number(value))) errors.push({ path, message: 'Enter a valid number.' })
    if (definition.blockType === 'checkbox' && !['true', 'false'].includes(value)) errors.push({ path, message: 'Enter a valid checkbox value.' })
  }
  for (const [name, field] of definitions) {
    const value = values.get(name)
    if ('required' in field && field.required && (!value || (field.blockType === 'checkbox' && value !== 'true'))) {
      errors.push({ path: 'submissionData', message: `${field.label || name} is required.` })
    }
  }
  return errors
}

export const validateFormSubmission: CollectionBeforeValidateHook<FormSubmission> = async ({ data, operation, req }) => {
  if (operation !== 'create' || !data) return data
  const id = typeof data.form === 'object' ? data.form?.id : data.form
  if (!id) throw new ValidationError({ errors: [{ path: 'form', message: 'Choose an existing form.' }] })
  const locale = (data as unknown as { contentLocale?: string }).contentLocale
  const form = await createContentReader(req.payload).findByID({ collection: 'forms', id, depth: 0, locale, overrideAccess: false, disableErrors: true })
  if (!form) throw new ValidationError({ errors: [{ path: 'form', message: 'This form is not published in the requested language.' }] })
  const errors = validateSubmissionFields(form.fields, data.submissionData)
  if (errors.length) throw new ValidationError({ errors })
  // The reusable form renderer sends booleans and numbers, whereas Payload stores textarea
  // values. Normalize only after type-aware validation, retaining false and zero verbatim.
  data.submissionData = data.submissionData?.map(row => ({ ...row, value: String(row.value).trim() }))
  return data
}
