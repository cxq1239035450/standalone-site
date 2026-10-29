import { cache } from 'react'
import type { Category, Post } from '@/payload-types'
import taxonomy from '@/data/yueli-taxonomy.json'
import { getYueli } from './data'
import { plainText } from './html'
import { yueliLocalePath } from '@/i18n/yueliPaths'

export type PostArchiveKind = 'category' | 'tag'
export type PostArchiveDefinition = {
  id: number
  sourceID: number | null
  slug: string
  title: string
  path: string
  description: string
  fromSnapshot: boolean
}

export const postTaxonomyType = (kind: PostArchiveKind) =>
  kind === 'category' ? 'post-category' : 'post-tag'

export function postArchivePath(term: Pick<Category, 'slug' | 'migration'>, kind: PostArchiveKind) {
  const sourcePath = term.migration?.sourcePath
  return sourcePath?.startsWith(`/${kind}/`)
    ? sourcePath
    : `/${kind}/${encodeURIComponent(term.slug || '')}`
}

export function normalizePostTaxonomies(
  kind: PostArchiveKind,
  records: Category[],
): PostArchiveDefinition[] {
  if (records.length)
    return records.map((term) => ({
      id: term.id,
      sourceID: term.migration?.sourceId ?? null,
      slug: term.slug || '',
      title: term.title || term.slug || 'Yueli',
      path: postArchivePath(term, kind),
      description: plainText(term.description || ''),
      fromSnapshot: false,
    }))
  return (kind === 'category' ? taxonomy.categories : taxonomy.tags).map((term) => ({
    id: term.id,
    sourceID: term.id,
    slug: term.slug,
    title: term.title || term.slug || 'Yueli',
    path: term.path,
    description: term.description,
    fromSnapshot: true,
  }))
}

export const getPostArchiveDefinitions = cache(async (kind: PostArchiveKind) => {
  const { payload, locale } = await getYueli()
  const records = await payload.find({
    collection: 'categories',
    where: { taxonomy: { equals: postTaxonomyType(kind) } },
    locale,
    depth: 0,
    pagination: false,
    sort: 'title',
    overrideAccess: false,
  })
  // Snapshots only repair legacy English imports. Dynamic empty translations
  // (or another requested language) must remain empty instead of resurrecting them.
  if (!records.docs.length && (process.env.ENABLE_DYNAMIC_CONTENT === 'true' || locale !== 'en'))
    return []
  return normalizePostTaxonomies(kind, records.docs).map((term) => ({
    ...term,
    path: yueliLocalePath(term.path, locale),
  }))
})

export function postTaxonomiesForPost(
  kind: PostArchiveKind,
  post: Post,
  definitions: PostArchiveDefinition[],
): PostArchiveDefinition[] {
  const field = kind === 'category' ? 'categories' : 'tags'
  const ids = new Set(
    (post[field] || []).map((term) => (typeof term === 'object' ? term.id : term)),
  )
  const source = taxonomy.posts.find((item) => item.id === post.migration?.sourceId)
  return definitions.filter((term) =>
    term.fromSnapshot
      ? term.sourceID !== null && Boolean(source?.[field].includes(term.sourceID))
      : ids.has(term.id),
  )
}

export function postsInArchive(
  kind: PostArchiveKind,
  archive: PostArchiveDefinition,
  posts: Post[],
): Post[] {
  return posts.filter(
    (post) =>
      post._status === 'published' && postTaxonomiesForPost(kind, post, [archive]).length > 0,
  )
}
