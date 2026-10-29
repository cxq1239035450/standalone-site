'use client'

import * as Popover from '@radix-ui/react-popover'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  MessageCircle,
  MessagesSquare,
  QrCode,
  X,
} from 'lucide-react'
import './contact-widget.css'

type Props = { email: string; telephone: string; whatsapp: string; wechat: string; qrImage: string }

export function ContactWidget({ email, telephone, whatsapp, wechat, qrImage }: Props) {
  const [open, setOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearHoverTimer = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
  }
  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
    },
    [],
  )
  const showQR = () => {
    clearHoverTimer()
    setQrOpen(true)
  }
  const hideQR = () => {
    clearHoverTimer()
    hoverTimer.current = setTimeout(() => setQrOpen(false), 180)
  }
  async function copyWechat() {
    try {
      await navigator.clipboard.writeText(wechat)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          clearHoverTimer()
          setQrOpen(false)
          setCopyState('idle')
        }
      }}
    >
      <Popover.Trigger
        className="yl-consult-trigger"
        aria-label={open ? 'Close consultation' : 'Open consultation'}
      >
        {open ? (
          <X size={26} aria-hidden="true" />
        ) : (
          <MessagesSquare size={27} aria-hidden="true" />
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="yl-consult-panel"
          side="top"
          align="end"
          sideOffset={14}
          collisionPadding={16}
          aria-labelledby="yl-consult-title"
          aria-describedby="yl-consult-description"
        >
          <header className="yl-consult-header">
            <div>
              <p>YUELI AUTOMATION</p>
              <h2 id="yl-consult-title">Let’s talk equipment</h2>
            </div>
            <Popover.Close className="yl-consult-close" aria-label="Close consultation panel">
              <X size={20} />
            </Popover.Close>
          </header>
          <div className="yl-consult-body">
            <p id="yl-consult-description">
              Discuss your workpiece, machine or production requirements with our team.
            </p>
            <a className="yl-consult-channel" href={`mailto:${email}`}>
              <Mail aria-hidden="true" />
              <span>
                <strong>Email</strong>
                <span>{email}</span>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a
              className="yl-consult-channel"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" />
              <span>
                <strong>WhatsApp</strong>
                <span>{telephone}</span>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <div className="yl-consult-wechat">
              <div className="yl-consult-channel">
                <MessagesSquare aria-hidden="true" />
                <span>
                  <strong>WeChat</strong>
                  <span>WeChat ID: {wechat}</span>
                </span>
              </div>
              <div className="yl-consult-actions">
                <button type="button" onClick={copyWechat} aria-label="Copy WeChat ID">
                  {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copyState === 'copied' ? 'Copied' : 'Copy WeChat'}</span>
                </button>
                <Popover.Root open={qrOpen} onOpenChange={setQrOpen}>
                  <Popover.Trigger
                    className="yl-consult-scan"
                    onClick={(event) => {
                      event.preventDefault()
                      showQR()
                    }}
                    onPointerEnter={(event) => {
                      if (event.pointerType === 'mouse') showQR()
                    }}
                    onPointerLeave={(event) => {
                      if (event.pointerType === 'mouse') hideQR()
                    }}
                  >
                    <QrCode size={16} />
                    <span>Scan QR code</span>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="yl-consult-qr-panel"
                      side="top"
                      align="end"
                      sideOffset={10}
                      collisionPadding={16}
                      aria-label="WeChat QR code"
                      onOpenAutoFocus={(event) => event.preventDefault()}
                      onCloseAutoFocus={(event) => event.preventDefault()}
                      onPointerEnter={clearHoverTimer}
                      onPointerLeave={(event) => {
                        if (event.pointerType === 'mouse') hideQR()
                      }}
                    >
                      <div className="yl-consult-qr-heading">
                        <strong>Scan with WeChat</strong>
                        <Popover.Close className="yl-consult-close" aria-label="Close QR code">
                          <X size={18} />
                        </Popover.Close>
                      </div>
                      <span className="yl-consult-qr-image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrImage}
                          alt="Yueli WeChat contact QR code"
                          width={966}
                          height={616}
                        />
                      </span>
                      <p>Add Yueli to discuss your project.</p>
                      <Popover.Arrow className="yl-consult-arrow" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
              <p className="yl-consult-copy-note" role="status" aria-live="polite">
                {copyState === 'failed'
                  ? 'Copy unavailable. Scan the QR code or copy the ID below.'
                  : copyState === 'copied'
                    ? 'WeChat ID copied.'
                    : 'Copy the WeChat ID or scan the QR code.'}
              </p>
              {copyState === 'failed' && (
                <input
                  className="yl-consult-copy-fallback"
                  aria-label="WeChat ID"
                  readOnly
                  value={wechat}
                  onFocus={(event) => event.currentTarget.select()}
                />
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
