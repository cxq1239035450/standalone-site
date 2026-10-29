import {
  getPayload as getRawPayload,
  type Payload,
  type CollectionSlug,
  type GlobalSlug,
  type DataFromCollectionSlug,
  type DataFromGlobalSlug,
  type PaginatedDocs,
  type Where,
} from 'payload'
import { isContentSource, mergeTranslation, translationSlug } from './contentSchema'
import type { User } from '@/payload-types'
import { Banner } from '@/blocks/Banner/config'
import { Code } from '@/blocks/Code/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

type FindArgs<T extends CollectionSlug> = Omit<
  Parameters<Payload['find']>[0],
  'collection' | 'locale' | 'fallbackLocale' | 'select'
> & {
  select?: Record<string, unknown>
  collection: T
  locale?: string
  fallbackLocale?: string | false
}
type ByIDArgs<T extends CollectionSlug> = Omit<
  Parameters<Payload['findByID']>[0],
  'collection' | 'locale' | 'fallbackLocale' | 'select'
> & {
  select?: Record<string, unknown>
  collection: T
  locale?: string
  fallbackLocale?: string | false
}
type GlobalArgs<T extends GlobalSlug> = Omit<
  Parameters<Payload['findGlobal']>[0],
  'slug' | 'locale' | 'fallbackLocale'
> & { slug: T; locale?: string; fallbackLocale?: string | false }

/** Translate query paths to the translation table or its shared subject relation. */
export function translationWhere(where: Where | undefined, paths: string[]): Where {
  return Object.fromEntries(
    Object.entries(where || {}).map(([key, value]) => {
      if (key.startsWith('shared.')) return [`subject.${key.slice(7)}`, value]
      if (key === 'and' || key === 'or')
        return [key, (value as Where[]).map((item) => translationWhere(item, paths))]
      if (key === '_status' || paths.some((path) => key === path || key.startsWith(`${path}.`)))
        return [key, value]
      return [`subject.${key}`, value]
    }),
  )
}

