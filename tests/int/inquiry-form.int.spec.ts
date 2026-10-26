import { describe, expect, it } from 'vitest'
import { contactForm } from '../../src/endpoints/seed/contact-form'

describe('Pet wholesale inquiry contract', () => {
  it('accepts pet sourcing categories and quantities in units', () => {
    const fields = contactForm.fields ?? []
    const category = fields.find((field) => 'name' in field && field.name === 'product-category')
    const volume = fields.find((field) => 'name' in field && field.name === 'monthly-volume')
    expect(category?.blockType).toBe('select')
    expect(volume?.blockType).toBe('select')
    if (category?.blockType !== 'select' || volume?.blockType !== 'select') return
    expect(category.options?.map(({ value }) => value)).toEqual(['walking', 'feeding', 'bedding', 'toys', 'multiple'])
    expect(volume.options?.map(({ value }) => value)).toEqual(['under-100', '100-500', '500-2000', 'over-2000', 'not-sure'])
  })

  it('does not send inquiries through a fictitious template email address', () => {
    expect(contactForm.emails).toEqual([])
  })
})
