import 'dotenv/config'
import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import { getTableConfig } from '@payloadcms/db-postgres/drizzle/pg-core'
import config from '@payload-config'
import { createContentReader } from '@/i18n/content'

const payload = await getPayload({ config })
try {
  const { rows } = await payload.db.pool.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public'")
  const columns = new Set(rows.map((row: {table_name:string;column_name:string}) => `${row.table_name}.${row.column_name}`))
  let checkedColumns = 0
  for (const table of Object.values(payload.db.tables)) {
    const definition = getTableConfig(table)
    for (const column of definition.columns) {
      assert.ok(columns.has(`${definition.name}.${column.name}`), `Missing column ${definition.name}.${column.name}`)
      checkedColumns++
    }
  }
  const reader = createContentReader(payload)
  const counts: Record<string, number> = {}
  for (const collection of ['products','posts','pages'] as const) {
    const result = await reader.find({ collection, locale: 'en', fallbackLocale: false, draft: false, overrideAccess: false, depth: 0, pagination: false, where: { _status: { equals: 'published' } } })
    assert.ok(result.docs.length > 0)
    assert.ok(result.docs.every(doc => doc.title?.trim() && doc._status === 'published'))
    counts[collection] = result.docs.length
  }
  const settings = await reader.findGlobal({ slug: 'search-settings', locale: 'en', draft: false, overrideAccess: false, depth: 0 })
  assert.equal(settings.siteUrl, 'https://yueliautomation.com')
  assert.equal(settings.allowIndexing, true)
  const forms = await reader.find({ collection: 'forms', locale: 'en', draft: false, overrideAccess: false, depth: 0, pagination: false })
  assert.ok(forms.docs.length)
  for (const form of forms.docs) for (const key of ['mailEnabled','mailMode','mailRecipients','mailSubject','mailReplyField','mailLegacy']) assert.ok(!(key in form), `Public form leaked ${key}`)
  await assert.rejects(payload.findGlobal({ slug: 'inquiry-mail-settings', overrideAccess: false }))
  await assert.rejects(payload.find({ collection: 'inquiry-mail-deliveries', overrideAccess: false }))
  console.log(JSON.stringify({ checkedColumns, publishedEnglish: counts, publicForms: forms.docs.length, privateMailDataProtected: true }))
} finally { await payload.destroy() }
process.exit(0)
