import { describe, expect, it, vi } from 'vitest'
import {
  parameterValuesError,
  templateDefinitionError,
  protectReferencedTemplate,
} from '@/hooks/industryParameters'

describe('Industry parameter contracts', () => {
  it('reports malformed template definitions without throwing runtime errors', () => {
    for (const fields of [
      {},
      [null],
      [{ key: 'size', type: 'select', options: {} }],
      [{ key: 'size', type: 'select', options: [null] }],
    ]) {
      expect(
        templateDefinitionError(fields as Parameters<typeof templateDefinitionError>[0]),
      ).toBeTruthy()
    }
  })
  const fields = [
    { key: 'power', type: 'number', required: true },
    { key: 'material', type: 'select', options: [{ value: 'steel' }, { value: 'plastic' }] },
  ]
  it('allows incomplete drafts but enforces required published values', () => {
    expect(parameterValuesError({}, '1', fields, false)).toBeUndefined()
    expect(parameterValuesError({}, '1', fields, true)).toContain('power')
    expect(parameterValuesError({ '1': { power: '0' } }, '1', fields, true)).toBeUndefined()
  })
  it('requires finite numeric strings and configured selection values', () => {
    for (const value of ['NaN', 'Infinity', 'invalid'])
      expect(parameterValuesError({ '1': { power: value } }, '1', fields, false)).toBeTruthy()
    expect(parameterValuesError({ '1': { power: 0 } }, '1', fields, true)).toBeTruthy()
    expect(parameterValuesError({ '1': { material: 'unknown' } }, '1', fields, false)).toBeTruthy()
  })
  it('retains inactive values without applying the selected template schema to them', () => {
    const values = { '1': { power: '0' }, '2': { shoe_size: 'EU 42' } }
    const snapshot = JSON.stringify(values)
    expect(parameterValuesError(values, '1', fields, true)).toBeUndefined()
    expect(JSON.stringify(values)).toBe(snapshot)
  })
  it('rejects malformed nested structures and prototype keys', () => {
    for (const value of [
      [],
      'text',
      { '1': [] },
      JSON.parse('{"1":{"__proto__":"unsafe"}}'),
      JSON.parse('{"constructor":{}}'),
    ])
      expect(parameterValuesError(value, '1', [], false)).toBeTruthy()
  })
  it('enforces safe unique keys, stable stored keys and valid options', () => {
    expect(templateDefinitionError([{ key: 'constructor', type: 'text' }])).toBeTruthy()
    expect(
      templateDefinitionError([
        { key: 'power', type: 'text' },
        { key: 'power', type: 'number' },
      ]),
    ).toBeTruthy()
    expect(
      templateDefinitionError(
        [{ id: 'a', key: 'new_key', type: 'text' }],
        [{ id: 'a', key: 'old_key', type: 'text' }],
      ),
    ).toBeTruthy()
    expect(
      templateDefinitionError([
        { key: 'material', type: 'select', options: [{ value: 'steel' }, { value: 'steel' }] },
      ]),
    ).toBeTruthy()
    expect(templateDefinitionError(fields)).toBeUndefined()
  })
  it('blocks deletion when only a draft references the template using internal access', async () => {
    const find = vi
      .fn()
      .mockResolvedValueOnce({ docs: [] })
      .mockResolvedValueOnce({ docs: [{ id: 99 }] })
    const req = { payload: { find } }
    await expect(
      protectReferencedTemplate({ id: 1, req } as unknown as Parameters<
        typeof protectReferencedTemplate
      >[0]),
    ).rejects.toThrow('used by a product')
    expect(find.mock.calls.map(([args]) => args.draft)).toEqual([false, true])
    expect(
      find.mock.calls.every(([args]) => args.overrideAccess === true && args.req === req),
    ).toBe(true)
  })
})
