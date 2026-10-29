import {test, expect} from '@playwright/test'
import {seedTestUser, cleanupTestUser, testUser} from '../helpers/seedUser'
const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
test('records open read-only details and selection opens the complete editor', async ({page}) => {
  await seedTestUser()
  let id: number | undefined
  let productID: number | undefined
  try {
    expect((await page.request.post(`${base}/api/users/login`, {data:testUser})).ok()).toBe(true)
    const response = await page.request.post(`${base}/api/languages`, {data:{code:`qaz-${Math.floor(100+Math.random()*900)}`,label:'详情编辑测试',direction:'ltr',enabled:false,sortOrder:13}})
    expect(response.ok()).toBe(true)
    id=(await response.json()).doc.id
    await page.goto(`${base}/admin/collections/languages?where[id][equals]=${id}`)
    // Slow refresh responses so loading feedback is observable, independently
    // of local database/network speed.
    await page.route('**/admin/collections/languages**', async route => {
      if (route.request().headers()['rsc'] === '1') await new Promise(resolve => setTimeout(resolve, 1200))
      await route.continue()
    })
    await page.route(`**/api/languages/${id}?**`, async route => {
      await new Promise(resolve => setTimeout(resolve, 600))
      await route.continue()
    })
    const listURL=page.url()
    await expect(page.getByRole('columnheader',{name:'操作'})).toBeVisible()
    await page.getByRole('link',{name:'详情编辑测试',exact:true}).click()
    await expect(page.getByText('正在加载详情…', {exact:true})).toBeVisible()
    await expect(page.getByText('正在加载详情…', {exact:true})).toBeHidden()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading',{name:'内容详情'})).toBeVisible()
    await expect(page.locator('input[name="label"]')).toHaveCount(0)
    await page.getByRole('button',{name:'关闭弹窗'}).click()
    await page.locator('.record-actions').getByRole('button',{name:'编辑',exact:true}).click()
    await expect(page.locator('input[name="label"]')).toBeVisible()
    await expect(page.locator('input[name="sortOrder"]')).toBeVisible()
    await page.locator('input[name="label"]').fill('完整编辑成功')
    await page.getByRole('button',{name:/^Save$|^保存$/}).click()
    await expect(page.getByText('正在刷新列表…', {exact:true})).toBeVisible()
    await expect(page.getByText('正在刷新列表…', {exact:true})).toBeHidden()
    await expect.poll(async ()=>(await (await page.request.get(`${base}/api/languages/${id}`)).json()).label).toBe('完整编辑成功')
    expect(new URL(page.url()).pathname).toBe(new URL(listURL).pathname)
    expect(new URL(page.url()).searchParams.get('where[id][equals]')).toBe(String(id))
    await page.keyboard.press('Escape')
    await expect(page.getByRole('link', {name:'完整编辑成功',exact:true})).toBeVisible()
    await page.locator('.record-actions').getByRole('button',{name:'删除',exact:true}).click()
    const product=await page.request.post(`${base}/api/products`,{data:{slug:`purge-test-${Date.now()}`,pricing:{unit:'piece',stock:9}}})
    expect(product.ok()).toBe(true)
    productID=(await product.json()).doc.id
    const translation=await page.request.post(`${base}/api/products-translations?draft=true`,{data:{subject:productID,language:id,title:'清理测试翻译',_status:'draft'}})
    expect(translation.ok()).toBe(true)
    await page.getByRole('button',{name:'确认删除',exact:true}).click()
    await expect(page.getByRole('alert')).toContainText('商品 1 条')
    await page.getByRole('checkbox',{name:'同时清空该语言的关联内容',exact:false}).check()
    await page.screenshot({path:'.deployment/language-delete-dialog.png'})
    await page.getByRole('button',{name:'清空关联内容并删除',exact:true}).click()
    await expect(page.getByText('正在刷新列表…', {exact:true})).toBeVisible()
    await expect(page.getByText('正在刷新列表…', {exact:true})).toBeHidden()
    await expect(page.locator('.record-actions')).toHaveCount(0)
    await expect(page.getByRole('link', {name:'完整编辑成功',exact:true})).toHaveCount(0)
    expect((await page.request.get(`${base}/api/products/${productID}`)).ok()).toBe(true)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    expect((await page.request.get(`${base}/api/languages/${id}`)).status()).toBe(404)
    id=undefined
    await page.goto(`${base}/admin/globals/language-settings`)
    const settingsURL=page.url()
    await page.getByRole('button',{name:'编辑',exact:true}).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog').getByRole('button',{name:/^Save$|^保存$/})).toBeVisible()
    expect(page.url()).toBe(settingsURL)
    await page.getByRole('button',{name:'关闭弹窗'}).click()
  } finally {
    if(id) await page.request.delete(`${base}/api/languages/${id}`)
    if(productID) await page.request.delete(`${base}/api/products/${productID}`)
    await cleanupTestUser()
  }
})


test('deleting the final row returns to the previous filtered page', async ({page}) => {
  await seedTestUser()
  const ids: number[] = []
  const label = `分页刷新-${Date.now()}`
  try {
    expect((await page.request.post(`${base}/api/users/login`, {data:testUser})).ok()).toBe(true)
    for (let index = 0; index < 2; index++) {
      const response = await page.request.post(`${base}/api/languages`, {data:{
        code:`qax-${Math.floor(100+Math.random()*900)}`, label:`${label}-${index}`, enabled:false, direction:'ltr', sortOrder:20,
      }})
      expect(response.ok()).toBe(true)
      ids.push((await response.json()).doc.id)
    }
    const query = new URLSearchParams({'where[label][contains]':label, limit:'1', page:'2', sort:'id'})
    await page.goto(`${base}/admin/collections/languages?${query}`)
    await expect(page.locator('.record-actions')).toHaveCount(1)
    await expect(page.getByRole('link', {name:`${label}-1`, exact:true})).toBeVisible()
    await page.locator('.record-actions').getByRole('button',{name:'删除',exact:true}).click()
    await page.getByRole('button',{name:'确认删除',exact:true}).click()
    await expect(page.getByRole('link', {name:`${label}-0`, exact:true})).toBeVisible()
    await expect(page.getByRole('link', {name:`${label}-1`, exact:true})).toHaveCount(0)
    expect(new URL(page.url()).searchParams.get('page')).toBe('1')
    expect(new URL(page.url()).searchParams.get('where[label][contains]')).toBe(label)
  } finally {
    for (const id of ids) await page.request.delete(`${base}/api/languages/${id}`)
    await cleanupTestUser()
  }
})
