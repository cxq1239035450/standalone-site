'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Package } from 'lucide-react'
import type { Media as MediaDocument } from '@/payload-types'
import { Media } from '@/components/Media'
import styles from './products.module.css'

export function ProductGallery({
  images,
  title,
  locale,
}: {
  images: MediaDocument[]
  title: string
  locale: string
}) {
  const [active, setActive] = useState(0)
  const selected = images[active] || images[0]
  const zh = locale === 'zh'
  if (!selected)
    return (
      <div className={styles.emptyImage}>
        <Package size={42} />
        <p>{zh ? '产品图片待补充' : 'Product photography coming soon'}</p>
      </div>
    )
  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <Media
          key={selected.id}
          resource={selected}
          fill
          priority={active === 0}
          alt={selected.alt || title}
          imgClassName={styles.containedImage}
          size="(max-width: 767px) 100vw, 50vw"
        />
        {images.length > 1 && (
          <div className={styles.imageControls}>
            <button
              type="button"
              aria-label={zh ? '上一张图片' : 'Previous image'}
              onClick={() => setActive((active + images.length - 1) % images.length)}
            >
              <ArrowLeft size={18} />
            </button>
            <span aria-live="polite">
              {active + 1} / {images.length}
            </span>
            <button
              type="button"
              aria-label={zh ? '下一张图片' : 'Next image'}
              onClick={() => setActive((active + 1) % images.length)}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className={styles.thumbnails} aria-label={zh ? '产品图库' : 'Product gallery'}>
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              aria-pressed={active === index}
              aria-label={zh ? `查看第 ${index + 1} 张图片` : `View image ${index + 1}`}
              onClick={() => setActive(index)}
            >
              <Media resource={image} fill imgClassName={styles.containedImage} size="100px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
