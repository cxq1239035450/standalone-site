'use client'

import { useEffect, useRef } from 'react'

type Certificate = { src: string; alt: string }

export function CertificateRail({ certificates }: { certificates: Certificate[] }) {
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = viewport.current
    const rail = track.current
    if (!element || !rail || certificates.length < 2) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let hovered = false
    let focused = false
    let touching = false
    let visible = false
    let last = 0
    let frame = 0
    let width = 0
    const measure = () => {
      width = (rail.scrollWidth + (Number.parseFloat(getComputedStyle(rail).columnGap) || 0)) / 2
    }
    const resize = new ResizeObserver(measure)
    resize.observe(rail)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      last = 0
    })
    observer.observe(element)
    const enter = () => {
      hovered = true
    }
    const leave = () => {
      hovered = false
      last = 0
    }
    const focus = () => {
      focused = true
    }
    const blur = () => {
      focused = false
      last = 0
    }
    const touch = () => {
      touching = true
    }
    const release = () => {
      touching = false
      last = 0
    }
    const tick = (now: number) => {
      if (
        visible &&
        !motion.matches &&
        !hovered &&
        !focused &&
        !touching &&
        !document.hidden &&
        width > 0
      ) {
        if (last) {
          element.scrollLeft += Math.min(now - last, 64) * 0.0288
          if (element.scrollLeft >= width) element.scrollLeft -= width
        }
        last = now
      } else last = 0
      frame = window.requestAnimationFrame(tick)
    }
    element.addEventListener('mouseenter', enter)
    element.addEventListener('mouseleave', leave)
    element.addEventListener('focusin', focus)
    element.addEventListener('focusout', blur)
    element.addEventListener('pointerdown', touch)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    measure()
    frame = window.requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      observer.disconnect()
      element.removeEventListener('mouseenter', enter)
      element.removeEventListener('mouseleave', leave)
      element.removeEventListener('focusin', focus)
      element.removeEventListener('focusout', blur)
      element.removeEventListener('pointerdown', touch)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
  }, [certificates.length])
  return (
    <div
      className="yl-cert-viewport"
      aria-label="Yueli certificate gallery; focus or hover to pause automatic scrolling"
      tabIndex={0}
      ref={viewport}
    >
      <div className="yl-cert-track" ref={track}>
        {[...certificates, ...certificates].map((certificate, index) => (
          <article
            className="yl-cert-slide"
            key={`${certificate.src}-${index}`}
            aria-hidden={index >= certificates.length}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={certificate.src}
              alt={index >= certificates.length ? '' : certificate.alt}
              width={400}
              height={560}
              loading="lazy"
            />
          </article>
        ))}
      </div>
    </div>
  )
}
