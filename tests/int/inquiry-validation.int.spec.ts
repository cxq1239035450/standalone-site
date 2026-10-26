import { describe, expect, it, vi } from 'vitest'
import { validateFormSubmission, validateSubmissionFields } from '@/hooks/validateFormSubmission'
import { contactForm } from '@/endpoints/seed/contact-form'
import type { Form } from '@/payload-types'

const valid = () => Object.entries({
  'company-name': 'Example Buyer', 'contact-name': 'Buyer', email: 'buyer@example.com', phone: '+1 555 0100',
  'business-type': 'brand', 'product-category': 'feeding', 'monthly-volume': '100-500', 'delivery-city': 'Shanghai', requirements: '',
}).map(([field, value]) => ({ field, value }))

describe('Server-side inquiry validation', () => {
  it('accepts the actual inquiry contract including an empty optional requirements field', () => {
    expect(validateSubmissionFields(contactForm.fields, valid())).toEqual([])
  })
  it('rejects an empty submission instead of bypassing required fields', () => {
    const requiredCount = contactForm.fields?.filter(field => 'required' in field && field.required).length || 0
    expect(validateSubmissionFields(contactForm.fields, [])).toHaveLength(requiredCount)
    expect(validateSubmissionFields(contactForm.fields, undefined)).not.toHaveLength(0)
  })
  it('accepts blank optional phone and an undecided volume when configured', () => {
    const data = valid().map(row => ({ ...row, value: row.field === 'phone' ? '   ' : row.field === 'monthly-volume' ? 'not-sure' : row.value }))
    expect(validateSubmissionFields(contactForm.fields, data)).toEqual([])
  })
  it('rejects invalid email and forged option values even when the client is bypassed', () => {
    const data = valid().map(row => ({ ...row, value: row.field === 'email' ? 'not-an-email' : row.field === 'product-category' ? 'forged-category' : row.value }))
    expect(validateSubmissionFields(contactForm.fields, data).map(error => error.message)).toEqual(['Enter a valid email address.', 'Choose one of the configured options.'])
  })
  it('rejects duplicate and unknown field names', () => {
    expect(validateSubmissionFields(contactForm.fields, [...valid(), { field: 'email', value: 'other@example.com' }, { field: 'arbitrary', value: 'value' }])).toHaveLength(2)
  })
  it('treats whitespace as missing and limits unexpectedly large values', () => {
    const data = valid().map(row => ({ ...row, value: row.field === 'company-name' ? '   ' : row.field === 'requirements' ? 'a'.repeat(10001) : row.value }))
    expect(validateSubmissionFields(contactForm.fields, data)).toHaveLength(2)
  })
  it('accepts typed optional false checkboxes and finite numbers including zero', () => {
    const fields: Form['fields'] = [{ blockType: 'checkbox', name: 'updates', required: false }, { blockType: 'number', name: 'quantity', required: true }]
    expect(validateSubmissionFields(fields, [{ field: 'updates', value: false }, { field: 'quantity', value: 0 }])).toEqual([])
  })
  it('requires a checked required checkbox for both boolean and string payloads', () => {
    const fields: Form['fields'] = [{ blockType: 'checkbox', name: 'consent', required: true }]
    for (const value of [false, 'false']) expect(validateSubmissionFields(fields, [{ field: 'consent', value }])).toHaveLength(1)
    for (const value of [true, 'true']) expect(validateSubmissionFields(fields, [{ field: 'consent', value }])).toEqual([])
  })
  it('rejects non-finite numbers and does not coerce objects or booleans into text or numeric fields', () => {
    const fields: Form['fields'] = [{ blockType: 'number', name: 'quantity' }, { blockType: 'text', name: 'name' }]
    for (const value of [Infinity, NaN, 'Infinity', false, {}]) expect(validateSubmissionFields(fields, [{ field: 'quantity', value }])).not.toHaveLength(0)
    expect(validateSubmissionFields(fields, [{ field: 'name', value: true }])).not.toHaveLength(0)
  })
  it('normalizes accepted checkbox false and number zero for textarea storage without losing either', async () => {
    const findByID = vi.fn().mockResolvedValue({ fields: [{ blockType: 'checkbox', name: 'updates' }, { blockType: 'number', name: 'quantity', required: true }] })
    const result = await validateFormSubmission({ operation: 'create', data: { form: 1, submissionData: [{ field: 'updates', value: false }, { field: 'quantity', value: 0 }] }, req: { payload: { findByID } } } as unknown as Parameters<typeof validateFormSubmission>[0])
    expect(result?.submissionData).toEqual([{ field: 'updates', value: 'false' }, { field: 'quantity', value: '0' }])
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false }))
  })
})
