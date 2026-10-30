import 'dotenv/config'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { getPayload, createLocalReq } from 'payload'
import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'
import config from '@payload-config'
import { migrations } from '@/migrations/yueli'

// Apply only this audited release's increments, atomically. Never replay init,
// remove the dev record, push a schema, or manufacture historical completions.
const expectedDatabase = process.argv.find(arg => arg.startsWith('--database='))?.slice(11)
const backup = process.argv.find(arg => arg.startsWith('--backup='))?.slice(9)
const apply = process.argv.includes('--apply')
assert.ok(expectedDatabase && backup?.startsWith('/'), 'Specify --database and an absolute --backup path')
assert.ok(backup)
assert.equal(new URL(process.env.DATABASE_URL!).pathname, `/${expectedDatabase}`)
assert.notEqual(process.env.INQUIRY_EMAIL_AUTORUN, 'true')
assert.ok((await fs.stat(backup)).size > 0)
const payload = await getPayload({ config })
try {
  const records = (await payload.db.drizzle.execute(sql`SELECT name,batch FROM payload_migrations`)).rows as {name:string;batch:number}[]
  const baseline = migrations.slice(0, 4)
  assert.ok(baseline.every(item => records.some(record => record.name === item.name)), 'Verified Yueli baseline is required')
  const release = migrations.slice(4)
  assert.equal(release.length, 3)
  assert.ok(records.every(record => record.name === 'dev' || migrations.some(item => item.name === record.name)), 'Unexpected migration history requires review')
  const pending = release.filter(item => !records.some(record => record.name === item.name))
  assert.ok(pending.length === 0 || pending.length === 3, 'Partially applied release requires review')
  if (apply && pending.length) {
    const req = await createLocalReq({ context: { disableRevalidate: true } }, payload)
    const transactionID = await payload.db.beginTransaction()
    assert.ok(transactionID, 'Transaction required')
    req.transactionID = transactionID
    try {
      const db = payload.db.sessions?.[transactionID]?.db as MigrateUpArgs['db'] | undefined
      assert.ok(db, 'Missing transaction session')
      await db.execute(sql`SELECT pg_advisory_xact_lock(hashtext('yueli:seo-mail-release'))`)
      const batch = Math.max(0, ...records.map(item => Number(item.batch))) + 1
      for (const migration of pending) {
        await migration.up({ db, payload, req })
        await payload.create({ collection: 'payload-migrations', req, data: { name: migration.name, batch } })
      }
      await payload.db.commitTransaction(transactionID)
    } catch (error) {
      await payload.db.rollbackTransaction(transactionID)
      throw error
    }
  }
  console.log(JSON.stringify({ database: expectedDatabase, state: pending.length ? (apply ? 'applied' : 'ready') : 'already-applied', migrations: pending.map(item => item.name) }))
} finally { await payload.destroy() }
process.exit(0)
