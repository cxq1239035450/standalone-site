import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { migrateLanguageContent } from '@/i18n/migrateContent'

const apply = process.argv.includes('--apply')
const backup = process.argv.find((argument) => argument.startsWith('--backup='))?.slice(9)
if (apply && (!backup || !(await fs.stat(backup)).isFile() || (await fs.stat(backup)).size === 0)) {
  throw new Error(
    'Before --apply, restore-test a pg_dump backup on a database copy and provide --backup=/absolute/path.dump.',
  )
}
const payload = await getPayload({ config })
try {
  const report = await migrateLanguageContent(payload, apply)
  const directory = path.resolve('.backups')
  await fs.mkdir(directory, { recursive: true })
  const output = path.join(
    directory,
    `languages-${apply ? 'applied' : 'dry-run'}-${Date.now()}.json`,
  )
  await fs.writeFile(
    output,
    JSON.stringify({ apply, generatedAt: new Date().toISOString(), report }, null, 2),
  )
  console.log(
    `${apply ? 'Applied' : 'Dry run (no content changed)'}: ${report.length} checks. Report: ${output}`,
  )
} finally {
  await payload.destroy()
}

// Payload background timers may keep a completed one-shot CLI alive.
process.exit(0)
