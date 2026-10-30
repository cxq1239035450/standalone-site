import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { up as apply } from '../20261030_094707_form_mail_routing'
import { migrateFormMail } from '@/scripts/formMailMigration'
export { down } from '../20261030_094707_form_mail_routing'

// The checked standalone bridge may already have applied this same increment.
export async function up(args: MigrateUpArgs) {
  const applied = await args.db.execute(sql`SELECT name FROM payload_migrations WHERE name = '20261030_094707_form_mail_routing'`)
  if (applied.rows.length) await migrateFormMail(args.payload)
  else await apply(args)
}
