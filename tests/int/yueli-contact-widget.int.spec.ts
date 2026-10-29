import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContactWidget } from '../../src/components/Yueli/ContactWidget'

const contact = {
  email: 'Nina.h@yueli-tech.com',
  telephone: '+86 136 0076 8411',
  whatsapp: 'https://wa.me/message/IZMZQ3UCIPGKF1?src=qr',
  wechat: '13600768411',
  qrImage: '/yueli-assets/78528d8b2323141d.png',
}
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function openWidget() {
  render(createElement(ContactWidget, contact))
  fireEvent.click(screen.getByRole('button', { name: 'Open consultation' }))
}

describe('consultation widget', () => {
  it('copies the confirmed WeChat ID and reports success only after clipboard completion', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    openWidget()
    fireEvent.click(screen.getByRole('button', { name: 'Copy WeChat ID' }))
    await screen.findByText('WeChat ID copied.')
    expect(writeText).toHaveBeenCalledWith(contact.wechat)
    expect(screen.getByRole('link', { name: /Email/ }).getAttribute('href')).toBe(
      `mailto:${contact.email}`,
    )
    expect(screen.getByRole('link', { name: /WhatsApp/ }).getAttribute('href')).toBe(
      contact.whatsapp,
    )
  })

  it('offers a selectable ID when clipboard access is rejected', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    openWidget()
    fireEvent.click(screen.getByRole('button', { name: 'Copy WeChat ID' }))
    const fallback = await screen.findByRole('textbox', { name: 'WeChat ID' })
    expect((fallback as HTMLInputElement).value).toBe(contact.wechat)
    expect(screen.queryByText('WeChat ID copied.')).toBeNull()
  })

  it('opens QR by click, supports closing it, and restores focus after Escape', async () => {
    openWidget()
    fireEvent.click(screen.getByRole('button', { name: 'Scan QR code' }))
    expect(await screen.findByRole('img', { name: 'Yueli WeChat contact QR code' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close QR code' }))
    await waitFor(() =>
      expect(screen.queryByRole('img', { name: 'Yueli WeChat contact QR code' })).toBeNull(),
    )
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open consultation' }))
  })
})
