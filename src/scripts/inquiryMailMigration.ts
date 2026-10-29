import fs from 'node:fs/promises'
import { createLocalReq, type Payload } from 'payload'
import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { up } from '@/migrations/20261029_173915_inquiry_mail_notifications'

export const inquiryMailMigrationName = '20261029_173915_inquiry_mail_notifications'
type Snapshot = { tables: Record<string, { name: string; columns: Record<string, unknown> }> }
const columnsOf = (snapshot: Snapshot) => Object.values(snapshot.tables).flatMap(table =>
  Object.keys(table.columns).map(column => `${table.name}.${column}`))

/** A checked, additive bridge for legacy dev databases. Does not mark old migrations as applied. */
export async function migrateInquiryMail(payload: Payload, apply = false) {
  const before = JSON.parse(await fs.readFile(new URL('../migrations/20261029_171455_seo_discovery.json', import.meta.url), 'utf8')) as Snapshot
  const after = JSON.parse(await fs.readFile(new URL('../migrations/20261029_173915_inquiry_mail_notifications.json', import.meta.url), 'utf8')) as Snapshot
  const baseline = columnsOf(before)
  const added = columnsOf(after).filter(column => !baseline.includes(column))
  const inspect = async (db: MigrateUpArgs['db']) => {
    const result = await db.execute(sql`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`)
    const actual = new Set((result.rows as {table_name:string;column_name:string}[]).map(row => `${row.table_name}.${row.column_name}`))
    const missingBaseline = baseline.filter(column => !actual.has(column))
    if (missingBaseline.length) throw new Error(`SEO and multilingual baseline is incomplete. Missing: ${missingBaseline.slice(0, 15).join(', ')}`)
    const records = await db.execute(sql`SELECT name, batch FROM payload_migrations`)
    const migrations = records.rows as {name:string;batch:number}[]
    const hasRecord = migrations.some(record => record.name === inquiryMailMigrationName)
    const present = added.filter(column => actual.has(column))
    const enums = await db.execute(sql`SELECT t.typname FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
      WHERE e.enumlabel = 'sendInquiryMail' AND t.typname IN ('enum_payload_jobs_task_slug', 'enum_payload_jobs_log_task_slug')`)
    if (hasRecord && (present.length !== added.length || enums.rows.length !== 2)) throw new Error('Inquiry mail migration is recorded but its schema is incomplete. Restore or repair the database before continuing.')
    if (!hasRecord && (present.length || enums.rows.length)) throw new Error('Inquiry mail schema exists without its migration record (or is partially applied). Refusing to repeat or silently mark it complete.')
    return {state: hasRecord ? 'already-applied' as const : 'ready' as const, newColumns: added.length,
      batch: Math.max(0, ...migrations.map(record => Number(record.batch) || 0)) + 1}
  }
  if (!apply) return inspect(payload.db.drizzle)
  const req = await createLocalReq({context:{disableRevalidate:true}}, payload)
  const transactionID = await payload.db.beginTransaction()
  if (!transactionID) throw new Error('A database transaction is required for the Inquiry mail migration.')
  req.transactionID = transactionID
  const db = payload.db.sessions?.[transactionID]?.db as MigrateUpArgs['db'] | undefined
  if (!db) {
    await payload.db.rollbackTransaction(transactionID)
    throw new Error('Database transaction session was not created.')
  }
  try {
    await db.execute(sql`SELECT pg_advisory_xact_lock(hashtext('standalone-site:inquiry-mail-migration'))`)
    const report = await inspect(db)
    if (report.state === 'ready') {
      await up({db, payload, req})
      await payload.create({collection:'payload-migrations', req, data:{name:inquiryMailMigrationName, batch:report.batch}})
    }
    await payload.db.commitTransaction(transactionID)
    return {...report, state: report.state === 'ready' ? 'applied' as const : report.state}
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
