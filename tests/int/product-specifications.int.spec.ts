import { describe, expect, it } from 'vitest'
import { productSpecifications } from '@/utilities/productSpecifications'

const template = {
  id: 2,
  fields: [
    { key: 'power', label: '额定功率', type: 'number', unit: 'kW' },
    {
      key: 'material',
      label: '材质',
      type: 'select',
      options: [{ value: 'steel', label: '不锈钢' }],
    },
    { key: 'empty', label: '尺寸', type: 'text' },
  ],
}

describe('public industry specifications', () => {
  it('renders only selected template fields in template order and translates options', () => {
    expect(
      productSpecifications(template, {
        '1': { shoe: 'hidden' },
        '2': { material: 'steel', power: '0', empty: ' ', obsolete: 'hidden' },
      }),
    ).toEqual([
      { key: 'power', label: '额定功率', value: '0', unit: 'kW' },
      { key: 'material', label: '材质', value: '不锈钢', unit: undefined },
    ])
  })
  it('omits invalid data, deleted options, missing templates and missing translations', () => {
    expect(
      productSpecifications(template, { '2': { power: 'Infinity', material: 'deleted' } }),
    ).toEqual([])
    expect(productSpecifications(null, { '2': { power: '3' } })).toEqual([])
    expect(
      productSpecifications(
        { id: 2, fields: [{ key: 'power', type: 'text', label: '' }] },
        { '2': { power: '3' } },
      ),
    ).toEqual([])
    expect(productSpecifications(template, [])).toEqual([])
  })
})
