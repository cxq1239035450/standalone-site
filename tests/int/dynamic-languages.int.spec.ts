import { describe, it, expect, vi } from 'vitest'
import type { Payload } from 'payload'
import { mergeTranslation, translationFields, fieldPaths, normalizeTranslationInput } from '@/i18n/contentSchema'
import { createContentReader, translationWhere } from '@/i18n/content'
import { validateMessages, messageTemplate } from '@/i18n/messageValidation'
import { migrationProjection, hasTranslation } from '@/i18n/migrateContent'
import en from '../../messages/en.json'

describe('Dynamic language content contract', () => {
  it('normalizes legacy arrays and namespaces row IDs without changing shared gallery matches', () => {
    const fields = translationFields([{ name: 'general', type: 'group', fields: [{ name: 'gallery', type: 'array', fields: [{name: 'caption', type: 'text'}] }] }], 'products')
    expect(normalizeTranslationInput({general: {gallery: null}}, fields, 1)).toEqual({general: {gallery: []}})
    const translation = normalizeTranslationInput({general: {gallery: [{id: 'row', caption: 'Japanese'}]}}, fields, 2)
    expect((translation.general as {gallery: {id: string}[]}).gallery[0].id).toBe('row::language:2')
    normalizeTranslationInput(translation, fields, 3)
    expect((translation.general as {gallery: {id: string}[]}).gallery[0].id).toBe('row::language:3')
    const merged = mergeTranslation({general: {gallery: [{id: 'row', image: 8}]}}, translation, ['general.gallery'])
    expect(merged.general).toEqual({gallery: [{id: 'row', image: 8, caption: 'Japanese'}]})
  })
  it('extracts translatable fields without duplicating stock or SKU', () => {
    const fields = translationFields(
      [
        { name: 'title', type: 'text', localized: true },
        { name: 'stock', type: 'number' },
        { name: 'sku', type: 'text' },
      ],
      'products',
    )
    expect(fieldPaths(fields)).toEqual(['title'])
    expect(fields[0]).not.toHaveProperty('localized')
  })
  it('removes all archived text when a translation is blank, while retaining shared values', () => {
    expect(
      mergeTranslation(
        {
          id: 7,
          title: '中文',
          pricing: { stock: 20, sku: 'A' },
          general: { shortDescription: '中文介绍' },
        },
        { title: '日本語', _status: 'published' },
        ['title', 'general.shortDescription'],
      ),
    ).toEqual({
      id: 7,
      title: '日本語',
      pricing: { stock: 20, sku: 'A' },
      general: { shortDescription: null },
      _status: 'published',
    })
  })
  it('maps mixed search predicates to translated text and shared identifiers', () => {
    expect(
      translationWhere(
        {
          and: [
            { _status: { equals: 'published' } },
            { or: [{ title: { like: '猫' } }, { 'pricing.sku': { like: 'A' } }] },
          ],
        },
        ['title'],
      ),
    ).toEqual({
      and: [
        { _status: { equals: 'published' } },
        { or: [{ title: { like: '猫' } }, { 'subject.pricing.sku': { like: 'A' } }] },
      ],
    })
  })
  it('does not query content for an unknown or disabled language', async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] })
    const reader = createContentReader({ find } as unknown as Payload)
    expect((await reader.find({ collection: 'products', locale: 'ja' })).docs).toEqual([])
    expect(find).toHaveBeenCalledTimes(1)
    expect(find.mock.calls[0][0]).toMatchObject({ collection: 'languages', overrideAccess: false })
  })
  it('does not grant preview access merely because a caller sets draft/overrideAccess', async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [{ id: 3, code: 'ja', enabled: true }] })
      .mockResolvedValue({ docs: [] })
    const reader = createContentReader({
      find,
      collections: {
        'products-translations': { config: { custom: { translationPaths: ['title'] } } },
      },
    } as unknown as Payload)
    await reader.find({ collection: 'products', locale: 'ja', draft: true, overrideAccess: true })
    expect(find.mock.calls[1][0]).toMatchObject({
      draft: false,
      where: { and: expect.arrayContaining([{ _status: { equals: 'published' } }]) },
    })
  })
  it('validates complete dictionaries and rejects missing variables and malformed ICU', () => {
    expect(validateMessages(messageTemplate)).toBe(true)
    expect(validateMessages(en)).toBe(true)
    const broken = structuredClone(messageTemplate)
    broken.products.filter.showing = '没有数量变量'
    expect(validateMessages(broken)).not.toBe(true)
    expect(validateMessages({})).not.toBe(true)
  })
  it('does not manufacture English translations from formerly shared Chinese fields', () => {
    expect(migrationProjection({ title: '分类' }, 'categories', ['title'], 'en')).toEqual({})
    expect(migrationProjection({ title: '分类' }, 'categories', ['title'], 'zh')).toEqual({
      title: '分类',
    })
    expect(hasTranslation({ fields: [{ id: '1', key: 'size', type: 'text', label: null }] })).toBe(
      false,
    )
  })
})
