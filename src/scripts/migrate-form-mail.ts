import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { migrateFormMail } from './formMailMigration'

const apply = process.argv.includes('--apply')
const backup = process.argv.find(argument => argument.startsWith('--backup='))?.slice(9)
if (apply) {
  const stat = backup && path.isAbsolute(backup) ? await fs.stat(backup).catch(() => null) : null
  if (!stat?.isFile() || !stat.size) throw new Error('Restore-test a database backup first, then pass --backup=/absolute/path.dump with --apply.')
}
const payload = await getPayload({config})
try {
  const report = await migrateFormMail(payload, apply)
  console.log(JSON.stringify({apply, migration:'20261030_094707_form_mail_routing', ...report}, null, 2))
  if (!apply) console.log('Read-only schema check completed. No database changes were made.')
} finally { await payload.destroy() }
process.exit(0)
