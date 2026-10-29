const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
import { expect, test } from '@playwright/test'

test('language navigation preserves route, filters and anchor and supports keyboard dismissal', async ({
  page,
}) => {
  await page.goto(`${base}/en/products?category=bedding#main-content`)
  const trigger = page.getByRole('combobox', { name: 'Switch language' })
  await trigger.click()
  await expect(page.getByRole('option', { name: 'English', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox')).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.getByRole('option', { name: '中文', exact: true }).click()
  await expect(page).toHaveURL(`${base}/zh/products?category=bedding#main-content`)
  const chinese = page.getByRole('combobox', { name: '切换语言' })
  await expect(chinese).toContainText('中文')
  await chinese.click()
  await page.getByRole('option', { name: 'English', exact: true }).click()
  await expect(page).toHaveURL(`${base}/en/products?category=bedding#main-content`)
})

test('language menu fits narrow phones and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`${base}/en`)
  await page.getByRole('combobox', { name: 'Switch language' }).click()
  const menu = page.getByRole('listbox')
  await expect(menu).toBeVisible()
  const bounds = await menu.boundingBox()
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  expect(await menu.evaluate((element) => getComputedStyle(element).animationName)).toBe('none')
})
