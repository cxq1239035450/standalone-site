import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import type { Endpoint } from 'payload'
import { assetRoot, mediaCacheStatus } from '@/cache/media'
import { publishedCacheStatus } from '@/cache/published'
import { assetPolicy } from '@/cache/policy'

export const cacheStatusEndpoint: Endpoint = {
  path: '/performance/status', method: 'get',
  handler: async req => {
    const headers = { 'Cache-Control': assetPolicy.private }
    if (!req.user) return Response.json({ error: '请先登录。' }, { status: 401, headers })
    const files = await readdir(assetRoot()).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return []
      throw error
    })
    let bytes = 0
    let count = 0
    for (const name of files) {
      if (!/^[a-f0-9]{64}\.[a-z0-9]+$/.test(name)) continue
      const item = await stat(path.join(assetRoot(), name)).catch(() => null)
      if (item?.isFile()) { count++; bytes += item.size }
    }
    return Response.json({
      checkedAt: new Date().toISOString(), mediaEnabled: process.env.MEDIA_IMMUTABLE_CACHE !== '0',
      contentEnabled: process.env.PUBLIC_CONTENT_CACHE !== '0',
      assets: { count, bytes, ...mediaCacheStatus() }, content: publishedCacheStatus(),
    }, { headers })
  },
}
