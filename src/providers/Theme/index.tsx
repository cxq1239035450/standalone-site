'use client'

import React, { createContext, useCallback, use, useEffect, useSyncExternalStore } from 'react'

import type { Theme, ThemeContextType } from './types'

import { useBrowserPreference, writeBrowserPreference } from '@/utilities/browserPreference'
import { defaultTheme, getImplicitPreference, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

const subscribeSystemTheme = (notify: () => void) => {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const preference = useBrowserPreference(themeLocalStorageKey)
  const implicit = useSyncExternalStore(subscribeSystemTheme, getImplicitPreference, () => undefined)
  const theme = preference === undefined ? undefined : themeIsValid(preference) ? preference : implicit || defaultTheme

  const setTheme = useCallback((themeToSet: Theme | null) => {
    writeBrowserPreference(themeLocalStorageKey, themeToSet)
  }, [])

  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
