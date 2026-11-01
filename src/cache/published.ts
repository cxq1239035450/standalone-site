import type { Payload } from 'payload'

type Document = Record<string, unknown> & { id: number | string; updatedAt?: string }
type Entry = { revision: string; document: Document; expires: number; bytes: number }
const stores = new WeakMap<Payload, Map<string, Entry>>()
const stats = { hits: 0, misses: 0 }
export const publishedCacheStatus = () => ({ ...stats, maxEntries: 512, maxBytes: 32 * 1024 * 1024 })

/** Cache only published translation bodies. Membership and revision are queried live on EVERY read.
 * No user, draft, stock, language permission or relation expansion is captured in this cache.
 * Independent workers naturally observe new revisions without an invalidation bus.
 */
export async function findPublished(raw: Payload, args: Parameters<Payload['find']>[0]) {
  if (args.user || args.draft || process.env.PUBLIC_CONTENT_CACHE === '0') return raw.find(args)
  if (!args.collection.endsWith('-translations')) throw new Error('Only published translations may use this cache')
  const heads = await raw.find({ ...args, depth: 0, select: { id: true, updatedAt: true, subject: true } })
  let store = stores.get(raw)
  if (!store) { store = new Map(); stores.set(raw, store) }
  const found = new Map<number | string, Document>()
  const missing: (number | string)[] = []
  for (const head of heads.docs as unknown as Document[]) {
    const key = `${args.collection}:${head.id}`
    const entry = store.get(key)
    if (entry && entry.revision === head.updatedAt && entry.expires > Date.now()) {
      stats.hits++
      store.delete(key); store.set(key, entry)
      found.set(head.id, structuredClone(entry.document))
    } else { stats.misses++; missing.push(head.id); store.delete(key) }
  }
  for (let offset = 0; offset < missing.length; offset += 100) {
    const batch = await raw.find({
      ...args, depth: 0, pagination: false, page: 1, limit: 100,
      where: { and: [args.where || {}, { id: { in: missing.slice(offset, offset + 100) } }] },
    })
    for (const document of batch.docs as unknown as Document[]) {
      found.set(document.id, document)
      const bytes = Buffer.byteLength(JSON.stringify(document))
      if (!document.updatedAt || bytes > 1024 * 1024) continue
      const key = `${args.collection}:${document.id}`
      store.set(key, { revision: document.updatedAt, document: structuredClone(document), bytes, expires: Date.now() + 300_000 })
      let total = [...store.values()].reduce((sum, item) => sum + item.bytes, 0)
      while (store.size > 512 || total > 32 * 1024 * 1024) {
        const oldest = store.keys().next().value!
        total -= store.get(oldest)!.bytes
        store.delete(oldest)
      }
    }
  }
  return { ...heads, docs: heads.docs.flatMap(head => found.has(head.id) ? [found.get(head.id)!] : []) } as unknown as typeof heads
}
