'use client'
import {
  Button,
  FieldError,
  FieldLabel,
  useField,
  useFormFields,
  useFormProcessing,
  useLocale,
  useTranslation,
} from '@payloadcms/ui'
import type { JSONFieldClientProps } from 'payload'
import React, { useEffect, useState } from 'react'
import './index.scss'

type Values = Record<string, Record<string, string>>
type Template = {
  title: string
  sectionTitle?: string | null
  fields?: Array<{
    key: string
    label: string
    type: 'text' | 'number' | 'select'
    unit?: string | null
    placeholder?: string | null
    required?: boolean | null
    options?: Array<{ value: string; label: string }> | null
  }> | null
}
function relationshipID(value: unknown): string {
  const id = typeof value === 'object' && value !== null && 'id' in value ? value.id : value
  return typeof id === 'number' && Number.isSafeInteger(id) && id > 0
    ? String(id)
    : typeof id === 'string' && /^[1-9]\d*$/.test(id)
      ? id
      : ''
}
export default function IndustryParameters({ path, field, readOnly }: JSONFieldClientProps) {
  const { value, setValue, disabled, showError, errorMessage } = useField<Values | null>({ path })
  const selected = useFormFields(([fields]) => fields.industryTemplate?.value)
  const { code: locale } = useLocale()
  const { i18n } = useTranslation()
  const processing = useFormProcessing()
  const templateID = relationshipID(selected)
  const english = i18n.language === 'en'
  const [initialTemplate] = useState(templateID)
  const [retry, setRetry] = useState(0)
  const locked = Boolean(readOnly || field.admin?.readOnly || disabled || processing)
  return (
    <section className="industry-parameters field-type">
      <FieldLabel
        as="h3"
        label={field.label || (english ? 'Technical parameters' : '行业参数')}
        localized={field.localized}
      />
      <FieldError path={path} showError={showError} message={errorMessage} />
      <p className="industry-parameters__help" role="status">
        {initialTemplate !== templateID
          ? english
            ? 'Template changed. Previously entered values are retained for each template; no defaults have been filled in.'
            : '已切换模板。各模板原有参数均会保留，不会自动填写默认值。'
          : english
            ? 'Parameters are saved separately for each template and content language. Switching templates preserves previously entered values.'
            : '参数按模板与内容语言分别保存；切换模板会保留已填写的值。'}
      </p>
      {!templateID ? (
        <p className="industry-parameters__notice">
          {english
            ? 'Select an industry template above to enter parameters.'
            : '请先在上方选择行业模板，再填写对应参数。'}
        </p>
      ) : (
        <TemplateInputs
          key={`${templateID}:${locale}:${retry}`}
          templateID={templateID}
          locale={locale || 'zh'}
          english={english}
          locked={locked}
          path={path}
          values={value || {}}
          onChange={setValue}
          onRetry={() => setRetry((value) => value + 1)}
        />
      )}
    </section>
  )
}
function TemplateInputs({
  templateID,
  locale,
  english,
  locked,
  path,
  values,
  onChange,
  onRetry,
}: {
  templateID: string
  locale: string
  english: boolean
  locked: boolean
  path: string
  values: Values
  onChange: (value: Values) => void
  onRetry: () => void
}) {
  const [request, setRequest] = useState<{
    status: 'loading' | 'error' | 'ready'
    template?: Template
  }>({ status: 'loading' })
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    async function load() {
      try {
        const response = await fetch(
          `/api/industry-templates/${encodeURIComponent(templateID)}?locale=${encodeURIComponent(locale)}&depth=0`,
          { credentials: 'same-origin', signal: controller.signal },
        )
        if (!response.ok) throw new Error('Template unavailable')
        const template: Template = await response.json()
        if (
          !template ||
          typeof template.title !== 'string' ||
          (template.fields != null && !Array.isArray(template.fields))
        )
          throw new Error('Invalid template')
        if (active) setRequest({ status: 'ready', template })
      } catch {
        if (active && !controller.signal.aborted) setRequest({ status: 'error' })
      }
    }
    void load()
    return () => {
      active = false
      controller.abort()
    }
  }, [templateID, locale])
  if (request.status === 'loading')
    return (
      <p role="status" aria-live="polite">
        {english ? 'Loading template parameters…' : '正在载入模板参数…'}
      </p>
    )
  if (request.status === 'error')
    return (
      <div className="industry-parameters__notice" role="alert">
        <p>
          {english
            ? 'Unable to load the template. Check your connection and template access, then retry. Saved values have not changed.'
            : '无法载入模板，请检查连接及模板访问权限后重试。已保存的参数未改变。'}
        </p>
        <Button
          type="button"
          size="small"
          buttonStyle="secondary"
          disabled={locked}
          onClick={onRetry}
        >
          {english ? 'Retry' : '重试'}
        </Button>
      </div>
    )
  const template = request.template!
  if (!template.fields?.length)
    return (
      <p className="industry-parameters__notice">
        {english
          ? 'This template has no parameters yet. Add parameter definitions to the template first.'
          : '该模板尚未配置参数，请先在行业模板中添加参数定义。'}
      </p>
    )
  const current = values[templateID] || {}
  const update = (key: string, next: string) => {
    if (!locked) onChange({ ...values, [templateID]: { ...current, [key]: next } })
  }
  return (
    <div>
      <h4 className="industry-parameters__title">{template.sectionTitle || template.title}</h4>
      <p className="industry-parameters__help">
        {english
          ? 'Required parameters are checked when publishing. You may save an incomplete draft.'
          : '标记为必填的参数会在发布时检查；可先保存未完成的草稿。'}
      </p>
      <div className="industry-parameters__grid">
        {template.fields.map((parameter) => {
          const id = `field-${path.replace(/\./g, '__')}-${templateID}-${parameter.key}`
          const label = parameter.unit ? `${parameter.label} (${parameter.unit})` : parameter.label
          const saved = typeof current[parameter.key] === 'string' ? current[parameter.key] : ''
          const obsolete =
            parameter.type === 'select' &&
            saved &&
            !parameter.options?.some((option) => option.value === saved)
          return (
            <div key={parameter.key} className="industry-parameters__input field-type">
              <FieldLabel htmlFor={id} label={label} required={Boolean(parameter.required)} />
              {parameter.type === 'select' ? (
                <select
                  id={id}
                  value={saved}
                  disabled={locked}
                  aria-required={Boolean(parameter.required)}
                  aria-invalid={Boolean(obsolete)}
                  aria-describedby={obsolete ? `${id}-obsolete` : undefined}
                  onChange={(event) => update(parameter.key, event.target.value)}
                >
                  <option value="">
                    {parameter.placeholder || (english ? 'Select an option' : '请选择')}
                  </option>
                  {obsolete && (
                    <option value={saved}>
                      {saved} — {english ? 'option removed' : '选项已移除'}
                    </option>
                  )}
                  {parameter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  type={parameter.type === 'number' ? 'number' : 'text'}
                  step={parameter.type === 'number' ? 'any' : undefined}
                  inputMode={parameter.type === 'number' ? 'decimal' : undefined}
                  value={saved}
                  readOnly={locked}
                  aria-required={Boolean(parameter.required)}
                  placeholder={parameter.placeholder || undefined}
                  onChange={(event) => update(parameter.key, event.target.value)}
                />
              )}
              {obsolete && (
                <p className="industry-parameters__warning" id={`${id}-obsolete`}>
                  {english
                    ? 'This option was removed. Please select another option. Your saved value is retained until you change it.'
                    : '选项已移除，请重新选择；修改前仍保留原值。'}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
