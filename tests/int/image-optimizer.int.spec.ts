// @vitest-environment node
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { expect, it } from 'vitest'

it('uses one native image library for Payload and Next, and really compresses the image', async () => {
  const require = createRequire(import.meta.url)
  const nextRequire = createRequire(require.resolve('next/dist/server/image-optimizer.js'))
  expect(require.resolve('sharp')).toBe(nextRequire.resolve('sharp'))
  const input = await readFile('public/pet-assets/hero-pets.webp')
  // Initialize the CMS image library first, reproducing the production module load order.
  expect((await sharp(input).metadata()).width).toBeGreaterThan(640)
  const { optimizeImage } = require('next/dist/server/image-optimizer.js')
  const high = await optimizeImage({ buffer: input, width: 640, quality: 100, contentType: 'image/webp' })
  const normal = await optimizeImage({ buffer: input, width: 640, quality: 75, contentType: 'image/webp' })
  expect((await sharp(normal).metadata()).width).toBe(640)
  expect(normal.length).toBeLessThan(high.length)
  expect(normal.length).toBeLessThan(input.length)
})
