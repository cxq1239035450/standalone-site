'use client'
import Image from 'next/image'
import { useState } from 'react'

export function EquipmentGallery({ images }: { images: { src: string; alt: string }[] }) {
  const [active, setActive] = useState(0)
  if (!images.length)
    return (
      <div className="yl-image-empty">
        Product photography is being updated. Ask the Yueli team for current machine images.
      </div>
    )
  return (
    <div className="yl-gallery">
      <div className="yl-gallery-main">
        <Image
          src={images[active].src}
          alt={images[active].alt}
          fill
          priority
          sizes="(max-width: 760px) 95vw, 50vw"
        />
      </div>
      {images.length > 1 && (
        <div className="yl-gallery-thumbnails" aria-label="Product images">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View ${image.alt}, image ${i + 1}`}
              aria-pressed={i === active}
            >
              <Image src={image.src} alt="" width={100} height={80} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
