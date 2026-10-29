import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Category } from '@/payload-types'
import taxonomy from '../data/yueli-taxonomy.json'
import source from '../data/yueli.json'

const database = new URL(process.env.DATABASE_URL || '')
if (
  !['localhost', '127.0.0.1'].includes(database.hostname) ||
  database.pathname !== '/yueliautomation'
)
  throw new Error('Taxonomy import requires the dedicated local yueliautomation database.')

const termIDs = [...source.categories, ...taxonomy.categories, ...taxonomy.tags].map(
  (term) => term.id,
)
if (new Set(termIDs).size !== termIDs.length)
  throw new Error('Source taxonomy IDs overlap. No records were changed.')

const payload = await getPayload({ config })
const context = { disableRevalidate: true }
try {
  const [existingCategories, existingPosts] = await Promise.all([
    payload.find({
      collection: 'categories',
      pagination: false,
      depth: 0,
      locale: 'en',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'posts',
      pagination: false,
      depth: 0,
      locale: 'en',
      overrideAccess: true,
    }),
  ])
  const backup = path.join('.backups', `yueli-taxonomies-${Date.now()}.json`)
  await fs.mkdir('.backups', { recursive: true })
  await fs.writeFile(
    backup,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        database: 'yueliautomation',
        categories: existingCategories.docs,
        posts: existingPosts.docs.map(({ id, migration, categories, tags }) => ({
          id,
          sourceId: migration?.sourceId,
          categories,
          tags,
        })),
      },
      null,
      2,
    ) + '\n',
  )

  const imported = new Map<number, Category>()
  let created = 0
  for (const [kind, terms] of [
    ['post-category', taxonomy.categories],
    ['post-tag', taxonomy.tags],
  ] as const) {
    for (const term of terms) {
      const existing = existingCategories.docs.find((item) => item.migration?.sourceId === term.id)
      if (existing && existing.taxonomy !== kind)
        throw new Error(
          `Source taxonomy ${term.id} is already assigned to ${existing.taxonomy}. Restore from ${backup} before resolving this conflict.`,
        )
      const record =
        existing ||
        (await payload.create({
          collection: 'categories',
          locale: 'en',
          overrideAccess: true,
          context,
          data: {
            taxonomy: kind,
            title: term.title,
            slug: term.slug,
            description: term.description,
            migration: {
              sourceId: term.id,
              sourcePath: term.path,
              sourceURL: taxonomy.sourceOrigin + term.path,
              contentHTML: term.html || '',
            },
          },
        }))
      imported.set(term.id, record)
      if (!existing) created++
    }
  }

  let updated = 0
  for (const sourcePost of taxonomy.posts) {
    const post = existingPosts.docs.find((item) => item.migration?.sourceId === sourcePost.id)
    if (!post) continue
    const update: { categories?: number[]; tags?: number[] } = {}
    if (!post.categories?.length && sourcePost.categories.length)
      update.categories = sourcePost.categories.map((id) => imported.get(id)!.id)
    if (!post.tags?.length && sourcePost.tags.length)
      update.tags = sourcePost.tags.map((id) => imported.get(id)!.id)
    if (!Object.keys(update).length) continue
    await payload.update({
      collection: 'posts',
      id: post.id,
      locale: 'en',
      data: update,
      overrideAccess: true,
      context,
    })
    updated++
  }
  console.log(
    `Article taxonomies ready: ${created} new terms, ${updated} posts linked. Existing terms and nonempty relations preserved. Backup: ${backup}`,
  )
} finally {
  await payload.destroy()
}
process.exit(0)
