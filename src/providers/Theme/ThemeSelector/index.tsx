'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'

import type { Theme } from './types'

import { useTheme } from '..'
import { themeLocalStorageKey } from './types'
import { useBrowserPreference } from '@/utilities/browserPreference'
import { themeIsValid } from '../types'

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()
  const preference = useBrowserPreference(themeLocalStorageKey)
  const value = preference && themeIsValid(preference) ? preference : 'auto'

  const onThemeChange = (themeToSet: Theme | 'auto') => {
    if (themeToSet === 'auto') {
      setTheme(null)
    } else {
      setTheme(themeToSet)
    }
  }

  return (
    <Select onValueChange={onThemeChange} value={value}>
      <SelectTrigger
        aria-label="Select a theme"
        className="w-auto bg-transparent gap-2 pl-0 md:pl-3 border-none"
      >
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto</SelectItem>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
      </SelectContent>
    </Select>
  )
}
