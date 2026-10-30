import { createHash, randomUUID } from 'node:crypto'
import { APIError, type CollectionAfterChangeHook, type CollectionSlug, type GlobalBeforeChangeHook, type GlobalSlug, type Payload, type PayloadRequest, type TaskConfig } from 'payload'
import { sql } from '@payloadcms/db-postgres'
import { mailConfiguration, safeMailError, sendSMTP, type MailSettings } from './transport'
import { recipientList, type FormMail } from './formSettings'
import { validEmail } from './transport'
import { createContentReader } from '@/i18n/content'

const settingsSlug = 'inquiry-mail-settings' as GlobalSlug
const deliveriesSlug = 'inquiry-mail-deliveries' as CollectionSlug
export type Delivery = {
  id: number; kind: 'test' | 'inquiry'; status: 'pending' | 'sending' | 'sent' | 'failed'
  dedupeKey: string; submission?: number | null; attempts: number
  recipients: string[]; acceptedRecipients?: string[] | null; fromEmail: string; fromName: string
  subject: string; bodyText: string; configFingerprint: string; lastError?: string | null
  messageId?: string | null; sentAt?: string | null; confirmedAt?: string | null; startedAt?: string | null
  formID?: number | null; replyTo?: string | null
  createdAt?: string
}
export async function getMailSettings(payload: Payload, req?: PayloadRequest): Promise<MailSettings> {
  return await payload.findGlobal({ slug: settingsSlug, depth: 0, overrideAccess: true, ...(req ? { req } : {}) }) as unknown as MailSettings
}
export async function routing(payload: Payload, formID?: number, req?: PayloadRequest, candidate?: FormMail) {
  const global = await getMailSettings(payload, req)
  const form = candidate || (formID ? await payload.findByID({ collection: 'forms', id: formID, depth: 0, overrideAccess: true, ...(req ? {req} : {}) }) as FormMail : undefined)
  const settings = { ...global, ...(form?.mailMode === 'custom' ? { recipients: recipientList(form.mailRecipients).map(email => ({email})) } : {}), ...(form?.mailSubject ? {subjectPrefix: form.mailSubject} : {}) }
  const config = mailConfiguration(settings)
  if (form && !(form.mailLegacy && form.mailMode === 'inherit' && !form.mailSubject && !form.mailReplyField)) config.fingerprint = createHash('sha256').update(JSON.stringify([config.fingerprint, form.id, form.mailReplyField || ''])).digest('hex')
  return { global, form, settings, config }
}
export async function validateFormActivation(payload: Payload, form: FormMail, req?: PayloadRequest) {
  const {config} = await routing(payload, form.id, req, form)
  if (config.issues.length || !await confirmedTest(payload, config, req)) throw new APIError('请先关闭并保存本表单转发配置，发送测试邮件并确认收信，再开启转发。', 400)
}
async function latestTest(payload: Payload, fingerprint: string, req?: PayloadRequest) {
  const result = await payload.find({ collection: deliveriesSlug, depth: 0, limit: 1, sort: '-createdAt', overrideAccess: true, ...(req ? { req } : {}), where: { and: [{ kind: { equals: 'test' } }, { configFingerprint: { equals: fingerprint } }] } })
  return result.docs[0] as unknown as Delivery | undefined
}
async function confirmedTest(payload: Payload, configuration: ReturnType<typeof mailConfiguration>, req?: PayloadRequest) {
  const last = await latestTest(payload, configuration.fingerprint, req)
  return Boolean(last?.status === 'sent' && last.confirmedAt)
}
export const validateMailSettings: GlobalBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const next = { ...originalDoc, ...data } as MailSettings
  if (next.enabled) {
    const config = mailConfiguration(next)
    if (config.issues.length) throw new APIError(config.issues.join(' '), 400)
    if (!await confirmedTest(req.payload, config, req)) throw new APIError('请先保存关闭状态的配置，发送测试邮件并确认已收信，再开启通知。配置或授权码变更后需重新测试。', 400)
  }
  return data
}
export async function mailStatus(payload: Payload, formID?: number) {
  const {config, form, global} = await routing(payload, formID)
  const last = await latestTest(payload, config.fingerprint)
  return {
    configured: config.issues.length === 0, enabled: Boolean(global.enabled && (!form || form.mailEnabled)),
    globalEnabled: Boolean(global.enabled), formEnabled: form ? Boolean(form.mailEnabled) : undefined,
    fromEmail: config.fromEmail, fromName: config.fromName, recipients: config.recipients, subjectPrefix: config.subjectPrefix,
    configurationIssues: config.issues,
    lastTest: last ? { id: last.id, status: last.status, lastError: last.lastError, sentAt: last.sentAt, confirmedAt: last.confirmedAt, createdAt: last.createdAt, startedAt: last.startedAt } : null,
    canEnable: !config.issues.length && last?.status === 'sent' && Boolean(last.confirmedAt),
    workerMode: config.issues.length ? 'unconfigured' : process.env.INQUIRY_EMAIL_AUTORUN !== 'true' || Boolean(process.env.VERCEL) ? 'external' : 'automatic',
  }
}
export function publicDelivery(delivery: Delivery) {
  const result = { ...delivery } as Partial<Delivery>
  delete result.configFingerprint
  return result
}
async function readDelivery(payload: Payload, id: number) {
  return await payload.findByID({ collection: deliveriesSlug, id, depth: 0, overrideAccess: true }) as unknown as Delivery
}
async function updateDelivery(payload: Payload, id: number, data: Partial<Delivery>) {
  return await payload.update({ collection: deliveriesSlug, id, data: data as never, depth: 0, overrideAccess: true }) as unknown as Delivery
}
async function createDelivery(payload: Payload, data: Partial<Delivery>, req?: PayloadRequest) {
  return await payload.create({ collection: deliveriesSlug, data: data as never, depth: 0, overrideAccess: true, ...(req ? { req } : {}) }) as unknown as Delivery
}