export function createContentReader(raw: Payload, previewUser?: User | null) {
  async function languageFor(code?: string, user?: unknown) {
    if (!code) {
      const settings = await raw.findGlobal({
        slug: 'language-settings',
        depth: 0,
        overrideAccess: false,
      })
      return raw.findByID({
        collection: 'languages',
        id: settings.defaultLanguage as number,
        depth: 0,
        overrideAccess: false,
      })
    }
    const result = await raw.find({
      collection: 'languages',
      where: { code: { equals: code } },
      depth: 0,
      limit: 1,
      overrideAccess: false,
      user: user as never,
    })
    return result.docs[0]
  }
  async function resolveRelations(
    document: Record<string, unknown>,
    source: string,
    locale: string,
    depth: number,
    user?: unknown,
  ): Promise<Record<string, unknown>> {
    if (depth <= 0) return document
    const fields =
      raw.collections[source as CollectionSlug]?.config.fields ||
      raw.globals.config.find((global) => global.slug === source)?.fields ||
      []
    async function richText(value: unknown): Promise<void> {
      if (!value || typeof value !== 'object') return
      if (Array.isArray(value)) {
        for (const child of value) await richText(child)
        return
      }
      const node = value as Record<string, unknown>
      if (typeof node.relationTo === 'string' && isContentSource(node.relationTo) && node.value) {
        const id = typeof node.value === 'object' && 'id' in node.value ? node.value.id : node.value
        node.value = await reader.findByID({
          collection: node.relationTo as CollectionSlug,
          id: id as number,
          locale,
          depth: depth - 1,
          user: user as never,
          disableErrors: true,
        })
      }
      const block = node.fields as Record<string, unknown> | undefined
      const definition =
        block && [Banner, Code, MediaBlock].find((item) => item.slug === block.blockType)
      if (block && definition) await walk(block, definition.fields)
      if (node.root) await richText(node.root)
      if (node.children) await richText(node.children)
    }
    async function walk(value: Record<string, unknown>, schema: typeof fields): Promise<void> {
      for (const field of schema) {
        if (field.type === 'tabs') {
          for (const tab of field.tabs)
            await walk(
              'name' in tab ? (value[tab.name] as Record<string, unknown>) || {} : value,
              tab.fields,
            )
          continue
        }
        if (!('name' in field)) {
          if ('fields' in field) await walk(value, field.fields)
          continue
        }
        const item = value[field.name]
        if (!item) continue
        if (field.type === 'relationship' || field.type === 'upload') {
          const resolve = async (relation: unknown): Promise<unknown> => {
            const polymorphic = Array.isArray(field.relationTo)
            const relationObject = relation as { relationTo?: string; value?: unknown; id?: number }
            const collection = polymorphic
              ? relationObject.relationTo!
              : (field.relationTo as string)
            const reference = polymorphic ? relationObject.value : relation
            const id =
              reference && typeof reference === 'object' && 'id' in reference
                ? reference.id
                : reference
            if (!isContentSource(collection)) return relation
            const related = await reader.findByID({
              collection: collection as CollectionSlug,
              id: id as number,
              locale,
              depth: depth - 1,
              disableErrors: true,
              user: user as never,
              overrideAccess: false,
            })
            return polymorphic && related ? { relationTo: collection, value: related } : related
          }
          value[field.name] = Array.isArray(item)
            ? (await Promise.all(item.map(resolve))).filter(Boolean)
            : await resolve(item)
        } else if (field.type === 'richText') {
          await richText(item)
        } else if (field.type === 'blocks' && Array.isArray(item)) {
          for (const row of item) {
            const block = field.blocks.find(
              (block) => typeof block !== 'string' && block.slug === row.blockType,
            )
            if (block && typeof block !== 'string') await walk(row, block.fields)
          }
        } else if ('fields' in field) {
          for (const row of Array.isArray(item) ? item : [item])
            if (row && typeof row === 'object') await walk(row, field.fields)
        }
      }
    }
    await walk(document, fields)
    return document
  }
  const reader = {
    async count<T extends CollectionSlug>(args: FindArgs<T>) {
      const result = await reader.find({ ...args, limit: 1, depth: 0 })
      return { totalDocs: result.totalDocs }
    },
    async find<T extends CollectionSlug>(
      args: FindArgs<T>,
    ): Promise<PaginatedDocs<DataFromCollectionSlug<T>>> {
      args = { ...args, user: args.user || previewUser }
      if (!isContentSource(args.collection))
        return raw.find(args as Parameters<Payload['find']>[0]) as Promise<
          PaginatedDocs<DataFromCollectionSlug<T>>
        >
      const language = await languageFor(args.locale, args.user)
      if (!language)
        return {
          docs: [],
          totalDocs: 0,
          limit: args.limit || 10,
          totalPages: 1,
          page: 1,
          pagingCounter: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        }
      const collection = translationSlug(args.collection) as CollectionSlug
      const paths = raw.collections[collection].config.custom?.translationPaths as string[]
      const sortPath = (key: string) => {
        const descending = key.startsWith('-')
        const path = descending ? key.slice(1) : key
        return `${descending ? '-' : ''}${path === '_status' || paths.includes(path) ? path : `subject.${path}`}`
      }
      const result = await raw.find({
        collection,
        depth: 0,
        pagination: args.pagination,
        limit: args.limit,
        page: args.page,
        sort: args.sort
          ? Array.isArray(args.sort)
            ? args.sort.map(sortPath)
            : sortPath(args.sort)
          : undefined,
        // Shared source records are private archives. The composed reader is a
        // trusted projection: languageFor checks visibility and the mandatory
        // published predicate below cannot be overridden by caller predicates.
        draft: Boolean(args.draft && args.user),
        user: args.user,
        overrideAccess: true,
        where: {
          and: [
            { language: { equals: language.id } },
            ...(args.user && args.draft ? [] : [{ _status: { equals: 'published' } }]),
            translationWhere(args.where, paths),
          ],
        },
      })
      const docs = await Promise.all(
        result.docs.map(async (row) => {
          const translation = row as unknown as Record<string, unknown>
          // Only this internal lookup bypasses access; translated projection below removes legacy text.
          const base = await raw.findByID({
            collection: args.collection,
            id: translation.subject as number,
            depth: 0,
            locale: 'zh',
            fallbackLocale: false,
            overrideAccess: true,
            disableErrors: true,
          })
          if (!base) return null
          const document = mergeTranslation(
            base as unknown as Record<string, unknown>,
            translation,
            paths,
          )
          document.updatedAt = translation.updatedAt
          return resolveRelations(
            document,
            args.collection,
            language.code,
            args.depth ?? 1,
            args.user,
          )
        }),
      )
      return { ...result, docs: docs.filter(Boolean) } as unknown as PaginatedDocs<
        DataFromCollectionSlug<T>
      >
    },
    async findByID<T extends CollectionSlug>(
      args: ByIDArgs<T>,
    ): Promise<DataFromCollectionSlug<T>> {
      if (!isContentSource(args.collection))
        return raw.findByID(args as Parameters<Payload['findByID']>[0]) as Promise<
          DataFromCollectionSlug<T>
        >
      const result = await reader.find({ ...args, limit: 1, where: { id: { equals: args.id } } })
      // Files are shared assets. An absent caption translation must not hide the file
      // or leak an archived caption in a different language.
      if (!result.docs.length && args.collection === 'media' && (await languageFor(args.locale))) {
        const media = await raw.findByID({
          collection: 'media',
          id: args.id,
          depth: 0,
          overrideAccess: true,
          disableErrors: true,
        })
        if (media) return { ...media, alt: null, caption: null } as DataFromCollectionSlug<T>
      }
      if (!result.docs.length && !args.disableErrors)
        throw new Error('Published translation not found')
      return result.docs[0] || (null as unknown as DataFromCollectionSlug<T>)
    },
    async findGlobal<T extends GlobalSlug>(args: GlobalArgs<T>): Promise<DataFromGlobalSlug<T>> {
      args = { ...args, user: args.user || previewUser }
      if (!isContentSource(args.slug))
        return raw.findGlobal(args as Parameters<Payload['findGlobal']>[0]) as Promise<
          DataFromGlobalSlug<T>
        >
      const language = await languageFor(args.locale, args.user)
      const collection = translationSlug(args.slug) as CollectionSlug
      const paths = raw.collections[collection].config.custom?.translationPaths as string[]
      const base = await raw.findGlobal({
        slug: args.slug,
        draft: Boolean(args.draft && args.user),
        user: args.user,
        depth: 0,
        locale: 'zh',
        fallbackLocale: false,
        overrideAccess: true,
      })
      const result = language
        ? await raw.find({
            collection,
            depth: 0,
            limit: 1,
            draft: Boolean(args.draft && args.user),
            user: args.user,
            overrideAccess: false,
            where: {
              and: [
                { language: { equals: language.id } },
                ...(args.draft && args.user ? [] : [{ _status: { equals: 'published' } }]),
              ],
            },
          })
        : { docs: [] }
      // Payload globals do not filter their base row by publication status.
      // After withdrawal (or before first publication), never expose the saved
      // rules through public readers; only authenticated draft previews may use
      // them. Published language text may still merge onto these safe defaults.
      const publicBase = args.slug === 'search-settings' && !(args.draft && args.user) &&
        (base as unknown as Record<string, unknown>)._status !== 'published'
        ? {
            id: base.id,
            _status: 'draft',
            allowIndexing: false,
            allowCrawling: false,
            sitemap: { enabled: false },
            geo: { enabled: false },
          }
        : base
      const document = mergeTranslation(
        publicBase as unknown as Record<string, unknown>,
        (result.docs[0] || {}) as unknown as Record<string, unknown>,
        paths,
      )
      return (await resolveRelations(
        document,
        args.slug,
        language?.code || '',
        args.depth ?? 1,
      )) as unknown as DataFromGlobalSlug<T>
    },
  }
  return reader
}

export async function getPayload(args: Parameters<typeof getRawPayload>[0]) {
  const { getPreviewUser } = await import('./preview')
  return createContentReader(await getRawPayload(args), await getPreviewUser())
}
