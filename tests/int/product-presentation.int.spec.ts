import { describe, expect, it } from 'vitest'
import {
  productInquiryHref,
  productPageNumber,
  productUnitLabel,
} from '@/utilities/productPresentation'

describe('product catalog input and inquiry handoff', () => {
  it('rejects ambiguous and unsafe pagination before querying', () => {
    expect(productPageNumber(undefined)).toBe(1)
    expect(productPageNumber('12')).toBe(12)
    for (const input of ['0', '-2', '1.5', '1abc', '', '01', '99999999999999999999', ['2']])
      expect(productPageNumber(input)).toBeNull()
  })
  it('uses consistent pet product units across cards and details', () => {
    expect(productUnitLabel(undefined, 'zh')).toBe('件')
    expect(productUnitLabel(null, 'en')).toBe('unit')
    expect(productUnitLabel('set', 'en')).toBe('set')
    expect(productUnitLabel('box', 'zh')).toBe('箱')
  })
  it('preserves product names and slugs without query injection', () => {
    const href = productInquiryHref('碗 & Bowl? 2件', 'feeding', 'bowl-set')
    const params = new URL(href, 'https://example.test').searchParams
    expect(params.get('product')).toBe('碗 & Bowl? 2件')
    expect(params.get('category')).toBe('feeding')
    expect(params.get('productSlug')).toBe('bowl-set')
    expect(
      new URL(productInquiryHref('test', 'vegetables'), 'https://example.test').searchParams.has(
        'category',
      ),
    ).toBe(false)
  })
})
