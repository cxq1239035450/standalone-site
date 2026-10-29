import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const InquiryMailDeliveries: CollectionConfig = {
  slug: 'inquiry-mail-deliveries',
  dbName: 'inquiry_mail_deliveries',
  labels: { singular: '邮件通知记录', plural: '邮件通知记录' },
  admin: {
    group: '询盘管理', useAsTitle: 'subject',
    defaultColumns: ['kind', 'status', 'attempts', 'lastError', 'createdAt'],
    description: '发送成功表示邮件服务已接受，不代表一定进入收件箱。失败记录可在询盘邮件通知配置页手动重发。',
  },
  access: { read: authenticated, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'kind', type: 'select', required: true, label: '类型', options: [{ label: '测试邮件', value: 'test' }, { label: '新询盘', value: 'inquiry' }] },
    { name: 'dedupeKey', type: 'text', required: true, unique: true, admin: { hidden: true } },
    { name: 'submission', type: 'relationship', relationTo: 'form-submissions', label: '关联询盘' },
    { name: 'status', type: 'select', required: true, defaultValue: 'pending', label: '发送状态', options: [
      { label: '待发送', value: 'pending' }, { label: '发送中', value: 'sending' }, { label: '邮件服务已接受', value: 'sent' }, { label: '发送失败', value: 'failed' },
    ] },
    { name: 'attempts', type: 'number', defaultValue: 0, min: 0, label: '尝试次数' },
    { name: 'recipients', type: 'json', required: true, label: '收件邮箱' },
    { name: 'acceptedRecipients', type: 'json', defaultValue: [], label: '邮件服务已接受的收件人' },
    { name: 'fromEmail', type: 'text', label: '发件邮箱' },
    { name: 'fromName', type: 'text', label: '发件人名称' },
    { name: 'subject', type: 'text', required: true, label: '主题' },
    { name: 'bodyText', type: 'textarea', required: true, label: '邮件内容' },
    { name: 'configFingerprint', type: 'text', required: true, admin: { hidden: true } },
    { name: 'lastError', type: 'textarea', label: '最近失败原因' },
    { name: 'messageId', type: 'text', label: '邮件服务消息 ID' },
    { name: 'sentAt', type: 'date', label: '服务接受时间' },
    { name: 'confirmedAt', type: 'date', label: '人工确认收信时间' },
    { name: 'startedAt', type: 'date', label: '开始发送时间' },
  ],
  timestamps: true,
}
