// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
const { sendSMTP, findForm } = vi.hoisted(() => ({ sendSMTP: vi.fn(), findForm: vi.fn() }))
vi.mock('@/email/transport', async importOriginal => ({ ...await importOriginal<typeof import('@/email/transport')>(), sendSMTP }))
vi.mock('@/i18n/content', () => ({ createContentReader: () => ({ findByID: findForm }) }))
import { mailConfiguration, safeMailError } from '@/email/transport'
import { deliverMail, enqueueInquiryMail, testMail, validateMailSettings, type Delivery } from '@/email/service'
import { inquiryMailEndpoints } from '@/endpoints/inquiryMail'

const settings = { enabled: false, fromEmail: 'sender@qq.com', fromName: '网站询盘', subjectPrefix: '【网站新询盘】', recipients: [{ email: 'first@qq.com' }, { email: 'second@qq.com' }] }
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('SMTP_USER', 'sender@qq.com')
  vi.stubEnv('SMTP_PASS', 'test-only-not-a-real-credential')
  vi.stubEnv('SMTP_HOST', 'smtp.qq.com')
  vi.stubEnv('SMTP_PORT', '465')
  vi.stubEnv('SMTP_SECURE', 'true')
})
afterEach(() => vi.unstubAllEnvs())

function fixture(initial: Partial<Delivery> = {}) {
  let record = { id: 7, kind: 'test', status: 'pending', attempts: 0, dedupeKey: 'test:7', recipients: ['first@qq.com', 'second@qq.com'], acceptedRecipients: [], fromEmail: settings.fromEmail, fromName: settings.fromName, subject: '测试', bodyText: '正文', configFingerprint: mailConfiguration(settings).fingerprint, ...initial } as Delivery
  const raw = {
    findGlobal: vi.fn(async () => settings),
    findByID: vi.fn(async () => structuredClone(record)),
    update: vi.fn(async ({ data }) => { record = { ...record, ...data }; return structuredClone(record) }),
    create: vi.fn(async ({ data }) => { record = { id: 7, ...data }; return structuredClone(record) }),
    find: vi.fn(async (_args: unknown) => ({ docs: [] })),
    db: { drizzle: { execute: vi.fn(async () => {
      if (record.status !== 'pending' && record.status !== 'failed') return { rows: [] }
      record.status = 'sending'; record.attempts += 1
      return { rows: [{ id: 7 }] }
    }) } },
    jobs: { queue: vi.fn() },
  }
  return { payload: raw as unknown as Payload, raw, record: () => record }
}

