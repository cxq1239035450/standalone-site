// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { Payload } from 'payload'
import { snapshotMedia } from '@/cache/media'
import { serveAsset } from '@/cache/serveAsset'
import { findPublished } from '@/cache/published'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cacheStatusEndpoint } from '@/endpoints/cacheStatus'

describe('immutable public media', () => {
  let root: string
  beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), 'site-media-test-'))
    vi.stubEnv('MEDIA_DIR', root)
    vi.stubEnv('MEDIA_CACHE_DIR', path.join(root, 'objects'))
  })
  afterEach(async () => { vi.unstubAllEnvs(); await rm(root, { recursive: true, force: true }) })
  it('reuses identical bytes, publishes atomically, and preserves old bytes after replacement', async () => {
    await writeFile(path.join(root, 'clip.mp4'), '0123456789')
    const urls = await Promise.all(Array.from({ length: 8 }, () => snapshotMedia('clip.mp4', 'video/mp4')))
    expect(new Set(urls).size).toBe(1)
    expect((await readdir(path.join(root, 'objects'))).filter(name => !name.startsWith('.'))).toHaveLength(1)
    await writeFile(path.join(root, 'clip.mp4'), 'new video content')
    const replacement = await snapshotMedia('clip.mp4', 'video/mp4')
    expect(replacement).not.toBe(urls[0])
    expect(await readFile(path.join(root, 'objects', path.basename(urls[0])), 'utf8')).toBe('0123456789')
    expect(await snapshotMedia('clip.mp4', 'video/mp4')).toBe(replacement)
    vi.resetModules()
    const restarted = await import('@/cache/media')
    expect(await restarted.snapshotMedia('clip.mp4', 'video/mp4')).toBe(replacement)
    expect(restarted.mediaCacheStatus()).toMatchObject({ hits: 1, generated: 0 })
  })
  it('supports cache validators, HEAD, ranges and If-Range without caching errors', async () => {
    await writeFile(path.join(root, 'clip.mp4'), '0123456789')
    const name = path.basename(await snapshotMedia('clip.mp4', 'video/mp4'))
    const request = (headers = {}, method = 'GET') => new Request('http://localhost/assets/media/' + name, { headers, method })
    const full = await serveAsset(request(), name)
    expect(full.headers.get('cache-control')).toContain('immutable')
    expect(await full.text()).toBe('0123456789')
    const cached = await serveAsset(request({ 'If-None-Match': full.headers.get('etag') }), name)
    expect(cached.status).toBe(304)
    const partial = await serveAsset(request({ Range: 'bytes=2-5' }), name)
    expect(partial.status).toBe(206)
    expect(partial.headers.get('content-range')).toBe('bytes 2-5/10')
    expect(await partial.text()).toBe('2345')
    expect(await (await serveAsset(request({ Range: 'bytes=-3' }), name)).text()).toBe('789')
    expect((await serveAsset(request({ Range: 'bytes=20-' }), name)).status).toBe(416)
    const changed = await serveAsset(request({ Range: 'bytes=2-5', 'If-Range': '"other"' }), name)
    expect(changed.status).toBe(200)
    expect(await changed.text()).toBe('0123456789')
    const head = await serveAsset(request({}, 'HEAD'), name)
    expect(head.headers.get('content-length')).toBe('10')
    expect(await head.text()).toBe('')
    const missing = await serveAsset(request(), `${'0'.repeat(64)}.mp4`)
    expect(missing.status).toBe(404)
    expect(missing.headers.get('cache-control')).toBe('no-store')
  })
  it('rejects traversal and active file types; preserves URL parameters and fragments', async () => {
    await expect(snapshotMedia('../secret', 'video/mp4')).rejects.toThrow()
    await expect(snapshotMedia('script.svg', 'image/svg+xml')).rejects.toThrow()
    expect((await serveAsset(new Request('http://localhost'), '../secret')).status).toBe(404)
    expect(getMediaUrl('/media/a.png?width=200#preview', 'file v2')).toBe('/media/a.png?width=200&v=file+v2#preview')
    expect(getMediaUrl('/assets/media/hash.png', 'caption-edit')).toBe('/assets/media/hash.png')
    expect(getMediaUrl('https://cdn.example.test/image.png?signature=abc')).toBe('https://cdn.example.test/image.png?signature=abc')
  })
  it('keeps performance metrics authenticated and private', async () => {
    const response = await cacheStatusEndpoint.handler({ user: null } as never)
    expect(response.status).toBe(401)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })
})

it('checks published membership live, reuses only matching revisions, and isolates returned objects', async () => {
  let document = { id: 1, subject: 20, updatedAt: 'revision-1', title: '中文', _status: 'published' }
  let visible = true
  let fullReads = 0
  const find = vi.fn(async (args: { select?: unknown }) => {
    if (!args.select) fullReads++
    return { docs: !visible ? [] : [args.select ? { id: 1, subject: 20, updatedAt: document.updatedAt } : structuredClone(document)], totalDocs: visible ? 1 : 0 }
  })
  const raw = { find } as unknown as Payload
  const query = { collection: 'products-translations', depth: 0, draft: false, where: { _status: { equals: 'published' } } } as const
  const first = await findPublished(raw, query)
  ;(first.docs[0] as unknown as { title: string }).title = 'client mutation'
  expect((await findPublished(raw, query)).docs[0]).toMatchObject({ title: '中文' })
  expect(fullReads).toBe(1)
  document = { ...document, title: '新发布内容', updatedAt: 'revision-2' }
  expect((await findPublished(raw, query)).docs[0]).toMatchObject({ title: '新发布内容' })
  expect(fullReads).toBe(2)
  visible = false
  expect((await findPublished(raw, query)).docs).toEqual([])
  expect(fullReads).toBe(2)
  await findPublished(raw, { ...query, user: { id: 1 } as never, draft: true })
  expect(fullReads).toBe(3)
})
