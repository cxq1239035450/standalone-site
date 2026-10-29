'use client'
import React, { useEffect, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import type { JSONFieldClientProps } from 'payload'
import type { IndustryTemplate } from '@/payload-types'

export default function TranslationParameters({ path, readOnly }: JSONFieldClientProps) {
  const { value, setValue, disabled, errorMessage } = useField<
    Record<string, Record<string, string>>
  >({ path })
  const subject = useFormFields(([fields]) => fields.subject?.value)
  const language = useFormFields(([fields]) => fields.language?.value)
  const [remote, setRemote] = useState<{
    key: string
    templateID: number | null
    template?: IndustryTemplate | null
    error?: string
  }>()
  const selectionKey = JSON.stringify([subject, language])
  const data = remote?.key === selectionKey ? remote : undefined
  useEffect(() => {
    if (!subject || !language) return
    const controller = new AbortController()
    const idOf = (value: unknown) =>
      value && typeof value === 'object' && 'id' in value ? value.id : value
    fetch(`/api/translations/template?product=${idOf(subject)}&language=${idOf(language)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('无法读取行业模板')
        return response.json()
      })
      .then((result) => setRemote({ ...result, key: selectionKey }))
      .catch((error) => {
        if (error.name !== 'AbortError')
          setRemote({ key: selectionKey, templateID: null, error: error.message })
      })
    return () => controller.abort()
  }, [subject, language, selectionKey])
  if (data?.error) return <p role="alert">{data.error}</p>
  if (!data) return <p>请选择所属商品和语言以加载参数。</p>
  if (!data.templateID) return <p>请在商品共享资料中选择行业参数模板。</p>
  if (!data.template) return <p>请先创建该行业模板的当前语言翻译。</p>
  const templateID = String(data.templateID)
  const update = (key: string, text: string) =>
    setValue({ ...value, [templateID]: { ...value?.[templateID], [key]: text } })
  return (
    <section>
      <h3>{data.template.sectionTitle || '行业参数'}</h3>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {data.template.fields?.map((field) => (
        <label key={field.key} style={{ display: 'block', marginBottom: 12 }}>
          {field.label || field.key}
          {field.required ? ' *' : ''} {field.unit || ''}
          {field.type === 'select' ? (
            <select
              value={value?.[templateID]?.[field.key] || ''}
              disabled={disabled || readOnly}
              onChange={(event) => update(field.key, event.target.value)}
            >
              <option value="">请选择</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              style={{ display: 'block', width: '100%' }}
              type={field.type === 'number' ? 'number' : 'text'}
              value={value?.[templateID]?.[field.key] || ''}
              disabled={disabled || readOnly}
              placeholder={field.placeholder || ''}
              onChange={(event) => update(field.key, event.target.value)}
            />
          )}
        </label>
      ))}
    </section>
  )
}
