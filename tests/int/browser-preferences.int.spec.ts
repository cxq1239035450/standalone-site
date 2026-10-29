import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBrowserPreference, writeBrowserPreference } from '@/utilities/browserPreference'
import { ThemeProvider, useTheme } from '@/providers/Theme'

function Preference() {
  const value = useBrowserPreference('preference-test')
  return React.createElement('output', null, value ?? 'unset')
}
function ThemeControls() {
  const { theme, setTheme } = useTheme()
  return React.createElement(React.Fragment, null,
    React.createElement('output', null, theme),
    React.createElement('button', { onClick: () => setTheme('dark') }, 'Dark'),
    React.createElement('button', { onClick: () => setTheme(null) }, 'Auto'))
}

describe('Browser preference subscriptions', () => {
  beforeEach(() => { localStorage.clear(); window.dispatchEvent(new StorageEvent('storage', {key: null})) })
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
  it('updates all subscribers on local writes and cross-tab removal', () => {
    render(React.createElement(React.Fragment, null, React.createElement(Preference), React.createElement(Preference)))
    act(() => writeBrowserPreference('preference-test', 'granted'))
    expect(screen.getAllByText('granted')).toHaveLength(2)
    act(() => { localStorage.removeItem('preference-test'); window.dispatchEvent(new StorageEvent('storage', { key: 'preference-test' })) })
    expect(screen.getAllByText('unset')).toHaveLength(2)
  })
  it('retains an explicit choice for the session when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    render(React.createElement(Preference))
    act(() => writeBrowserPreference('preference-test', 'denied'))
    expect(screen.getByText('denied')).toBeTruthy()
  })
  it('honors a declined choice even when storage can be read but writes fail', () => {
    localStorage.setItem('preference-test', 'granted')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    render(React.createElement(Preference))
    act(() => writeBrowserPreference('preference-test', 'denied'))
    expect(screen.getByText('denied')).toBeTruthy()
  })
  it('applies explicit themes and resumes following system changes in auto mode', () => {
    let dark = false
    const listeners = new Set<() => void>()
    vi.stubGlobal('matchMedia', () => ({ get matches() { return dark }, addEventListener: (_: string, listener: () => void) => listeners.add(listener), removeEventListener: (_: string, listener: () => void) => listeners.delete(listener) }))
    render(React.createElement(ThemeProvider, {} as React.ComponentProps<typeof ThemeProvider>, React.createElement(ThemeControls)))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
    expect(localStorage.getItem('payload-theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Auto' }))
    expect(localStorage.getItem('payload-theme')).toBeNull()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    act(() => { dark = true; listeners.forEach(listener => listener()) })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
