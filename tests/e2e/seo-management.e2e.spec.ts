import { expect, test } from '@playwright/test'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

test('SEO output panels load in dialogs and expose full configuration editing', async ({ page }) => {
  await seedTestUser()
  try {
    expect((await page.request.post(`${base}/api/users/login`, { data: testUser })).ok()).toBe(true)
    await page.goto(`${base}/admin/globals/search-settings`)
    await expect(page.getByRole('heading', { name: 'SEO 输出管理' })).toBeVisible()
    const url = page.url()
    await page.route('**/api/seo/preview?**', async route => {
      await new Promise(resolve => setTimeout(resolve, 700))
      await route.continue()
    })
    for (const name of ['sitemap.xml', 'robots.txt', 'llms.txt', 'canonical']) {
      await page.locator('.discovery-card').filter({ hasText: name }).click()
      const dialog = page.getByRole('dialog')
      await expect(dialog.getByText('正在生成预览…', { exact: true })).toBeVisible()
      await expect(dialog.getByLabel('最终输出')).toBeVisible()
      await expect(dialog.getByRole('alert')).toHaveCount(0)
      await dialog.getByLabel('预览版本').selectOption('draft')
      await expect(dialog.getByLabel('最终输出')).toBeVisible()
      await expect(dialog.getByRole('alert')).toHaveCount(0)
      if (name === 'sitemap.xml') await page.screenshot({ path: '.deployment/seo-output-preview.png', animations: 'disabled' })
      await dialog.getByRole('button', { name: '关闭 SEO 预览', exact: true }).click()
      expect(page.url()).toBe(url)
    }
    await page.getByRole('button', { name: '编辑 SEO 配置', exact: true }).click()
    const editor = page.getByRole('dialog')
    await expect(editor.locator('input[name="siteUrl"]')).toBeVisible()
    await expect(editor.getByText('允许搜索引擎抓取', { exact: true })).toBeVisible()
    await expect(editor.getByText('其他爬虫规则', { exact: true })).toBeVisible()
    expect(page.url()).toBe(url)
    await page.screenshot({ path: '.deployment/seo-edit-dialog.png', animations: 'disabled' })
    await editor.locator('.discovery-card').filter({ hasText: 'robots.txt' }).click()
    const nested = page.getByRole('dialog', { name: 'robots.txt 预览', exact: true })
    await expect(nested.getByLabel('最终输出')).toBeVisible()
    await nested.getByRole('button', { name: '关闭 SEO 预览', exact: true }).click()
    await expect(editor).toBeVisible()
    await editor.getByRole('button', { name: '关闭弹窗', exact: true }).click()
    await page.setViewportSize({ width: 390, height: 844 })
    await page.locator('.discovery-card').filter({ hasText: 'robots.txt' }).click()
    await expect(nested.getByLabel('最终输出')).toBeVisible()
    const bounds = await nested.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    await page.screenshot({ path: '.deployment/seo-mobile-preview.png', animations: 'disabled' })
    await nested.getByRole('button', { name: '关闭 SEO 预览', exact: true }).click()
  } finally {
    await cleanupTestUser()
  }
})

