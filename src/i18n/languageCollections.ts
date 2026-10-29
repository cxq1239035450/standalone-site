import { APIError, type CollectionConfig, type GlobalConfig, type Where } from 'payload'
import { authenticated } from '@/access/authenticated'
import { validateMessages } from './messageValidation'
import { revalidatePath, revalidateTag } from 'next/cache'

export function invalidateLanguages() {
  // CLI migrations run without a Next request cache.
  try {
    revalidateTag('languages', { expire: 0 })
    revalidatePath('/', 'layout')
  } catch {
    /* no request cache */
  }
}
export const Languages: CollectionConfig = {
  slug: 'languages',
  labels: { singular: '语言', plural: '语言管理' },
  admin: {
    useAsTitle: 'label',
    group: '多语言',
    defaultColumns: ['label', 'code', 'enabled', 'sortOrder'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { enabled: { equals: true } }),
    create: authenticated,
    update: authenticated,
    delete: () => false,
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: '语言代码',
      admin: { description: '例如 zh、en、ja、pt-BR。保存后不可更改。' },
      validate: (value: unknown) =>
        (typeof value === 'string' &&
          /^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|\d{3}))?$/.test(value) &&
          !['all', 'api'].includes(value)) ||
        '请输入规范语言代码，例如 ja 或 pt-BR',
    },
    { name: 'label', type: 'text', required: true, label: '显示名称' },
    {
      name: 'htmlLang',
      type: 'text',
      label: 'HTML 语言标记',
      admin: { description: '留空使用语言代码，例如中文可填写 zh-CN。' },
    },
    {
      name: 'direction',
      type: 'select',
      options: ['ltr', 'rtl'],
      defaultValue: 'ltr',
      required: true,
      label: '文字方向',
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0, label: '显示顺序' },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      label: '启用前台',
      admin: { description: '准备状态可编辑翻译。发布前台文案、页头、页脚和搜索配置后才能启用。' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        if (originalDoc?.code && data.code && data.code !== originalDoc.code)
          throw new APIError('语言代码保存后不可修改。', 400)
        if (originalDoc?.enabled && data.enabled === false) {
          const settings = await req.payload.findGlobal({
            slug: 'language-settings',
            depth: 0,
            req,
          })
          if (String(settings.defaultLanguage) === String(originalDoc.id))
            throw new APIError('请先更换默认语言，再禁用此语言。', 400)
        }
        if (data.enabled && !req.context.languageMigration) {
          if (!originalDoc?.id)
            throw new APIError('请先保存准备状态，填写并发布基础翻译后再启用。', 400)
          for (const collection of [
            'site-copy',
            'header-translations',
            'footer-translations',
            'search-settings-translations',
          ] as const) {
            const result = await req.payload.find({
              collection,
              req,
              depth: 0,
              draft: false,
              limit: 1,
              where: {
                and: [
                  { language: { equals: originalDoc.id } },
                  { _status: { equals: 'published' } },
                ],
              },
            })
            if (!result.docs.length)
              throw new APIError(`请先发布 ${collection} 的当前语言翻译。`, 400)
          }
        }
        return data
      },
    ],
    afterChange: [
      ({ doc }) => {
        invalidateLanguages()
        return doc
      },
    ],
  },
}

export const LanguageSettings: GlobalConfig = {
  slug: 'language-settings',
  label: '默认语言',
  admin: { group: '多语言' },
  access: { read: () => true, update: authenticated },
  fields: [
    {
      name: 'defaultLanguage',
      type: 'relationship',
      relationTo: 'languages',
      required: true,
      filterOptions: { enabled: { equals: true } },
      label: '默认语言',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const id =
          typeof data.defaultLanguage === 'object' ? data.defaultLanguage.id : data.defaultLanguage
        const language = await req.payload.findByID({ collection: 'languages', id, req, depth: 0 })
        if (!language.enabled) throw new APIError('默认语言必须已启用。', 400)
        return data
      },
    ],
    afterChange: [
      ({ doc }) => {
        invalidateLanguages()
        return doc
      },
    ],
  },
}

export const SiteCopy: CollectionConfig = {
  slug: 'site-copy',
  labels: { singular: '前台文案', plural: '前台文案' },
  admin: { group: '多语言', defaultColumns: ['language', '_status', 'updatedAt'] },
  access: {
    read: ({ req }) =>
      req.user
        ? true
        : ({
            and: [{ _status: { equals: 'published' } }, { 'language.enabled': { equals: true } }],
          } as Where),
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'language',
      type: 'relationship',
      relationTo: 'languages',
      required: true,
      unique: true,
      label: '语言',
    },
    {
      name: 'messages',
      type: 'json',
      required: true,
      label: '分组文案',
      admin: { components: { Field: '@/components/MessageEditor' } },
    },
  ],
  versions: { drafts: { schedulePublish: true }, maxPerDoc: 50 },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        if (
          originalDoc?.language &&
          data.language &&
          String(data.language) !==
            String(
              typeof originalDoc.language === 'object'
                ? originalDoc.language.id
                : originalDoc.language,
            )
        )
          throw new APIError('已保存文案不能更换语言。', 400)
        if (data._status === 'published') {
          const result = validateMessages(data.messages ?? originalDoc?.messages)
          if (result !== true) throw new APIError(result, 400)
        }
        return data
      },
    ],
    afterChange: [
      ({ doc }) => {
        invalidateLanguages()
        return doc
      },
    ],
    afterDelete: [() => invalidateLanguages()],
  },
}
