'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import type { Media } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

export default function ProductLightbox({
  images,
  title,
  index,
  reducedMotion,
  onView,
  onClose,
}: {
  images: Media[]
  title: string
  locale: string
  index: number
  reducedMotion: boolean
  onView: (index: number) => void
  onClose: () => void
}) {
  const copy = useTranslations('lightbox')
  const slides = useMemo(
    () =>
      images.map((image) => ({
        src: getMediaUrl(image.url, image.updatedAt),
        alt: image.alt || title,
        width: image.width || undefined,
        height: image.height || undefined,
      })),
    [images, title],
  )
  return (
    <Lightbox
      open
      index={index}
      close={onClose}
      slides={slides}
      plugins={images.length > 1 ? [Zoom, Thumbnails] : [Zoom]}
      on={{ view: ({ index }) => onView(index) }}
      controller={{ closeOnBackdropClick: true }}
      carousel={{ finite: images.length === 1, preload: 1 }}
      thumbnails={{ width: 80, height: 64, padding: 3, gap: 12, imageFit: 'contain' }}
      animation={reducedMotion ? { fade: 0, swipe: 0, navigation: 0, zoom: 0 } : undefined}
      labels={{ Close: copy('close'), Previous: copy('previous'), Next: copy('next'), 'Zoom in': copy('zoomIn'), 'Zoom out': copy('zoomOut'), 'Show thumbnails': copy('showThumbnails'), 'Hide thumbnails': copy('hideThumbnails') }}
    />
  )
}
