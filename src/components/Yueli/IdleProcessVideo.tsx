'use client'

import { useEffect, useRef } from 'react'

export function IdleProcessVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let idleID: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false
    const load = () => {
      const video = videoRef.current
      if (cancelled || !video) return
      video.src = src
      video.load()
      void video.play().catch(() => {
        // Keep the poster if the browser disallows automatic playback.
      })
    }
    const schedule = () => {
      if ('requestIdleCallback' in window) idleID = window.requestIdleCallback(load)
      else timer = setTimeout(load, 2000)
    }
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('load', schedule)
      if (idleID !== undefined) window.cancelIdleCallback(idleID)
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [src])

  return (
    <video
      className="yl-intro-video"
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      preload="none"
      poster={poster}
      aria-label="Yueli automated machining process"
    />
  )
}
