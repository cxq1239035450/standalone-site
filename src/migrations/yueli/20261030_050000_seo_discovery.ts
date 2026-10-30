import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'
import { up as apply } from '../20261029_171455_seo_discovery'
import { migrateSeo } from '@/scripts/seoMigration'
export { down } from '../20261029_171455_seo_discovery'

// The checked standalone bridge may already have applied this same increment.
export async function up(args: MigrateUpArgs) {
  const applied = await args.db.execute(sql`SELECT name FROM payload_migrations WHERE name = '20261029_171455_seo_discovery'`)
  if (applied.rows.length) await migrateSeo(args.payload)
  else await apply(args)
}
