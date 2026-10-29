import 'dotenv/config'
import fs from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '@payload-config'
import layouts from '../data/yueli-page-layouts.json'

const database = new URL(process.env.DATABASE_URL || '')
if (
  !['localhost', '127.0.0.1'].includes(database.hostname) ||
  database.pathname !== '/yueliautomation'
) {
  throw new Error('Page layout import requires the dedicated local yueliautomation database.')
}
const payload = await getPayload({ config })
const backup = []
try {
  for (const layout of layouts) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { 'migration.sourceId': { equals: layout.sourceId } },
      locale: 'en',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const page = docs[0]
    if (!page) throw new Error(`Import the page records first: ${layout.slug}`)
    backup.push({ id: page.id, slug: page.slug, migration: page.migration })
  }
  await fs.mkdir('.backups', { recursive: true })
  await fs.writeFile(`.backups/page-layouts-${Date.now()}.json`, JSON.stringify(backup, null, 2))
  for (const layout of layouts) {
    const previous = backup.find((page) => page.slug === layout.slug)!
    await payload.update({
      collection: 'pages',
      id: previous.id,
      locale: 'en',
      overrideAccess: true,
      context: { disableRevalidate: true },
      data: { migration: { ...previous.migration, contentHTML: layout.html } },
    })
    console.log(`Restored editable original layout: /${layout.slug}`)
  }
} finally {
  await payload.destroy()
}
