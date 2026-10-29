import { createLocalReq, type Payload, type CollectionSlug } from 'payload'
import {
  additionalFields,
  projectTranslation,
  translatedGlobals,
  translationSlug,
  type ContentSource,
} from './contentSchema'
import zh from '../../messages/zh.json'
import en from '../../messages/en.json'

type Document = Record<string, unknown>
export type MigrationReport = {
  source: string
  subject: string | number
  locale: string
  action: string
}[]

/** Never treat shared identifiers, options or assets as evidence of a translation. */
export function hasTranslation(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.some(hasTranslation)
  if (!value || typeof value !== 'object') return false
  return Object.entries(value).some(
    ([key, child]) =>
      ![
        'id',
        'key',
        'type',
        'blockType',
        'version',
        'format',
        'mode',
        'detail',
        'style',
        'direction',
        'tag',
        'value',
        'name',
        'image',
        'media',
        'reference',
        'url',
      ].includes(key) && hasTranslation(child),
  )
}

export function migrationProjection(
  document: Document,
  source: ContentSource,
  paths: string[],
  locale: string,
) {
  const copy = projectTranslation(document, paths)
  if (locale !== 'zh') {
    // These fields were not localized before migration; their old value belongs
    // only to the default language, even if a localized query returned it.
    for (const path of additionalFields[source]) {
      const segments = path.split('.')
      let target = copy
      for (const key of segments.slice(0, -1)) target = (target[key] as Document) || {}
      delete target[segments.at(-1)!]
    }
  }
  return copy
}

