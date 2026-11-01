import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { VideoMedia } from '@/components/Media/VideoMedia'
import type { Media } from '@/payload-types'

afterEach(cleanup)
it('keeps normal videos paused with no preload, native controls, and the canonical asset URL', () => {
  const resource = { id: 1, url: '/assets/media/test.mp4', filename: 'legacy.mp4', mimeType: 'video/mp4' } as Media
  const { container } = render(React.createElement(VideoMedia, { resource }))
  const video = container.querySelector('video')!
  expect(video.preload).toBe('none')
  expect(video.autoplay).toBe(false)
  expect(video.controls).toBe(true)
  expect(video.getAttribute('src')).toBe(resource.url)
  expect(video.style.aspectRatio).toBe('16/9')
})
