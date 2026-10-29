import { describe, it, expect } from 'vitest'
import source from '../../src/data/yueli.json'
import { yueliLegacyAsset } from '../../src/utilities/yueliLegacyAssets'
import { GET } from '../../src/app/wp-content/[...asset]/route'

describe('existing WordPress media URLs', () => {
  it('preserves every known first-party asset link, including encoded Chinese filenames', () => {
    for (const asset of source.assets) {
      const url = new URL(asset.source)
      if (url.origin !== source.sourceOrigin) continue
      expect(yueliLegacyAsset(url.pathname)).toBe(asset.local)
      expect(yueliLegacyAsset(decodeURI(url.pathname))).toBe(asset.local)
    }
  })
  it('redirects to the local copy without redirecting unknown or malformed paths', () => {
    const asset = source.assets.find((asset) => asset.source.startsWith(source.sourceOrigin))!
    const request = new Request(`http://localhost:3000${new URL(asset.source).pathname}`)
    const response = GET(request)
    expect(response.status).toBe(308)
    expect(response.headers.get('location')).toBe(`http://localhost:3000${asset.local}`)
    expect(GET(new Request('http://localhost:3000/wp-content/unknown.png')).status).toBe(404)
    expect(yueliLegacyAsset('/wp-content/%malformed')).toBeUndefined()
  })
})
