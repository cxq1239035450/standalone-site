'use client'
import { useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
export const ReplyField: TextFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const fields = useFormFields(([fields]) => fields)
  const names = Object.entries(fields).filter(([key, field]) => /^fields\.\d+\.blockType$/.test(key) && field.value === 'email').map(([key]) => {
    const prefix = key.replace(/blockType$/, '')
    return { name: String(fields[`${prefix}name`]?.value || ''), label: String(fields[`${prefix}label`]?.value || fields[`${prefix}name`]?.value || '') }
  }).filter(field => field.name)
  return <label style={{ display: 'grid', gap: 8, margin: '20px 0' }}>客户邮箱字段<select aria-label="客户邮箱字段" value={value || ''} onChange={event => setValue(event.target.value)} style={{ padding: 12, background: 'var(--theme-input-bg)', color: 'var(--theme-text)', border: '1px solid var(--theme-elevation-200)', borderRadius: 6 }}><option value="">不设置客户回复地址</option>{names.map(field => <option key={field.name} value={field.name}>{field.label}</option>)}{value && !names.some(field => field.name === value) && <option value={value}>{value}</option>}</select><small>收到通知后点击回复，将发送至客户填写的此邮箱。</small></label>
}
export default ReplyField