describe('QQ inquiry notifications', () => {
  it('requires a QQ TLS endpoint and matching authorized sender, never exposing SMTP secrets in errors', () => {
    expect(mailConfiguration(settings).issues).toEqual([])
    expect(mailConfiguration({ ...settings, fromEmail: 'different@qq.com' }).issues.join(' ')).toContain('必须与 SMTP_USER')
    vi.stubEnv('SMTP_HOST', 'untrusted.example')
    expect(mailConfiguration(settings).issues.join(' ')).toContain('smtp.qq.com')
    expect(safeMailError({ code: 'EAUTH', message: 'AUTH secret-password' })).not.toContain('secret-password')
  })
  it('refuses enablement until a successful test was explicitly confirmed for the exact configuration', async () => {
    const { payload, raw } = fixture()
    const req = { payload }
    await expect(validateMailSettings({ data: { ...settings, enabled: true }, originalDoc: settings, req } as never)).rejects.toMatchObject({ status: 400 })
    raw.find.mockResolvedValueOnce({ docs: [{ status: 'sent', confirmedAt: '2026-10-30T00:00:00Z' }] } as never)
    await expect(validateMailSettings({ data: { ...settings, enabled: true }, originalDoc: settings, req } as never)).resolves.toMatchObject({ enabled: true })
    expect(raw.find.mock.calls[1][0]).toMatchObject({ where: { and: [{ kind: { equals: 'test' } }, { configFingerprint: { equals: mailConfiguration(settings).fingerprint } }] } })
  })
  it('records a failed test when credentials are missing without attempting SMTP', async () => {
    vi.stubEnv('SMTP_PASS', '')
    const { payload } = fixture()
    const result = await testMail(payload)
    expect(result.status).toBe('failed')
    expect(result.lastError).toContain('SMTP_PASS')
    expect(sendSMTP).not.toHaveBeenCalled()
  })
  it('records partial acceptance and resends only recipients not already accepted', async () => {
    const { payload } = fixture()
    sendSMTP.mockResolvedValueOnce({ accepted: ['first@qq.com'], rejected: ['second@qq.com'], messageId: 'message-1' })
    expect((await deliverMail(payload, 7)).status).toBe('failed')
    sendSMTP.mockResolvedValueOnce({ accepted: ['second@qq.com'], rejected: [], messageId: 'message-2' })
    const result = await deliverMail(payload, 7, true)
    expect(result.status).toBe('sent')
    expect(result.acceptedRecipients).toEqual(['first@qq.com', 'second@qq.com'])
    expect(sendSMTP.mock.calls[1][1].to).toEqual(['second@qq.com'])
    expect((await deliverMail(payload, 7)).status).toBe('sent')
    expect(sendSMTP).toHaveBeenCalledTimes(2)
  })
  it('claims sending atomically and logs transport failures instead of propagating SMTP errors', async () => {
    const { payload, raw } = fixture()
    sendSMTP.mockRejectedValueOnce({ code: 'EAUTH', message: 'secret-password' })
    const result = await deliverMail(payload, 7)
    expect(result.status).toBe('failed')
    expect(result.lastError).toContain('认证失败')
    expect(result.lastError).not.toContain('secret-password')
    raw.db.drizzle.execute.mockResolvedValueOnce({ rows: [] })
    await expect(deliverMail(payload, 7, true)).rejects.toMatchObject({ status: 409 })
    expect(sendSMTP).toHaveBeenCalledTimes(1)
  })
  it('retests all recipients when credentials change instead of trusting old test acknowledgements', async () => {
    const { payload } = fixture({ status: 'failed', acceptedRecipients: ['first@qq.com', 'second@qq.com'], configFingerprint: 'old-configuration' })
    sendSMTP.mockResolvedValueOnce({ accepted: ['first@qq.com', 'second@qq.com'], rejected: [], messageId: 'new-config-message' })
    expect((await deliverMail(payload, 7, true)).status).toBe('sent')
    expect(sendSMTP.mock.calls[0][1].to).toEqual(['first@qq.com', 'second@qq.com'])
  })
  it('recovers a pending inquiry after a claim database error using the current confirmed settings', async () => {
    const { payload, raw } = fixture({ kind: 'inquiry', recipients: ['old@qq.com'], configFingerprint: 'old-configuration' })
    raw.findGlobal.mockResolvedValue({ ...settings, enabled: true })
    raw.find.mockResolvedValue({ docs: [{ status: 'sent', confirmedAt: '2026-10-30T00:00:00Z' }] } as never)
    raw.db.drizzle.execute.mockRejectedValueOnce(new Error('temporary database failure'))
    await expect(deliverMail(payload, 7)).rejects.toThrow('temporary database failure')
    expect(sendSMTP).not.toHaveBeenCalled()
    sendSMTP.mockResolvedValueOnce({ accepted: ['first@qq.com', 'second@qq.com'], rejected: [], messageId: 'recovered' })
    expect((await deliverMail(payload, 7, true)).status).toBe('sent')
    expect(sendSMTP.mock.calls[0][1].to).toEqual(['first@qq.com', 'second@qq.com'])
  })
  it('keeps pending manual recovery subject to notification enablement and confirmed configuration', async () => {
    const disabled = fixture({ kind: 'inquiry' })
    expect((await deliverMail(disabled.payload, 7, true)).lastError).toContain('通知已关闭')
    const unconfirmed = fixture({ kind: 'inquiry' })
    unconfirmed.raw.findGlobal.mockResolvedValue({ ...settings, enabled: true })
    expect((await deliverMail(unconfirmed.payload, 7, true)).lastError).toContain('重新测试')
    expect(sendSMTP).not.toHaveBeenCalled()
  })
  it('sends only once when pending manual recovery competes with the background worker', async () => {
    const { payload } = fixture()
    sendSMTP.mockResolvedValueOnce({ accepted: ['first@qq.com', 'second@qq.com'], rejected: [], messageId: 'once' })
    const results = await Promise.allSettled([deliverMail(payload, 7, true), deliverMail(payload, 7)])
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.find(result => result.status === 'rejected')).toMatchObject({ reason: { status: 409 } })
    expect(sendSMTP).toHaveBeenCalledTimes(1)
  })
  it('does not create notifications while disabled and queues only after the validated submission exists', async () => {
    const { payload, raw } = fixture()
    const doc = { id: 42, form: 1, contentLocale: 'zh', submissionData: [{ field: 'company', value: '测试公司' }] }
    const req = { payload, transactionID: 'tx' }
    await enqueueInquiryMail({ doc, operation: 'create', req } as never)
    expect(raw.create).not.toHaveBeenCalled()
    raw.findGlobal.mockResolvedValueOnce({ ...settings, enabled: true })
    findForm.mockResolvedValueOnce({ title: '询盘', fields: [{ blockType: 'text', name: 'company', label: '公司' }] })
    await enqueueInquiryMail({ doc, operation: 'create', req } as never)
    expect(raw.create).toHaveBeenCalledWith(expect.objectContaining({ req, data: expect.objectContaining({ dedupeKey: 'submission:42', bodyText: expect.stringContaining('公司：测试公司') }) }))
    expect(raw.jobs.queue).toHaveBeenCalledWith({ task: 'sendInquiryMail', input: { deliveryID: 7 }, queue: 'inquiry-mail', req })
    expect(sendSMTP).not.toHaveBeenCalled()
  })
  it('protects all email operations from anonymous requests', async () => {
    for (const endpoint of inquiryMailEndpoints) await expect(endpoint.handler({ user: null } as never)).rejects.toMatchObject({ status: 401 })
  })
})
