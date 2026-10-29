import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
const messages = JSON.parse(readFileSync(new URL('../../messages/zh.json', import.meta.url), 'utf8'))

// Run only against a migrated database COPY. The language is retained disabled
// afterward because languages with existing translations cannot be deleted.
test('adds a language without restarting, edits a translation and isolates its publication', async ({ page, request }) => {
  test.skip(process.env.LANGUAGE_E2E !== '1', 'Requires LANGUAGE_E2E=1 and a migrated database copy.')
  const origin = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
  const login = await page.request.post(`${origin}/api/users/login`, { data: { email: process.env.LANGUAGE_E2E_EMAIL, password: process.env.LANGUAGE_E2E_PASSWORD } })
  expect(login.ok()).toBe(true)
  const code = `qaa-${100 + Math.floor(Math.random() * 900)}`
  const create = async (collection: string, data: unknown) => {
    const response = await page.request.post(`${origin}/api/${collection}`, { data })
    expect(response.ok(), await response.text()).toBe(true)
    return (await response.json()).doc
  }
  const language = await create('languages', { code, label: `测试语种 ${code}`, direction: 'ltr', enabled: false })
  try {
    await create('site-copy', { language: language.id, messages, _status: 'published' })
    for (const subject of ['header', 'footer']) await create(`${subject}-translations`, { subject, language: language.id, navItems: [{ link: { type: 'custom', url: '/products', label: '测试导航' } }], _status: 'published' })
    await create('search-settings-translations', { subject: 'search-settings', language: language.id, siteName: 'Language test', description: 'Language test', _status: 'published' })
    expect((await page.request.patch(`${origin}/api/languages/${language.id}`, { data: { enabled: true } })).ok()).toBe(true)
    const slug = `language-test-${Date.now()}`
    const product = await create('products', { slug, pricing: { unit: 'piece', stock: 5 } })
    await page.goto(`${origin}/admin/collections/products/${product.id}?mode=edit`)
    await expect(page.getByRole('listitem').filter({hasText: `测试语种 ${code} (${code})`})).toBeVisible()
    const draft = await create('products-translations?draft=true', { subject: product.id, language: language.id, title: '新语种商品', _status: 'draft' })
    const publicURL = `${origin}/api/translations/content?source=products&language=${code}&slug=${slug}`
    expect((await (await request.get(publicURL)).json()).docs).toHaveLength(0)
    expect((await page.request.patch(`${origin}/api/products-translations/${draft.id}`, { data: { _status: 'published' } })).ok()).toBe(true)
    await page.goto(`${origin}/${code}/products/${slug}`)
    await expect(page.getByRole('heading', { name: '新语种商品', exact: true })).toBeVisible()
    expect((await page.request.patch(`${origin}/api/products-translations/${draft.id}?draft=true`, { data: { title: '未发布修改', _status: 'draft' } })).ok()).toBe(true)
    expect((await (await request.get(publicURL)).json()).docs[0].title).toBe('新语种商品')
  } finally {
    expect((await page.request.patch(`${origin}/api/languages/${language.id}`, { data: { enabled: false } })).ok()).toBe(true)
  }
  expect((await request.get(`${origin}/api/translations/content?source=products&language=${code}`)).status()).toBe(404)
})
