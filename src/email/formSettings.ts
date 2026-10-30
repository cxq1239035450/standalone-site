import type { Field, CollectionBeforeChangeHook } from 'payload'
import { APIError } from 'payload'
import { validEmail } from './transport'

export type FormMail = { id?: number; mailEnabled?: boolean | null; mailMode?: string | null; mailRecipients?: string | null; mailSubject?: string | null; mailReplyField?: string | null; mailLegacy?: boolean | null; fields?: { name?: string; blockType?: string }[] }
export const recipientList = (value?: string | null) => [...new Set((value || '').split(/[\s,;，；]+/).map(value => value.trim().toLowerCase()).filter(Boolean))]
const privateRead = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)
export const formMailFields: Field[] = [
  { name: 'mailEnabled', type: 'checkbox', defaultValue: false, label: '开启邮件转发', access: { read: privateRead }, admin: { description: '全站通知和本表单转发均开启时才发送。先关闭并保存配置，测试收信后再开启。' } },
  { name: 'mailMode', type: 'select', defaultValue: 'inherit', label: '收件方式', access: { read: privateRead }, options: [{ label: '使用全站默认邮箱', value: 'inherit' }, { label: '使用本表单指定邮箱', value: 'custom' }] },
  { name: 'mailRecipients', type: 'textarea', label: '转发邮箱', access: { read: privateRead }, admin: { description: '每行一个邮箱，最多 20 个。指定邮箱将替代全站默认收件人。', condition: data => data.mailMode === 'custom' } },
  { name: 'mailSubject', type: 'text', maxLength: 100, label: '邮件主题', access: { read: privateRead }, admin: { description: '留空沿用全站主题前缀，系统追加询盘编号。' } },
  { name: 'mailReplyField', type: 'text', label: '客户邮箱字段', access: { read: privateRead }, admin: { components: { Field: '@/components/InquiryMailPanel/ReplyField' }, description: '收件人点击回复时使用此字段的客户邮箱。' } },
  { name: 'mailLegacy', type: 'checkbox', defaultValue: false, access: { read: privateRead, create: () => false, update: () => false }, admin: { hidden: true } },
]
export const validateFormMail: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const next: FormMail = { ...originalDoc, ...data }
  if (next.mailMode === 'custom') {
    const emails = recipientList(next.mailRecipients)
    if (!emails.length || emails.length > 20 || emails.some(email => !validEmail(email))) throw new APIError('请填写 1 至 20 个有效转发邮箱。', 400)
  }
  if (/[\r\n\x00-\x1f]/.test(next.mailSubject || '')) throw new APIError('邮件主题不能包含换行或控制字符。', 400)
  if (next.mailReplyField && !next.fields?.some(field => field.name === next.mailReplyField && field.blockType === 'email')) throw new APIError('客户邮箱字段必须是当前表单中的邮箱字段。', 400)
  const changed = !originalDoc?.mailEnabled || ['mailMode', 'mailRecipients', 'mailSubject', 'mailReplyField'].some(key => (data[key] ?? originalDoc?.[key] ?? '') !== (originalDoc?.[key] ?? ''))
  if (next.mailEnabled && changed) {
    const { validateFormActivation } = await import('./service')
    await validateFormActivation(req.payload, next, req)
  }
  return data
}
