// @vitest-environment node
import { describe, expect, it } from 'vitest'
import baseline from '../../src/migrations/yueli-support/baseline.json'
import { assertBaseline } from '../../src/migrations/yueli-support/schema'
import { migrations } from '../../src/migrations/yueli'

describe('Yueli database adoption', () => {
  it('accepts the restored baseline and rejects schema drift before any increment', () => {
    expect(() => assertBaseline(structuredClone(baseline), baseline)).not.toThrow()
    const changedColumn = structuredClone(baseline)
    changedColumn.columns[0].is_nullable = 'YES'
    expect(() => assertBaseline(changedColumn, baseline)).toThrow('baseline mismatch')
    const missingConstraint = structuredClone(baseline)
    missingConstraint.constraints.pop()
    expect(() => assertBaseline(missingConstraint, baseline)).toThrow('baseline mismatch')
    const missingIndex = structuredClone(baseline)
    missingIndex.indexes.pop()
    expect(() => assertBaseline(missingIndex, baseline)).toThrow('baseline mismatch')
    expect(() => assertBaseline({}, baseline)).toThrow('baseline mismatch')
  })

  it('uses adoption before increments and never includes the generic initialization', () => {
    expect(migrations.map(({ name }) => name)).toEqual([
      '20261030_010000_verified_baseline',
      '20261030_020000_dynamic_languages',
      '20261030_030000_translation_fields',
      '20261030_040000_archive_search_brand',
      '20261030_050000_seo_discovery',
      '20261030_060000_inquiry_mail_notifications',
      '20261030_070000_form_mail_routing',
    ])
  })
})
