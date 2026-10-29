import { createElement } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { IdleProcessVideo } from '../../src/components/Yueli/IdleProcessVideo'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('does not attach a video URL until page load and idle, and omits playback controls', () => {
  vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
  let idle: (() => void) | undefined
  const schedule = vi.fn((callback: () => void) => {
    idle = callback
    return 1
  })
  vi.stubGlobal('requestIdleCallback', schedule)
  vi.stubGlobal('cancelIdleCallback', vi.fn())
  const load = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  const { container } = render(
    createElement(IdleProcessVideo, { src: '/process.mp4', poster: '/poster.jpg' }),
  )
  const video = container.querySelector('video')!
  expect(video.hasAttribute('src')).toBe(false)
  expect(video.hasAttribute('controls')).toBe(false)
  expect(video.preload).toBe('none')
  expect(schedule).not.toHaveBeenCalled()
  window.dispatchEvent(new Event('load'))
  expect(schedule).toHaveBeenCalledOnce()
  expect(video.hasAttribute('src')).toBe(false)
  idle!()
  expect(video.getAttribute('src')).toBe('/process.mp4')
  expect(load).toHaveBeenCalledOnce()
})

it('cancels pending idle work on unmount', () => {
  vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
  vi.stubGlobal(
    'requestIdleCallback',
    vi.fn(() => 7),
  )
  const cancel = vi.fn()
  vi.stubGlobal('cancelIdleCallback', cancel)
  const { unmount } = render(
    createElement(IdleProcessVideo, { src: '/process.mp4', poster: '/poster.jpg' }),
  )
  unmount()
  expect(cancel).toHaveBeenCalledWith(7)
})
