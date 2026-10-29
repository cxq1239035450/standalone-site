'use client'

import { useCallback, useSyncExternalStore } from 'react'

const changeEvent = 'site:preference-change'
const memory = new Map<string, string | null>()

export function readBrowserPreference(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null
  try { return window.localStorage.getItem(key) } catch { return null }
}

export function writeBrowserPreference(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
    memory.delete(key)
  } catch { memory.set(key, value) }
  window.dispatchEvent(new CustomEvent(changeEvent, { detail: key }))
}

export function useBrowserPreference(key: string) {
  const subscribe = useCallback((notify: () => void) => {
    const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) { memory.delete(key); notify() } }
    const onChange = (event: Event) => { if ((event as CustomEvent<string>).detail === key) notify() }
    window.addEventListener('storage', onStorage)
    window.addEventListener(changeEvent, onChange)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(changeEvent, onChange)
    }
  }, [key])
  return useSyncExternalStore(subscribe, useCallback(() => readBrowserPreference(key), [key]), () => undefined)
}
