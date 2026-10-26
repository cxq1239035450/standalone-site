/** Only the currently selected template is rendered; values retained for other templates are omitted. */
type SpecificationTemplate = {
  id: string | number
  sectionTitle?: string | null
  fields?: Array<{
    key: string
    label?: string | null
    type: string
    unit?: string | null
    options?: Array<{ value: string; label?: string | null }> | null
  }> | null
}

export type Specification = { key: string; label: string; value: string; unit?: string }

export function productSpecifications(
  template: SpecificationTemplate | null | undefined,
  values: unknown,
): Specification[] {
  if (!template || !values || typeof values !== 'object' || Array.isArray(values)) return []
  const selected = Object.hasOwn(values, String(template.id))
    ? (values as Record<string, unknown>)[String(template.id)]
    : undefined
  if (!selected || typeof selected !== 'object' || Array.isArray(selected)) return []
  return (template.fields ?? []).flatMap((field) => {
    const raw = Object.hasOwn(selected, field.key)
      ? (selected as Record<string, unknown>)[field.key]
      : undefined
    if (typeof raw !== 'string' || !raw.trim() || !field.label?.trim()) return []
    let value = raw.trim()
    if (field.type === 'select') {
      const option = field.options?.find((option) => option.value === value)
      if (!option?.label?.trim()) return []
      value = option.label.trim()
    } else if (field.type === 'number' && !Number.isFinite(Number(value))) return []
    return [
      { key: field.key, label: field.label.trim(), value, unit: field.unit?.trim() || undefined },
    ]
  })
}
