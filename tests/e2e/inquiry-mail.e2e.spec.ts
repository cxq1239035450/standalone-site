import { test, expect } from '@playwright/test'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

test('QQ notification settings stay disabled without credentials and retain failed test retries', async ({ page, request }) => {
  await seedTestUser()
  let original: Record<string, unknown> | undefined
  try {
    expect((await request.get(`${base}/api/inquiry-mail/status`)).status()).toBe(401)
    expect((await request.post(`${base}/api/inquiry-mail/test`)).status()).toBe(401)
    expect([401, 403]).toContain((await request.get(`${base}/api/inquiry-mail-deliveries`)).status())
    expect((await page.request.post(`${base}/api/users/login`, { data: testUser })).ok()).toBe(true)
    original = await (await page.request.get(`${base}/api/globals/inquiry-mail-settings`)).json()
    const status = await (await page.request.get(`${base}/api/inquiry-mail/status`)).json()
    // This suite must never send a real email. Success paths use a mocked SMTP adapter.
    expect(status.configured, 'Run this browser case only on the unconfigured database copy.').toBe(false)
    expect(status.enabled).toBe(false)
    expect(status.recipients).toContain('1239035450@qq.com')
    expect(status.fromName).toBe('网站询盘')
    expect(status.subjectPrefix).toBe('【网站新询盘】')
    expect((await page.request.post(`${base}/api/globals/inquiry-mail-settings`, { data: { enabled: true } })).ok()).toBe(false)
    expect((await page.request.post(`${base}/api/inquiry-mail-deliveries`, { data: { status: 'sent' } })).ok()).toBe(false)
    let releaseStatus!: () => void
    const statusReady = new Promise<void>(resolve => { releaseStatus = resolve })
    await page.route('**/api/inquiry-mail/status', async route => {
      await statusReady
      await route.continue()
    })
    await page.route('**/api/inquiry-mail/test', async route => {
      await new Promise(resolve => setTimeout(resolve, 600))
      await route.continue()
    })
    await page.goto(`${base}/admin/globals/inquiry-mail-settings`, {waitUntil: 'domcontentloaded'})
    const panel = page.getByRole('region', { name: '询盘邮件通知管理' })
    await expect(panel.getByText('正在加载邮件配置与发送记录…')).toBeVisible()
    releaseStatus()
    await expect(panel.getByText('已关闭', { exact: true })).toBeVisible()
    const initialURL = page.url()
    await panel.getByRole('button', { name: '发送测试邮件', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: '发送测试邮件', exact: true })
    await expect(dialog).toContainText('1239035450@qq.com')
    await dialog.getByRole('button', { name: '确认发送测试邮件', exact: true }).click()
    await expect(dialog.getByRole('button', { name: '正在发送…', exact: true })).toBeDisabled()
    await expect(dialog).toHaveCount(0)
    await expect(panel.locator('tbody tr').first()).toContainText('SMTP_PASS')
    const last = (await (await page.request.get(`${base}/api/inquiry-mail/status`)).json()).lastTest
    expect(last.status).toBe('failed')
    expect((await page.request.post(`${base}/api/inquiry-mail/${last.id}/confirm`)).ok()).toBe(false)
    await panel.locator('tbody tr').first().getByRole('button', { name: '重发', exact: true }).click()
    await page.getByRole('dialog', { name: '确认重发邮件', exact: true }).getByRole('button', { name: '确认重发', exact: true }).click()
    await expect.poll(async () => (await (await page.request.get(`${base}/api/inquiry-mail-deliveries/${last.id}`)).json()).attempts).toBe(2)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await panel.locator('tbody tr').first().getByRole('button', { name: '查看', exact: true }).click()
    await expect(page.getByRole('dialog', { name: '邮件发送详情', exact: true })).toContainText('SMTP_PASS')
    await page.getByRole('button', { name: '关闭邮件弹窗', exact: true }).click()
    expect(page.url()).toBe(initialURL)
    await panel.getByRole('button', { name: '编辑邮件配置', exact: true }).click()
    const editor = page.getByRole('dialog', { name: '编辑内容', exact: true })
    await expect(editor.locator('input[name="fromName"]')).toBeVisible()
    await expect(editor.locator('input[name="fromEmail"]')).toBeVisible()
    await expect(editor.locator('input[name="subjectPrefix"]')).toBeVisible()
    await editor.locator('input[name="fromName"]').fill('网站询盘（编辑验证）')
    await editor.getByRole('button', { name: /^Save$|^保存$/ }).click()
    await expect.poll(async () => (await (await page.request.get(`${base}/api/inquiry-mail/status`)).json()).fromName).toBe('网站询盘（编辑验证）')
    await expect(editor.getByRole('region', { name: '询盘邮件通知管理' }).getByText('网站询盘（编辑验证） · 邮箱待配置', { exact: true })).toBeVisible()
    await editor.getByRole('button', { name: '关闭弹窗', exact: true }).click()
    await expect(panel.getByText('网站询盘（编辑验证） · 邮箱待配置', { exact: true })).toBeVisible()
    expect(page.url()).toBe(initialURL)
    await page.screenshot({ path: '.deployment/inquiry-mail-settings.png', animations: 'disabled', fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await panel.getByRole('button', { name: '发送测试邮件', exact: true }).click()
    const bounds = await dialog.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    await page.screenshot({ path: '.deployment/inquiry-mail-mobile.png', animations: 'disabled' })
    await page.getByRole('button', { name: '关闭邮件弹窗', exact: true }).click()
  } finally {
    if (original) await page.request.post(`${base}/api/globals/inquiry-mail-settings`, { data: { ...original, enabled: false } })
    await cleanupTestUser()
  }
})
