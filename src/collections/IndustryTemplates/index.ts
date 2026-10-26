import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { protectReferencedTemplate, validateIndustryTemplate } from '@/hooks/industryParameters'
import { revalidatePublicSite } from '@/hooks/revalidateSearch'
import { contentLanguageField } from '@/fields/contentLanguageField'

export const IndustryTemplates: CollectionConfig = {
  slug: 'industry-templates',
  labels: {
    singular: { zh: '行业参数模板', en: 'Industry template' },
    plural: { zh: '行业参数模板', en: 'Industry templates' },
  },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'updatedAt'] },
  access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    beforeValidate: [validateIndustryTemplate],
    beforeDelete: [protectReferencedTemplate],
    afterChange: [
      ({ doc, req }) => {
        revalidatePublicSite(req)
        return doc
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        revalidatePublicSite(req)
        return doc
      },
    ],
  },
  fields: [
    contentLanguageField(),
    { name: 'title', type: 'text', required: true, label: '管理名称 / Template name' },
    {
      name: 'sectionTitle',
      type: 'text',
      localized: true,
      label: '前台分组标题 / Section heading',
    },
    {
      name: 'fields',
      type: 'array',
      maxRows: 50,
      label: '参数定义 / Parameters',
      fields: [
        {
          name: 'key',
          type: 'text',
          required: true,
          label: '稳定标识 / Key',
          admin: { description: '小写字母开头，可含数字和下划线；已保存行的标识不可修改。' },
        },
        { name: 'label', type: 'text', required: true, localized: true, label: '显示名称 / Label' },
        {
          name: 'type',
          label: '参数类型 / Type',
          type: 'select',
          required: true,
          defaultValue: 'text',
          options: [
            { label: '文本 / Text', value: 'text' },
            { label: '数值 / Number', value: 'number' },
            { label: '单选 / Select', value: 'select' },
          ],
        },
        { name: 'unit', type: 'text', localized: true, label: '单位 / Unit' },
        { name: 'placeholder', type: 'text', localized: true, label: '填写提示 / Placeholder' },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
          label: '发布时必填 / Required on publish',
        },
        {
          name: 'options',
          label: '下拉选项 / Options',
          type: 'array',
          maxRows: 100,
          admin: { condition: (_, siblingData) => siblingData.type === 'select' },
          fields: [
            { name: 'value', type: 'text', required: true, label: '稳定值 / Value' },
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: '显示名称 / Label',
            },
          ],
        },
      ],
    },
  ],
}
