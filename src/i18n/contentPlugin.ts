import { APIError, type CollectionConfig, type Field, type Plugin, type Where } from 'payload'
import { authenticated } from '@/access/authenticated'
import { Languages, LanguageSettings, SiteCopy, invalidateLanguages } from './languageCollections'
import {
  fieldPaths,
  getPath,
  isContentSource,
  translatedCollections,
  translatedGlobals,
  translationFields,
  translationSlug,
} from './contentSchema'
import { parameterValuesError } from '@/hooks/industryParameters'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { normalizeTranslationInput, sourceRowID } from './contentSchema'

function archiveFields(fields: Field[], paths: string[], prefix = ''): Field[] {
  return fields
    .filter((field) => field.type !== 'ui' && !('virtual' in field && field.virtual))
    .map((field) => {
      const path = 'name' in field ? [prefix, field.name].filter(Boolean).join('.') : prefix
      if (paths.includes(path)) {
        // Shared row structure (parameter keys, form names and gallery assets) stays editable.
        if ((field.type === 'array' || field.type === 'blocks') && !field.localized) return field
        return {
          ...field,
          required: false,
          access: {
            ...('access' in field ? field.access : {}),
            update: ({ req }) => Boolean(req.context.languageMigration),
          },
          admin: { ...field.admin, hidden: true, readOnly: true },
        } as Field
      }
      if (field.type === 'tabs')
        return {
          ...field,
          tabs: field.tabs.map((tab) => ({
            ...tab,
            fields: archiveFields(
              tab.fields,
              paths,
              'name' in tab ? [prefix, tab.name].filter(Boolean).join('.') : prefix,
            ),
          })),
        }
      if ('fields' in field)
        return { ...field, fields: archiveFields(field.fields, paths, path) } as Field
      return field
    })
}