/** Atomic claim is committed before SMTP. No database transaction spans a network send. */
export async function deliverMail(payload: Payload, id: number, retry = false, confirmUncertain = false) {
  const claimed = await payload.db.drizzle.execute(sql`
    UPDATE inquiry_mail_deliveries SET status = 'sending', attempts = COALESCE(attempts, 0) + 1,
      started_at = now(), updated_at = now(), last_error = NULL
    WHERE id = ${id} AND (status = 'pending' OR (${retry} AND status = 'failed')
      OR (${retry && confirmUncertain} AND status = 'sending' AND started_at < now() - interval '2 minutes')) RETURNING id
  `)
  if (!claimed.rows.length) {
    const current = await readDelivery(payload, id)
    if (!retry && current.status === 'sent') return current
    throw new APIError('记录正在发送或已处理。可发送等待记录、重发失败记录，或恢复已超过两分钟且明确核对过收件箱的发送记录。', 409)
  }
  const delivery = await readDelivery(payload, id)
  let route: Awaited<ReturnType<typeof routing>>
  try { route = await routing(payload, delivery.formID || undefined) }
  catch { return updateDelivery(payload, id, {status: 'failed', lastError: '来源表单不存在或配置无法读取，未发送。'}) }
  const {settings, config, form} = route
  // A test must exercise the new transport/configuration, even when the same
  // recipients accepted a previous configuration. Inquiry retries retain the
  // recipient acknowledgements to avoid duplicate customer notifications.
  const accepted = new Set((retry && delivery.kind === 'test' && delivery.configFingerprint !== config.fingerprint
    ? [] : delivery.acceptedRecipients || []).map(email => email.toLowerCase()))
  const recipients = retry ? config.recipients : delivery.recipients
  const fields: Partial<Delivery> = retry ? { recipients, fromEmail: config.fromEmail, fromName: config.fromName, configFingerprint: config.fingerprint, confirmedAt: null,
    subject: `${config.subjectPrefix}${delivery.kind === 'test' ? ' 测试通知' : ` 询盘 #${delivery.submission || delivery.id}`}` } : {}
  let messageId = delivery.messageId
  const fail = async (lastError: string) => updateDelivery(payload, id, { ...fields, status: 'failed', lastError, acceptedRecipients: [...accepted], messageId })
  if (config.issues.length) return fail(config.issues.join(' '))
  if (delivery.kind === 'inquiry' && (!settings.enabled || (form && !form.mailEnabled))) return fail('询盘通知已关闭，未发送。重新启用后可手动重发。')
  if (delivery.kind === 'inquiry' && !await confirmedTest(payload, config)) return fail('邮件配置或授权码已变更，请重新测试并确认收信后重发。')
  if (!retry && delivery.configFingerprint !== config.fingerprint) return fail('发送配置已变更，请确认当前配置后手动重发。')
  const pending = recipients.filter(email => !accepted.has(email.toLowerCase()))
  try {
    if (pending.length) {
      const result = await sendSMTP(config, { to: pending, subject: fields.subject || delivery.subject, text: delivery.bodyText, replyTo: delivery.replyTo || undefined })
      for (const address of result.accepted) if (pending.includes(address)) accepted.add(address)
      messageId = result.messageId || messageId
      if (pending.some(email => !accepted.has(email.toLowerCase()))) return fail('部分或全部收件人被 SMTP 服务拒绝。重发时仅发送尚未被接受的收件人。')
    }
    return await updateDelivery(payload, id, { ...fields, status: 'sent', lastError: null, acceptedRecipients: [...accepted], messageId, sentAt: new Date().toISOString() })
  } catch (error) {
    return fail(safeMailError(error))
  }
}

export async function testMail(payload: Payload, formID?: number) {
  const {config} = await routing(payload, formID)
  const delivery = await createDelivery(payload, {
    kind: 'test', formID, dedupeKey: `test:${randomUUID()}`, status: 'pending', attempts: 0,
    recipients: config.recipients, acceptedRecipients: [], fromEmail: config.fromEmail, fromName: config.fromName,
    subject: `${config.subjectPrefix} 测试通知`, configFingerprint: config.fingerprint,
    bodyText: '这是一封网站询盘通知测试邮件。\n\n如果您已收到此邮件，请返回后台点击“我已收到测试邮件”，然后开启新询盘通知。\n此邮件不包含真实客户询盘。',
  })
  return deliverMail(payload, delivery.id)
}
export async function confirmTestMail(payload: Payload, id: number) {
  const record = await readDelivery(payload, id)
  const {config: configuration} = await routing(payload, record.formID || undefined)
  const latest = await latestTest(payload, configuration.fingerprint)
  if (record.kind !== 'test' || record.status !== 'sent' || record.configFingerprint !== configuration.fingerprint || latest?.id !== id) throw new APIError('只能确认当前配置最近一次成功发送的测试邮件。', 400)
  return updateDelivery(payload, id, { confirmedAt: new Date().toISOString() })
}

export const enqueueInquiryMail: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const settings = await getMailSettings(req.payload, req)
  if (!settings.enabled) return doc
  const formID = typeof doc.form === 'object' ? doc.form?.id : doc.form
  const {config: configuration, form: sharedForm} = await routing(req.payload, formID, req)
  if (!sharedForm?.mailEnabled) return doc
  const form = await createContentReader(req.payload).findByID({ collection: 'forms', id: formID, locale: doc.contentLocale, depth: 0, disableErrors: true })
  const definitions = form?.fields || []
  const formatAnswer = (row: { field: string; value: string }) => {
    const field = definitions.find(field => 'name' in field && field.name === row.field)
    if (field?.blockType === 'select') return field.options?.find(option => option.value === row.value)?.label || row.value
    if (field?.blockType === 'checkbox') return row.value === 'true' ? '是' : '否'
    return row.value || '未填写'
  }
  const labels = new Map((form?.fields || []).flatMap(field => 'name' in field && field.name ? [[field.name, 'label' in field ? String(field.label || field.name) : field.name] as const] : []))
  const body = [`新询盘 #${doc.id}`, `提交时间：${doc.createdAt || new Date().toISOString()}`, `表单：${form?.title || formID}`, `提交语言：${doc.contentLocale || '默认'}`, '',
    ...(doc.submissionData || []).map((row: { field: string; value: string }) => `${labels.get(row.field) || row.field}：${formatAnswer(row)}`)].join('\n')
  const replyValue = doc.submissionData?.find((row: {field: string; value: string}) => row.field === sharedForm.mailReplyField)?.value
  const replyTo = typeof replyValue === 'string' && validEmail(replyValue) ? replyValue : undefined
  const record = await createDelivery(req.payload, { kind: 'inquiry', formID, replyTo, dedupeKey: `submission:${doc.id}`, submission: doc.id, status: 'pending', attempts: 0,
    recipients: configuration.recipients, acceptedRecipients: [], fromEmail: configuration.fromEmail, fromName: configuration.fromName, configFingerprint: configuration.fingerprint,
    subject: `${configuration.subjectPrefix} 询盘 #${doc.id}`, bodyText: body }, req)
  await req.payload.jobs.queue({ task: 'sendInquiryMail', input: { deliveryID: record.id }, queue: 'inquiry-mail', req })
  return doc
}
export const sendInquiryMailTask: TaskConfig<{ input: { deliveryID: number }; output: { status: string } }> = {
  slug: 'sendInquiryMail', label: '发送询盘通知邮件', retries: 0,
  inputSchema: [{ name: 'deliveryID', type: 'number', required: true }],
  outputSchema: [{ name: 'status', type: 'text' }],
  handler: async ({ input, req }) => {
    const result = await deliverMail(req.payload, input.deliveryID)
    return { output: { status: result.status } }
  },
}
