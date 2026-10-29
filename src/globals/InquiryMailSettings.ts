import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

const header = (value: string | null | undefined) =>
  !value || !/[\x00-\x1f\x7f]/.test(value) || '不能包含换行或控制字符。'

export const InquiryMailSettings: GlobalConfig = {
  slug: 'inquiry-mail-settings',
  label: '询盘邮件通知',
  admin: { group: '询盘管理', description: '先保存配置并发送测试邮件，确认实际收信后再开启新询盘通知。QQ 邮箱授权码只在服务器环境变量中配置。' },
  access: { read: authenticated, update: authenticated },
  hooks: { beforeChange: [async args => (await import('@/email/service')).validateMailSettings(args)] },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false, label: '开启新询盘通知', admin: { description: '默认关闭；需要当前配置测试发送成功并确认收信后才能开启。' } },
    { name: 'recipients', type: 'array', label: '收件邮箱', required: true, minRows: 1, maxRows: 20, defaultValue: [{ email: '1239035450@qq.com' }], validate: rows => {
      const addresses = (rows || []).map(row => String((row as {email?: string}).email || '').trim().toLowerCase())
      return new Set(addresses).size === addresses.length || '收件邮箱不能重复。'
    }, fields: [{ name: 'email', type: 'email', required: true, label: '邮箱' }] },
    { name: 'fromName', type: 'text', defaultValue: '网站询盘', required: true, maxLength: 80, label: '发件人名称', validate: header },
    { name: 'fromEmail', type: 'email', label: '发件邮箱', admin: { description: '填写已获发信授权的 QQ 邮箱，必须与服务器 SMTP_USER 一致；未配置时保留为空。' } },
    { name: 'subjectPrefix', type: 'text', defaultValue: '【网站新询盘】', required: true, maxLength: 100, label: '邮件主题前缀', validate: header },
  ],
}
