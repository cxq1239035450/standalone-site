import source from '@/data/yueli.json'

const assets = new Map(
  source.assets.flatMap((asset) => {
    const url = new URL(asset.source)
    return asset.local && url.origin === source.sourceOrigin
      ? [[decodeURI(url.pathname), asset.local] as const]
      : []
  }),
)

/** Existing image/video links retain their original WordPress paths after migration. */
export function yueliLegacyAsset(path: string) {
  try {
    return assets.get(decodeURI(path))
  } catch {
    return undefined
  }
}
