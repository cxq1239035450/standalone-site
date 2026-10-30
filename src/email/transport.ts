import { createHash } from 'node:crypto'
import nodemailer from 'nodemailer'

export type MailSettings = {
  enabled?: boolean | null
  recipients?: { email: string }[] | null
  fromName?: string | null
  fromEmail?: string | null
  subjectPrefix?: string | null
}

export const cleanHeader = (value: string) => value.replace(/[\r\n\x00-\x1f]+/g, ' ').trim()
export const validEmail = (value: string) => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)
export function mailConfiguration(settings: MailSettings, env: NodeJS.ProcessEnv = process.env) {
  const user = (env.SMTP_USER || '').trim().toLowerCase()
  const password = env.SMTP_PASS || ''
  const host = (env.SMTP_HOST || 'smtp.qq.com').trim().toLowerCase()
  const port = Number(env.SMTP_PORT || 465)
  const secure = env.SMTP_SECURE === undefined ? port === 465 : env.SMTP_SECURE === 'true'
  const fromEmail = (settings.fromEmail || user).trim().toLowerCase()
  const fromName = cleanHeader(settings.fromName || '网站询盘')
  const subjectPrefix = cleanHeader(settings.subjectPrefix || '【网站新询盘】')
  const recipients = [...new Set((settings.recipients || [{ email: '1239035450@qq.com' }]).map(row => row.email.trim().toLowerCase()))]
  const issues: string[] = []
  if (!user || !validEmail(user)) issues.push('尚未配置有效的 SMTP_USER 发件邮箱。')
  if (!password) issues.push('尚未配置 SMTP_PASS 授权码。')
  if (host !== 'smtp.qq.com') issues.push('当前仅支持 QQ 邮箱 SMTP：smtp.qq.com。')
  if (![465, 587].includes(port) || (port === 465 && !secure) || (port === 587 && secure)) issues.push('请使用 465 + SSL，或 587 + STARTTLS。')
  if (!validEmail(fromEmail) || fromEmail !== user) issues.push('发件邮箱必须与 SMTP_USER 授权账号一致。')
  if (!recipients.length || recipients.length > 20 || recipients.some(email => !validEmail(email))) issues.push('请配置 1 至 20 个有效收件邮箱。')
  const fingerprint = createHash('sha256').update(JSON.stringify({ host, port, secure, user, password, fromEmail, fromName, subjectPrefix, recipients })).digest('hex')
  return { host, port, secure, user, password, fromEmail, fromName, subjectPrefix, recipients, issues, fingerprint }
}

export function safeMailError(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
  const responseCode = error && typeof error === 'object' && 'responseCode' in error ? Number(error.responseCode) : 0
  if (code === 'EAUTH') return 'QQ 邮箱认证失败，请检查发件邮箱、SMTP 服务开关及授权码。'
  if (['ETIMEDOUT', 'ETIMEOUT'].includes(code)) return 'SMTP 连接或发送超时，结果可能不确定；请核对收件箱后再重发。'
  if (['ECONNECTION', 'ECONNREFUSED', 'ESOCKET', 'EDNS', 'ENOTFOUND', 'EHOSTUNREACH'].includes(code)) return '无法连接 QQ SMTP 服务，请检查服务器网络、TLS 和端口。'
  if (code === 'EENVELOPE' || responseCode >= 500) return '邮件服务拒绝发送，请检查发件授权、收件地址或账号发送限制。'
  return '邮件发送失败，请检查 SMTP 配置或稍后重试。'
}

export async function sendSMTP(configuration: ReturnType<typeof mailConfiguration>, message: { to: string[]; subject: string; text: string }) {
  const transport = nodemailer.createTransport({
    host: configuration.host, port: configuration.port, secure: configuration.secure,
    requireTLS: true,
    auth: { user: configuration.user, pass: configuration.password },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    logger: false, debug: false,
  })
  try {
    const info = await transport.sendMail({
      from: { name: configuration.fromName, address: configuration.fromEmail },
      to: message.to, subject: cleanHeader(message.subject), text: message.text,
      disableFileAccess: true, disableUrlAccess: true,
    })
    const addresses = (rows: unknown[]) => rows.map(row => typeof row === 'string' ? row : row && typeof row === 'object' && 'address' in row ? String(row.address) : '').map(value => value.trim().toLowerCase()).filter(Boolean)
    return { accepted: addresses(info.accepted || []), rejected: addresses(info.rejected || []), messageId: info.messageId as string | undefined }
  } finally { transport.close() }
}
