// @vitest-environment node
import 'dotenv/config'
import fs from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { BasePayload, createLocalReq } from 'payload'
import { expect, it, vi } from 'vitest'

const { sendMail, close } = vi.hoisted(() => ({ sendMail: vi.fn(), close: vi.fn() }))
vi.mock('node:dns/promises', () => ({lookup: vi.fn(async () => ({address: '127.0.0.1', family: 4}))}))
vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail, close }) } }))
import config from '@payload-config'
import { createContentReader } from '@/i18n/content'
import { migrateFormMail } from '@/scripts/formMailMigration'
import { migrateInquiryMail, inquiryMailMigrationName } from '@/scripts/inquiryMailMigration'
import { confirmTestMail, deliverMail, mailStatus, testMail } from '@/email/service'

it('migrates mail safely and isolates private settings, confirmed activation, outbox and retry', async () => {
  vi.stubEnv('SMTP_USER', '')
  vi.stubEnv('SMTP_PASS', '')
  vi.stubEnv('SMTP_HOST', 'smtp.qq.com')
  vi.stubEnv('SMTP_PORT', '465')
  vi.stubEnv('SMTP_SECURE', 'true')
  vi.stubEnv('INQUIRY_EMAIL_AUTORUN', 'false')
  const database = new PGlite()
  const payload = new BasePayload()
  try {
    for (const name of ['20260818_035022', '20261028_143927_dynamic_languages', '20261029_171455_seo_discovery']) {
      const source = await fs.readFile(`src/migrations/${name}.ts`, 'utf8')
      await database.exec(source.match(/sql`([\s\S]*?)`/)![1])
    }
    await payload.init({ config, disableDBConnect: true, disableOnInit: true })
    const pool = {
      async query(query: string | { text: string; rowMode?: string }, values?: unknown[]) {
        const text = typeof query === 'string' ? query : query.text
        const result = text.trim().startsWith('CREATE TYPE') ? (await database.exec(text)).at(-1)! : await database.query(text, values)
        const rows = result.rows.map(row => Object.fromEntries(Object.entries(row as Record<string, unknown>).map(([key, value]) => [key, value instanceof Date ? value.toISOString() : value])))
        return { ...result, rows: typeof query === 'object' && query.rowMode === 'array' ? rows.map(row => result.fields.map(field => row[field.name])) : rows, rowCount: result.affectedRows || rows.length }
      },
      async connect() { return this }, release() {}, prependListener() {}, on() {}, async end() {},
    }
    Object.assign(payload.db, { pool })
    await payload.db.connect!()
    expect((await migrateInquiryMail(payload)).state).toBe('ready')
    expect((await database.query('SELECT name FROM payload_migrations')).rows).toHaveLength(0)
    expect((await migrateInquiryMail(payload, true)).state).toBe('applied')
    expect((await migrateInquiryMail(payload, true)).state).toBe('already-applied')
    expect((await database.query('SELECT name FROM payload_migrations')).rows).toEqual([{ name: inquiryMailMigrationName }])
    await database.exec("INSERT INTO forms (title) VALUES ('Legacy mail form')")
    await migrateFormMail(payload, true)
    expect((await database.query('SELECT mail_enabled, mail_legacy FROM forms')).rows).toEqual([{mail_enabled: true, mail_legacy: true}])
    const settings = await payload.findGlobal({ slug: 'inquiry-mail-settings' })
    expect(settings).toMatchObject({ enabled: false, fromName: '网站询盘', subjectPrefix: '【网站新询盘】', recipients: [{ email: '1239035450@qq.com' }] })
    await expect(payload.findGlobal({ slug: 'inquiry-mail-settings', overrideAccess: false })).rejects.toThrow()
    await expect(payload.find({ collection: 'inquiry-mail-deliveries', overrideAccess: false })).rejects.toThrow()
    await expect(payload.updateGlobal({ slug: 'inquiry-mail-settings', data: { enabled: true } })).rejects.toThrow()
    const failed = await testMail(payload)
    expect(failed).toMatchObject({ kind: 'test', status: 'failed', attempts: 1 })
    expect(failed.lastError).toContain('SMTP_PASS')
    expect(sendMail).not.toHaveBeenCalled()
    await expect(confirmTestMail(payload, failed.id)).rejects.toThrow()

    vi.stubEnv('SMTP_USER', 'sender@qq.com')
    vi.stubEnv('SMTP_PASS', 'test-only-secret-never-used')
    await payload.updateGlobal({ slug: 'inquiry-mail-settings', data: { fromEmail: 'sender@qq.com', recipients: [{ email: 'first@qq.com' }, { email: 'second@qq.com' }] } })
    await expect(payload.updateGlobal({ slug: 'inquiry-mail-settings', data: { enabled: true } })).rejects.toThrow('测试')
    await expect(payload.updateGlobal({ slug: 'inquiry-mail-settings', data: { fromName: 'Header\r\nInjected' } })).rejects.toThrow()
    await expect(payload.updateGlobal({ slug: 'inquiry-mail-settings', data: { recipients: [{ email: 'FIRST@qq.com' }, { email: 'first@qq.com' }] } })).rejects.toThrow()
    sendMail.mockResolvedValue({ accepted: ['first@qq.com', 'second@qq.com'], rejected: [], messageId: 'mock-message' })
    const sentTest = await testMail(payload)
    expect(sentTest.status).toBe('sent')
    expect((await mailStatus(payload)).canEnable).toBe(false)
    await expect(payload.updateGlobal({ slug: 'inquiry-mail-settings', data: { enabled: true } })).rejects.toThrow('确认')
    await confirmTestMail(payload, sentTest.id)
    expect((await mailStatus(payload)).canEnable).toBe(true)
    await payload.updateGlobal({ slug: 'inquiry-mail-settings', data: { enabled: true } })
    await expect(payload.updateGlobal({ slug: 'inquiry-mail-settings', data: { subjectPrefix: '新前缀' } })).rejects.toThrow('重新测试')

    const user = await payload.create({ collection: 'users', data: { email: 'mail-test@example.test', password: 'test-password-only' } })
    const req = await createLocalReq({ user: { ...user, collection: 'users' }, context: { disableRevalidate: true, languageMigration: true } }, payload)
    await expect(payload.update({ collection: 'inquiry-mail-deliveries', id: failed.id, data: { status: 'sent' }, user: req.user, overrideAccess: false })).rejects.toThrow()
    await expect(payload.delete({ collection: 'inquiry-mail-deliveries', id: failed.id, user: req.user, overrideAccess: false })).rejects.toThrow()
    const language = await payload.create({ collection: 'languages', req, data: { code: 'zh', label: '中文', direction: 'ltr', enabled: true } })
    await payload.updateGlobal({ slug: 'language-settings', req, data: { defaultLanguage: language.id } })
    const fields = [{ blockType: 'email' as const, name: 'email', label: '邮箱', required: true }]
    const form = await payload.create({ collection: 'forms', req, data: { title: '询盘测试', fields, submitButtonLabel: '提交' } })
    await payload.create({ collection: 'forms-translations', req, data: { subject: form.id, language: language.id, title: '询盘测试', fields, submitButtonLabel: '提交', _status: 'published' } })
    const formTest = await testMail(payload, form.id)
    await confirmTestMail(payload, formTest.id)
    await payload.update({collection: 'forms', id: form.id, data: {mailEnabled: true}, req})
    sendMail.mockClear()
    const submission = await payload.create({ collection: 'form-submissions', req, data: { form: form.id, contentLocale: 'zh', submissionData: [{ field: 'email', value: 'buyer@example.test' }] } })
    expect(sendMail).not.toHaveBeenCalled()
    const records = await payload.find({ collection: 'inquiry-mail-deliveries', where: { submission: { equals: submission.id } }, depth: 0 })
    expect(records.docs).toHaveLength(1)
    const delivery = records.docs[0]
    expect(delivery).toMatchObject({ status: 'pending', dedupeKey: `submission:${submission.id}` })
    const jobs = await payload.find({ collection: 'payload-jobs', where: { taskSlug: { equals: 'sendInquiryMail' } } })
    expect(jobs.docs).toHaveLength(1)
    expect(jobs.docs[0].input).toEqual({ deliveryID: delivery.id })
    await expect(payload.create({ collection: 'inquiry-mail-deliveries', data: { ...delivery, id: undefined } })).rejects.toThrow()
    sendMail.mockResolvedValueOnce({ accepted: ['first@qq.com'], rejected: ['second@qq.com'], messageId: 'partial' })
    const partial = await deliverMail(payload, delivery.id)
    expect(partial.status).toBe('failed')
    expect(partial.acceptedRecipients).toEqual(['first@qq.com'])
    sendMail.mockResolvedValueOnce({ accepted: ['second@qq.com'], rejected: [], messageId: 'retry' })
    const retried = await deliverMail(payload, delivery.id, true)
    expect(retried.status).toBe('sent')
    expect(sendMail.mock.calls.at(-1)![0].to).toEqual(['second@qq.com'])
    const calls = sendMail.mock.calls.length
    expect((await deliverMail(payload, delivery.id)).status).toBe('sent')
    expect(sendMail).toHaveBeenCalledTimes(calls)
    await payload.jobs.run({ queue: 'inquiry-mail', limit: 10 })
    expect(sendMail).toHaveBeenCalledTimes(calls)
    expect((await payload.find({ collection: 'payload-jobs', where: { id: { equals: jobs.docs[0].id } } })).docs).toHaveLength(0)

    // Per-form routing overrides recipients, tests are isolated, and reply-to stays the customer's email.
    const custom = await payload.create({collection: 'forms', req, data: {title: '独立转发表单', fields, mailMode: 'custom', mailRecipients: 'sales@qq.com\nsales@qq.com', mailSubject: '销售询盘', mailReplyField: 'email'}})
    expect(custom.mailEnabled).toBe(false)
    await payload.create({collection: 'forms-translations', req, data: {subject: custom.id, language: language.id, title: '独立转发表单', fields, submitButtonLabel: '提交', _status: 'published'}})
    const publicForm = await createContentReader(payload).findByID({collection: 'forms', id: custom.id, locale: 'zh', depth: 0})
    expect(publicForm).not.toHaveProperty('mailRecipients')
    expect(publicForm).not.toHaveProperty('mailReplyField')
    await expect(payload.update({collection: 'forms', id: custom.id, req, data: {mailEnabled: true}})).rejects.toThrow('测试')
    sendMail.mockResolvedValue({accepted: ['sales@qq.com'], rejected: [], messageId: 'custom'})
    const customTest = await testMail(payload, custom.id)
    await expect(payload.update({collection: 'forms', id: custom.id, req, data: {mailEnabled: true}})).rejects.toThrow('确认')
    await confirmTestMail(payload, customTest.id)
    await payload.update({collection: 'forms', id: custom.id, req, data: {mailEnabled: true}})
    await expect(payload.update({collection: 'forms', id: custom.id, req, data: {mailRecipients: 'changed@qq.com'}})).rejects.toThrow('测试')
    const customSubmission = await payload.create({collection: 'form-submissions', req, data: {form: custom.id, contentLocale: 'zh', submissionData: [{field: 'email', value: 'customer@example.test'}]}})
    const customRecord = (await payload.find({collection: 'inquiry-mail-deliveries', where: {submission: {equals: customSubmission.id}}})).docs[0]
    expect(customRecord).toMatchObject({formID: custom.id, recipients: ['sales@qq.com'], replyTo: 'customer@example.test'})
    await deliverMail(payload, customRecord.id)
    expect(sendMail.mock.calls.at(-1)![0]).toMatchObject({to: ['sales@qq.com'], replyTo: 'customer@example.test'})
    await payload.update({collection: 'forms', id: custom.id, req, data: {mailEnabled: false}})
    await payload.create({collection: 'form-submissions', req, data: {form: custom.id, contentLocale: 'zh', submissionData: [{field: 'email', value: 'disabled@example.test'}]}})
    expect((await payload.find({collection: 'inquiry-mail-deliveries', where: {and: [{formID: {equals: custom.id}}, {kind: {equals: 'inquiry'}}]}})).docs).toHaveLength(1)
    // Return the SMTP mock to the baseline used by the concurrency checks below.
    sendMail.mockResolvedValue({accepted: ['first@qq.com', 'second@qq.com'], rejected: [], messageId: 'mock-message'})
    const extraCalls = sendMail.mock.calls.length - calls
    const transaction = await payload.db.beginTransaction()
    const transactionalReq = await createLocalReq({ user: req.user!, context: { disableRevalidate: true } }, payload)
    transactionalReq.transactionID = transaction!
    const rollbackSubmission = await payload.create({ collection: 'form-submissions', req: transactionalReq, data: { form: form.id, contentLocale: 'zh', submissionData: [{ field: 'email', value: 'rollback@example.test' }] } })
    await payload.db.rollbackTransaction(transaction!)
    expect((await payload.find({ collection: 'form-submissions', where: { id: { equals: rollbackSubmission.id } } })).docs).toHaveLength(0)
    expect((await payload.find({ collection: 'inquiry-mail-deliveries', where: { dedupeKey: { equals: `submission:${rollbackSubmission.id}` } } })).docs).toHaveLength(0)
    expect(sendMail).toHaveBeenCalledTimes(calls + extraCalls)
    await payload.updateGlobal({ slug: 'inquiry-mail-settings', data: { enabled: false } })
    await payload.create({ collection: 'form-submissions', req, data: { form: form.id, contentLocale: 'zh', submissionData: [{ field: 'email', value: 'disabled@example.test' }] } })
    expect((await payload.find({ collection: 'inquiry-mail-deliveries', where: { kind: { equals: 'inquiry' } } })).docs).toHaveLength(2)
    const concurrent = await payload.create({ collection: 'inquiry-mail-deliveries', data: {
      kind: 'test', dedupeKey: 'concurrent-test', status: 'pending', attempts: 0,
      recipients: sentTest.recipients, acceptedRecipients: [], fromEmail: sentTest.fromEmail, fromName: sentTest.fromName,
      subject: '并发测试', bodyText: '只发送一次', configFingerprint: sentTest.configFingerprint,
    } })
    // Manual "send now" and the worker compete for the same pending record.
    const outcomes = await Promise.allSettled([deliverMail(payload, concurrent.id, true), deliverMail(payload, concurrent.id)])
    expect(outcomes.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(outcomes.find(result => result.status === 'rejected')).toMatchObject({ reason: { status: 409 } })
    expect(sendMail).toHaveBeenCalledTimes(calls + extraCalls + 1)
    expect(await payload.findByID({ collection: 'inquiry-mail-deliveries', id: concurrent.id })).toMatchObject({ status: 'sent', attempts: 1 })
    const unclaimed = await payload.create({ collection: 'inquiry-mail-deliveries', data: {
      kind: 'test', dedupeKey: 'unclaimed-test', status: 'pending', attempts: 0,
      recipients: sentTest.recipients, acceptedRecipients: [], fromEmail: sentTest.fromEmail, fromName: sentTest.fromName,
      subject: '待发送恢复测试', bodyText: '恢复领取前中断的任务', configFingerprint: sentTest.configFingerprint,
    } })
    const claimFailure = vi.spyOn(payload.db.drizzle, 'execute').mockRejectedValueOnce(new Error('Simulated claim connection failure'))
    try {
      await expect(deliverMail(payload, unclaimed.id)).rejects.toThrow('Simulated claim connection failure')
    } finally {
      claimFailure.mockRestore()
    }
    expect(await payload.findByID({ collection: 'inquiry-mail-deliveries', id: unclaimed.id })).toMatchObject({ status: 'pending', attempts: 0 })
    expect(sendMail).toHaveBeenCalledTimes(calls + extraCalls + 1)
    expect(await deliverMail(payload, unclaimed.id, true)).toMatchObject({ status: 'sent', attempts: 1 })
    expect(sendMail).toHaveBeenCalledTimes(calls + extraCalls + 2)
    const interrupted = await payload.create({ collection: 'inquiry-mail-deliveries', data: {
      kind: 'test', dedupeKey: 'interrupted-test', status: 'sending', attempts: 1, startedAt: new Date().toISOString(),
      recipients: sentTest.recipients, acceptedRecipients: [], fromEmail: sentTest.fromEmail, fromName: sentTest.fromName,
      subject: '中断恢复测试', bodyText: '先核对收件箱再恢复', configFingerprint: sentTest.configFingerprint,
    } })
    await expect(deliverMail(payload, interrupted.id, true, true)).rejects.toMatchObject({ status: 409 })
    await payload.update({ collection: 'inquiry-mail-deliveries', id: interrupted.id, data: { startedAt: new Date(Date.now() - 180000).toISOString() } })
    await expect(deliverMail(payload, interrupted.id, true)).rejects.toMatchObject({ status: 409 })
    expect((await deliverMail(payload, interrupted.id, true, true)).status).toBe('sent')
    expect(sendMail).toHaveBeenCalledTimes(calls + extraCalls + 3)
  } finally {
    vi.unstubAllEnvs()
    await database.close()
  }
}, 60000)
