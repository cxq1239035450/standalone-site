'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { EquipmentSite } from '@/payload-types'
import { imageURL } from './media'

export function EquipmentHero({ slides }: { slides: EquipmentSite['slides'] }) {
  const [active, setActive] = useState(0)
  const items = slides || []
  const slide = items[active]
  if (!slide)
    return (
      <section className="yl-wrap yl-empty">
        <h1>Yueli Automation</h1>
        <p>Industrial equipment and automation solutions.</p>
        <Link href="/products/" className="yl-button">
          View Products
        </Link>
      </section>
    )
  return (
    <section
      className="yl-hero"
      aria-roledescription="carousel"
      aria-label="Yueli equipment and manufacturing"
    >
      {imageURL(slide.image) && (
        <Image
          src={imageURL(slide.image)}
          alt={slide.title}
          fill
          priority
          sizes="100vw"
          className="yl-hero-image"
        />
      )}
      <div className="yl-wrap yl-hero-inner">
        <div className="yl-hero-copy" key={active}>
          <h1 className={slide.title.length > 65 ? 'yl-long-title' : ''}>{slide.title}</h1>
          {slide.description && <p>{slide.description}</p>}
          <div className="yl-actions">
            <Link href={slide.href} className="yl-button">
              {slide.label}
              <span aria-hidden="true">↗</span>
            </Link>
            {slide.href !== '/contact-us/' && (
              <Link href="/contact-us/" className="yl-button yl-button-outline">
                Get Quote
              </Link>
            )}
          </div>
        </div>
      </div>
      {items.length > 1 && (
        <div className="yl-wrap yl-hero-controls">
          <span aria-live="polite">
            {String(active + 1).padStart(2, '0')}{' '}
            <span className="yl-muted">/ {String(items.length).padStart(2, '0')}</span>
          </span>
          <div>
            <button
              type="button"
              onClick={() => setActive((active + items.length - 1) % items.length)}
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setActive((active + 1) % items.length)}
              aria-label="Next slide"
            >
              →
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