export async function migrateLanguageContent(
  payload: Payload,
  apply = false,
): Promise<MigrationReport> {
  const report: MigrationReport = []
  const req = await createLocalReq(
    { context: { languageMigration: true, disableRevalidate: true } },
    payload,
  )
  const transaction = apply ? await payload.db.beginTransaction() : null
  if (apply && !transaction) throw new Error('Transactional database is required for migration.')
  if (transaction) req.transactionID = transaction
  const languageIDs: Record<string, number> = {}
  const translatedIDs = new Map<string, number>()
  try {
    for (const [code, label, htmlLang] of [
      ['zh', '中文', 'zh-CN'],
      ['en', 'English', 'en-US'],
    ]) {
      const found = await payload.find({
        collection: 'languages',
        req,
        depth: 0,
        limit: 1,
        where: { code: { equals: code } },
      })
      if (found.docs[0]) languageIDs[code] = found.docs[0].id
      else if (apply)
        languageIDs[code] = (
          await payload.create({
            collection: 'languages',
            req,
            data: {
              code,
              label,
              htmlLang,
              enabled: false,
              direction: 'ltr',
              sortOrder: code === 'zh' ? 0 : 1,
            },
          })
        ).id
      const copy = languageIDs[code]
        ? await payload.find({
            collection: 'site-copy',
            req,
            depth: 0,
            limit: 1,
            where: { language: { equals: languageIDs[code] } },
          })
        : { docs: [] }
      if (!copy.docs.length && apply)
        await payload.create({
          collection: 'site-copy',
          req,
          data: {
            language: languageIDs[code],
            messages: code === 'zh' ? zh : en,
            _status: 'published',
          },
        })
      report.push({
        source: 'languages',
        subject: code,
        locale: code,
        action: found.docs.length ? 'keep-existing' : 'create',
      })
    }
    // Dependencies first, then content that references them.
    const sources: ContentSource[] = [
      'categories',
      'media',
      'industry-templates',
      'forms',
      'products',
      'posts',
      'pages',
      ...translatedGlobals,
    ]
    for (const source of sources) {
      const global = translatedGlobals.includes(source as (typeof translatedGlobals)[number])
      const collection = translationSlug(source) as CollectionSlug
      const paths = payload.collections[collection].config.custom?.translationPaths as string[]
      const subjects = global
        ? [{ id: source }]
        : (
            await payload.find({
              collection: source as CollectionSlug,
              req,
              depth: 0,
              pagination: false,
              locale: 'zh',
              fallbackLocale: false,
            })
          ).docs
      for (const subject of subjects) {
        for (const locale of ['zh', 'en'] as const) {
          const exists = languageIDs[locale]
            ? await payload.find({
                collection,
                req,
                depth: 0,
                draft: true,
                limit: 1,
                where: {
                  and: [
                    { subject: { equals: subject.id } },
                    { language: { equals: languageIDs[locale] } },
                  ],
                },
              })
            : { docs: [] }
          if (exists.docs[0]) {
            translatedIDs.set(`${source}:${subject.id}:${locale}`, Number(exists.docs[0].id))
            report.push({ source, subject: subject.id, locale, action: 'keep-existing' })
            continue
          }
          const read = async (draft: boolean) =>
            (global
              ? await payload.findGlobal({
                  slug: source as 'header',
                  req,
                  locale,
                  fallbackLocale: false,
                  depth: 0,
                })
              : await payload.findByID({
                  collection: source as CollectionSlug,
                  id: subject.id,
                  req,
                  locale,
                  fallbackLocale: false,
                  draft,
                  depth: 0,
                })) as unknown as Document
          const published = await read(false)
          const draft = global ? published : await read(true)
          const publishedCopy = migrationProjection(published, source, paths, locale)
          const draftCopy = migrationProjection(draft, source, paths, locale)
          const hasPublished = hasTranslation(publishedCopy)
          const hasDraft = hasTranslation(draftCopy)
          const requiredTitle = ['products', 'posts', 'pages', 'categories'].includes(source)
          const complete =
            (source !== 'search-settings' || hasTranslation(publishedCopy.siteName)) &&
            (!requiredTitle || Boolean(publishedCopy.title)) &&
            (source !== 'posts' || hasTranslation(publishedCopy.content)) &&
            (source !== 'pages' || hasTranslation(publishedCopy.layout))
          const validNavigation =
            !['header', 'footer'].includes(source) ||
            !Array.isArray(publishedCopy.navItems) ||
            publishedCopy.navItems.every((item) => {
              const link = item.link as Document | undefined
              return link?.label && (link.type === 'custom' ? link.url : link.reference)
            })
          if (!validNavigation)
            report.push({
              source,
              subject: subject.id,
              locale,
              action: 'invalid-legacy-navigation-preserved-as-draft',
            })
          const canPublish =
            validNavigation &&
            complete &&
            (hasPublished || (global && locale === 'zh')) &&
            (!requiredTitle || Boolean(publishedCopy.title)) &&
            (global ||
              !payload.collections[source as CollectionSlug].config.versions ||
              published._status === 'published')
          if (!hasPublished && !hasDraft && !(global && locale === 'zh')) {
            report.push({ source, subject: subject.id, locale, action: 'skip-no-translation' })
            continue
          }
          report.push({
            source,
            subject: subject.id,
            locale,
            action: canPublish ? 'published' : 'draft',
          })
          if (!apply) continue
          const created = await payload.create({
            collection,
            req,
            draft: !canPublish,
            data: {
              ...(canPublish ? publishedCopy : draftCopy),
              subject: subject.id,
              language: languageIDs[locale],
              _status: canPublish ? 'published' : 'draft',
            } as never,
          })
          translatedIDs.set(`${source}:${subject.id}:${locale}`, Number(created.id))
          if (
            canPublish &&
            hasDraft &&
            (draft._status === 'draft' ||
              JSON.stringify(draftCopy) !== JSON.stringify(publishedCopy))
          ) {
            await payload.update({
              collection,
              id: created.id,
              req,
              draft: true,
              data: { ...draftCopy, _status: 'draft' } as never,
            })
            report.push({ source, subject: subject.id, locale, action: 'preserve-newer-draft' })
          }
        }
      }
    }
    // Keep scheduled publications aimed at the correct new translation record.
    const jobs = await payload.find({
      collection: 'payload-jobs',
      req,
      pagination: false,
      depth: 0,
      where: {
        and: [{ taskSlug: { equals: 'schedulePublish' } }, { completedAt: { exists: false } }],
      },
    })
    for (const job of jobs.docs) {
      const input = job.input as Record<string, unknown> | null
      if (!input) continue
      const reference = input.doc as { relationTo?: string; value?: string } | undefined
      const source = reference?.relationTo || (typeof input.global === 'string' ? input.global : '')
      const subject = reference?.value || source
      if (!source || !sources.includes(source as ContentSource)) continue
      const locale = typeof input.locale === 'string' ? input.locale : 'zh'
      const targetID = translatedIDs.get(`${source}:${subject}:${locale}`)
      if (!targetID) {
        report.push({
          source: 'payload-jobs',
          subject: job.id,
          locale,
          action: 'manual-review-unmapped-schedule',
        })
        if (apply)
          throw new Error(
            `Scheduled publication ${job.id} has no matching ${locale} translation. Review the dry-run report before applying.`,
          )
        continue
      }
      report.push({
        source: 'payload-jobs',
        subject: job.id,
        locale,
        action: 'retarget-scheduled-publication',
      })
      if (apply)
        await payload.update({
          collection: 'payload-jobs',
          id: job.id,
          req,
          data: {
            input: {
              ...input,
              doc: { relationTo: translationSlug(source), value: String(targetID) },
              global: undefined,
              locale: undefined,
            },
          } as never,
        })
    }
    if (apply) {
      // Chinese is safe to enable after its original shared navigation is migrated.
      // English stays in preparation if old nonlocalized navigation/settings are missing.
      const settings = await payload.findGlobal({ slug: 'language-settings', req, depth: 0 })
      if (!settings.defaultLanguage) {
        await payload.update({
          collection: 'languages',
          id: languageIDs.zh,
          req,
          data: { enabled: true },
        })
        await payload.updateGlobal({
          slug: 'language-settings',
          req,
          data: { defaultLanguage: languageIDs.zh },
        })
      }
      await payload.db.commitTransaction(transaction!)
    }
    return report
  } catch (error) {
    if (transaction) await payload.db.rollbackTransaction(transaction)
    throw error
  }
}
