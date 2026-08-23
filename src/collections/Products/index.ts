import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { slugField } from 'payload'
import { adminLabel } from '@/i18n/adminLabels'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: adminLabel('产品', 'Product'),
    plural: adminLabel('产品', 'Products'),
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    general: {
      heroImage: true,
      shortDescription: true,
    },
    pricing: {
      price: true,
      unit: true,
    },
    organization: {
      category: true,
      featured: true,
    },
  },
  admin: {
    defaultColumns: [
      'title',
      'language',
      'general.heroImage',
      'pricing.price',
      'pricing.stock',
      'organization.category',
      'organization.featured',
      'updatedAt',
    ],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: adminLabel('产品名称', 'Title'),
      localized: true,
      required: true,
      admin: {
        description: adminLabel(
          '输入产品名称后，点击 Slug 字段的"生成"按钮自动创建 URL 标识',
          'Enter product name, then click "Generate" in Slug field',
        ),
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'general',
          label: adminLabel('基本信息', 'General'),
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              label: adminLabel('产品主图', 'Hero Image'),
              relationTo: 'media',
            },
            {
              name: 'gallery',
              type: 'array',
              label: adminLabel('产品相册', 'Gallery'),
              admin: {
                description: adminLabel(
                  '添加产品的多张图片',
                  'Add multiple images for the product',
                ),
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  label: adminLabel('图片', 'Image'),
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  label: adminLabel('图片说明', 'Caption'),
                },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              label: adminLabel('简短描述', 'Short Description'),
              localized: true,
              admin: {
                description: adminLabel(
                  '在产品列表中显示的简短描述',
                  'Brief description shown in product listings',
                ),
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: adminLabel('产品详情', 'Description'),
              localized: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                    BlocksFeature({}),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
            },
          ],
        },
        {
          name: 'pricing',
          label: adminLabel('价格与库存', 'Pricing & Stock'),
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  label: adminLabel('价格', 'Price'),
                  required: true,
                  admin: {
                    width: '50%',
                    step: 0.01,
                  },
                },
                {
                  name: 'unit',
                  type: 'select',
                  label: adminLabel('单位', 'Unit'),
                  required: true,
                  options: [
                    { label: '千克 (kg)', value: 'kg' },
                    { label: '斤', value: 'jin' },
                    { label: '箱', value: 'box' },
                    { label: '个', value: 'piece' },
                    { label: '袋', value: 'bag' },
                    { label: '吨', value: 'ton' },
                  ],
                  defaultValue: 'kg',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'stock',
              type: 'number',
              label: adminLabel('库存数量', 'Stock'),
              admin: {
                description: adminLabel('输入 -1 表示无限制库存', 'Enter -1 for unlimited stock'),
              },
            },
            {
              name: 'sku',
              type: 'text',
              label: adminLabel('SKU编码', 'SKU'),
              admin: {
                description: adminLabel('产品库存单位编码', 'Stock Keeping Unit code'),
              },
            },
          ],
        },
        {
          name: 'organization',
          label: adminLabel('组织', 'Organization'),
          fields: [
            {
              name: 'category',
              type: 'relationship',
              label: adminLabel('产品分类', 'Category'),
              relationTo: 'categories',
              admin: {
                description: adminLabel('选择产品所属分类', 'Select the category for this product'),
              },
            },
            {
              name: 'featured',
              type: 'checkbox',
              label: adminLabel('推荐产品', 'Featured Product'),
              defaultValue: false,
              admin: {
                description: adminLabel('在首页推荐区域显示', 'Show in featured products section'),
              },
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: adminLabel('发布时间', 'Published At'),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'language',
      type: 'text',
      label: adminLabel('发布语言', 'Published languages'),
      virtual: true,
      admin: {
        components: {
          Cell: '@/components/ProductLanguageColumn#ProductLanguageCell',
          Field: '@/components/ProductLanguageColumn#ProductLanguageField',
        },
        disableListFilter: true,
        disableGroupBy: true,
        readOnly: true,
      },
    },
    slugField({
      localized: false,
    }),
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      localizeStatus: true,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
