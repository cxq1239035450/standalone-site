import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { up as apply } from '../20261029_173915_inquiry_mail_notifications'
import { migrateInquiryMail } from '@/scripts/inquiryMailMigration'
export { down } from '../20261029_173915_inquiry_mail_notifications'

// The checked standalone bridge may already have applied this same increment.
export async function up(args: MigrateUpArgs) {
  const applied = await args.db.execute(sql`SELECT name FROM payload_migrations WHERE name = '20261029_173915_inquiry_mail_notifications'`)
  if (applied.rows.length) await migrateInquiryMail(args.payload)
  else await apply(args)
}
