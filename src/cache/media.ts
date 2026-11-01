import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { link, mkdir, readFile, realpath, rename, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { CollectionAfterReadHook } from 'payload'
import { publicMediaTypes } from './policy'

export const mediaRoot = () => path.resolve(process.env.MEDIA_DIR || 'public/media')
export const assetRoot = () => path.resolve(process.env.MEDIA_CACHE_DIR || path.join(mediaRoot(), '.immutable'))
const entries = new Map<string, { signature: string; url: string }>()
const pending = new Map<string, Promise<string>>()
let active = 0
const waiting: (() => void)[] = []
const counters = { hits: 0, generated: 0, failures: 0 }
export const mediaCacheStatus = () => ({ ...counters, entries: entries.size, active, queued: waiting.length })

/** Limit disk work during cold starts and concurrent image-heavy requests. */
async function limited<T>(work: () => Promise<T>): Promise<T> {
  if (active >= 2) await new Promise<void>(resolve => waiting.push(resolve))
  else active++
  try { return await work() } finally {
    const next = waiting.shift()
    if (next) next()
    else active--
  }
}

export async function snapshotMedia(filename: string, mimeType: string): Promise<string> {
  const extension = Object.keys(publicMediaTypes).find(key => publicMediaTypes[key] === mimeType)
  if (!extension || !filename || path.basename(filename) !== filename || /[\\/\x00]/.test(filename)) {
    throw new Error('Unsupported public media file')
  }
  const root = await realpath(mediaRoot())
  const source = await realpath(path.join(root, filename))
  if (path.dirname(source) !== root) throw new Error('Media path escapes storage directory')
  const key = `${source}:${extension}`
  const running = pending.get(key)
  if (running) return running
  const task = limited(async () => {
    const before = await stat(source, { bigint: true })
    if (!before.isFile()) throw new Error('Media is not a regular file')
    const signature = `${before.ino}:${before.size}:${before.mtimeNs}:${before.ctimeNs}`
    const index = path.join(assetRoot(), '.index', `${createHash('sha256').update(key).digest('hex')}.json`)
    let cached = entries.get(key)
    if (!cached) {
      try {
        const saved = JSON.parse(await readFile(index, 'utf8'))
        if (typeof saved.signature === 'string' && new RegExp(`^/assets/media/[a-f0-9]{64}\\.${extension}$`).test(saved.url)) cached = saved
      } catch { /* Missing or interrupted index: regenerate from the original file. */ }
    }
    if (cached?.signature === signature) {
      const target = path.join(assetRoot(), path.basename(cached.url))
      if (await stat(target).then(s => s.isFile(), () => false)) {
        counters.hits++
        if (entries.size >= 2048) entries.delete(entries.keys().next().value!)
        entries.set(key, cached)
        return cached.url
      }
    }
    await mkdir(assetRoot(), { recursive: true })
    const temporary = path.join(assetRoot(), `.tmp-${randomUUID()}`)
    try {
      const hash = createHash('sha256')
      await pipeline(createReadStream(source), new Transform({
        transform(chunk, _encoding, callback) { hash.update(chunk); callback(null, chunk) },
      }), createWriteStream(temporary, { flags: 'wx' }))
      const name = `${hash.digest('hex')}.${extension}`
      const after = await stat(source, { bigint: true })
      if (`${after.ino}:${after.size}:${after.mtimeNs}:${after.ctimeNs}` !== signature) {
        throw new Error('Source changed during snapshot; retry on the next read')
      }
      // Atomic hard-link publication: a reader must never observe a partly written object.
      await link(temporary, path.join(assetRoot(), name)).catch(error => {
        if (error.code !== 'EEXIST') throw error
      })
      const url = `/assets/media/${name}`
      if (`${after.ino}:${after.size}:${after.mtimeNs}:${after.ctimeNs}` === signature) {
        if (entries.size >= 2048) entries.delete(entries.keys().next().value!)
        entries.set(key, { signature, url })
        // Persist only file signatures/URLs so CLI prewarming also avoids hashing on the next boot.
        const indexTemporary = `${index}.${randomUUID()}.tmp`
        try {
          await mkdir(path.dirname(index), { recursive: true })
          await writeFile(indexTemporary, JSON.stringify({ signature, url }), { flag: 'wx' })
          await rename(indexTemporary, index)
        } catch { /* The immutable file is valid even if the optional acceleration index is unavailable. */ }
        finally { await unlink(indexTemporary).catch(() => undefined) }
      }
      counters.generated++
      return url
    } finally { await unlink(temporary).catch(() => undefined) }
  })
  pending.set(key, task)
  try { return await task } catch (error) { counters.failures++; throw error }
  finally { pending.delete(key) }
}

/** Binary media is already public; archived text and private collections are never cached here. */
export const publicMediaURL: CollectionAfterReadHook = async ({ doc, collection, req }) => {
  if (process.env.MEDIA_IMMUTABLE_CACHE === '0' || !collection.upload || collection.upload.disableLocalStorage) return doc
  if (!doc.filename || !Object.values(publicMediaTypes).includes(doc.mimeType)) return doc
  try {
    const url = await snapshotMedia(doc.filename, doc.mimeType)
    return { ...doc, url }
  } catch {
    // A missing file/cache volume must not break content pages. Keep the original URL.
    req.payload.logger.warn({ msg: 'Public media snapshot unavailable; using original URL', mediaID: doc.id })
    return doc
  }
}