export const dynamicContentPlugin: Plugin = (config) => {
  const translations: CollectionConfig[] = []
  for (const source of [...(config.collections || []), ...(config.globals || [])]) {
    if (!isContentSource(source.slug)) continue
    const slug = source.slug
    const global = translatedGlobals.includes(slug as (typeof translatedGlobals)[number])
    const fields = translationFields(source.fields, slug)
    const paths = fieldPaths(fields)
    const sourceLabel =
      'labels' in source ? source.labels?.plural : 'label' in source ? source.label : slug
    const label =
      typeof sourceLabel === 'string'
        ? sourceLabel
        : sourceLabel && typeof sourceLabel === 'object'
          ? sourceLabel.zh || sourceLabel.en || slug
          : slug
    translations.push({
      slug: translationSlug(slug),
      dbName: `tr_${slug.replaceAll('-', '_')}`,
      labels: { singular: `${label}翻译`, plural: `${label}翻译` },
      custom: { translationSource: slug, translationPaths: paths, translationGlobal: global },
      admin: {
        preview: ['products', 'posts', 'pages'].includes(slug)
          ? async (data, { req }) => {
              const idOf = (value: unknown) =>
                value && typeof value === 'object' && 'id' in value ? value.id : value
              if (!data.subject || !data.language) return null
              const [subject, language] = await Promise.all([
                req.payload.findByID({
                  collection: slug as 'products' | 'posts' | 'pages',
                  id: idOf(data.subject) as number,
                  depth: 0,
                  req,
                }),
                req.payload.findByID({
                  collection: 'languages',
                  id: idOf(data.language) as number,
                  depth: 0,
                  req,
                }),
              ])
              return generatePreviewPath({
                collection: slug as 'products' | 'posts' | 'pages',
                slug: subject.slug || '',
                locale: language.code,
                req,
              })
            }
          : undefined,
        group: '内容翻译',
        defaultColumns: ['subject', 'language', '_status', 'updatedAt'],
        description:
          '每条记录是一种语言的独立版本。保存草稿不会改变已发布内容。共享数据请在原内容中编辑。',
        components: { edit: { beforeDocumentControls: ['@/components/TranslationActions'] } },
      },
      access: {
        read: ({ req }) =>
          req.user
            ? true
            : ({
                and: [
                  { _status: { equals: 'published' } },
                  { 'language.enabled': { equals: true } },
                ],
              } as Where),
        create: authenticated,
        update: authenticated,
        delete: authenticated,
      },
      indexes: [{ fields: ['subject', 'language'], unique: true }],
      fields: [
        global
          ? {
              name: 'subject',
              type: 'text',
              required: true,
              defaultValue: slug,
              admin: { readOnly: true },
              label: '设置项',
            }
          : {
              name: 'subject',
              type: 'relationship',
              relationTo: slug as (typeof translatedCollections)[number],
              required: true,
              label: '所属内容',
            },
        {
          name: 'language',
          type: 'relationship',
          relationTo: 'languages',
          required: true,
          label: '内容语言',
        },
        ...fields,
      ],
      versions: { drafts: { schedulePublish: true, autosave: { interval: 1000 } }, maxPerDoc: 50 },
      hooks: {
        beforeValidate: [({ data, originalDoc }) => {
          if (!data) return data
          const language = data.language ?? originalDoc?.language
          return normalizeTranslationInput(data, fields, typeof language === 'object' ? language?.id : language)
        }],
        beforeChange: [
          async ({ data, originalDoc, req }) => {
            const idOf = (value: unknown) =>
              value && typeof value === 'object' && 'id' in value ? value.id : value
            for (const key of ['subject', 'language']) {
              if (
                originalDoc?.[key] &&
                data[key] !== undefined &&
                String(idOf(data[key])) !== String(idOf(originalDoc[key]))
              )
                throw new APIError('已有翻译的所属内容和语言不可修改，请创建新的翻译。', 400)
            }
            if (global && (data.subject ?? originalDoc?.subject) !== slug)
              throw new APIError('无效的设置项。', 400)
            const language = idOf(data.language ?? originalDoc?.language) as number
            await req.payload.findByID({ collection: 'languages', id: language, req, depth: 0 })
            if (data._status !== 'published' || req.context.languageMigration) return data
            const subject = global
              ? null
              : await req.payload.findByID({
                  collection: slug as (typeof translatedCollections)[number],
                  id: idOf(data.subject ?? originalDoc?.subject) as number,
                  req,
                  depth: 0,
                  locale: 'zh',
                  fallbackLocale: false,
                })
            const merged = { ...originalDoc, ...data }
          if (slug === 'header' || slug === 'footer') {
            const shared = await req.payload.findGlobal({ slug, req, depth: 0 })
            if (shared.useCustomNavigation && (!Array.isArray(merged.navItems) || !merged.navItems.length)) {
              throw new APIError('已开启自定义导航，请先填写当前语言的导航项目。', 400)
            }
          }
          if (slug === 'forms') {
            if (!String(merged.submitButtonLabel || '').trim()) throw new APIError('请填写当前语言的提交按钮文字。', 400)
            for (const field of (merged.fields || []) as Record<string, unknown>[]) {
              if (field.name && !String(field.label || '').trim()) throw new APIError(`请填写表单字段 ${field.name} 的当前语言标签。`, 400)
              for (const option of (field.options || []) as Record<string, unknown>[]) {
                if (!String(option.label || '').trim()) throw new APIError(`请补全表单字段 ${field.name} 的选项文字。`, 400)
              }
            }
          }
            // Required translated dependencies are checked even when publishing through REST or a scheduled job.
            const dependencies: Array<[string, unknown]> = []
            if (slug === 'products') {
              dependencies.push(
                ['categories', getPath(subject, 'organization.category')],
                ['industry-templates', getPath(subject, 'industryTemplate')],
              )
            }
            if (slug === 'posts')
              for (const id of (getPath(subject, 'categories') as unknown[]) || [])
                dependencies.push(['categories', id])
            const findForms = (value: unknown) => {
              if (!value || typeof value !== 'object') return
              if (Array.isArray(value)) {
                value.forEach(findForms)
                return
              }
              const row = value as Record<string, unknown>
              if (row.blockType === 'formBlock' && row.form)
                dependencies.push(['forms', idOf(row.form)])
              Object.values(row).forEach(findForms)
            }
            findForms(merged.layout)
            if (slug === 'industry-templates' || slug === 'forms') {
              const rows = (getPath(subject, 'fields') || []) as Array<Record<string, unknown>>
              const translatedRows = (merged.fields || []) as Array<Record<string, unknown>>
              const signature = (items: Array<Record<string, unknown>>) =>
                JSON.stringify(
                  items.map((row) => ({
                    key: row.key || row.name || sourceRowID(row.id),
                    type: row.type || row.blockType,
                    required: row.required,
                    options: ((row.options as Array<{ value: string }>) || []).map(
                      (option) => option.value,
                    ),
                  })),
                )
              if (signature(rows) !== signature(translatedRows))
                throw new APIError(
                  '翻译中的字段标识、类型、必填设置和选项值必须与共享资料一致；只修改显示文字。',
                  400,
                )
            }
            for (const [collection, subjectID] of dependencies) {
              if (!subjectID) continue
              const result = await req.payload.find({
                collection: translationSlug(collection) as 'categories-translations',
                depth: 0,
                req,
                draft: false,
                limit: 1,
                where: {
                  and: [
                    { subject: { equals: idOf(subjectID) } },
                    { language: { equals: language } },
                    { _status: { equals: 'published' } },
                  ],
                },
              })
              if (!result.docs.length)
                throw new APIError(
                  `请先发布关联内容 ${collection} #${idOf(subjectID)} 的当前语言翻译。`,
                  400,
                )
            }
            if (slug === 'products' && getPath(subject, 'industryTemplate')) {
              const templateID = idOf(getPath(subject, 'industryTemplate')) as number
              const template = await req.payload.findByID({
                collection: 'industry-templates',
                id: templateID,
                req,
                depth: 0,
              })
              const error = parameterValuesError(
                merged.technicalValues,
                String(templateID),
                template.fields || [],
                true,
              )
              if (error) throw new APIError(error, 400)
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
    })
    source.fields = [
      {
        name: 'translations',
        type: 'ui',
        admin: { components: { Field: '@/components/TranslationManager' } },
      },
      ...archiveFields(source.fields, paths),
    ]
    // Legacy localized values and version histories are private migration archives.
    source.access = { ...source.access, read: authenticated, update: authenticated }
    source.admin = {
      ...source.admin,
      description:
        '共享资料在此维护；语言内容请使用下方翻译管理。旧语言字段和历史版本保留作为迁移归档。',
    }
    if ('versions' in source && source.versions && !global) {
      const collection = source as CollectionConfig
      collection.versions = { ...(typeof collection.versions === 'object' ? collection.versions : {}), maxPerDoc: 0 }
      collection.admin = {
        ...collection.admin,
        components: { edit: { PublishButton: '@/components/SharedSaveButton' } },
        defaultColumns: ['id', 'slug', 'updatedAt'],
        useAsTitle: 'slug',
      }
      // Old publish hooks apply to the archived language model only.
      collection.hooks = {
        ...collection.hooks,
        beforeChange: [],
        beforeOperation: [
          ({ operation, args }) => {
            if (operation === 'restoreVersion')
              throw new APIError('旧版本为只读迁移归档，请在翻译记录中恢复新版本。', 400)
            return args
          },
        ],
      }
      collection.access = { ...collection.access, readVersions: authenticated }
    }
  }
  config.collections = [...(config.collections || []), Languages, SiteCopy, ...translations]
  config.globals = [...(config.globals || []), LanguageSettings]
  return config
}
