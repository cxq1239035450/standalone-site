// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import type { Access, AccessArgs, Config, PayloadRequest } from 'payload'
import { dynamicContentPlugin } from '@/i18n/contentPlugin'

const request = (user: PayloadRequest['user'] = null) => ({ user }) as PayloadRequest
const readArguments = (staticFile: boolean, user: PayloadRequest['user'] = null): AccessArgs => ({
  req: request(user),
  isReadingStaticFile: staticFile,
  data: { filename: 'machine.jpg' },
})
async function mediaRead(originalRead?: Access) {
  const config = await dynamicContentPlugin({
    collections: [
      {
        slug: 'media',
        upload: true,
        fields: [{ name: 'alt', type: 'text' }],
        access: originalRead ? { read: originalRead } : {},
      },
    ],
    globals: [],
  } as unknown as Config)
  return config.collections!.find((collection) => collection.slug === 'media')!.access!.read!
}

describe('Dynamic Yueli media file access', () => {
  it('serves public files while denying anonymous archived media JSON', async () => {
    const original = vi.fn(() => true)
    const read = await mediaRead(original)
    const staticArgs = readArguments(true)
    expect(await read(staticArgs)).toBe(true)
    expect(original).toHaveBeenCalledExactlyOnceWith(staticArgs)
    expect(await read(readArguments(false))).toBe(false)
    expect(await read({ req: request() })).toBe(false)
    expect(original).toHaveBeenCalledTimes(1)
  })

  it('preserves a private original file access rule instead of broadening it', async () => {
    const original = vi.fn(({ req }: AccessArgs) => Boolean(req.user))
    const read = await mediaRead(original)
    expect(await read(readArguments(true))).toBe(false)
    const editor = { id: 1 } as PayloadRequest['user']
    expect(await read(readArguments(true, editor))).toBe(true)
    expect(await read(readArguments(false))).toBe(false)
  })

  it('preserves asynchronous document filters and receives the exact original file request', async () => {
    const filter = { visibility: { equals: 'public' } }
    const original = vi.fn(async () => filter)
    const read = await mediaRead(original)
    const args = readArguments(true)
    expect(await read(args)).toBe(filter)
    expect(original).toHaveBeenCalledExactlyOnceWith(args)
    expect(await read(readArguments(false))).toBe(false)
  })

  it('keeps default-public uploads public only through the static-file operation', async () => {
    const read = await mediaRead()
    expect(await read(readArguments(true))).toBe(true)
    expect(await read(readArguments(false))).toBe(false)
  })
})
