import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { assetRoot } from './media'
import { assetPolicy, publicMediaTypes } from './policy'

export async function serveAsset(request: Request, name: string): Promise<Response> {
  const match = /^([a-f0-9]{64})\.([a-z0-9]+)$/.exec(name)
  const mime = match && publicMediaTypes[match[2]]
  if (!mime) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  const file = path.join(assetRoot(), name)
  const info = await stat(file).catch(() => null)
  if (!info?.isFile()) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  const etag = `"${match[1]}"`
  const headers = new Headers({
    'Content-Type': mime, 'Cache-Control': assetPolicy.immutable,
    ETag: etag, 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff',
  })
  const noneMatch = request.headers.get('if-none-match')
  if (noneMatch?.split(',').some(value => value.trim().replace(/^W\//, '') === etag || value.trim() === '*')) {
    return new Response(null, { status: 304, headers })
  }
  let start = 0
  let end = info.size - 1
  let status = 200
  const range = request.method === 'HEAD' ? null : request.headers.get('range')
  const ifRange = request.headers.get('if-range')
  if (range && (!ifRange || ifRange === etag)) {
    const parts = /^bytes=(\d*)-(\d*)$/.exec(range)
    // Ignore unsupported multi-range requests and return a complete representation.
    if (parts && (parts[1] || parts[2])) {
      if (parts[1]) {
        start = Number(parts[1]); end = parts[2] ? Math.min(Number(parts[2]), end) : end
      } else start = Math.max(0, info.size - Number(parts[2]))
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
        headers.set('Content-Range', `bytes */${info.size}`)
        headers.set('Cache-Control', 'no-store')
        return new Response(null, { status: 416, headers })
      }
      status = 206
      headers.set('Content-Range', `bytes ${start}-${end}/${info.size}`)
    }
  }
  headers.set('Content-Length', String(Math.max(0, end - start + 1)))
  if (request.method === 'HEAD' || !info.size) return new Response(null, { status, headers })
  const stream = createReadStream(file, { start, end })
  return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, { status, headers })
}
