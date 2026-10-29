import { expect, test } from '@playwright/test'

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

test.describe('Storefront component interactions', () => {
  test('product lightbox opens, closes with Escape and returns focus without changing the URL', async ({
    page,
  }) => {
    await page.goto(`${base}/en/products/concept-sage-nest-bed`)
    const gallery = page.getByRole('region', { name: 'Product gallery' })
    await expect(gallery).toBeVisible()
    const trigger = gallery.getByRole('button', { name: 'Enlarge product image', exact: true })
    await trigger.click()
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeHidden()
    await expect(trigger).toBeFocused()
    await expect(page).toHaveURL(`${base}/en/products/concept-sage-nest-bed`)
  })

  test('mobile navigation traps focus, closes with Escape and restores the trigger', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${base}/en`)
    const trigger = page.getByRole('button', { name: 'Open menu', exact: true })
    await trigger.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(
        true,
      )
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
    await trigger.click()
    await page.getByRole('dialog').getByRole('link', { name: 'Request a quote' }).click()
    await expect(page).toHaveURL(`${base}/en/contact`)
    await expect(page.getByRole('dialog')).toBeHidden()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })

  test('invalid inquiries stay local and focus the first invalid field, including controlled selects', async ({
    page,
  }) => {
    let submissions = 0
    await page.route('**/api/form-submissions', async (route) => {
      submissions += 1
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: '{"errors":[{"message":"Test only"}]}',
      })
    })
    await page.goto(`${base}/en/contact`)
    const form = page.locator('form[data-insights-form]')
    await form.getByRole('button', { name: 'Submit inquiry', exact: true }).click()
    await expect(page.locator('#company-name')).toBeFocused()
    await expect(page.locator('#company-name')).toHaveAttribute('aria-invalid', 'true')
    expect(submissions).toBe(0)
    await page.locator('#company-name').fill('UI regression fixture')
    await page.locator('#contact-name').fill('Test buyer')
    await page.locator('#email').fill('buyer@example.test')
    await form.getByRole('button', { name: 'Submit inquiry', exact: true }).click()
    await expect(page.locator('#business-type')).toBeFocused()
    await expect(page.locator('#business-type')).toHaveAttribute('aria-invalid', 'true')
    expect(submissions).toBe(0)
  })
})