test('SEO drafts stay private and publishing updates robots and canonical output', async ({ page, request }) => {
  await seedTestUser()
  let original: Record<string, unknown> | undefined
  let productID: number | undefined
  let translationID: number | undefined
  let originalTranslation: Record<string, unknown> | undefined
  try {
    expect((await request.get(`${base}/api/seo/preview?type=robots`)).status()).toBe(401)
    expect((await page.request.post(`${base}/api/users/login`, { data: testUser })).ok()).toBe(true)
    original = await (await page.request.get(`${base}/api/globals/search-settings?draft=false&depth=0`)).json()
    const initialRobots = await (await request.get(`${base}/robots.txt`)).text()
    const draft = await page.request.post(`${base}/api/globals/search-settings?draft=true`, {
      data: { allowCrawling: false, _status: 'draft' },
    })
    expect(draft.ok()).toBe(true)
    expect(await (await request.get(`${base}/robots.txt`)).text()).toBe(initialRobots)
    const preview = await page.request.get(`${base}/api/seo/preview?type=robots&mode=draft`)
    expect(preview.ok()).toBe(true)
    expect((await preview.json()).text).toMatch(/Disallow: \/(?:\r?\n|$)/)
    expect((await page.request.post(`${base}/api/globals/search-settings`, {
      data: { allowCrawling: false, _status: 'published' },
    })).ok()).toBe(true)
    expect(await (await request.get(`${base}/robots.txt`)).text()).toMatch(/User-Agent: \*\s+Disallow: \/(?:\r?\n|$)/i)
    // Withdrawing the global must not expose fields left in its draft base row.
    expect((await page.request.post(`${base}/api/globals/search-settings`, {
      data: { siteUrl: 'https://unpublished-seo.example', allowCrawling: true, allowIndexing: true, _status: 'draft' },
    })).ok()).toBe(true)
    const withdrawnRobots = await (await request.get(`${base}/robots.txt`)).text()
    expect(withdrawnRobots).not.toContain('unpublished-seo.example')
    expect(withdrawnRobots).toMatch(/User-Agent: \*\s+Disallow: \/(?:\r?\n|$)/i)
    expect(await (await request.get(`${base}/sitemap.xml`)).text()).not.toContain('<loc>')
    expect((await request.get(`${base}/llms.txt`)).status()).toBe(404)
    // noindex is independent from crawling; restore normal rules for the content checks.
    expect((await page.request.post(`${base}/api/globals/search-settings`, {
      data: { ...original, allowCrawling: true, allowIndexing: true, _status: 'published' },
    })).ok()).toBe(true)
    const languages = await (await page.request.get(`${base}/api/languages?where[code][equals]=zh`)).json()
    const language = languages.docs[0]
    const slug = `seo-check-${Date.now()}`
    const product = await page.request.post(`${base}/api/products`, { data: { slug, pricing: { unit: 'piece', stock: 3 } } })
    expect(product.ok()).toBe(true)
    productID = (await product.json()).doc.id
    const translation = await page.request.post(`${base}/api/products-translations`, {
      data: { subject: productID, language: language.id, title: 'SEO 回归商品', _status: 'published' },
    })
    expect(translation.ok()).toBe(true)
    translationID = (await translation.json()).doc.id
    const settingsTranslations = await (await page.request.get(`${base}/api/search-settings-translations?where[language][equals]=${language.id}&depth=0`)).json()
    originalTranslation = settingsTranslations.docs[0]
    expect(originalTranslation).toBeDefined()
    const recommendation = `精选回归-${slug}`
    const geo = { ...(originalTranslation!.geo as object), sections: [{ title: '推荐商品', links: [{ label: recommendation, content: { relationTo: 'products', value: productID } }] }] }
    expect((await page.request.patch(`${base}/api/search-settings-translations/${originalTranslation!.id}?draft=true`, {
      data: { geo, _status: 'draft' },
    })).ok()).toBe(true)
    expect(await (await request.get(`${base}/llms.txt`)).text()).not.toContain(recommendation)
    expect((await (await page.request.get(`${base}/api/seo/preview?type=llms&mode=draft&lang=zh`)).json()).text).toContain(recommendation)
    expect((await page.request.patch(`${base}/api/search-settings-translations/${originalTranslation!.id}`, {
      data: { geo, _status: 'published' },
    })).ok()).toBe(true)
    expect(await (await request.get(`${base}/llms.txt`)).text()).toContain(recommendation)
    await page.goto(`${base}/zh/products/${slug}`)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/zh/products/${slug}$`))
    expect(await (await request.get(`${base}/sitemap.xml`)).text()).toContain(`/zh/products/${slug}`)
    const canonical = `https://canonical.example/zh/products/${slug}`
    expect((await page.request.patch(`${base}/api/products-translations/${translationID}?draft=true`, {
      data: { discovery: { canonicalUrl: canonical }, _status: 'draft' },
    })).ok()).toBe(true)
    await page.reload()
    await expect(page.locator('link[rel="canonical"]')).not.toHaveAttribute('href', canonical)
    const canonicalPreview = await page.request.get(`${base}/api/seo/preview?type=canonical&mode=draft&source=products&id=${productID}&language=${language.id}`)
    expect(canonicalPreview.ok()).toBe(true)
    expect((await canonicalPreview.json()).text).toContain(canonical)
    expect((await page.request.patch(`${base}/api/products-translations/${translationID}`, {
      data: { discovery: { canonicalUrl: canonical }, _status: 'published' },
    })).ok()).toBe(true)
    await page.reload()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)
    expect(await (await request.get(`${base}/sitemap.xml`)).text()).not.toContain(`/zh/products/${slug}`)
    expect(await (await request.get(`${base}/llms.txt`)).text()).not.toContain(recommendation)
  } finally {
    if (originalTranslation) await page.request.patch(`${base}/api/search-settings-translations/${originalTranslation.id}`, { data: { ...originalTranslation, _status: 'published' } })
    if (translationID) await page.request.delete(`${base}/api/products-translations/${translationID}`)
    if (productID) await page.request.delete(`${base}/api/products/${productID}`)
    if (original) await page.request.post(`${base}/api/globals/search-settings`, { data: { ...original, _status: 'published' } })
    await cleanupTestUser()
  }
})
