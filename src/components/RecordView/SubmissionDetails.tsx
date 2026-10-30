'use client'

import React, { useEffect, useState } from 'react'
import { useConfig } from '@payloadcms/ui'
import './submission.css'
import InquiryMailPanel from '../InquiryMailPanel'

type Field = { name?: string; label?: string; options?: { label?: string; value?: string }[] }
type Form = { id?: number | string; title?: string; fields?: Field[] }
const display = (value: unknown): string => value == null || value === '' ? '未填写' : typeof value === 'boolean' ? value ? '是' : '否' : Array.isArray(value) ? value.map(display).join('、') : typeof value === 'object' ? JSON.stringify(value) : String(value)

export default function SubmissionDetails({ data }: { data: Record<string, unknown> }) {
  const { config } = useConfig()
  const [resolved, setResolved] = useState<{ form: Form; warning?: string }>()
  const [retry, setRetry] = useState(0)
  const formID = typeof data.form === 'object' && data.form ? (data.form as Form).id : data.form
  useEffect(() => {
    const controller = new AbortController()
    const read = async (path: string) => {
      const response = await fetch(`${config.routes.api}/${path}`, { signal: controller.signal, cache: 'no-store' })
      if (!response.ok) throw new Error('表单标签读取失败')
      return response.json()
    }
    void (async () => {
      const base: Form = typeof data.form === 'object' && data.form ? data.form as Form : await read(`forms/${encodeURIComponent(String(formID))}?depth=0`)
      if (data.contentLocale) {
        const query = new URLSearchParams({ 'where[subject][equals]': String(formID), 'where[language.code][equals]': String(data.contentLocale), depth: '0', limit: '1' })
        const translations = await read(`forms-translations?${query}`)
        if (translations.docs?.[0]) return { form: translations.docs[0] as Form }
      }
      return { form: base }
    })().then(result => { if (!controller.signal.aborted) setResolved(result) }).catch(() => {
      if (!controller.signal.aborted) setResolved({ form: typeof data.form === 'object' && data.form ? data.form as Form : {}, warning: '部分标签暂时无法读取，已保留全部提交内容。' })
    })
    return () => controller.abort()
  }, [config.routes.api, data, formID, retry])
  const rows = (data.submissionData || []) as { field: string; value: unknown; id?: string }[]
  return <section className="submission-details" aria-label="表单提交详情">
    <div className="submission-summary"><strong>{resolved?.form.title || '表单提交'}</strong><span>提交语言：{display(data.contentLocale)}</span>{typeof data.createdAt === 'string' && <span>提交时间：{new Date(data.createdAt).toLocaleString('zh-CN')}</span>}</div>
    {!resolved && <p role="status" className="record-content-loading">正在加载字段标签…</p>}
    {resolved?.warning && <p role="alert">{resolved.warning} <button type="button" onClick={() => { setResolved(undefined); setRetry(value => value + 1) }}>重新加载</button></p>}
    <div className="submission-column-head" aria-hidden="true"><span>字段标签</span><span>用户提交的内容</span></div>
    <dl className="submission-answers">{rows.map((row, index) => {
      const field = resolved?.form.fields?.find(field => field.name === row.field)
      const label = field?.label || row.field || `字段 ${index + 1}`
      const valueLabel = (value: unknown) => field?.options?.find(option => option.value === value)?.label || display(value)
      return <div key={row.id || `${row.field}-${index}`}><dt>{label}</dt><dd>{Array.isArray(row.value) ? row.value.map(valueLabel).join('、') || '未填写' : valueLabel(row.value)}</dd></div>
    })}</dl>
    {!rows.length && <p>暂无提交内容。</p>}
    {formID && data.id ? <InquiryMailPanel formID={Number(formID)} submissionID={Number(data.id)} /> : null}
    <p className="submission-note">标签取自当前表单配置；已删除的字段保留原字段名称，提交内容保持原样。</p>
  </section>
}
