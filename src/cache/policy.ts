/** Shared policy for public assets only. Never apply these headers to CMS/API responses. */
export const assetPolicy = {
  immutable: 'public, max-age=31536000, immutable',
  legacy: 'public, max-age=0, must-revalidate',
  private: 'private, no-store',
  imageTTL: 14400,
  imageDiskBytes: 500_000_000,
} as const

export const publicMediaTypes: Record<string, string> = {
  jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif',
  gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg',
}
