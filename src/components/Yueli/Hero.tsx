'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { EquipmentSite } from '@/payload-types'
import { imageURL } from './media'

type Artwork = { className: string; html: string }

/** Reuse the existing stateful carousel while preserving the original machine artwork layers. */
export function EquipmentHero({
  slides,
  artworks,
}: {
  slides: EquipmentSite['slides']
  artworks?: Artwork[]
}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const items = slides || []
  const count = artworks?.length || items.length
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (paused || hovered || focused || reducedMotion || count < 2) return
    const timer = window.setInterval(() => setActive((index) => (index + 1) % count), 6500)
    return () => window.clearInterval(timer)
  }, [paused, hovered, focused, reducedMotion, count])
  const change = (index: number) => {
    setActive((index + count) % count)
    setPaused(true)
  }
  if (!count)
    return (
      <section className="yl-wrap yl-empty">
        <h1>Yueli Automation</h1>
        <a href="/products/" className="yl-button">
          View Products
        </a>
      </section>
    )
  if (!artworks?.length) {
    const slide = items[active]
    return (
      <section className="yl-hero" aria-label="Yueli equipment and manufacturing">
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
          <div className="yl-hero-copy">
            <h1>{slide.title}</h1>
            <p>{slide.description}</p>
            <a href={slide.href} className="yl-button">
              {slide.label}
            </a>
          </div>
        </div>
        <div className="yl-hero-controls">
          <button aria-label="Previous slide" onClick={() => change(active - 1)}>
            ←
          </button>
          <button aria-label="Next slide" onClick={() => change(active + 1)}>
            →
          </button>
        </div>
      </section>
    )
  }
  return (
    <section
      className="yl-carousel"
      aria-roledescription="carousel"
      aria-label="Yueli Automation highlights"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
      }}
      onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
      onTouchEnd={(event) => {
        if (touchStart !== null && Math.abs(event.changedTouches[0].clientX - touchStart) > 50)
          change(active + (event.changedTouches[0].clientX < touchStart ? 1 : -1))
        setTouchStart(null)
      }}
    >
      <button
        className="yl-carousel-pause"
        type="button"
        aria-label={paused ? 'Start automatic slide show' : 'Pause automatic slide show'}
        onClick={() => setPaused(!paused)}
      >
        {paused ? '▶' : 'Ⅱ'}
      </button>
      <div className="yl-carousel-track" aria-live={paused ? 'polite' : 'off'}>
        {artworks.map((artwork, index) =>
          index === active ? (
            <article
              key={index}
              className={`${artwork.className} is-active`}
              style={{ opacity: 1, visibility: 'visible', zIndex: 1 }}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
              dangerouslySetInnerHTML={{ __html: artwork.html }}
            />
          ) : null,
        )}
      </div>
      <button
        type="button"
        className="yl-carousel-arrow yl-carousel-prev"
        aria-label="Previous slide"
        onClick={() => change(active - 1)}
      >
        <span aria-hidden="true" />
      </button>
      <button
        type="button"
        className="yl-carousel-arrow yl-carousel-next"
        aria-label="Next slide"
        onClick={() => change(active + 1)}
      >
        <span aria-hidden="true" />
      </button>
      <div className="yl-carousel-dots" aria-label="Choose slide">
        {artworks.map((_, index) => (
          <button
            type="button"
            key={index}
            className={`yl-carousel-dot${index === active ? ' is-active' : ''}`}
            aria-label={`Slide ${index + 1}`}
            aria-current={index === active ? 'true' : undefined}
            onClick={() => change(index)}
          />
        ))}
      </div>
    </section>
  )
}
