import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'
import baseline from '../yueli-support/baseline.json'
import { assertBaseline, schemaQuery } from '../yueli-support/schema'

// Adoption migration for the audited, restored Yueli database. It deliberately
// refuses empty or different databases rather than replaying another site's init.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const result = await db.execute(sql.raw(schemaQuery))
  assertBaseline(result.rows[0].snapshot, baseline)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Restore the verified Yueli backup; the adopted baseline cannot be reversed.')
}
