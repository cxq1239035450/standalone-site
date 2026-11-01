import 'dotenv/config'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { mediaRoot, snapshotMedia } from '../cache/media'
import { publicMediaTypes } from '../cache/policy'

// Additive filesystem migration. Originals and database references are never changed.
const apply = process.argv.includes('--apply')
const files = await readdir(mediaRoot(), { withFileTypes: true })
let eligible = 0
let completed = 0
let failed = 0
let bytes = 0
for (const file of files) {
  if (!file.isFile()) continue
  const extension = path.extname(file.name).slice(1).toLowerCase().replace(/^jpeg$/, 'jpg').replace(/^ogg$/, 'ogv')
  const mime = publicMediaTypes[extension]
  if (!mime) continue
  eligible++
  bytes += (await stat(path.join(mediaRoot(), file.name))).size
  if (apply) {
    try { await snapshotMedia(file.name, mime); completed++ }
    catch { failed++; console.error(JSON.stringify({ file: file.name, status: 'failed' })) }
  }
}
console.log(JSON.stringify({ apply, eligible, completed, failed, sourceBytes: bytes,
  note: 'Originals unchanged. Dry-run writes nothing; repeated --apply safely reuses content-addressed files.' }))
if (failed) process.exitCode = 1
