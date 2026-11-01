import { test, expect } from '@playwright/test'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

test('media revisions, browser reuse, on-demand video and cache status dialogs', async ({ page, request }) => {
  test.setTimeout(180000)
  await seedTestUser()
  const cleanup: { collection: string; id: number }[] = []
  const slug = `cache-qa-${randomUUID()}`
  try {
    expect((await request.get('/api/performance/status')).status()).toBe(401)
    expect((await page.request.post('/api/users/login', { data: testUser })).ok()).toBe(true)
    const movie = await readFile('tests/fixtures/performance-clip.webm')
    const upload = async (name: string, mimeType: string, buffer: Buffer) => {
      const result = await page.request.post('/api/media', { multipart: {
        _payload: JSON.stringify({ alt: '缓存与加载验收' }), file: { name, mimeType, buffer },
      } })
      expect(result.ok(), await result.text()).toBe(true)
      const doc = (await result.json()).doc
      cleanup.unshift({ collection: 'media', id: doc.id })
      expect(doc.url).toMatch(/^\/assets\/media\/[a-f0-9]{64}\./)
      return doc
    }
    const picture = await upload(`${slug}.webp`, 'image/webp', await readFile('public/pet-assets/hero-pets.webp'))
    const video = await upload(`${slug}.webm`, 'video/webm', Buffer.from(movie))
    const changed = await page.request.patch(`/api/media/${picture.id}`, { data: { alt: '只改说明' } })
    expect(changed.ok()).toBe(true)
    expect((await changed.json()).doc.url).toBe(picture.url)
    const language = (await (await page.request.get('/api/languages?where[code][equals]=zh')).json()).docs[0]
    const layout = [{ blockType: 'mediaBlock', media: picture.id }, { blockType: 'mediaBlock', media: video.id }]
    const shared = await page.request.post('/api/pages', { data: { slug, title: '性能缓存验收', hero: { type: 'none' }, layout } })
    expect(shared.ok(), await shared.text()).toBe(true)
    const sharedID = (await shared.json()).doc.id
    cleanup.unshift({ collection: 'pages', id: sharedID })
    const translated = await page.request.post('/api/pages-translations', { data: {
      subject: sharedID, language: language.id, title: '性能缓存验收', hero: { type: 'none' }, layout, _status: 'published',
    } })
    expect(translated.ok(), await translated.text()).toBe(true)
    const translationID = (await translated.json()).doc.id
    cleanup.unshift({ collection: 'pages-translations', id: translationID })
    const videoRequests: string[] = []
    page.on('request', req => { if (req.url().includes(video.url)) videoRequests.push(req.url()) })
    await page.goto(`/zh/${slug}`)
    const img = page.locator('article img').first()
    await expect(img).toBeVisible()
    await expect.poll(() => img.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    const src = await img.getAttribute('src')
    expect(src).toContain('q=75')
    const clip = page.locator('video')
    await expect(clip).toHaveAttribute('preload', 'none')
    expect(videoRequests).toHaveLength(0)
    const imageTiming = () => page.evaluate(() => performance.getEntriesByType('resource')
      .filter(item => item.name.includes('/_next/image'))
      .map(item => ({ url: item.name, bytes: (item as PerformanceResourceTiming).transferSize })))
    const cold = await imageTiming()
    // No request interception: Playwright routing would disable the browser HTTP cache.
    await page.goto('/zh')
    await page.goto(`/zh/${slug}`)
    await expect.poll(() => img.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    const warm = await imageTiming()
    const target = warm.find(item => item.url.includes(encodeURIComponent(picture.url)))
    expect(target).toBeDefined()
    expect(target!.bytes).toBe(0)
    expect(videoRequests).toHaveLength(0)
    await clip.evaluate(element => (element as HTMLVideoElement).play())
    await expect.poll(() => videoRequests.length).toBeGreaterThan(0)
    await expect.poll(() => clip.evaluate(element => (element as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(2)
    await clip.evaluate(element => (element as HTMLVideoElement).pause())
    await mkdir('.deployment', { recursive: true })
    await writeFile('.deployment/performance-cache-measurements.json', JSON.stringify({ cold, warm, videoInitialRequests: 0 }, null, 2))
    await page.screenshot({ path: '.deployment/performance-media.png', fullPage: true, animations: 'disabled' })
    // Warm published content must disappear immediately after withdrawal.
    expect((await page.request.patch(`/api/pages-translations/${translationID}`, { data: { _status: 'draft' } })).ok()).toBe(true)
    expect((await request.get(`/zh/${slug}`)).status()).toBe(404)
    await page.goto('/admin/collections/media')
    const panel = page.locator('.performance-panel')
    await expect(panel.getByText('已启用', { exact: true })).toBeVisible()
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    await page.route('**/api/performance/status', async route => { await gate; await route.continue() })
    await panel.getByRole('button', { name: '刷新状态' }).click()
    await expect(panel.getByRole('button', { name: '正在读取…' })).toBeDisabled()
    release()
    await expect(panel.getByRole('button', { name: '刷新状态' })).toBeEnabled()
    await panel.getByRole('button', { name: '查看策略' }).click()
    await expect(page.getByRole('dialog', { name: '缓存策略与运行状态' })).toBeVisible()
    await page.screenshot({ path: '.deployment/performance-cache-panel.png', animations: 'disabled' })
    await page.getByRole('dialog').getByRole('button', { name: '关闭', exact: true }).last().click()
  } finally {
    for (const item of cleanup) await page.request.delete(`/api/${item.collection}/${item.id}`)
    await cleanupTestUser()
  }
})
