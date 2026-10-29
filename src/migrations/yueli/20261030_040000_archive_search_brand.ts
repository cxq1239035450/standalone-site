import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Dynamic content keeps the former shared brand as an optional archive field.
  // Its translated replacement is validated on publication; preserve the old value.
  await db.execute(sql`ALTER TABLE "search_settings" ALTER COLUMN "site_name" DROP NOT NULL`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Restore the verified backup; archived brand names may now legitimately be empty.')
}
