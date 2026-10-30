import { test, expect } from '@playwright/test'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test('form mail settings edit in a dialog and isolate recipients and failed tests', async ({ page, request }) => {
  test.setTimeout(90000)
  await seedTestUser()
  let id: number | undefined
  try {
    expect((await request.get('/api/inquiry-mail/forms/1/status')).status()).toBe(401)
    expect((await page.request.post('/api/users/login', {data: testUser})).ok()).toBe(true)
    const created = await page.request.post('/api/forms', {data: { title: '表单独立转发验收', fields: [{blockType: 'email', name: 'customer-email', label: '客户邮箱'}], mailMode: 'custom', mailRecipients: 'sales@example.test\nsupport@example.test' }})
    expect(created.ok()).toBe(true)
    id = (await created.json()).doc.id
    const status = await (await page.request.get(`/api/inquiry-mail/forms/${id}/status`)).json()
    expect(status.configured, 'This suite must not send real email').toBe(false)
    expect(status.formEnabled).toBe(false)
    expect(status.recipients).toEqual(['sales@example.test', 'support@example.test'])
    expect((await page.request.patch(`/api/forms/${id}`, {data: {mailEnabled: true}})).ok()).toBe(false)
    await page.goto(`/admin/collections/forms?where[id][equals]=${id}`)
    await page.locator('.record-actions').getByRole('button', {name: '编辑', exact: true}).click()
    const editor = page.getByRole('dialog').last()
    await expect(editor.getByText('开启邮件转发', {exact: true})).toBeVisible()
    await editor.getByLabel('客户邮箱字段', {exact: true}).selectOption('customer-email')
    await editor.locator('input[name="mailSubject"]').fill('销售询盘')
    await editor.getByRole('button', {name: /^Save$|^保存$/}).click()
    await expect.poll(async () => (await (await page.request.get(`/api/forms/${id}?depth=0`)).json()).mailReplyField).toBe('customer-email')
    const panel = page.getByRole('region', {name: '询盘邮件通知管理'})
    await expect(panel.getByText('sales@example.test、support@example.test', {exact: true})).toBeVisible()
    await panel.getByRole('button', {name: '发送测试邮件', exact: true}).click()
    const confirm = page.getByRole('dialog', {name: '发送测试邮件', exact: true})
    await expect(confirm).toContainText('sales@example.test')
    await confirm.getByRole('button', {name: '确认发送测试邮件'}).click()
    await expect(confirm).toHaveCount(0)
    await expect(panel.locator('tbody tr').first()).toContainText('SMTP_PASS')
    const last = (await (await page.request.get(`/api/inquiry-mail/forms/${id}/status`)).json()).lastTest
    expect((await (await page.request.get(`/api/inquiry-mail-deliveries/${last.id}`)).json()).formID).toBe(id)
    await page.screenshot({path: '.deployment/form-mail-routing.png', fullPage: true, animations: 'disabled'})
  } finally {
    if (id) await page.request.delete(`/api/forms/${id}`)
    await cleanupTestUser()
  }
})
