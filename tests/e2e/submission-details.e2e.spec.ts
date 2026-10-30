import { test, expect } from '@playwright/test'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test('submission labels match stored answers in desktop and mobile dialogs', async ({ page }) => {
  test.setTimeout(180000)
  await seedTestUser()
  let formID: number | undefined
  let translationID: number | undefined
  let submissionID: number | undefined
  try {
    expect((await page.request.post('/api/users/login', { data: testUser })).ok()).toBe(true)
    const settings = await (await page.request.get('/api/inquiry-mail/status')).json()
    expect(settings.enabled, 'Use the notification-disabled test database.').toBe(false)
    const language = (await (await page.request.get('/api/languages?where[code][equals]=zh')).json()).docs[0]
    const fields = [
      { blockType: 'text', name: 'e-form-first-name', label: '名字' },
      { blockType: 'text', name: 'e-form-last-name', label: '姓氏' },
      { blockType: 'email', name: 'e-form-email', label: '联系邮箱' },
      { blockType: 'select', name: 'project-type', label: '项目类型', options: [{ label: '设备采购', value: 'equipment' }] },
      { blockType: 'textarea', name: 'message', label: '需求说明' },
      { blockType: 'text', name: 'company', label: '公司名称' },
    ]
    const create = await page.request.post('/api/forms', { data: { title: '表单详情浏览器验收', fields, submitButtonLabel: '提交' } })
    expect(create.ok()).toBe(true)
    const createdForm = (await create.json()).doc
    formID = createdForm.id
    const translated = await page.request.post('/api/forms-translations', { data: { subject: formID, language: language.id, title: '设备与项目询盘（演示数据）', fields: createdForm.fields, submitButtonLabel: '提交', _status: 'published' } })
    expect(translated.ok()).toBe(true)
    translationID = (await translated.json()).doc.id
    const answers = [ ['e-form-first-name', '小'], ['e-form-last-name', '昂科'], ['e-form-email', 'demo@example.test'], ['project-type', 'equipment'], ['message', '希望了解设备规格及交付周期。\n预计采购 10 台，请提供报价。'], ['company', ''] ]
    const submission = await page.request.post('/api/form-submissions', { data: { form: formID, contentLocale: 'zh', submissionData: answers.map(([field, value]) => ({ field, value })) } })
    expect(submission.ok(), await submission.text()).toBe(true)
    submissionID = (await submission.json()).doc.id
    await page.setViewportSize({ width: 1440, height: 1050 })
    await page.goto(`/admin/collections/form-submissions?where[id][equals]=${submissionID}`)
    await page.locator(`a[href*="/form-submissions/${submissionID}"]`).first().click()
    const dialog = page.getByRole('dialog', { name: '内容详情' })
    await expect(dialog.getByText('设备与项目询盘（演示数据）', { exact: true })).toBeVisible()
    const expected = [ ['名字', '小'], ['姓氏', '昂科'], ['联系邮箱', 'demo@example.test'], ['项目类型', '设备采购'], ['需求说明', answers[4][1]], ['公司名称', '未填写'] ]
    const rows = dialog.locator('.submission-answers > div')
    await expect(rows).toHaveCount(expected.length)
    for (let index = 0; index < expected.length; index++) {
      await expect(rows.nth(index).locator('dt')).toHaveText(expected[index][0])
      await expect(rows.nth(index).locator('dd')).toHaveText(expected[index][1])
    }
    await page.screenshot({ path: '.deployment/submission-details-desktop.png', animations: 'disabled' })
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(rows.nth(0).locator('dd')).toBeVisible()
    const bounds = await dialog.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    await page.screenshot({ path: '.deployment/submission-details-mobile.png', animations: 'disabled' })
  } finally {
    if (submissionID) await page.request.delete(`/api/form-submissions/${submissionID}`)
    if (translationID) await page.request.delete(`/api/forms-translations/${translationID}`)
    if (formID) await page.request.delete(`/api/forms/${formID}`)
    await cleanupTestUser()
  }
})
