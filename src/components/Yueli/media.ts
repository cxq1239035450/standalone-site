import type { Media } from '@/payload-types'

// This module is safe in client components; data.ts contains server database code.
export function imageURL(image: number | Media | null | undefined): string {
  return image && typeof image === 'object' ? image.url || '' : ''
}
