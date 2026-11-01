'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/utilities/ui'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import type { Props as MediaProps } from '../types'

export const VideoMedia: React.FC<MediaProps> = ({
  onClick, resource, videoClassName, videoPoster, videoMode = 'on-demand',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [backgroundActive, setBackgroundActive] = useState(false)
  const media = resource && typeof resource === 'object' ? resource : null
  const url = getMediaUrl(media?.url, media?.url?.startsWith('/') ? media.updatedAt : undefined)
  useEffect(() => {
    const video = videoRef.current
    if (!video || videoMode !== 'background') return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    let visible = false
    const update = () => {
      const allowed = visible && !preference.matches && !connection?.saveData && !document.hidden
      setBackgroundActive(allowed)
      if (!allowed) video.pause()
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update() })
    observer.observe(video)
    preference.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [url, videoMode])
  useEffect(() => {
    if (backgroundActive) void videoRef.current?.play().catch(() => setBackgroundActive(false))
  }, [backgroundActive])
  if (!media || !url) return null
  return (
    <video
      key={url}
      ref={videoRef}
      className={cn('w-full rounded-lg bg-black/5', videoClassName)}
      controls={!backgroundActive}
      preload="none"
      poster={videoPoster}
      width={media.width || undefined}
      height={media.height || undefined}
      style={{ aspectRatio: media.width && media.height ? `${media.width}/${media.height}` : '16/9' }}
      aria-label={media.alt || undefined}
      autoPlay={backgroundActive}
      loop={videoMode === 'background'}
      muted={videoMode === 'background'}
      playsInline
      onClick={onClick}
      src={url}
    />
  )
}
