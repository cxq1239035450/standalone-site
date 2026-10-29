const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
import { test, expect } from '@playwright/test'

test.describe('Pet supplies storefront', () => {
  for (const locale of ['zh', 'en']) {
    test(`${locale} homepage has search metadata and procurement navigation`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(`${base}/${locale}`)
      await expect(page).toHaveTitle(/PawSupply/i)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/${locale}$`))
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/)
      await expect(page.locator('body')).not.toContainText(/鲜联集采|FreshConnect|农产品|冷链/)
      await page.locator(`main a[href="/${locale}/contact"]`).first().click()
      await expect(page).toHaveURL(new RegExp(`/${locale}/contact$`))
      await expect(page.locator('form[data-insights-form]')).toBeVisible()
      await expect(page.locator('input[name="company-name"]')).toBeVisible()
      expect(errors).toEqual([])
    })
  }

  test('mobile homepage fits its viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${base}/zh`)
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })
})
