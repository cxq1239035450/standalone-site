'use client'

import type { StaticImageData } from 'next/image'
import NextImage from 'next/image'
import React from 'react'
import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Props as MediaProps } from '../types'

/** File URLs are versioned by their bytes on the server, independently of translated captions. */
export const ImageMedia: React.FC<MediaProps> = ({
  alt: altFromProps, fill, pictureClassName, imgClassName, priority,
  resource, size, src: srcFromProps, loading, quality = 75, onLoad,
}) => {
  const media = resource && typeof resource === 'object' ? resource : null
  // Keep legacy local replacements fresh during fallback; never alter external signed URLs.
  const src: StaticImageData | string = srcFromProps || getMediaUrl(media?.url, media?.url?.startsWith('/') ? media.updatedAt : undefined)
  if (!src) return null
  return (
    <picture className={cn(fill && 'absolute inset-0 block', pictureClassName)}>
      <NextImage
        alt={altFromProps ?? media?.alt ?? ''}
        className={imgClassName}
        fill={fill}
        height={!fill ? media?.height ?? undefined : undefined}
        width={!fill ? media?.width ?? undefined : undefined}
        quality={quality}
        loading={priority ? 'eager' : loading || 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        sizes={size || '(max-width: 768px) 100vw, (max-width: 1440px) 90vw, 1296px'}
        src={src}
        onLoad={onLoad}
      />
    </picture>
  )
}
