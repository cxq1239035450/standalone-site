'use client'
import React, {useState} from 'react'
import {X} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import './modal.css'
import { Button, DefaultEditView, useConfig, useDocumentInfo } from '@payloadcms/ui'
import type { ClientField, DocumentViewClientProps } from 'payload'
import { useSearchParams } from 'next/navigation'
import DiscoveryPanel from '@/components/DiscoveryPanel'
import InquiryMailPanel from '@/components/InquiryMailPanel'

function label(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const labels = value as Record<string, string>
    return labels.zh || labels.en || fallback
  }
  return fallback
}
function plainText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const node = value as { text?: string; root?: unknown; children?: unknown[] }
  return node.text || (node.root ? plainText(node.root) : (node.children || []).map(plainText).join('\n'))
}
function scalar(value: unknown): string {
  if (value == null || value === '') return '—'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (Array.isArray(value)) return value.map(scalar).join('、') || '—'
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return scalar(record.title ?? record.name ?? record.filename ?? record.label ?? record.value ?? record.id)
  }
  return String(value)
}
export function Fields({ fields, data }: { fields: ClientField[]; data: Record<string, unknown> }) {
  return <>{fields.map((field, index) => {
    if (field.type === 'ui' || ('name' in field && ['password', 'hash', 'salt', 'resetPasswordToken'].includes(field.name)) || field.admin?.hidden) return null
    if (field.type === 'tabs') return <React.Fragment key={index}>{field.tabs.map((tab, i) => <section key={i}>
      <h3>{label(tab.label, 'name' in tab ? tab.name : '')}</h3>
      <Fields fields={tab.fields} data={('name' in tab ? data[tab.name] : data) as Record<string, unknown> || {}} />
    </section>)}</React.Fragment>
    if (!('name' in field)) return 'fields' in field ? <Fields key={index} fields={field.fields} data={data} /> : null
    const value = data[field.name]
    let content: React.ReactNode = scalar(value)
    if (field.type === 'richText') content = plainText(value) || '—'
    else if (field.type === 'json') content = <pre style={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>{JSON.stringify(value, null, 2) || '—'}</pre>
    else if (field.type === 'group') content = <Fields fields={field.fields} data={value as Record<string, unknown> || {}} />
    else if ((field.type === 'array' || field.type === 'blocks') && Array.isArray(value)) content = value.length ? value.map((row, i) => {
      const block = field.type === 'blocks' ? field.blocks.find(b => typeof b !== 'string' && b.slug === row.blockType) : null
      const children = field.type === 'array' ? field.fields : block && typeof block !== 'string' ? block.fields : []
      return <section key={row.id || i} style={{borderLeft: '2px solid var(--theme-elevation-200)', paddingLeft: 16}}><h4>#{i + 1}</h4><Fields fields={children} data={row} /></section>
    }) : '—'
    else if ((field.type === 'select' || field.type === 'radio') && field.options) {
      const optionLabel = (entry: unknown) => {
        const option = field.options.find(o => typeof o === 'string' ? o === entry : o.value === entry)
        return option && typeof option !== 'string' ? label(option.label, scalar(entry)) : scalar(entry)
      }
      content = Array.isArray(value) ? value.map(optionLabel).join('、') : optionLabel(value)
    }
    return <div key={field.name} style={{padding: '12px 0', borderBottom: '1px solid var(--theme-elevation-100)'}}>
      <strong>{label(field.label, field.name)}</strong><div style={{marginTop: 8, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>{content}</div>
    </div>
  })}</>
}
export default function RecordView(props: DocumentViewClientProps) {
  const [modalEdit, setModalEdit] = useState(false)
  const params = useSearchParams()
  const info = useDocumentInfo()
  const { getEntityConfig } = useConfig()
  const entity = getEntityConfig({collectionSlug: info.collectionSlug, globalSlug: info.globalSlug})
  const editing = info.globalSlug ? params.get('mode') === 'edit' : params.get('mode') !== 'view'
  if (editing) return <DefaultEditView {...props} />
  return <div style={{padding: '24px var(--gutter-h)', maxWidth: 1200}}>
    <header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24}}>
      <h1>{label(entity && ('labels' in entity ? entity.labels.singular : entity.label), '记录')}详情</h1>
      {info.hasSavePermission && <Button type="button" margin={false} onClick={()=>setModalEdit(true)}>编辑</Button>}
    </header>
    <p>只读详情。点击“编辑”可修改此记录的全部可编辑内容。</p>
    {info.globalSlug === 'search-settings' && <DiscoveryPanel onEdit={info.hasSavePermission ? () => setModalEdit(true) : undefined}/>}
    {info.globalSlug === 'inquiry-mail-settings' && <InquiryMailPanel refreshKey={modalEdit} onEdit={info.hasSavePermission ? () => setModalEdit(true) : undefined}/>}
    {info.globalSlug !== 'inquiry-mail-settings' && <Fields fields={entity?.fields || []} data={info.data || {}} />}
    <Dialog.Root open={modalEdit} onOpenChange={setModalEdit}><Dialog.Portal><Dialog.Overlay className="record-overlay"/><Dialog.Content className="record-modal" aria-describedby={undefined}><div className="record-modal-heading"><Dialog.Title>编辑内容</Dialog.Title><Dialog.Close className="record-icon-button" aria-label="关闭弹窗"><X size={20}/></Dialog.Close></div><DefaultEditView {...props}/></Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>
}
