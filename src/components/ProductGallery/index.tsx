'use client'
import { useTranslations as useInterfaceCopy } from 'next-intl'


import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight, Expand, Package } from 'lucide-react'
import type { Media as MediaDocument } from '@/payload-types'
import { Media } from '@/components/Media'
import styles from './products.module.css'

const ProductLightbox = dynamic(() => import('./ProductLightbox'), { ssr: false })
const motionQuery = '(prefers-reduced-motion: reduce)'
function subscribeToMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery)
  query.addEventListener('change', callback)
  return () => query.removeEventListener('change', callback)
}

export function ProductGallery({
  images,
  title,
  locale,
}: {
  images: MediaDocument[]
  title: string
  locale: string
}) {
  const interfaceCopy = useInterfaceCopy('interface')

  const galleryImages = useMemo(() => images.filter((image) => Boolean(image.url)), [images])
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const lightboxTrigger = useRef<HTMLElement | null>(null)
  const expandButton = useRef<HTMLButtonElement | null>(null)
  const gallery = useRef<HTMLDivElement | null>(null)
  const reducedMotion = useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  )
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true, duration: reducedMotion ? 0 : 25 })
  const current = Math.min(active, Math.max(galleryImages.length - 1, 0))
  const galleryLabel = interfaceCopy('components_ProductGallery_index_tsx_1')
  const openLabel = interfaceCopy('components_ProductGallery_index_tsx_2')

  const syncSelection = useCallback(() => {
    if (!carousel) return
    setActive(carousel.selectedScrollSnap())
    const focused = document.activeElement
    if (
      focused instanceof HTMLButtonElement &&
      gallery.current?.contains(focused) &&
      focused.classList.contains(styles.imageButton)
    ) {
      // Wait for the selected slide's accessibility state to commit. Only move
      // focus if it is still on the image that has just become hidden.
      requestAnimationFrame(() => {
        if (document.activeElement === focused && focused.closest('[aria-hidden="true"]')) {
          gallery.current
            ?.querySelector<HTMLButtonElement>('[aria-hidden="false"] button')
            ?.focus({ preventScroll: true })
        }
      })
    }
  }, [carousel])
  useEffect(() => {
    if (!carousel) return
    carousel.on('select', syncSelection).on('reInit', syncSelection)
    return () => {
      carousel.off('select', syncSelection).off('reInit', syncSelection)
    }
  }, [carousel, syncSelection])

  const openLightbox = (trigger: HTMLElement) => {
    lightboxTrigger.current = trigger
    setLightboxOpen(true)
  }
  if (!galleryImages.length)
    return (
      <div className={styles.emptyImage}>
        <Package size={42} aria-hidden="true" />
        <p>{interfaceCopy('components_ProductGallery_index_tsx_3')}</p>
      </div>
    )
  return (
    <div
      ref={gallery}
      className={styles.gallery}
      role="region"
      aria-label={galleryLabel}
      aria-roledescription={interfaceCopy('components_ProductGallery_index_tsx_4')}
      onKeyDown={(event) => {
        if (lightboxOpen || event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          if (event.key === 'ArrowLeft') carousel?.scrollPrev(reducedMotion)
          else carousel?.scrollNext(reducedMotion)
        }
      }}
    >
      <div className={styles.mainImage}>
        <div className={styles.viewport} ref={viewportRef}>
          <div className={styles.track}>
            {galleryImages.map((image, index) => (
              <div
                className={styles.slide}
                key={image.id}
                role="group"
                aria-roledescription={interfaceCopy('components_ProductGallery_index_tsx_5')}
                aria-label={`${index + 1} / ${galleryImages.length}`}
                aria-hidden={current !== index}
              >
                <button
                  className={styles.imageButton}
                  type="button"
                  tabIndex={current === index ? 0 : -1}
                  aria-label={`${openLabel}: ${image.alt || title}`}
                  onClick={(event) => openLightbox(event.currentTarget)}
                >
                  <Media
                    resource={image}
                    fill
                    priority={index === 0}
                    alt={image.alt || title}
                    imgClassName={styles.containedImage}
                    size="(max-width: 767px) 100vw, 50vw"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          ref={expandButton}
          type="button"
          className={styles.expandButton}
          aria-label={openLabel}
          onClick={(event) => openLightbox(event.currentTarget)}
        >
          <Expand size={18} aria-hidden="true" />
        </button>
        {galleryImages.length > 1 && (
          <div className={styles.imageControls}>
            <button
              type="button"
              aria-label={interfaceCopy('components_ProductGallery_index_tsx_6')}
              onClick={() => carousel?.scrollPrev(reducedMotion)}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <span aria-live="polite" aria-atomic="true">
              {current + 1} / {galleryImages.length}
            </span>
            <button
              type="button"
              aria-label={interfaceCopy('components_ProductGallery_index_tsx_7')}
              onClick={() => carousel?.scrollNext(reducedMotion)}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      {galleryImages.length > 1 && (
        <div className={styles.thumbnails} role="group" aria-label={galleryLabel}>
          {galleryImages.map((image, index) => (
            <button
              type="button"
              key={image.id}
              aria-pressed={current === index}
              aria-label={interfaceCopy('components_ProductGallery_index_tsx_8', {v0: index + 1})}
              onClick={() => carousel?.scrollTo(index, reducedMotion)}
            >
              <Media
                resource={image}
                fill
                alt=""
                imgClassName={styles.containedImage}
                size="100px"
              />
            </button>
          ))}
        </div>
      )}
      {lightboxOpen && (
        <ProductLightbox
          images={galleryImages}
          title={title}
          locale={locale}
          index={current}
          reducedMotion={reducedMotion}
          onView={(index) => carousel?.scrollTo(index, true)}
          onClose={() => {
            setLightboxOpen(false)
            requestAnimationFrame(() => {
              const trigger = lightboxTrigger.current
              const target = trigger?.closest('[aria-hidden="true"]')
                ? gallery.current?.querySelector<HTMLButtonElement>(
                    '[aria-hidden="false"] button',
                  ) || expandButton.current
                : trigger
              target?.focus({ preventScroll: true })
            })
          }}
        />
      )}
    </div>
  )
}
